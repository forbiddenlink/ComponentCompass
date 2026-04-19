import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    SendIcon as Send,
    ImageIcon as Image,
    PaperclipIcon as Paperclip,
    CompassIcon as Compass,
    MapIcon as Map,
    NavigationIcon as Navigation,
    RotateCwIcon as RotateCw,
    DownloadIcon as Download,
    CloseIcon as X,
    CheckCircleIcon as CheckCircle,
    AlertCircleIcon as AlertCircle,
} from './Icons';
import { cn } from '../lib/utils';
import { createRateLimiter } from '../lib/rate-limit';
import { CodeBlock } from './CodeBlock';
import { FeedbackButtons } from './FeedbackButtons';
import { ComponentCard, KNOWN_COMPONENTS } from './ComponentCard';
import { trackSuggestionClick } from '../services/insights';
import { useMessages } from '../hooks/useMessages';
import { useStreamingChat } from '../hooks/useStreaming';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { SourceBadge } from '../hooks/useMessages';

// --- Types ---

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
}

// --- Index Source Names (type-safe) ---

const INDEX_SOURCES: SourceBadge[] = [
    { name: 'Components', color: 'text-white', bgColor: 'bg-ocean', borderColor: 'border-ocean' },
    { name: 'Code Examples', color: 'text-white', bgColor: 'bg-terrain', borderColor: 'border-terrain' },
    { name: 'Accessibility', color: 'text-ink', bgColor: 'bg-gold', borderColor: 'border-gold' },
    { name: 'Design Tokens', color: 'text-white', bgColor: 'bg-compass', borderColor: 'border-compass' },
    { name: 'Usage Analytics', color: 'text-white', bgColor: 'bg-ink/70', borderColor: 'border-ink/40' },
    { name: 'Storybook', color: 'text-white', bgColor: 'bg-compass-dark', borderColor: 'border-compass-dark' },
    { name: 'Changelog', color: 'text-ink', bgColor: 'bg-parchment', borderColor: 'border-ink/30' },
];

// Rate limiter: 10 messages per minute
const messageLimiter = createRateLimiter(10, 60_000);

