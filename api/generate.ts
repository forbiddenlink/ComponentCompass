import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateFromScreenshot } from './_lib/generate';

/**
 * POST /api/generate
 * Body: {
 *   imageDataUrl: string,          // a data:<mime>;base64,<payload> URL
 *   previousJsx?: string,          // optional: prior jsx to repair (targeted repair)
 *   errorMessage?: string,         // optional: compile/runtime error OR a11y issues for previousJsx
 *   repairReason?: 'compile' | 'a11y', // optional: how to frame the repair (default 'compile')
 * }
 * Returns: GenResult JSON ({ detections, jsx, componentsUsed, notes, repairs }).
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

  const { imageDataUrl, previousJsx, errorMessage, repairReason } = req.body ?? {};
  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    return res.status(400).json({ error: 'imageDataUrl is required' });
  }

  const repair =
    typeof previousJsx === 'string' && typeof errorMessage === 'string'
      ? {
          previousJsx,
          errorMessage,
          repairReason: repairReason === 'a11y' ? ('a11y' as const) : ('compile' as const),
        }
      : undefined;

  try {
    const result = await generateFromScreenshot(imageDataUrl, repair);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    const status = message.includes('data URL') ? 400 : 500;
    return res.status(status).json({ error: message });
  }
}
