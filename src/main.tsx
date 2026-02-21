import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global error handler for debugging production white-screens
window.onerror = (message, source, lineno, colno, error) => {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px;">
        <h2 style="margin-top: 0">Runtime Error Detected</h2>
        <p>${message}</p>
        <pre style="font-size: 12px; overflow: auto; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px;">${error?.stack || 'No stack trace available'}</pre>
        <button onclick="window.location.reload()" style="background: #721c24; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Reload App</button>
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
    <App />
  </React.StrictMode>
);
