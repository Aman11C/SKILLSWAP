import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Enable JSON parser
app.use(express.json());

/**
 * Endpoint to generate non-streaming content from Gemini.
 */
app.post('/api/gemini/generate', async (req, res) => {
  const { prompt, model, systemInstruction, temperature, responseMimeType } = req.body;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ 
      error: 'GEMINI_API_KEY is not configured in Vercel environment variables. Please add it to your project settings.' 
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
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

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini Generate Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content from Gemini API.' });
  }
});

/**
 * Endpoint to stream content from Gemini via Server-Sent Events (SSE).
 */
app.post('/api/gemini/stream', async (req, res) => {
  const { prompt, model, systemInstruction, temperature, responseMimeType } = req.body;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }));
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
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
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Stream connection error' })}\n\n`);
    res.end();
  }
});

/**
 * Endpoint to generate images using gemini-2.5-flash-image.
 */
app.post('/api/gemini/generate-image', async (req, res) => {
  const { prompt, aspectRatio, model } = req.body;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const selectedModel = model || 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1"
        }
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
      res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
    } else {
      res.status(500).json({ error: 'No image data was returned by the model.' });
    }
  } catch (error: any) {
    console.error('Image Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image.' });
  }
});

export default app;
