// Creates a public gist and returns raw URL + snack embed URL
import axios from 'axios';
import { GITHUB_TOKEN, GITHUB_USERNAME } from '../config.js';

export async function createGist(files, description = 'AI generated snippet') {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');
  const res = await axios.post('https://api.github.com/gists', { files, description, public: true }, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  });
  return res.data;
}

export function rawGistUrl(gistData, filename) {
  // raw URL pattern
  // NOTE: GitHub sometimes uses different hostnames — this works in common cases
  return `https://gist.githubusercontent.com/${GITHUB_USERNAME}/${gistData.id}/raw/${filename}`;
}

export function makeSnackEmbedUrl(rawUrl) {
  // Snack embed accepts sourceUrl pointing to raw JS file
  return `https://snack.expo.dev/embed?platform=android&sourceUrl=${encodeURIComponent(rawUrl)}`;
}
