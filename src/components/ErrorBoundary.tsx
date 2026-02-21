import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Rendering Error</h1>
                        <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                            We encountered a runtime crash. This often happens due to missing data or a compatibility issue.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-xl text-left mb-6 overflow-auto max-h-40">
                            <p className="text-xs font-mono text-red-800 break-words">{this.state.error?.message}</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                        >
                            <RefreshCw size={20} /> Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return (this as any).props.children;
    }
}
