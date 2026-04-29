import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-gray-900 rounded-2xl border border-red-500/30 p-6">
            <h1 className="text-xl font-bold text-red-400 mb-3">Something went wrong</h1>
            <pre className="bg-gray-950 rounded-xl p-4 text-sm text-red-300 overflow-auto whitespace-pre-wrap break-words max-h-72">
              {this.state.error?.message}
              {this.state.error?.stack && (
                <>
                  {'\n\n'}
                  {this.state.error.stack}
                </>
              )}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-all"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
