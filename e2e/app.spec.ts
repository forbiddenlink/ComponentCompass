import { test, expect, type Page } from '@playwright/test';

/**
 * E2E coverage for the current Trace app.
 *
 * The app opens on the Screenshot Studio tab. These tests run on the documented
 * zero-cred path: the dev server is started with empty Algolia vars (see
 * playwright.config.ts), so the Chat tab is hidden and the gallery loads cached
 * results with NO call to /api/generate. Nothing here needs a live Gemini key.
 */

const TAB_BAR = '[role="tablist"][aria-label="View"]';

/** Fail the test if anything hits the generation API (proves the gallery is cached). */
async function failOnGenerateCall(page: Page) {
  await page.route('**/api/generate', () => {
    throw new Error('Unexpected network call to /api/generate on the zero-cred path');
  });
}

test.describe('Trace - default view + Studio empty state', () => {
  test('opens on the Studio tab with the empty state rendered', async ({ page }) => {
    await page.goto('/');

    // Studio is the default selected tab.
    const studioTab = page.getByRole('tab', { name: 'Studio' });
    await expect(studioTab).toHaveAttribute('aria-selected', 'true');

    // Heading + tagline of the empty state.
    await expect(page.getByRole('heading', { name: 'Screenshot Studio' })).toBeVisible();
    await expect(page.getByText('Drop a screenshot here')).toBeVisible();

    // Upload affordance.
    await expect(page.getByRole('button', { name: 'Choose file' })).toBeVisible();
  });

  test('Chat tab is hidden when Algolia creds are absent', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('tab', { name: 'Studio' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Explore' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Chat' })).toHaveCount(0);
  });
});

test.describe('Trace - example gallery (zero-cred path)', () => {
  test('clicking a gallery example loads a cached result with no /api/generate call', async ({
    page,
  }) => {
    await failOnGenerateCall(page);
    await page.goto('/');

    // The gallery lives in the Studio empty state.
    await expect(page.getByText('Try an example')).toBeVisible();

    // Load the first cached example (a real generation result captured at build time).
    await page.getByRole('button', { name: /Pricing card example/i }).click();

    // The result view replaces the empty state: detection panel + live preview appear.
    await expect(page.getByRole('heading', { name: 'What the AI sees' })).toBeVisible();
    // The detection panel lists the components used once a result is loaded.
    await expect(page.getByText('Components used')).toBeVisible();

    // The Sandpack preview toolbar (Copy code) only exists once code is rendered.
    await expect(page.getByRole('button', { name: 'Copy code' })).toBeVisible();

    // Empty state is gone.
    await expect(page.getByText('Drop a screenshot here')).toHaveCount(0);
  });
});

test.describe('Trace - tab navigation', () => {
  test('clicking Explore switches to the Component Explorer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Explore' }).click();
    await expect(page.getByRole('tab', { name: 'Explore' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('heading', { name: 'Component Explorer' })).toBeVisible();
  });

  test('ArrowRight moves selection across tabs (roving tabindex)', async ({ page }) => {
    await page.goto('/');
    const tablist = page.locator(TAB_BAR);
    await expect(tablist).toBeVisible();

    const studioTab = page.getByRole('tab', { name: 'Studio' });
    const exploreTab = page.getByRole('tab', { name: 'Explore' });

    // Active tab has tabindex 0, inactive has -1 (roving tabindex pattern).
    await expect(studioTab).toHaveAttribute('tabindex', '0');
    await expect(exploreTab).toHaveAttribute('tabindex', '-1');

    await studioTab.focus();
    await page.keyboard.press('ArrowRight');

    // With only Studio + Explore present, ArrowRight selects Explore.
    await expect(exploreTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'Component Explorer' })).toBeVisible();
  });
});

test.describe('Trace - dark mode (editor theme) persists', () => {
  test('toggling the editor theme persists across reload', async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /editor/i });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    // The choice is persisted to localStorage under a known key.
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('trace-studio-theme')))
      .toBe('dark');

    await page.reload();
    await expect(page.getByRole('button', { name: /editor/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
