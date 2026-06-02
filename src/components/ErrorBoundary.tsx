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
      const isEnvError = this.state.error?.name === 'EnvValidationError';

      return (
        <div className="flex items-center justify-center min-h-screen bg-parchment p-4">
          <div className="max-w-2xl w-full bg-white border-2 border-compass/30 rounded-lg shadow-paper p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-compass/10 rounded-full flex items-center justify-center">
                <AlertCircleIcon className="w-6 h-6 text-compass" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold text-ink mb-2">
                  {isEnvError ? 'Configuration Required' : 'Something went wrong'}
                </h1>
                <p className="text-terrain mb-4">
                  {isEnvError
                    ? 'Trace requires Algolia credentials to function.'
                    : 'The application encountered an unexpected error.'}
                </p>
              </div>
            </div>

            <div className="bg-ink/5 border border-ink/10 rounded p-4 mb-6 font-mono text-sm overflow-auto">
              <pre className="whitespace-pre-wrap text-ink/80">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </div>

            {isEnvError && (
              <div className="bg-gold/10 border border-gold/30 rounded p-4 mb-6">
                <h3 className="font-bold text-ink mb-2">Quick Setup:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-ink/80">
                  <li>Copy <code className="bg-ink/10 px-1 rounded">.env.example</code> to <code className="bg-ink/10 px-1 rounded">.env</code></li>
                  <li>Get your credentials from <a href="https://dashboard.algolia.com/" target="_blank" rel="noopener noreferrer" className="text-compass underline">Algolia Dashboard</a></li>
                  <li>Fill in the values in your <code className="bg-ink/10 px-1 rounded">.env</code> file</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}

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
