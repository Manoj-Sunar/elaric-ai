// src/utils/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function joinUrl(base, path) {
  return base.replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
}
