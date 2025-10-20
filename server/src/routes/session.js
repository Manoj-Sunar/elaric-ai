import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import storage from '../services/storage.js';
import { generateQrForSession } from '../services/qr.js';
import { createGist, rawGistUrl, makeSnackEmbedUrl } from '../services/snack.js';
import { GITHUB_TOKEN, GITHUB_USERNAME } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

function extractFencedContent(text) {
  if (!text) return null;
  const match = text.match(/```(?:jsx|js|tsx|html)?\n([\s\S]*?)```/i);
  if (match) return match[1].trim();
  return null;
}

function transformReactNativeToWeb(code) {
  if (!code) return null;
  // remove import lines (we'll provide React in wrapper)
  let out = code.replace(/^import .*;?\n/gm, '');
  // map RN primitives to basic DOM tags
  out = out.replace(/\bView\b/g, 'div');
  out = out.replace(/\bText\b/g, 'span');
  out = out.replace(/\bTouchableOpacity\b/g, 'button');
  // remove StyleSheet.create block (we will inline minimal fallbacks)
  out = out.replace(/StyleSheet\.create\([\s\S]*?\);?/g, '');
  return out;
}

function makeReactBabelWrapper(jsxsnippet) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>AI Preview</title>
  <style>body{margin:0;font-family:system-ui;background:#fff;color:#111;padding:16px;}</style>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      ${jsxsnippet.includes('export default') ? jsxsnippet : `const PreviewApp = () => (${jsxsnippet}); ReactDOM.createRoot(document.getElementById('root')).render(<PreviewApp />);`}
    } catch (err) {
      document.getElementById('root').innerText = 'Preview render error: ' + err.message;
      console.error(err);
    }
  </script>
</body>
</html>`;
}

const router = express.Router();

router.post('/create-session', async (req, res) => {
  try {
    const { project } = req.body;
    if (!project) return res.status(400).json({ error: 'project required' });

    const session = await storage.createSession(project);
    const qrObj = await generateQrForSession(session.id);

    let response = {
      sessionId: session.id,
      previewUrl: qrObj.url,
      qrDataUrl: qrObj.dataUrl,
      session
    };

    // Build preview HTML
    let previewHtml = null;

    if (project.html && project.html.trim()) {
      previewHtml = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${project.html}</body></html>`;
    } else {
      const fenced = extractFencedContent(project.code || '');
      if (fenced) {
        if (/(<div|<button|<section|<\/div>)/i.test(fenced)) {
          previewHtml = `<!doctype html><html><head><meta charset="utf-8"/></head><body>${fenced}</body></html>`;
        } else {
          previewHtml = makeReactBabelWrapper(fenced);
        }
      } else if (project.code && /(import .*react|React\.|View|Text|TouchableOpacity)/i.test(project.code)) {
        const maybeJsx = transformReactNativeToWeb(project.code);
        previewHtml = makeReactBabelWrapper(maybeJsx);
      } else {
        previewHtml = `<!doctype html><html><head><meta charset="utf-8"/></head><body><pre>${String(project.code||project.html||'').replace(/</g,'&lt;')}</pre></body></html>`;
      }
    }

    // write file preview-<id>.html
    const fileName = `preview-${session.id}.html`;
    const previewPath = path.join(publicDir, fileName);
    fs.writeFileSync(previewPath, previewHtml, 'utf8');

    // host-local preview URL
    const host = `${req.protocol}://${req.get('host')}`;
    response.previewUrl = `${host}/public/${fileName}`;

    // prefer creating a Snack (runnable RN in browser/device) if code present & GitHub token available
    if (project.code && GITHUB_TOKEN && GITHUB_USERNAME) {
      try {
        const files = {
          'App.js': { content: project.code },
          'package.json': { content: JSON.stringify({ name: 'ai-snack', main: 'App.js' }, null, 2) }
        };
        const gist = await createGist(files, 'AI generated Snack');
        const raw = rawGistUrl(gist, 'App.js'); // raw file
        const snackUrl = makeSnackEmbedUrl(raw);
        response.snackUrl = snackUrl;
        response.gistUrl = gist.html_url;
        // prefer snack as previewUrl and qr
        response.previewUrl = snackUrl;
        response.qrDataUrl = await generateQrForSession(session.id).then(r=>r.dataUrl).catch(()=>qrObj.dataUrl);
      } catch (e) {
        console.warn('Snack/gist creation failed', e.message || e);
      }
    }

    // emit update using socket.io if available
    try {
      const io = req.app.get('io');
      if (io) io.to(session.id).emit('session:update', { previewUrl: response.previewUrl });
    } catch (e) {
      // ignore
    }

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', details: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const s = await storage.getSession(req.params.id);
  if (!s) return res.status(404).json({ error: 'not_found' });
  res.json(s);
});

export default router;
