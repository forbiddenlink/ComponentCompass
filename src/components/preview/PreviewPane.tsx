import { SandpackPreview, useSandpack, SandpackConsole } from '@codesandbox/sandpack-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { RefreshCwIcon, ExternalLinkIcon, TerminalIcon } from '../Icons';
import { PreviewErrorBoundary } from './ErrorBoundary';

interface PreviewPaneProps {
    showConsole?: boolean;
    showRefreshButton?: boolean;
    showOpenInNewTab?: boolean;
    className?: string;
}

export function PreviewPane({
    showConsole = false,
    showRefreshButton = true,
    showOpenInNewTab = false,
    className,
}: PreviewPaneProps) {
    const { sandpack } = useSandpack();
    const [consoleVisible, setConsoleVisible] = useState(showConsole);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Force re-run
        sandpack.runSandpack();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Preview Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-ink/5 border-b border-ink/10">
                <div className="flex items-center gap-2">
                    <span className="text-caption font-semibold text-ink uppercase tracking-wider">
                        Preview
                    </span>
                    {sandpack.status === 'running' && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-terrain">
                            <span className="w-1.5 h-1.5 rounded-full bg-terrain animate-pulse" />
                            Live
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setConsoleVisible(!consoleVisible)}
                        className={cn(
                            'p-1.5 rounded transition-colors',
                            consoleVisible
                                ? 'bg-compass/10 text-compass'
                                : 'text-muted hover:text-ink hover:bg-ink/5'
                        )}
                        title="Toggle console"
                    >
                        <TerminalIcon className="w-3.5 h-3.5" />
                    </button>
                    {showRefreshButton && (
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-1.5 text-muted hover:text-ink hover:bg-ink/5 rounded transition-colors disabled:opacity-50"
                            title="Refresh preview"
                        >
                            <RefreshCwIcon
                                className={cn(
                                    'w-3.5 h-3.5',
                                    isRefreshing && 'animate-spin'
                                )}
                            />
                        </button>
                    )}
                    {showOpenInNewTab && (
                        <button
                            onClick={() => {
                                // Open in CodeSandbox
                                const params = new URLSearchParams();
                                Object.entries(sandpack.files).forEach(
                                    ([path, file]) => {
                                        params.append(
                                            `files[${path}]`,
                                            file.code
                                        );
                                    }
                                );
                                window.open(
                                    `https://codesandbox.io/api/v1/sandboxes/define?parameters=${btoa(
                                        JSON.stringify({
                                            files: Object.fromEntries(
                                                Object.entries(
                                                    sandpack.files
                                                ).map(([path, file]) => [
                                                    path.startsWith('/')
                                                        ? path.slice(1)
                                                        : path,
                                                    { content: file.code },
                                                ])
                                            ),
                                        })
                                    )}`,
                                    '_blank'
                                );
                            }}
                            className="p-1.5 text-muted hover:text-ink hover:bg-ink/5 rounded transition-colors"
                            title="Open in CodeSandbox"
                        >
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Preview Area */}
            <div
                className={cn(
                    'flex-1 overflow-hidden',
                    consoleVisible && 'flex flex-col'
                )}
            >
                <PreviewErrorBoundary
                    fallbackMessage="The component preview encountered an error. Try editing the code or resetting."
                    onReset={handleRefresh}
                >
                    <div
                        className={cn(
                            'h-full',
                            consoleVisible && 'h-[60%] border-b border-ink/10'
                        )}
                    >
                        <SandpackPreview
                            showNavigator={false}
                            showRefreshButton={false}
                            showOpenInCodeSandbox={false}
                            style={{
                                height: '100%',
                            }}
                        />
                    </div>
                </PreviewErrorBoundary>

                {/* Console */}
                {consoleVisible && (
                    <div className="h-[40%] bg-deep-charcoal">
                        <div className="px-3 py-1.5 bg-ink/80 border-b border-ink/30">
                            <span className="text-caption font-mono text-parchment/70 uppercase tracking-wider">
                                Console
                            </span>
                        </div>
                        <SandpackConsole
                            style={{
                                height: 'calc(100% - 28px)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '12px',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default PreviewPane;
