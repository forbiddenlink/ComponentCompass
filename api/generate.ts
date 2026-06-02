import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateFromScreenshot } from './_lib/generate';

/**
 * POST /api/generate
 * Body: { imageDataUrl: string }  (a data:<mime>;base64,<payload> URL)
 * Returns: GenResult JSON ({ detections, jsx, componentsUsed, notes }).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return res.status(503).json({ error: 'Google Generative AI API key not configured on server' });
  }

  const { imageDataUrl } = req.body ?? {};
  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    return res.status(400).json({ error: 'imageDataUrl is required' });
  }

  try {
    const result = await generateFromScreenshot(imageDataUrl);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    const status = message.includes('data URL') ? 400 : 500;
    return res.status(status).json({ error: message });
  }
}
