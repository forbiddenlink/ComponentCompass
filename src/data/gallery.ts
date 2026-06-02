/**
 * Pre-baked Screenshot Studio examples.
 *
 * Each entry pairs a sample input screenshot (served from /examples/<id>.png)
 * with the FULL generation result captured once at author time by running the
 * real Gemini pipeline (see scripts/build-gallery.mjs). The app loads these
 * cached results directly into the result view — NO network call, NO API key —
 * so the gallery works even with zero credentials or a dead Gemini quota.
 *
 * Regenerate with: pnpm gallery
 */
import galleryData from './gallery.json';

export interface GalleryDetection {
  label: string;
  componentName: string;
  variant?: string;
  confidence: number;
  /** [ymin, xmin, ymax, xmax] normalized 0-1000 (y first). Absent on pre-box cached results. */
  box?: number[];
  grounding?: 'grounded' | 'inferred' | 'guessed';
}

export interface GalleryGenResult {
  detections: GalleryDetection[];
  jsx: string;
  componentsUsed: string[];
  notes: string;
  repairs?: number;
}

export interface GalleryExample {
  id: string;
  title: string;
  /** Path under /public, served statically (e.g. /examples/pricing-card.png). */
  thumbnail: string;
  result: GalleryGenResult;
}

export const GALLERY_EXAMPLES: GalleryExample[] = galleryData as GalleryExample[];
