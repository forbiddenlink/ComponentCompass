import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OpenAI API key not configured on server' });
  }

  const { imageUrl } = req.body ?? {};
  if (!imageUrl || typeof imageUrl !== 'string') {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert UI/UX designer analyzing design screenshots to identify React components.
Analyze the image and identify all UI components present. For each component, provide:
1. Component name (e.g., Button, Card, Input, Dialog, etc.)
2. Detailed description including variants, states, and properties
3. Confidence level (0-1) that this component exists

Also describe the overall layout and design style.

Respond in JSON format:
{
  "components": [
    {
      "name": "Button",
      "description": "Primary button with rounded corners, gradient background, medium size",
      "confidence": 0.95
    }
  ],
  "layout": "Card layout with header, content, and footer sections",
  "designStyle": "Modern, minimalist with soft shadows and rounded corners",
  "suggestions": ["Consider using shadcn/ui Button component", "Add hover states for better interactivity"]
}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this design and identify all UI components. Be specific about variants, sizes, and states.',
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl, detail: 'high' },
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: `OpenAI API error: ${error.error?.message || 'Unknown error'}`,
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: 'No response from OpenAI' });
    }

    const result = JSON.parse(content);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Vision analysis failed',
    });
  }
}
