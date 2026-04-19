import { test, expect } from '@playwright/test';

test.describe('ComponentCompass', () => {
  test('loads the app and shows welcome screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('ComponentCompass');
    await expect(page.locator('h2')).toContainText('Chart Your Course');
  });

  test('shows suggested prompts on welcome screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Show me accessible buttons')).toBeVisible();
    await expect(page.getByText('Card component implementation')).toBeVisible();
    await expect(page.getByText('Analyze this design mockup')).toBeVisible();
    await expect(page.getByText('Design tokens for spacing')).toBeVisible();
  });

  test('has skip navigation link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#messages"]');
    await expect(skipLink).toBeAttached();
  });

  test('shows stats panel when stats button is clicked', async ({ page }) => {
    await page.goto('/');
    await page.getByTitle('Toggle Session Statistics').click();
    await expect(page.getByText('Queries')).toBeVisible();
    await expect(page.getByText('Indices')).toBeVisible();
  });

  test('textarea accepts input', async ({ page }) => {
    await page.goto('/');
    const textarea = page.locator('textarea');
    await textarea.fill('test message');
    await expect(textarea).toHaveValue('test message');
  });

  test('send button is disabled when textarea is empty', async ({ page }) => {
    await page.goto('/');
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await expect(sendButton).toBeDisabled();
  });

  test('send button is enabled when textarea has content', async ({ page }) => {
    await page.goto('/');
    await page.locator('textarea').fill('test');
    // The last button in the input area is the send button
    const buttons = page.locator('.max-w-4xl button');
    const sendButton = buttons.last();
    await expect(sendButton).toBeEnabled();
  });

  test('keyboard shortcut Cmd+/ toggles stats', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Queries')).not.toBeVisible();
    await page.keyboard.press('Meta+/');
    await expect(page.getByText('Queries')).toBeVisible();
    await page.keyboard.press('Meta+/');
    await expect(page.getByText('Queries')).not.toBeVisible();
  });

  test('file upload button exists and is accessible', async ({ page }) => {
    await page.goto('/');
    const uploadButton = page.getByLabel('Upload screenshot for AI analysis').first();
    await expect(uploadButton).toBeVisible();
  });
});
