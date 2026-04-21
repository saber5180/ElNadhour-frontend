import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800">Error:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {this.state.error && this.state.error.toString()}
                </pre>
              </div>
              {this.state.errorInfo && (
                <div>
                  <h3 className="font-semibold text-gray-800">Error Info:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;