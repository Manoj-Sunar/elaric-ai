// src/index.js
import 'dotenv/config.js';
import { createServer } from './server.js';

const PORT = process.env.PORT || 4000;

const server = createServer();
server.listen(PORT, () => {
  console.log(`✅ Backend listening on ${PORT}`);
});
