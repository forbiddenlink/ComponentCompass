import { useState, useEffect, useCallback, useRef } from 'react';
import { agentClient } from '../services/algolia';

// --- Types ---

export interface LocalMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    imageUrl?: string;
    fileName?: string;
    sources?: SourceBadge[];
    suggestions?: string[];
}

export interface SessionStats {
    queries: number;
    indicesSearched: number;
    componentsFound: number;
    screenshotsAnalyzed: number;
}

export interface SourceBadge {
    name: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

interface UseMessagesParams {
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const DEFAULT_STATS: SessionStats = {
    queries: 0,
    indicesSearched: 7,
    componentsFound: 0,
    screenshotsAnalyzed: 0,
};

function loadSavedMessages(): LocalMessage[] {
    const saved = localStorage.getItem('componentcompass_messages');
    if (!saved) return [];
    try {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: LocalMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
        }));
    } catch {
        return [];
    }
}

function loadSavedStats(): SessionStats {
    const saved = localStorage.getItem('componentcompass_stats');
    if (!saved) return DEFAULT_STATS;
    try {
        return JSON.parse(saved);
    } catch {
        return DEFAULT_STATS;
    }
}

export function useMessages({ showToast }: UseMessagesParams) {
    const [displayMessages, setDisplayMessages] = useState<LocalMessage[]>(loadSavedMessages);
    const [sessionStats, setSessionStats] = useState<SessionStats>(loadSavedStats);
    // Ref to setStreamMessages — set by the caller after useStreamingChat initializes
    const setStreamMessagesRef = useRef<((messages: never[]) => void) | null>(null);

    // Save conversation to localStorage whenever display messages change
    useEffect(() => {
        if (displayMessages.length > 0) {
            localStorage.setItem('componentcompass_messages', JSON.stringify(displayMessages));
        }
    }, [displayMessages]);

    useEffect(() => {
        localStorage.setItem('componentcompass_stats', JSON.stringify(sessionStats));
    }, [sessionStats]);

    const handleNewConversation = useCallback(() => {
        if (displayMessages.length > 0) {
            const confirmed = window.confirm('Start a new conversation? Your current conversation will be cleared.');
            if (confirmed) {
                setDisplayMessages([]);
                setStreamMessagesRef.current?.([] as never[]);
                setSessionStats(DEFAULT_STATS);
                localStorage.removeItem('componentcompass_messages');
                localStorage.removeItem('componentcompass_stats');
                agentClient.resetSession();
                showToast('New conversation started', 'success');
            }
        }
    }, [displayMessages.length, showToast]);

    const exportConversation = useCallback(() => {
        const markdown = displayMessages.map(msg => {
            const timestamp = msg.timestamp.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            const role = msg.role === 'user' ? 'USER' : 'COMPASS';
            return `## ${role} \u00b7 ${timestamp}\n\n${msg.content}\n\n---\n`;
        }).join('\n');

        const header = `# ComponentCompass Session Map\n\nExported: ${new Date().toLocaleString()}\n\n**Session Statistics:**\n- Queries: ${sessionStats.queries}\n- Indices Searched: ${sessionStats.indicesSearched}\n- Components Found: ${sessionStats.componentsFound}\n- Screenshots Analyzed: ${sessionStats.screenshotsAnalyzed}\n\n---\n\n`;

        const fullContent = header + markdown;

        const blob = new Blob([fullContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `component-compass-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('Conversation exported successfully!', 'success');
    }, [displayMessages, sessionStats, showToast]);

    return {
        displayMessages,
        setDisplayMessages,
        sessionStats,
        setSessionStats,
        handleNewConversation,
        exportConversation,
        setStreamMessagesRef,
    };
}
