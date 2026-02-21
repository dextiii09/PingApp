import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global error handler for debugging production white-screens
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global crash:", message, error);
  const root = document.getElementById('root');
  // Only show diagnostic if the app hasn't rendered anything yet
  const loader = document.getElementById('loading-indicator');
  if (root && (root.innerHTML === '' || loader)) {
    root.innerHTML = `
      <div style="padding: 24px; font-family: -apple-system, sans-serif; color: #7f1d1d; background: #fef2f2; border: 2px solid #fee2e2; border-radius: 16px; margin: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <h2 style="margin-top: 0; color: #991b1b;">Ping Runtime Error</h2>
        <p style="font-weight: 500;">The application failed to start.</p>
        <p style="font-size: 14px; opacity: 0.8;">${message}</p>
        <pre style="font-size: 11px; overflow: auto; background: rgba(0,0,0,0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); line-height: 1.4;">${error?.stack || 'No trace'}</pre>
        <button onclick="window.location.reload()" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; width: 100%;">Try Reloading</button>
      </div>
    `;
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
