import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-4xl text-red-500">error_outline</span>
            </div>
            <h1 className="text-2xl font-extrabold text-text-main mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                We encountered an unexpected error. Our team has been notified.
            </p>
            <button 
                onClick={() => window.location.reload()}
                className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition-transform active:scale-95"
            >
                Restart App
            </button>
            {process.env.NODE_ENV === 'development' && (
                <pre className="mt-8 p-4 bg-gray-200 rounded text-left text-xs overflow-auto max-w-full">
                    {this.state.error?.toString()}
                </pre>
            )}
        </div>
      );
    }

    return (this as any).props.children;
  }
}