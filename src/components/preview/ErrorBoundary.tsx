import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertCircleIcon } from '../Icons';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary specifically for Sandpack previews
 * Catches and displays errors gracefully without crashing the entire app
 */
export class PreviewErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Preview error:', error, errorInfo);
    }

    private handleReset = (): void => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    public render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-6 bg-compass/5 border border-compass/20 rounded-lg text-center">
                    <AlertCircleIcon className="w-8 h-8 text-compass mb-3" />
                    <h4 className="font-semibold text-ink mb-2">Preview Error</h4>
                    <p className="text-sm text-muted mb-4 max-w-sm">
                        {this.props.fallbackMessage ||
                            'There was an error rendering this preview.'}
                    </p>
                    {this.state.error && (
                        <pre className="text-xs text-compass/80 bg-white p-2 rounded border border-ink/10 max-w-full overflow-x-auto mb-4">
                            {this.state.error.message}
                        </pre>
                    )}
                    <button
                        onClick={this.handleReset}
                        className="px-4 py-2 text-sm bg-compass text-white rounded-md hover:bg-compass-dark transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default PreviewErrorBoundary;
