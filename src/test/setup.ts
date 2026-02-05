import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app-id');
vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
vi.stubEnv('VITE_ALGOLIA_AGENT_ID', 'test-agent-id');
vi.stubEnv('VITE_OPENAI_API_KEY', 'test-openai-key');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
globalThis.localStorage = localStorageMock as Storage;

// Mock fetch
globalThis.fetch = vi.fn();

// Extend expect with custom matchers if needed
expect.extend({});
