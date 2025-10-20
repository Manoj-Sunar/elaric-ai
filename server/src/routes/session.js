// src/routes/session.js  (replace your existing /create-session handler with this)
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import storage from '../services/storage.js';
import { generateQrForSession } from '../services/qr.js';
import { createGist, rawGistUrl, makeSnackEmbedUrl } from '../services/snack.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const previewDir = path.join(__dirname, '../public'); // public root

// helper: extract code from fenced blocks
function extractFencedContent(text) {
  if (!text) return null;
  const fenceMatch = text.match(/```(?:html|jsx|tsx|js|react|xml)?\n([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  return null;
}

// helper: naive transform RN -> web-ish JSX (best-effort)
function transformReactNativeToWeb(code) {
  if (!code) return null;
  // remove import lines
  let out = code.replace(/^import .*;?\n/gm, '');
  // basic tag mapping: View -> div, Text -> span, TouchableOpacity -> button
  out = out.replace(/\bView\b/g, 'div');
  out = out.replace(/\bText\b/g, 'span');
  out = out.replace(/\bTouchableOpacity\b/g, 'button');
  // remove StyleSheet.create(...) usages (they won't work in DOM)
  out = out.replace(/StyleSheet\.create\([\s\S]*?\);?/g, '');
  // replace self-closing <Text /> etc — leave as-is
  return out;
}

// helper: create preview HTML that uses React + Babel to mount JSX
function makeReactBabelWrapper(jsxsnippet) {
  // jsxsnippet is expected to be a JSX snippet like <div>...</div> or a React component
  // We'll mount it into a root
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>AI Preview</title>
  <style>body{margin:0;font-family:system-ui;background:#fff;color:#111;padding:16px;}</style>
  <!-- React + ReactDOM + Babel for running JSX in-browser (dev only) -->
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    // If the snippet looks like a full component declaration, render it.
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

    // store session (keeps old behaviour)
    const session = await storage.createSession(project);
    const qrObj = await generateQrForSession(session.id);

    // build default response
    const response = {
      sessionId: session.id,
      previewUrl: qrObj.url,
      qrDataUrl: qrObj.dataUrl,
      session,
    };

    // ——— Build a renderable preview HTML file ———
    // Priority:
    // 1) If project.html provided -> use it directly
    // 2) else try to extract fenced html/jsx from project.code
    // 3) else if code looks like React Native -> transform to web-ish JSX and render
    // 4) else fallback to a page showing code and instructions

    let previewHtml = null;

    if (project.html && project.html.trim()) {
      // use project.html as full body
      previewHtml = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${project.title || 'Preview'}</title></head><body>${project.html}</body></html>`;
    } else {
      // try fenced block
      const fenced = extractFencedContent(project.code || project.html || '');
      if (fenced) {
        // if fenced block looks like html (contains <div> or <button>), use wrapper directly
        if (/(<html|<div|<\/div>|<button|<section|<main)/i.test(fenced)) {
          // If html tags present, wrap into a simple page
          previewHtml = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${project.title||'Preview'}</title></head><body>${fenced}</body></html>`;
        } else {
          // otherwise assume it's JSX — build React+Babel wrapper
          previewHtml = makeReactBabelWrapper(fenced);
        }
      } else {
        // If no fenced content, inspect raw code for tags
        const raw = project.code || '';
        if (raw && /<\s*div|<\s*button|<\s*section|<\/\s*div>/i.test(raw)) {
          // contains web HTML tags — wrap
          previewHtml = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${raw}</body></html>`;
        } else if (raw && /(import .*react|React\.|View|Text|TouchableOpacity)/i.test(raw)) {
          // looks like React or React Native — try to transform RN -> web-ish and render via Babel
          const maybeJsx = transformReactNativeToWeb(raw);
          previewHtml = makeReactBabelWrapper(maybeJsx);
        } else {
          // Fallback: show code and explanation
          previewHtml = `<!doctype html><html><head><meta charset="utf-8"/></head><body><h3>AI Output (code)</h3><pre>${String(project.code||project.html||'').replace(/</g,'&lt;')}</pre><p>To render this preview as a UI, the AI should return HTML/JSX code block. Try asking AI to provide a \`<div>...</div>\` or \`\`\`html\`\`\` block or a runnable Snack link.</p></body></html>`;
        }
      }
    }

    // write the preview HTML file to public/preview-<id>.html
    const fileName = `preview-${session.id}.html`;
    const previewPath = path.join(__dirname, '../public', fileName);
    fs.writeFileSync(previewPath, previewHtml, 'utf8');

    // compute a public preview URL pointing to the written file
    const host = `${req.protocol}://${req.get('host')}`;
    response.previewUrl = `${host}/public/${fileName}`;

    // attempt gist/snack creation (keeps your existing behaviour)
    try {
      if (project.code && process.env.GITHUB_TOKEN && process.env.GITHUB_USERNAME) {
        const files = {
          'App.js': { content: project.code },
          'package.json': { content: JSON.stringify({ name: 'ai-snack', main: 'App.js' }, null, 2) }
        };
        const gist = await createGist(files, 'AI generated Snack');
        const raw = rawGistUrl(gist, 'App.js');
        const snackUrl = makeSnackEmbedUrl(raw);
        response.snackUrl = snackUrl;
        response.gistUrl = gist.html_url;
      }
    } catch (e) {
      console.warn('Snack/gist creation failed', e.message || e);
    }

    // Emit socket update (if clients joined)
    try {
      const io = req.app.get('io');
      if (io) io.to(session.id).emit('session:update', { previewUrl: response.previewUrl });
    } catch (e) {
      // ignore
    }

    // respond
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
