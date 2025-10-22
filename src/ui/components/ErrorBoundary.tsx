import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Error is already captured in state via getDerivedStateFromError
    // In production, this would be where you send errors to a monitoring service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload the page to reset state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>The spreadsheet encountered an unexpected error. Please try refreshing the page.</p>
          {this.state.error && (
            <details>
              <summary>Error details</summary>
              <pre>
                {this.state.error.toString()}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <button onClick={this.handleReset} className="error-boundary-button">
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
