import { useEffect } from 'react';

interface UseKeyboardShortcutsParams {
    handleNewConversation: () => void;
    exportConversation: () => void;
    toggleStats: () => void;
    hasMessages: boolean;
}

export function useKeyboardShortcuts({
    handleNewConversation,
    exportConversation,
    toggleStats,
    hasMessages,
}: UseKeyboardShortcutsParams): void {
    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                handleNewConversation();
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 'e' && hasMessages) {
                e.preventDefault();
                exportConversation();
            }

            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                toggleStats();
            }
        };

        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [hasMessages, handleNewConversation, exportConversation, toggleStats]);
}
