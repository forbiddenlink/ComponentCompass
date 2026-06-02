import { defineConfig } from '@playwright/test';

/**
 * E2E runs on a dedicated port (5174) with a dev server we fully control, so the
 * suite never collides with a hand-started `pnpm dev` on 5173 that may have real
 * Algolia creds loaded from a local `.env`.
 *
 * Determinism + CI-safety:
 *  - The Algolia VITE_* vars are forced empty here. Vite lets `process.env` values
 *    take precedence over `.env` files, so this hides the Algolia-backed Chat tab
 *    regardless of what's in a developer's local `.env`. The tests assume Chat is
 *    absent (the documented zero-cred path).
 *  - No test depends on a live Gemini key: the gallery loads cached results with no
 *    call to /api/generate, so the suite passes with no credentials at all.
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
    env: {
      // Force the zero-cred path: empty values override the local .env (Vite
      // precedence), so hasAlgolia() is false and the Chat tab is hidden.
      VITE_ALGOLIA_APP_ID: '',
      VITE_ALGOLIA_SEARCH_API_KEY: '',
      VITE_ALGOLIA_AGENT_ID: '',
    },
  },
});
