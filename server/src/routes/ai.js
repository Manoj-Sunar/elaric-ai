import express from 'express';
import aiClient from '../services/aiClient.js';

const router = express.Router();

router.post('/generate-text', async (req, res) => {
  try {
    const { prompt, maxTokens } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const text = await aiClient.generateText(prompt, { maxTokens });
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ai_error', details: err.message });
  }
});

export default router;
