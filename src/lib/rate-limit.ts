/**
 * Simple client-side rate limiter to prevent API abuse
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const timestamps: number[] = [];

  return {
    canProceed(): boolean {
      const now = Date.now();
      while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
        timestamps.shift();
      }
      return timestamps.length < maxRequests;
    },

    record(): void {
      timestamps.push(Date.now());
    },

    remainingRequests(): number {
      const now = Date.now();
      while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
        timestamps.shift();
      }
      return Math.max(0, maxRequests - timestamps.length);
    },
  };
}
