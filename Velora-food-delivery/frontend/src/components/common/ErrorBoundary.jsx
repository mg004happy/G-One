import React from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an uncaught exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="max-w-md w-full text-center p-8 rounded-2xl shadow-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-error-light)' }}>
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              An unexpected error occurred while rendering this page. You can try refreshing the page or returning home.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReload} className="flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="secondary" className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
