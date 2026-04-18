console.log("INDEX.TSX: Script starting");

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("INDEX.TSX: Imports complete");

const rootElement = document.getElementById('root');
console.log("INDEX.TSX: Root element found:", !!rootElement);

if (!rootElement) {
  console.error("INDEX.TSX: Root element not found! document.body is:", !!document.body);
  // If root is missing, we can't mount.
} else {
  try {
    console.log("INDEX.TSX: Creating React root");
    const root = ReactDOM.createRoot(rootElement);
    console.log("INDEX.TSX: Rendering App");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("INDEX.TSX: Render call complete");
  } catch (error) {
    console.error("INDEX.TSX: Render error:", error);
  }
}
