
// Algolia Agent Studio Client
// Supports both non-streaming (fallback) and streaming (via AI SDK) modes

// --- Types ---

interface AgentMessagePart {
    text: string;
}

interface AgentMessage {
    role: 'user' | 'assistant' | 'system';
    parts: AgentMessagePart[];
}

interface AgentCompletionRequest {
    messages: AgentMessage[];
    sessionId?: string;
    context?: Record<string, unknown>;
}

// --- Environment ---

const appId = import.meta.env.VITE_ALGOLIA_APP_ID || '';
const apiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY || '';
const agentId = import.meta.env.VITE_ALGOLIA_AGENT_ID || '';

if (!appId || !apiKey || !agentId) {
    console.warn('Algolia credentials not configured. Please set environment variables.');
}

// --- Streaming transport config (for useChat from @ai-sdk/react) ---

export const ALGOLIA_STREAM_URL = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`;

export const ALGOLIA_HEADERS = {
    'X-Algolia-Application-Id': appId,
    'X-Algolia-API-Key': apiKey,
};

// --- Non-streaming client (fallback) ---

export class AgentStudioClient {
    private appId: string;
    private apiKey: string;
    private endpoint: string;
    private sessionId?: string;

    constructor(appId: string, apiKey: string, agentId: string) {
        this.appId = appId;
        this.apiKey = apiKey;
        this.endpoint = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions`;
    }

    async sendMessage(
        message: string,
        context?: Record<string, unknown>
    ): Promise<string> {
        try {
            const requestBody: AgentCompletionRequest = {
                messages: [
                    {
                        role: 'user',
                        parts: [{ text: message }],
                    },
                ],
                context: context || {},
            };

            // Include session ID if we have one
            if (this.sessionId) {
                requestBody.sessionId = this.sessionId;
            }

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'X-Algolia-Application-Id': this.appId,
                    'X-Algolia-API-Key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Agent Studio error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            // Store session ID for context continuity
            if (data.sessionId) {
                this.sessionId = data.sessionId;
            }

            // The response format uses parts: [{type: "step-start"}, {type: "text", text: "..."}]
            if (data.messages && Array.isArray(data.messages)) {
                const assistantMsg = data.messages.find(
                    (m: { role: string }) => m.role === 'assistant'
                );
                if (assistantMsg?.parts) {
                    return assistantMsg.parts
                        .filter((p: { type: string; text?: string }) => p.type === 'text' && p.text)
                        .map((p: { text: string }) => p.text)
                        .join('\n\n');
                }
            }

            // Fallback: try older content format
            if (data.content && Array.isArray(data.content)) {
                return data.content
                    .filter((item: { type: string }) => item.type === 'text')
                    .map((item: { value?: string; text?: string }) => item.value || item.text)
                    .join('\n\n');
            }

            return 'Sorry, I received an unexpected response format.';
        } catch (error) {
            console.error('Agent Studio API error:', error);
            throw error;
        }
    }

    resetSession() {
        this.sessionId = undefined;
    }
}

// Initialize the agent client with environment variables
export const agentClient = new AgentStudioClient(appId, apiKey, agentId);
