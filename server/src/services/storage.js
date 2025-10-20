import { v4 as uuidv4 } from 'uuid';
import IORedis from 'ioredis';
import { USE_REDIS, REDIS_URL } from '../config.js';

let redis = null;
let ioRef = null;
const inMemory = {};

if (USE_REDIS) redis = new IORedis(REDIS_URL || undefined);

export function attachSocket(io) { ioRef = io; }

export async function createSession(data, ttlSeconds = 3600) {
  const id = uuidv4();
  const payload = { id, createdAt: Date.now(), data };
  if (USE_REDIS) {
    await redis.set(`session:${id}`, JSON.stringify(payload), 'EX', ttlSeconds);
  } else {
    inMemory[id] = payload;
    setTimeout(() => { delete inMemory[id]; }, ttlSeconds * 1000);
  }
  return payload;
}

export async function getSession(id) {
  if (USE_REDIS) {
    const raw = await redis.get(`session:${id}`);
    return raw ? JSON.parse(raw) : null;
  }
  return inMemory[id] || null;
}

export async function updateSession(id, patch) {
  const s = await getSession(id);
  if (!s) return null;
  s.data = { ...s.data, ...patch };
  if (USE_REDIS) await redis.set(`session:${id}`, JSON.stringify(s));
  else inMemory[id] = s;
  if (ioRef) ioRef.to(id).emit('session:update', { id, data: s.data });
  return s;
}

export default { attachSocket, createSession, getSession, updateSession };
