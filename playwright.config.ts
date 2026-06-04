import { defineConfig } from '@playwright/test';

/**
 * E2E runs on a dedicated port (5174) with a dev server we fully control, so the
 * suite never collides with a hand-started `pnpm dev` on 5173.
 *
 * Determinism + CI-safety: no test depends on a live Gemini key. The gallery loads
 * cached results with no call to /api/generate, so the suite passes with no
 * credentials at all (the documented zero-cred path).
 */
const E2E_PORT = 5174;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: `pnpm dev --port ${E2E_PORT} --strictPort`,
    port: E2E_PORT,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
