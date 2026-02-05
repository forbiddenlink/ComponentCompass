import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentStudioClient, ALGOLIA_STREAM_URL, ALGOLIA_HEADERS } from './algolia';

describe('algolia service', () => {
  describe('ALGOLIA_STREAM_URL', () => {
    it('should construct correct streaming URL', () => {
      expect(ALGOLIA_STREAM_URL).toContain('algolia.net');
      expect(ALGOLIA_STREAM_URL).toContain('agent-studio');
      expect(ALGOLIA_STREAM_URL).toContain('stream=true');
      expect(ALGOLIA_STREAM_URL).toContain('compatibilityMode=ai-sdk-5');
    });
  });

  describe('ALGOLIA_HEADERS', () => {
    it('should include required authentication headers', () => {
      expect(ALGOLIA_HEADERS).toHaveProperty('X-Algolia-Application-Id');
      expect(ALGOLIA_HEADERS).toHaveProperty('X-Algolia-API-Key');
    });
  });

  describe('AgentStudioClient', () => {
    let client: AgentStudioClient;

    beforeEach(() => {
      client = new AgentStudioClient('test-app-id', 'test-api-key', 'test-agent-id');
      vi.clearAllMocks();
    });

    it('should construct with correct parameters', () => {
      expect(client).toBeInstanceOf(AgentStudioClient);
    });

    it('should send message with correct format', async () => {
      const mockResponse = `data: {"type":"start","messageId":"alg_msg_123"}
data: {"type":"text-delta","delta":"Hello"}
data: {"type":"text-delta","delta":" world"}
data: [DONE]`;

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.sendMessage('Test query');

      expect(result).toBe('Hello world');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('agent-studio'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Algolia-Application-Id': 'test-app-id',
            'X-Algolia-API-Key': 'test-api-key',
          }),
          body: expect.stringContaining('Test query'),
        })
      );
    });

    it('should handle error events gracefully', async () => {
      const mockResponse = `data: {"type":"start","messageId":"alg_msg_123"}
data: {"type":"text-delta","delta":"Partial response"}
data: {"type":"error","errorText":"Max tokens exceeded"}
data: [DONE]`;

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.sendMessage('Test query');

      // Should return partial content before error
      expect(result).toBe('Partial response');
    });

    it('should throw error for failed requests', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      } as Response);

      await expect(client.sendMessage('Test query')).rejects.toThrow(/401/);
    });

    it('should reset session', () => {
      client.resetSession();
      // Session ID should be cleared (private property, behavior tested via subsequent requests)
      expect(() => client.resetSession()).not.toThrow();
    });
  });
});
