import {
    SandpackProvider,
    SandpackLayout,
} from '@codesandbox/sandpack-react';
import { useState, useMemo, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { CodeEditor } from './CodeEditor';
import { PreviewPane } from './PreviewPane';
import { PreviewErrorBoundary } from './ErrorBoundary';
import {
    COMPONENT_TEMPLATES,
    PREVIEWABLE_COMPONENTS,
    getTemplate,
} from '../../lib/preview/templates';
import { buildDependencies } from '../../lib/preview/dependencies';
import { SunIcon, MoonIcon, CodeIcon, EyeIcon, ColumnsIcon, ExternalLinkIcon } from '../Icons';

// Theme definitions
const LIGHT_THEME = {
    colors: {
        surface1: '#F9F6F0',
        surface2: '#FFFAF3',
        surface3: '#E8E4DD',
        clickable: '#7A8B8C',
        base: '#2C3E50',
        disabled: '#B8BFC4',
        hover: '#C84B31',
        accent: '#C84B31',
        error: '#C84B31',
        errorSurface: '#FEF2F2',
    },
    font: {
        body: "'Epilogue', -apple-system, sans-serif",
        mono: "'JetBrains Mono', monospace",
        size: '13px',
        lineHeight: '1.5',
    },
};

const DARK_THEME = {
    colors: {
        surface1: '#1A1D23',
        surface2: '#22262E',
        surface3: '#2C3038',
        clickable: '#7A8B8C',
        base: '#E8E4DD',
        disabled: '#4A4E54',
        hover: '#D85740',
        accent: '#C84B31',
        error: '#EF4444',
        errorSurface: '#3B1A1A',
    },
    font: {
        body: "'Epilogue', -apple-system, sans-serif",
        mono: "'JetBrains Mono', monospace",
        size: '13px',
        lineHeight: '1.5',
    },
};

type ViewMode = 'split' | 'preview' | 'code';
type ThemeMode = 'light' | 'dark';

interface ComponentPreviewProps {
    componentName: string;
    customCode?: string;
    showEditor?: boolean;
    showConsole?: boolean;
    height?: string;
    defaultViewMode?: ViewMode;
    defaultTheme?: ThemeMode;
    additionalFiles?: Record<string, string>;
    additionalDependencies?: Record<string, string>;
}

export function ComponentPreview({
    componentName,
    customCode,
    showEditor = true,
    showConsole = false,
    height = '400px',
    defaultViewMode = 'split',
    defaultTheme = 'light',
    additionalFiles,
    additionalDependencies,
}: ComponentPreviewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>(
        showEditor ? defaultViewMode : 'preview'
    );
    const [themeMode, setThemeMode] = useState<ThemeMode>(defaultTheme);

    const normalizedName = componentName.toLowerCase();
    const template = getTemplate(normalizedName);

    // Build files for Sandpack
    const files = useMemo(() => {
        const code = customCode || template?.code;
        if (!code) return null;

        const baseFiles: Record<string, string> = {
            '/App.js': code,
            ...(additionalFiles || {}),
        };

        // Add utility files if needed
        if (code.includes('cn(') || code.includes('clsx')) {
            baseFiles['/utils.js'] = `
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
`;
        }

        return baseFiles;
    }, [customCode, template, additionalFiles]);

    // Build dependencies
    const dependencies = useMemo(() => {
        const code = customCode || template?.code || '';
        return buildDependencies(code, {
            ...template?.dependencies,
            ...additionalDependencies,
        });
    }, [customCode, template, additionalDependencies]);

    // Handle export to CodeSandbox
    const handleExportToCodeSandbox = useCallback(() => {
        if (!files) return;

        const parameters = btoa(
            JSON.stringify({
                files: Object.fromEntries(
                    Object.entries(files).map(([path, code]) => [
                        path.startsWith('/') ? path.slice(1) : path,
                        { content: code },
                    ])
                ),
            })
        );

        window.open(
            `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`,
            '_blank'
        );
    }, [files]);

    // No template available
    if (!template && !customCode) {
        return (
            <div className="my-4 p-6 bg-white border border-ink/10 rounded-lg text-center">
                <p className="text-muted text-sm">
                    Preview not available for{' '}
                    <span className="font-mono text-compass">{componentName}</span>
                </p>
                <p className="text-caption text-muted mt-2">
                    Available previews:{' '}
                    {PREVIEWABLE_COMPONENTS.slice(0, 5).join(', ')}
                    {PREVIEWABLE_COMPONENTS.length > 5 && '...'}
                </p>
            </div>
        );
    }

    if (!files) return null;

    const currentTheme = themeMode === 'light' ? LIGHT_THEME : DARK_THEME;

    return (
        <PreviewErrorBoundary
            fallbackMessage={`Unable to load preview for ${componentName}`}
        >
            <div
                className="my-4 border border-ink/10 rounded-lg overflow-hidden bg-white shadow-sm"
                style={{ height }}
            >
                {/* Header / Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-ink/10 bg-ink/5">
                    <div className="flex items-center gap-2">
                        <span className="text-caption text-muted font-mono uppercase tracking-wider">
                            {componentName}
                        </span>
                        {template?.description && (
                            <span className="hidden md:inline text-caption text-muted/60 truncate max-w-[200px]">
                                - {template.description}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* View Mode Toggle */}
                        {showEditor && (
                            <div className="flex items-center bg-white rounded border border-ink/15 p-0.5 mr-2">
                                <button
                                    onClick={() => setViewMode('split')}
                                    className={cn(
                                        'p-1.5 rounded transition-colors',
                                        viewMode === 'split'
                                            ? 'bg-compass/10 text-compass'
                                            : 'text-muted hover:text-ink'
                                    )}
                                    title="Split view"
                                >
                                    <ColumnsIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={cn(
                                        'p-1.5 rounded transition-colors',
                                        viewMode === 'preview'
                                            ? 'bg-compass/10 text-compass'
                                            : 'text-muted hover:text-ink'
                                    )}
                                    title="Preview only"
                                >
                                    <EyeIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('code')}
                                    className={cn(
                                        'p-1.5 rounded transition-colors',
                                        viewMode === 'code'
                                            ? 'bg-compass/10 text-compass'
                                            : 'text-muted hover:text-ink'
                                    )}
                                    title="Code only"
                                >
                                    <CodeIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={() =>
                                setThemeMode(
                                    themeMode === 'light' ? 'dark' : 'light'
                                )
                            }
                            className="p-1.5 text-muted hover:text-ink hover:bg-ink/5 rounded transition-colors"
                            title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} theme`}
                        >
                            {themeMode === 'light' ? (
                                <MoonIcon className="w-4 h-4" />
                            ) : (
                                <SunIcon className="w-4 h-4" />
                            )}
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={handleExportToCodeSandbox}
                            className="p-1.5 text-muted hover:text-ink hover:bg-ink/5 rounded transition-colors"
                            title="Open in CodeSandbox"
                        >
                            <ExternalLinkIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Sandpack */}
                <div style={{ height: `calc(${height} - 45px)` }}>
                    <SandpackProvider
                        template="react"
                        theme={currentTheme}
                        files={files}
                        customSetup={{
                            dependencies,
                        }}
                        options={{
                            externalResources: ['https://cdn.tailwindcss.com'],
                            activeFile: '/App.js',
                        }}
                    >
                        <SandpackLayout
                            style={{
                                height: '100%',
                                border: 'none',
                                borderRadius: 0,
                            }}
                        >
                            {viewMode === 'split' && (
                                <>
                                    <div
                                        style={{
                                            flex: 1,
                                            height: '100%',
                                            minWidth: 0,
                                        }}
                                    >
                                        <CodeEditor showLineNumbers />
                                    </div>
                                    <div
                                        style={{
                                            flex: 1,
                                            height: '100%',
                                            minWidth: 0,
                                            borderLeft: '1px solid rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <PreviewPane showConsole={showConsole} />
                                    </div>
                                </>
                            )}

                            {viewMode === 'preview' && (
                                <div style={{ flex: 1, height: '100%' }}>
                                    <PreviewPane
                                        showConsole={showConsole}
                                        showRefreshButton
                                    />
                                </div>
                            )}

                            {viewMode === 'code' && (
                                <div style={{ flex: 1, height: '100%' }}>
                                    <CodeEditor showLineNumbers />
                                </div>
                            )}
                        </SandpackLayout>
                    </SandpackProvider>
                </div>
            </div>
        </PreviewErrorBoundary>
    );
}

// Quick preview for inline use (preview only, smaller)
export function QuickPreview({
    componentName,
}: {
    componentName: string;
}) {
    return (
        <ComponentPreview
            componentName={componentName}
            showEditor={false}
            height="300px"
        />
    );
}

// Re-export for convenience
export { PREVIEWABLE_COMPONENTS, COMPONENT_TEMPLATES };

export default ComponentPreview;
