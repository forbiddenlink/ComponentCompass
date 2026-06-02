export type Grounding = 'grounded' | 'inferred' | 'guessed';

export function friendlyError(status: number, backendMessage: string): string {
  const safe = /data url|too large|image type|unsupported|temporarily unavailable/i.test(
    backendMessage,
  );
  if (safe && backendMessage) return backendMessage;
  if (status === 413) return 'That image is too large. Please try one under 4 MB.';
  if (status === 503) return 'Trace is temporarily unavailable. Please try again in a moment.';
  if (status === 429) return 'Too many requests right now. Please wait a moment and try again.';
  return 'Something went wrong while tracing this screenshot. Please try again.';
}

export function getConfidenceDisplay(value: number, ticks = 20): {
  clamped: number;
  pct: number;
  filled: number;
} {
  const clamped = Math.max(0, Math.min(1, value));
  return {
    clamped,
    pct: Math.round(clamped * 100),
    filled: Math.round(clamped * ticks),
  };
}

export function getGroundingMeta(grounding: Grounding): { styles: string; title: string } {
  if (grounding === 'grounded') {
    return {
      styles: 'border-terrain/40 text-terrain',
      title: 'Maps cleanly to a catalog component.',
    };
  }
  if (grounding === 'inferred') {
    return {
      styles: 'border-ocean/40 text-ocean',
      title: 'Reasonable mapping with some uncertainty.',
    };
  }
  return {
    styles: 'border-compass/50 text-compass border-dashed',
    title: 'Low confidence / no good catalog match.',
  };
}
