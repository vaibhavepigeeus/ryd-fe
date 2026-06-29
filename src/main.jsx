import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import PublishedPage from './pages/PublishedPage.jsx';
import './theme.css';
import './index.css';

const publishSlug = window.location.pathname.match(/^\/p\/([^/]+)\/?$/)?.[1];

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {publishSlug ? <PublishedPage slug={publishSlug} /> : <App />}
  </StrictMode>
);
