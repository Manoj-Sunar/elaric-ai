import axios from 'axios';
import { PROVIDER, GROQ_API_KEY, GROQ_MODEL } from '../config.js';

// example using Groq (adjust to your provider)
export async function generateText(prompt, opts = {}) {
  if (!prompt?.trim()) throw new Error('prompt required');

  if (PROVIDER === 'groq' && GROQ_API_KEY) {
    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are an expert developer. When generating React Native UI, return full code inside fenced ```jsx blocks.' },
            { role: 'user', content: prompt }
          ],
          temperature: opts.temperature ?? 0.6,
          max_tokens: opts.maxTokens ?? 1200
        },
        { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
      );

      const output = res.data?.choices?.[0]?.message?.content || res.data?.choices?.[0]?.text || '';
      return output.trim();
    } catch (err) {
      console.error('Groq error', err?.response?.data || err.message || err);
      throw new Error('AI generation failed');
    }
  }

  // fallback - simple example (for dev only)
  return `\`\`\`jsx
import React from 'react';
import { View, Text } from 'react-native';

export default function App(){
  return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Hello from fallback</Text></View>;
}
\`\`\``;
}

export default { generateText };
