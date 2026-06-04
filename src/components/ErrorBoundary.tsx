import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircleIcon } from './Icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and display errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-parchment p-4">
          <div className="max-w-2xl w-full bg-white border-2 border-compass/30 rounded-lg shadow-paper p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-compass/10 rounded-full flex items-center justify-center">
                <AlertCircleIcon className="w-6 h-6 text-compass" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold text-ink mb-2">
                  Something went wrong
                </h1>
                <p className="text-terrain mb-4">
                  The application encountered an unexpected error.
                </p>
              </div>
            </div>

            <div className="bg-ink/5 border border-ink/10 rounded p-4 mb-6 font-mono text-sm overflow-auto">
              <pre className="whitespace-pre-wrap text-ink/80">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full px-6 py-3 bg-compass text-white font-bold rounded hover:bg-compass-dark transition-colors border-2 border-compass-dark"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
