import QRCode from 'qrcode';
import { BASE_URL, QR_SIZE } from '../config.js';

export async function generateQrForSession(sessionId, preferredUrl) {
  // preferredUrl (if passed) should be short (e.g., snack url). Fallback to local preview page
  const defaultUrl = `${BASE_URL.replace(/\/$/, '')}/public/preview-${sessionId}.html`;
  const url = preferredUrl && preferredUrl.length < 2000 ? preferredUrl : defaultUrl;
  const dataUrl = await QRCode.toDataURL(url, { width: QR_SIZE });
  return { url, dataUrl };
}
export default { generateQrForSession };
