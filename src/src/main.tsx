import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';
import '../styles/globals.css';
import { Toaster } from 'sonner@2.0.3';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-right" 
      expand={false}
      richColors
      closeButton
    />
  </StrictMode>
);
