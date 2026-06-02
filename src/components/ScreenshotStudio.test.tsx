import { describe, expect, it } from 'vitest';
import { friendlyError, getConfidenceDisplay, getGroundingMeta } from './ScreenshotStudio.logic';

describe('ScreenshotStudio helpers', () => {
  describe('friendlyError', () => {
    it('passes through safe validation messages', () => {
      expect(friendlyError(400, 'Unsupported image type. Please use a PNG, JPEG, WebP, or GIF.')).toBe(
        'Unsupported image type. Please use a PNG, JPEG, WebP, or GIF.',
      );
      expect(friendlyError(400, 'imageDataUrl must be a base64 data URL (data:<mime>;base64,...)')).toBe(
        'imageDataUrl must be a base64 data URL (data:<mime>;base64,...)',
      );
    });

    it('maps known statuses to friendly copy', () => {
      expect(friendlyError(413, '')).toBe('That image is too large. Please try one under 4 MB.');
      expect(friendlyError(503, '')).toBe(
        'Trace is temporarily unavailable. Please try again in a moment.',
      );
      expect(friendlyError(429, '')).toBe(
        'Too many requests right now. Please wait a moment and try again.',
      );
    });

    it('hides unsafe backend/provider errors behind generic copy', () => {
      expect(friendlyError(500, 'Gemini quota exhausted for project abc123')).toBe(
        'Something went wrong while tracing this screenshot. Please try again.',
      );
      expect(friendlyError(500, '')).toBe(
        'Something went wrong while tracing this screenshot. Please try again.',
      );
    });
  });

  describe('getConfidenceDisplay', () => {
    it('rounds percent and filled tick counts from the confidence value', () => {
      expect(getConfidenceDisplay(0.42)).toEqual({
        clamped: 0.42,
        pct: 42,
        filled: 8,
      });
    });

    it('clamps values outside the 0-1 range', () => {
      expect(getConfidenceDisplay(-3)).toEqual({
        clamped: 0,
        pct: 0,
        filled: 0,
      });
      expect(getConfidenceDisplay(2)).toEqual({
        clamped: 1,
        pct: 100,
        filled: 20,
      });
    });
  });

  describe('getGroundingMeta', () => {
    it.each([
      ['grounded', 'Maps cleanly to a catalog component.', 'border-terrain/40 text-terrain'],
      ['inferred', 'Reasonable mapping with some uncertainty.', 'border-ocean/40 text-ocean'],
      ['guessed', 'Low confidence / no good catalog match.', 'border-compass/50 text-compass border-dashed'],
    ] as const)('returns %s styling + explanation', (grounding, title, styles) => {
      expect(getGroundingMeta(grounding)).toEqual({ title, styles });
    });
  });
});
