/**
 * Core, framework-agnostic screenshot -> React component generation.
 *
 * Uses the Vercel AI SDK (`generateObject`) with Google Gemini to:
 *  1. Detect UI elements in a screenshot and map each to the closest catalog component.
 *  2. Generate ONE self-contained TypeScript React file that recreates the screenshot.
 *
 * No secrets are read or logged here beyond passing the API key to the SDK via env.
 */
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import catalog from '../../data/components_index_enhanced.json' with { type: 'json' };

/** A single catalog component entry (shape of components_index_enhanced.json). */
interface CatalogComponent {
  objectID: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  status: string;
  props: string;
  variants: string;
}

export interface Detection {
  label: string;
  componentName: string;
  variant?: string;
  confidence: number;
}

export interface GenResult {
  detections: Detection[];
  jsx: string;
  componentsUsed: string[];
  notes: string;
}

const detectionSchema = z.object({
  label: z
    .string()
    .describe('A short human label for the detected UI element, e.g. "Submit button" or "Email field".'),
  componentName: z
    .string()
    .describe('The closest catalog component name this element maps to, e.g. "Button".'),
  variant: z
    .string()
    .optional()
    .describe('The catalog variant that best matches, e.g. "outline". Omit if not applicable.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence (0-1) that this mapping is correct.'),
});

const genSchema = z.object({
  detections: z
    .array(detectionSchema)
    .describe('Every distinct UI element detected in the screenshot, mapped to a catalog component.'),
  jsx: z
    .string()
    .describe(
      'A single self-contained TypeScript React file. Default-exports an `App` component recreating the screenshot. Only imports allowed: react, lucide-react. Tailwind utility classes only.',
    ),
  componentsUsed: z
    .array(z.string())
    .describe('Catalog component names that informed the generated UI.'),
  notes: z
    .string()
    .describe('Brief notes on layout/design decisions and any catalog gaps.'),
});

/** ~40-component cap to control prompt tokens. */
const MAX_CATALOG = 40;

/** Build a compact, token-efficient catalog grounding string. */
function buildCatalogPrompt(): string {
  const list = catalog as CatalogComponent[];
  return list
    .slice(0, MAX_CATALOG)
    .map((c) => `${c.name} — variants: ${c.variants} — props: ${c.props}`)
    .join('\n');
}

const PROMPT = `You are an expert front-end engineer and design-system analyst.

You will be given a screenshot of a user interface. Do TWO things:

1) DETECT every distinct UI element in the screenshot. For each, map it to the closest
   component from the CATALOG WHITELIST below (by name), pick the best-fitting variant
   when one applies, give it a short human label, and a confidence score (0-1).
   Return these in "detections".

2) GENERATE one self-contained TypeScript React file (the "jsx" field) that visually
   RECREATES the screenshot as closely as possible. Prefer recreating the elements using
   the patterns and variants implied by the catalog whitelist.

STRICT RULES for the generated "jsx":
- It MUST be a single file that compiles and runs in a Sandpack "react-ts" template.
- It MUST default-export a component named \`App\` (i.e. \`export default function App() { ... }\`).
- Inline ALL sub-components in the same file. Do NOT split into multiple files.
- The ONLY allowed imports are: \`react\` (e.g. \`import { useState } from 'react'\`) and,
  optionally, \`lucide-react\` for icons.
- DO NOT import from "@/..." or any package other than react / lucide-react.
- DO NOT import shadcn, the catalog, CSS files, or any UI library.
- Style ONLY with Tailwind utility classes (Tailwind is provided via CDN at runtime).
- No external network calls, no fetch, no images from the internet (use colored
  placeholders / Tailwind backgrounds or lucide icons instead).
- Keep it accessible: real button/label/input elements, sensible aria where helpful.

Put the catalog names you leaned on in "componentsUsed", and a short rationale in "notes".

CATALOG WHITELIST (recreate using these patterns/variants where possible):
${buildCatalogPrompt()}`;

/** Parse a base64 data URL into mime type + raw base64 payload. */
function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

/** Strip stray ```tsx / ```jsx / ``` fences a model may wrap code in. */
function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:tsx|jsx|ts|js|typescript|javascript)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Generate a self-contained React component + detection report from a screenshot.
 *
 * @param imageDataUrl A base64 data URL: `data:<mime>;base64,<payload>`.
 * @throws if the API key is missing or the input is not a valid data URL.
 */
export async function generateFromScreenshot(imageDataUrl: string): Promise<GenResult> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured on the server');
  }

  const parsed = parseDataUrl(imageDataUrl);
  if (!parsed) {
    throw new Error('imageDataUrl must be a base64 data URL (data:<mime>;base64,...)');
  }

  const modelId = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

  const { object } = await generateObject({
    model: google(modelId),
    schema: genSchema,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          // Pass raw bytes + mediaType so the SDK does not try to fetch the data: URL.
          {
            type: 'image',
            image: Uint8Array.from(Buffer.from(parsed.data, 'base64')),
            mediaType: parsed.mimeType,
          },
        ],
      },
    ],
  });

  return {
    ...object,
    jsx: stripCodeFences(object.jsx),
  };
}
