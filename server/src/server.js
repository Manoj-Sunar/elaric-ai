// src/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

import aiRoutes from './routes/ai.js';
import sessionRoutes from './routes/session.js';
import storage from './services/storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  // Serve public preview folder (static preview pages)
  app.use('/public', express.static(path.join(__dirname, 'public')));

  app.use('/api/ai', aiRoutes);
  app.use('/api/session', sessionRoutes);

  app.get('/health', (_, res) => res.json({ ok: true }));

  // Create HTTP server and socket.io
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  // Attach io to storage so storage.updateSession can emit
  storage.attachSocket(io);

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('join', (roomId) => {
      console.log('Socket join room', roomId);
      socket.join(roomId);
    });
    socket.on('disconnect', () => {
      // console.log('Socket disconnected', socket.id);
    });
  });

  // attach io to app for route controllers to use (if needed)
  app.set('io', io);

  return server;
}
