import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load dotenv for development API keys
dotenv.config();

function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url) return next();

        // Handle /api/gemini/generate
        if (req.url.startsWith('/api/gemini/generate') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { prompt, model, systemInstruction, temperature, responseMimeType } = JSON.parse(body);
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Secrets panel.' }));
                return;
              }
              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
              });
              const response = await ai.models.generateContent({
                model: model || 'gemini-3.5-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  temperature: temperature !== undefined ? Number(temperature) : undefined,
                  responseMimeType,
                }
              });
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ text: response.text }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message || 'Gemini error' }));
            }
          });
          return;
        }

        // Handle /api/gemini/stream
        if (req.url.startsWith('/api/gemini/stream') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { prompt, model, systemInstruction, temperature, responseMimeType } = JSON.parse(body);
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }));
                return;
              }
              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
              });
              
              res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
              });

              const responseStream = await ai.models.generateContentStream({
                model: model || 'gemini-3.5-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  temperature: temperature !== undefined ? Number(temperature) : undefined,
                  responseMimeType,
                }
              });

              for await (const chunk of responseStream) {
                const text = chunk.text;
                if (text) {
                  res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
              }
              res.write('data: [DONE]\n\n');
              res.end();
            } catch (err: any) {
              res.write(`data: ${JSON.stringify({ error: err.message || 'Gemini stream error' })}\n\n`);
              res.end();
            }
          });
          return;
        }

        // Handle /api/gemini/generate-image
        if (req.url.startsWith('/api/gemini/generate-image') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { prompt, aspectRatio, model } = JSON.parse(body);
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }));
                return;
              }
              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
              });
              const response = await ai.models.generateContent({
                model: model || 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: {
                  imageConfig: { aspectRatio: aspectRatio || '1:1' }
                }
              });
              let base64Image = "";
              for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                  base64Image = part.inlineData.data;
                  break;
                }
              }
              if (base64Image) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ imageUrl: `data:image/png;base64,${base64Image}` }));
              } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No image data returned.' }));
              }
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message || 'Image generation error' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
