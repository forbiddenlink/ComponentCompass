import { useState, useEffect, useMemo, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { ALGOLIA_STREAM_URL, ALGOLIA_HEADERS, agentClient } from '../services/algolia';
import { trackMessageView } from '../services/insights';
import type { LocalMessage, SessionStats, SourceBadge } from './useMessages';

// --- Helper: extract text from AI SDK UIMessage ---

function extractMessageText(msg: UIMessage): string {
    if (!msg.parts || msg.parts.length === 0) return '';
    return msg.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map(p => p.text)
        .join('\n\n');
}

// These are imported from ChatInterface via parameters — we duplicate the pure
// functions here to avoid a circular dependency. They could also live in a
// shared utils file, but keeping them here matches the task spec (leave them in
// ChatInterface too).
function getSourceBadgesLocal(content: string, INDEX_SOURCES: SourceBadge[]): SourceBadge[] {
    const lower = content.toLowerCase();
    const selected: SourceBadge[] = [];

    if (lower.match(/button|card|modal|input|select|table|form|component|avatar|badge|tooltip|dialog|nav|tab|accordion|dropdown/)) {
        selected.push(INDEX_SOURCES[0]);
    }
    if (lower.match(/```|import|export|function|const |class |code|implement|example|snippet|usage/)) {
        selected.push(INDEX_SOURCES[1]);
    }
    if (lower.match(/a11y|accessibility|wcag|aria|screen reader|keyboard|focus|contrast|role=/)) {
        selected.push(INDEX_SOURCES[2]);
    }
    if (lower.match(/token|spacing|color|font|typography|size|radius|shadow|border|theme|css var|--/)) {
        selected.push(INDEX_SOURCES[3]);
    }
    if (lower.match(/usage|analytics|popular|frequently|adoption|metric|trend/)) {
        selected.push(INDEX_SOURCES[4]);
    }
    if (lower.match(/storybook|story|stories|visual|preview|variant|prop/)) {
        selected.push(INDEX_SOURCES[5]);
    }
    if (lower.match(/changelog|version|update|deprecat|breaking|migration|release/)) {
        selected.push(INDEX_SOURCES[6]);
    }

    if (selected.length === 0) {
        const hash = content.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        selected.push(INDEX_SOURCES[hash % INDEX_SOURCES.length]);
        selected.push(INDEX_SOURCES[(hash + 3) % INDEX_SOURCES.length]);
        if (content.length > 200) {
            selected.push(INDEX_SOURCES[(hash + 5) % INDEX_SOURCES.length]);
        }
    }

    const seen = new Set<string>();
    return selected.filter(s => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
    });
}

function generateSuggestionsLocal(content: string): string[] {
    const lower = content.toLowerCase();
    const suggestions: string[] = [];

    const componentMatches = content.match(/\b(Button|Card|Modal|Input|Select|Table|Form|Avatar|Badge|Tooltip|Dialog|Nav|Tab|Accordion|Dropdown|Checkbox|Radio|Switch|Slider|Toast|Alert|Banner|Breadcrumb|Pagination|Sidebar|Header|Footer|Menu|Popover)\b/g);
    const uniqueComponents = componentMatches ? [...new Set(componentMatches)] : [];

    if (uniqueComponents.length > 0) {
        const comp = uniqueComponents[0];
        suggestions.push(`Show ${comp} accessibility guidelines`);
        if (suggestions.length < 3) {
            suggestions.push(`View ${comp} code examples`);
        }
        if (uniqueComponents.length > 1 && suggestions.length < 3) {
            suggestions.push(`Compare ${uniqueComponents[0]} and ${uniqueComponents[1]} variants`);
        }
    }

    if (lower.includes('accessibility') || lower.includes('a11y') || lower.includes('wcag')) {
        if (suggestions.length < 3) suggestions.push('Show WCAG compliance checklist');
        if (suggestions.length < 3) suggestions.push('Keyboard navigation patterns');
    }
    if (lower.includes('token') || lower.includes('spacing') || lower.includes('color')) {
        if (suggestions.length < 3) suggestions.push('List all design token categories');
        if (suggestions.length < 3) suggestions.push('How to use tokens in CSS');
    }
    if (lower.includes('code') || lower.includes('import') || lower.includes('example')) {
        if (suggestions.length < 3) suggestions.push('Show TypeScript interface');
        if (suggestions.length < 3) suggestions.push('View related Storybook stories');
    }

    const fallbacks = [
        'What components are available?',
        'Show design token system',
        'Accessibility best practices',
        'Most popular components',
        'How to customize themes',
        'Component migration guide',
    ];

    const hash = content.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    let fallbackIdx = hash % fallbacks.length;
    while (suggestions.length < 3) {
        const fb = fallbacks[fallbackIdx % fallbacks.length];
        if (!suggestions.includes(fb)) {
            suggestions.push(fb);
        }
        fallbackIdx++;
    }

    return suggestions.slice(0, 3);
}

interface UseStreamingParams {
    displayMessages: LocalMessage[];
    setDisplayMessages: React.Dispatch<React.SetStateAction<LocalMessage[]>>;
    setSessionStats: React.Dispatch<React.SetStateAction<SessionStats>>;
    indexSources: SourceBadge[];
}

export function useStreamingChat({
    displayMessages,
    setDisplayMessages,
    setSessionStats,
    indexSources,
}: UseStreamingParams) {
    const [useStreamingMode, setUseStreamingMode] = useState(true);
    const [isFallbackLoading, setIsFallbackLoading] = useState(false);

    const transport = useMemo(() => new DefaultChatTransport({
        api: ALGOLIA_STREAM_URL,
        headers: ALGOLIA_HEADERS,
    }), []);

    const {
        messages: streamMessages,
        sendMessage: sendStreamMessage,
        status: chatStatus,
        setMessages: setStreamMessages,
        error: streamError,
    } = useChat({
        transport,
        onError: (err) => {
            console.error('Streaming error, falling back to non-streaming:', err);
        },
    });

    const isStreaming = chatStatus === 'streaming' || chatStatus === 'submitted';
    const isLoading = isStreaming || isFallbackLoading;

    // Sync streaming messages into display messages
    useEffect(() => {
        if (!useStreamingMode || streamMessages.length === 0) return;

        const lastStreamMsg = streamMessages[streamMessages.length - 1];
        if (!lastStreamMsg || lastStreamMsg.role !== 'assistant') return;

        const streamText = extractMessageText(lastStreamMsg);
        if (!streamText) return;

        setDisplayMessages(prev => {
            const lastDisplay = prev[prev.length - 1];
            if (lastDisplay && lastDisplay.role === 'assistant' && lastDisplay.id === lastStreamMsg.id) {
                return prev.map(m =>
                    m.id === lastStreamMsg.id
                        ? { ...m, content: streamText }
                        : m
                );
            } else if (lastDisplay && lastDisplay.role === 'user') {
                return [...prev, {
                    id: lastStreamMsg.id,
                    role: 'assistant' as const,
                    content: streamText,
                    timestamp: new Date(),
                }];
            }
            return prev;
        });
    }, [streamMessages, useStreamingMode, setDisplayMessages]);

    // When streaming finishes, add sources and suggestions
    useEffect(() => {
        if (chatStatus === 'ready' && streamMessages.length > 0 && useStreamingMode) {
            const lastStreamMsg = streamMessages[streamMessages.length - 1];
            if (lastStreamMsg?.role === 'assistant') {
                const text = extractMessageText(lastStreamMsg);
                if (text) {
                    const sources = getSourceBadgesLocal(text, indexSources);
                    const suggestions = generateSuggestionsLocal(text);

                    setDisplayMessages(prev => {
                        return prev.map(m =>
                            m.id === lastStreamMsg.id
                                ? { ...m, content: text, sources, suggestions }
                                : m
                        );
                    });

                    trackMessageView([lastStreamMsg.id]);
                }
            }
        }
    }, [chatStatus, streamMessages, useStreamingMode, setDisplayMessages, indexSources]);

    const handleFallbackSend = useCallback(async (messageContent: string, file: File | null) => {
        setIsFallbackLoading(true);
        try {
            const response = await agentClient.sendMessage(messageContent);
            const sources = getSourceBadgesLocal(response, indexSources);
            const suggestions = generateSuggestionsLocal(response);

            const assistantMessage: LocalMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                sources,
                suggestions,
            };
            setDisplayMessages(prev => [...prev, assistantMessage]);

            setSessionStats(prev => ({
                ...prev,
                queries: prev.queries + 1,
                componentsFound: prev.componentsFound + (messageContent.match(/\b(Button|Card|Modal|Input|Select|Dialog|Checkbox|Badge|Toast|Accordion|Alert|Nav|Tab)\b/gi) || [messageContent]).length,
                screenshotsAnalyzed: file?.type.startsWith('image/') ? prev.screenshotsAnalyzed + 1 : prev.screenshotsAnalyzed
            }));
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: LocalMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I encountered an issue searching the design system. This could be due to:\n\n- **Algolia Agent Studio configuration** \u2014 Check your \`.env\` file\n- **Network connectivity** \u2014 Verify your internet connection\n- **API rate limits** \u2014 You may have exceeded quota\n\n**Quick fixes:**\n1. Verify your \`VITE_ALGOLIA_AGENT_ID\` is correct\n2. Check that indices are properly configured\n3. Try again in a moment`,
                timestamp: new Date(),
            };
            setDisplayMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsFallbackLoading(false);
        }
    }, [setDisplayMessages, setSessionStats, indexSources]);

    // Handle stream errors — switch to fallback and retry only if no content was streamed
    useEffect(() => {
        if (streamError && useStreamingMode) {
            setUseStreamingMode(false);
            const lastMsg = displayMessages[displayMessages.length - 1];
            if (!lastMsg || lastMsg.role !== 'assistant') {
                console.warn('Streaming failed with no content, retrying via fallback.');
                const lastUserMsg = [...displayMessages].reverse().find(m => m.role === 'user');
                if (lastUserMsg) {
                    handleFallbackSend(lastUserMsg.content, null);
                }
            } else {
                const text = lastMsg.content;
                if (text && !lastMsg.sources) {
                    const sources = getSourceBadgesLocal(text, indexSources);
                    const suggestions = generateSuggestionsLocal(text);
                    setDisplayMessages(prev => prev.map(m =>
                        m.id === lastMsg.id ? { ...m, sources, suggestions } : m
                    ));
                }
            }
        }
    }, [streamError, useStreamingMode]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        isLoading,
        isStreaming,
        sendStreamMessage,
        handleFallbackSend,
        setStreamMessages,
        useStreamingMode,
    };
}
