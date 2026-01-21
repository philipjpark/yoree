import { Buffer } from 'buffer';
// process is provided globally via webpack ProvidePlugin in craco.config.js
// We access it via the global scope to avoid CRA import path issues
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';
import CssBaseline from '@mui/material/CssBaseline';

// Make Buffer available globally
// process is available globally via ProvidePlugin, assign to window for compatibility
window.Buffer = Buffer;
// @ts-ignore - process is provided by webpack ProvidePlugin
if (typeof process !== 'undefined') {
  // @ts-ignore
  window.process = process;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
); 