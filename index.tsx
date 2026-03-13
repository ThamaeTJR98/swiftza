
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Service Worker Registration for PWA support
// We add a check to ensure we aren't in a sensitive preview iframe that blocks SW registration
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    try {
        // Check if we are in a restrictive iframe context (common in previews)
        // If the window origin is opaque or weird, skip SW to avoid noisy errors
        if (window.location.origin === 'null') return;

        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful');
          },
          (err) => {
            // Be very quiet about origin errors in dev/preview
            if (err.message && (err.message.includes('origin') || err.message.includes('security'))) {
                // Squelch
            } else {
                console.warn('ServiceWorker registration failed:', err.message);
            }
          }
        );
    } catch (e) {
        // Squelch unsupported env errors
    }
  });
}

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