// Toast Component
const ToastNotification = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <AlertCircle className="w-5 h-5" />
    };

    const colors = {
        success: 'bg-terrain border-terrain',
        error: 'bg-compass border-compass-dark',
        info: 'bg-ocean border-ink'
    };

    return (
        <div className={`fixed top-4 right-4 md:top-24 md:right-8 left-4 md:left-auto ${colors[type]} text-white px-4 py-3 md:px-5 rounded shadow-xl border-2 z-50 animate-in slide-in-from-right-4 flex items-center gap-3`}>
            {icons[type]}
            <span className="font-semibold text-sm md:text-base flex-1">{message}</span>
            <button
                onClick={onClose}
                className="hover:opacity-70 transition-opacity flex-shrink-0"
                aria-label="Close notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// Source Badges Component
const SourceBadges = ({ sources }: { sources: SourceBadge[] }) => (
    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-ink/8">
        <span className="text-caption text-muted uppercase tracking-wider self-center mr-1">Sources:</span>
        {sources.map((source) => (
            <span
                key={source.name}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-ink/5 text-caption text-ink/70 border-l-2 border-ink/20"
            >
                {source.name}
            </span>
        ))}
    </div>
);

// Follow-up Suggestion Chips Component
const SuggestionChips = ({ suggestions, onSelect }: { suggestions: string[]; onSelect: (query: string) => void }) => (
    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-ink/8">
        <span className="text-caption text-muted uppercase tracking-wider self-center mr-1 w-full mb-1">Follow up:</span>
        {suggestions.map((suggestion) => (
            <button
                key={suggestion}
                onClick={() => onSelect(suggestion)}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ink/15 rounded-lg text-small text-ink hover:border-compass hover:bg-compass/5 transition-colors focus-ring"
            >
                <Navigation className="w-3.5 h-3.5 text-compass/60 group-hover:text-compass transition-colors" />
                <span className="truncate max-w-[200px]">{suggestion}</span>
            </button>
        ))}
    </div>
);

// --- Main Component ---

export function ChatInterface() {
    const [input, setInput] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
    }, []);

    // Use extracted hooks
    const {
        displayMessages,
        setDisplayMessages,
        sessionStats,
        setSessionStats,
        handleNewConversation,
        exportConversation,
        setStreamMessagesRef,
    } = useMessages({ showToast });

    const {
        isLoading,
        isStreaming,
        sendStreamMessage,
        handleFallbackSend,
        setStreamMessages,
        useStreamingMode,
    } = useStreamingChat({
        displayMessages,
        setDisplayMessages,
        setSessionStats,
        indexSources: INDEX_SOURCES,
    });

    // Wire up the ref so useMessages can clear stream messages on new conversation
    useEffect(() => {
        setStreamMessagesRef.current = setStreamMessages as (messages: never[]) => void;
    }, [setStreamMessages, setStreamMessagesRef]);

    useKeyboardShortcuts({
        handleNewConversation,
        exportConversation,
        toggleStats: useCallback(() => setShowStats(prev => !prev), []),
        hasMessages: displayMessages.length > 0,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [displayMessages, isLoading]);

    // Scroll button visibility handler
    useEffect(() => {
        const handleScroll = () => {
            if (messagesContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
                setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
            }
        };

        const container = messagesContainerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAttachedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setAttachedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !attachedFile) || isLoading) return;

        if (!messageLimiter.canProceed()) {
            showToast('Please wait before sending more messages', 'error');
            return;
        }
        messageLimiter.record();

        let messageContent = input;
        let imageUrl: string | undefined;
        let fileName: string | undefined;

        if (attachedFile) {
            fileName = attachedFile.name;
            if (attachedFile.type.startsWith('image/')) {
                imageUrl = URL.createObjectURL(attachedFile);
                messageContent = input || `[Uploaded image: ${fileName}]`;
            } else {
                messageContent = input || `[Uploaded file: ${fileName}]`;
            }
        }

        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: messageContent,
            timestamp: new Date(),
            imageUrl,
            fileName,
        };

        setDisplayMessages(prev => [...prev, userMessage]);
        setInput('');
        const currentFile = attachedFile;
        setAttachedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (useStreamingMode) {
            try {
                await sendStreamMessage({ text: messageContent });
                setSessionStats(prev => ({
                    ...prev,
                    queries: prev.queries + 1,
                    componentsFound: prev.componentsFound + (messageContent.match(/\b(Button|Card|Modal|Input|Select|Dialog|Checkbox|Badge|Toast|Accordion|Alert|Nav|Tab)\b/gi) || [messageContent]).length,
                    screenshotsAnalyzed: currentFile?.type.startsWith('image/') ? prev.screenshotsAnalyzed + 1 : prev.screenshotsAnalyzed
                }));
            } catch (error) {
                console.error('Streaming send failed, trying fallback:', error);
                await handleFallbackSend(messageContent, currentFile);
            }
        } else {
            await handleFallbackSend(messageContent, currentFile);
        }
    };

    const handleExampleQuery = (query: string) => {
        setInput(query);
        setTimeout(() => {
            const textarea = document.querySelector('textarea');
            if (textarea) {
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    bubbles: true
                });
                textarea.dispatchEvent(enterEvent);
            }
        }, 300);
    };

    const handleSuggestionSelect = (query: string) => {
        trackSuggestionClick(query, []);
        setInput(query);
        setTimeout(() => {
            const textarea = document.querySelector('textarea');
            if (textarea) {
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    bubbles: true
                });
                textarea.dispatchEvent(enterEvent);
            }
        }, 150);
    };

    const detectComponents = (text: string): string[] => {
        const found: string[] = [];
        for (const name of KNOWN_COMPONENTS) {
            const regex = new RegExp(`\\b${name}\\b`, 'i');
            if (regex.test(text)) {
                found.push(name);
            }
        }
        return found.slice(0, 2); // max 2 per message
    };

    return (
        <div className="flex flex-col h-screen h-[100dvh] bg-parchment topo-background relative overflow-hidden">
            {/* Skip Navigation */}
            <a
                href="#messages"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-compass focus:text-white focus:rounded-lg focus:shadow-lg"
            >
                Skip to messages
            </a>

            {/* Toast Notifications */}
            {toast && (
                <ToastNotification
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Decorative Compass Rose - Background (hidden on mobile) */}
            <div className="absolute top-20 right-10 w-32 h-32 opacity-5 pointer-events-none compass-spin hidden md:block">
                <Compass className="w-full h-full text-ink" />
            </div>

            {/* Header */}
            <header className="bg-warm-white border-b border-ink/15 px-4 py-4 md:px-6 shadow-sm relative z-10 safe-pt">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 min-w-0">
                        <div
                            className={cn(
                                "relative w-9 h-9 md:w-11 md:h-11 wax-seal rounded-full flex items-center justify-center flex-shrink-0 transition-transform",
                                isLoading && "scale-105"
                            )}
                            title={isLoading ? "Charting territories..." : "ComponentCompass"}
                        >
                            <Compass
                                className={cn(
                                    "w-4.5 h-4.5 md:w-5 md:h-5 text-white transition-transform",
                                    isLoading && "compass-spin"
                                )}
                            />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-h1 text-ink tracking-tight font-display truncate">
                                ComponentCompass
                            </h1>
                            <p className="text-caption text-muted tracking-wide uppercase">
                                Navigate Your Design System
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-2.5 flex-shrink-0">
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="px-3 py-2 text-small text-ink border border-ink/20 rounded-lg hover:bg-ink/5 transition-colors focus-ring"
                            title="Toggle Session Statistics"
                        >
                            <Map className="w-4 h-4 inline mr-1.5 opacity-60" />
                            <span className="hidden sm:inline">Stats</span>
                        </button>
                        {displayMessages.length > 0 && (
                            <>
                                <button
                                    onClick={exportConversation}
                                    className="px-3 py-2 text-small text-ink border border-ink/20 rounded-lg hover:bg-ink/5 transition-colors focus-ring"
                                    title="Export Conversation"
                                >
                                    <Download className="w-4 h-4 inline mr-1.5 opacity-60" />
                                    <span className="hidden sm:inline">Export</span>
                                </button>
                                <button
                                    onClick={handleNewConversation}
                                    className="px-3 py-2 text-small bg-compass text-white rounded-lg hover:bg-compass-dark transition-colors shadow-sm focus-ring"
                                    title="New Conversation"
                                >
                                    <RotateCw className="w-4 h-4 inline mr-1.5" />
                                    <span className="hidden sm:inline">New</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Session Statistics Panel */}
                {showStats && (
                    <div className="max-w-7xl mx-auto mt-4 p-4 bg-white border border-ink/10 rounded-lg shadow-sm animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-h2 text-compass font-display">
                                    {sessionStats.queries}
                                </div>
                                <div className="text-caption text-muted uppercase tracking-wide">Queries</div>
                            </div>
                            <div>
                                <div className="text-h2 text-ocean font-display">
                                    {sessionStats.indicesSearched}
                                </div>
                                <div className="text-caption text-muted uppercase tracking-wide">Indices</div>
                            </div>
                            <div>
                                <div className="text-h2 text-terrain font-display">
                                    {sessionStats.componentsFound}
                                </div>
                                <div className="text-caption text-muted uppercase tracking-wide">Components</div>
                            </div>
                            <div>
                                <div className="text-h2 text-gold font-display">
                                    {sessionStats.screenshotsAnalyzed}
                                </div>
                                <div className="text-caption text-muted uppercase tracking-wide">Screenshots</div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Messages Container */}
            <div ref={messagesContainerRef} id="messages" className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-8">
                <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
                    {/* Welcome Screen */}
                    {displayMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in px-4">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 wax-seal rounded-full mb-6 flex items-center justify-center">
                                <Compass className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <h2 className="text-display text-ink tracking-tight font-display mb-3">
                                Chart Your Course
                            </h2>
                            <p className="max-w-xl text-body text-terrain mb-2">
                                Navigate your design system with an intelligent AI assistant.
                            </p>
                            <p className="max-w-lg text-small text-muted mb-10">
                                Discover components, explore implementations, and find accessibility guidelines.
                            </p>

                            {/* Suggested Prompts */}
                            <div className="w-full max-w-3xl">
                                <p className="text-caption text-muted uppercase tracking-wider mb-4">
                                    Try asking about
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { icon: <Navigation className="w-4 h-4" />, text: 'Show me accessible buttons', desc: 'WCAG compliant variants' },
                                        { icon: <Map className="w-4 h-4" />, text: 'Card component implementation', desc: 'Code examples' },
                                        { icon: <Image className="w-4 h-4" />, text: 'Analyze this design mockup', desc: 'Vision analysis' },
                                        { icon: <Compass className="w-4 h-4" />, text: 'Design tokens for spacing', desc: 'System foundations' }
                                    ].map((prompt) => (
                                        <button
                                            key={prompt.text}
                                            onClick={() => handleExampleQuery(prompt.text)}
                                            className="group p-4 bg-white border border-ink/10 rounded-lg text-left hover:border-compass/40 hover:shadow-sm transition-all focus-ring"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-ink/5 flex items-center justify-center text-ink/50 group-hover:bg-compass/10 group-hover:text-compass transition-colors">
                                                    {prompt.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-small font-medium text-ink group-hover:text-compass transition-colors truncate">
                                                        {prompt.text}
                                                    </div>
                                                    <div className="text-caption text-muted">
                                                        {prompt.desc}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message List */}
                    {displayMessages.map((msg, index) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full animate-in fade-in slide-in-from-bottom-2",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[90%] md:max-w-[80%] rounded-lg p-4 md:p-5",
                                    msg.role === 'user'
                                        ? "bg-ocean text-white shadow-sm"
                                        : "bg-white border border-ink/10 text-ink shadow-sm"
                                )}
                            >
                                {/* Timestamp */}
                                <div className={cn(
                                    "text-caption font-mono mb-2 tracking-wider uppercase",
                                    msg.role === 'user' ? "text-white/50" : "text-muted"
                                )}>
                                    {msg.role === 'user' ? 'You' : 'Compass'} · {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    {msg.role === 'assistant' && isStreaming && index === displayMessages.length - 1 && (
                                        <span className="ml-2 text-compass/70">●</span>
                                    )}
                                </div>

                                {msg.imageUrl && (
                                    <div className="mb-4 md:mb-5 p-2 bg-ink/5 rounded border border-ink/10">
                                        <img
                                            src={msg.imageUrl}
                                            alt="Uploaded screenshot"
                                            className="max-w-full rounded shadow-lg"
                                        />
                                        <p className="text-xs text-terrain mt-2 italic">Screenshot Analysis</p>
                                    </div>
                                )}

                                <div className={cn(
                                    "prose prose-sm max-w-none",
                                    msg.role === 'user'
                                        ? "prose-invert [&>p]:text-white [&>ul]:text-white [&>ol]:text-white"
                                        : "[&>p]:text-ink [&>ul]:text-ink [&>ol]:text-ink [&>h1]:font-display [&>h2]:font-display [&>h3]:font-display [&>strong]:text-compass"
                                )}>
                                    <ReactMarkdown
                                        components={{
                                            code({ className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                const codeString = String(children).replace(/\n$/, '');
                                                const isInline = !match && !codeString.includes('\n');

                                                if (!isInline && match) {
return <CodeBlock code={codeString} language={match[1]} />;
                                                }

                                                return (
                                                    <code className={cn(
                                                        "rounded px-1.5 py-0.5 text-sm font-mono border",
                                                        msg.role === 'user'
                                                            ? "bg-white/20 border-white/30"
                                                            : "bg-ink/10 border-ink/20 text-compass",
                                                        className
                                                    )} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            a({ children, href }) {
                                                return (
                                                    <a
                                                        href={href}
                                                        className="text-compass underline decoration-compass/40 hover:decoration-compass font-semibold transition-all"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {children}
                                                    </a>
                                                );
                                            }
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>

                                {/* Feedback Buttons */}
                                {msg.role === 'assistant' && !(isStreaming && index === displayMessages.length - 1) && (
                                    <FeedbackButtons messageId={msg.id} />
                                )}

                                {/* Component Cards */}
                                {msg.role === 'assistant' && !(isStreaming && index === displayMessages.length - 1) && (
                                    (() => {
                                        const detected = detectComponents(msg.content);
                                        return detected.length > 0 ? (
                                            <div className="mt-2">
                                                {detected.map(name => (
                                                    <ComponentCard
                                                        key={name}
                                                        componentName={name}
                                                        onAction={handleSuggestionSelect}
                                                    />
                                                ))}
                                            </div>
                                        ) : null;
                                    })()
                                )}

                                {/* Source Badges */}
                                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                    <SourceBadges sources={msg.sources} />
                                )}

                                {/* Follow-up Suggestion Chips */}
                                {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && !isLoading && (
                                    <SuggestionChips suggestions={msg.suggestions} onSelect={handleSuggestionSelect} />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading State */}
                    {isLoading && (displayMessages.length === 0 || displayMessages[displayMessages.length - 1]?.role !== 'assistant') && (
                        <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2">
                            <div className="max-w-[90%] md:max-w-[80%] bg-white border border-ink/10 rounded-lg p-4 md:p-5 shadow-sm">
                                <div className="text-caption font-mono mb-3 tracking-wider uppercase text-muted">
                                    Compass
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <Compass className="w-5 h-5 text-compass/60 compass-spin flex-shrink-0" />
                                    <span className="text-small text-ink">Searching design system...</span>
                                </div>

                                {/* Skeleton content */}
                                <div className="space-y-2">
                                    <div className="h-3 bg-ink/5 rounded-lg animate-pulse"></div>
                                    <div className="h-3 bg-ink/5 rounded-lg animate-pulse w-3/4"></div>
                                    <div className="h-3 bg-ink/5 rounded-lg animate-pulse w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-ink/10 bg-warm-white px-4 py-4 md:px-6 md:py-5 safe-pb">
                <div className="max-w-4xl mx-auto">
                    {/* File Attachment Preview */}
                    {attachedFile && (
                        <div className="mb-3 p-3 bg-gold/5 border border-gold/30 rounded-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {attachedFile.type.startsWith('image/') ? (
                                    <Image className="w-4 h-4 text-gold flex-shrink-0" />
                                ) : (
                                    <Paperclip className="w-4 h-4 text-gold flex-shrink-0" />
                                )}
                                <span className="text-small text-ink truncate">{attachedFile.name}</span>
                            </div>
                            <button
                                onClick={handleRemoveFile}
                                className="p-1 text-ink/40 hover:text-ink transition-colors flex-shrink-0 ml-2 focus-ring rounded"
                                aria-label="Remove attached file"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Input Box */}
                    <div className="flex items-end gap-2 p-2 bg-white border border-ink/15 rounded-lg focus-within:border-compass/50 focus-within:shadow-sm transition-all">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="screenshot-upload"
                            aria-label="Upload screenshot for AI analysis"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 text-ink/40 hover:text-compass hover:bg-compass/5 rounded-lg transition-colors flex-shrink-0 focus-ring"
                            title="Upload image"
                            aria-label="Upload screenshot for AI analysis"
                        >
                            <Image className="w-5 h-5" />
                        </button>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask about components, accessibility, tokens..."
                            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none max-h-32 py-2.5 text-body text-ink placeholder-muted"
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />

                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !attachedFile) || isLoading}
                            className={cn(
                                "p-2.5 rounded-lg transition-all flex-shrink-0 focus-ring",
                                (input.trim() || attachedFile) && !isLoading
                                    ? "bg-compass text-white hover:bg-compass-dark shadow-sm"
                                    : "bg-ink/5 text-ink/30 cursor-not-allowed"
                            )}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-3 text-center text-caption text-muted flex items-center justify-center gap-3">
                        <span>Powered by Algolia</span>
                        <span className="hidden sm:inline text-ink/20">·</span>
                        <span className="hidden sm:inline">⏎ send</span>
                        <span className="hidden md:inline text-ink/20">·</span>
                        <span className="hidden md:inline">⇧⏎ new line</span>
                    </div>
                </div>
            </div>

            {/* Scroll-to-Bottom FAB */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-24 md:bottom-32 right-4 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-compass text-white rounded-full shadow-xl hover:bg-compass-dark transition-all hover:scale-110 z-20 flex items-center justify-center wax-seal"
                    aria-label="Scroll to bottom"
                >
                    <Navigation className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                </button>
            )}
        </div>
    );
}
