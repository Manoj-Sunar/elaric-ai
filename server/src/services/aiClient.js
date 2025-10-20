import axios from 'axios';
import { PROVIDER, GROQ_API_KEY, GROQ_MODEL } from '../config.js';

export async function generateText(prompt, opts = {}) {
  if (!prompt?.trim()) throw new Error('prompt required');

  if (PROVIDER === 'groq' && GROQ_API_KEY) {
    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are an expert full-stack and React Native developer. Return runnable code in fenced code blocks when appropriate.' },
            { role: 'user', content: prompt }
          ],
          temperature: opts.temperature ?? 0.6,
          max_tokens: opts.maxTokens ?? 1200
        },
        { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
      );

      // Normalize output
      const output = res.data?.choices?.[0]?.message?.content || res.data?.choices?.[0]?.text || '';
      return output.trim();
    } catch (err) {
      console.error('Groq error', err?.response?.data || err.message || err);
      throw new Error('AI generation failed');
    }
  }

  // Fallback simple generator (for local dev when no key)
  return `// [fallback] React Native sample\n// Prompt: ${prompt}\n\nimport React from 'react';\nimport { View, Text } from 'react-native';\nexport default function App(){\n  return (<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>${prompt.replace(/"/g, '\\"')}</Text></View>);\n}`;
}

export default { generateText };
