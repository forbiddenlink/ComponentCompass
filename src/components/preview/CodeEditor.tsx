import { SandpackCodeEditor, useSandpack } from '@codesandbox/sandpack-react';
import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { CopyIcon, CheckIcon, DownloadIcon, RefreshCwIcon } from '../Icons';

interface CodeEditorProps {
    showLineNumbers?: boolean;
    wrapContent?: boolean;
    readOnly?: boolean;
    className?: string;
}

export function CodeEditor({
    showLineNumbers = true,
    wrapContent = false,
    readOnly = false,
    className,
}: CodeEditorProps) {
    const { sandpack } = useSandpack();
    const [copied, setCopied] = useState(false);

    const currentCode = sandpack.files[sandpack.activeFile]?.code || '';

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(currentCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [currentCode]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([currentCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sandpack.activeFile.replace('/', '') || 'component.jsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [currentCode, sandpack.activeFile]);

    const handleReset = useCallback(() => {
        sandpack.resetAllFiles();
    }, [sandpack]);

    return (
        <div className={cn('relative flex flex-col h-full', className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 bg-ink/5 border-b border-ink/10">
                <span className="text-caption font-mono text-muted">
                    {sandpack.activeFile}
                </span>
                <div className="flex items-center gap-1">
                    {!readOnly && (
                        <button
                            onClick={handleReset}
                            className="p-1.5 text-muted hover:text-ink hover:bg-ink/5 rounded transition-colors"
                            title="Reset code"
                        >
                            <RefreshCwIcon className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={handleDownload}
                        className="p-1.5 text-muted hover:text-ink hover:bg-ink/5 rounded transition-colors"
                        title="Download code"
                    >
                        <DownloadIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-muted hover:text-ink hover:bg-ink/5 rounded transition-colors"
                        title={copied ? 'Copied!' : 'Copy code'}
                    >
                        {copied ? (
                            <CheckIcon className="w-3.5 h-3.5 text-terrain" />
                        ) : (
                            <CopyIcon className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <SandpackCodeEditor
                    showLineNumbers={showLineNumbers}
                    showInlineErrors
                    wrapContent={wrapContent}
                    readOnly={readOnly}
                    style={{
                        height: '100%',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '13px',
                    }}
                />
            </div>
        </div>
    );
}

export default CodeEditor;
