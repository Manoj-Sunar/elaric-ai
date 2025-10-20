import QRCode from 'qrcode';
import { BASE_URL, QR_SIZE } from '../config.js';

export async function generateQrForSession(sessionId) {
  // point to public preview page with query string
  const url = `${BASE_URL.replace(/\/$/, '')}/public/preview.html?sessionId=${encodeURIComponent(sessionId)}`;
  const dataUrl = await QRCode.toDataURL(url, { width: QR_SIZE });
  return { url, dataUrl };
}
export default { generateQrForSession };
