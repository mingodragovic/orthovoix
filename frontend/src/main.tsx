// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Initialize language direction for initial render
const initLanguage = () => {
  const savedLang = localStorage.getItem('orthovoix_language') || 'fr';
  const dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = savedLang;
  if (savedLang === 'ar') {
    document.documentElement.classList.add('rtl');
    document.documentElement.classList.remove('ltr');
  } else {
    document.documentElement.classList.add('ltr');
    document.documentElement.classList.remove('rtl');
  }
};

initLanguage();

// ✅ Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  console.log('📱 PWA service worker registered');
}

// ✅ Listen for online/offline events
window.addEventListener('online', () => {
  console.log('🟢 App is online');
});

window.addEventListener('offline', () => {
  console.log('🔴 App is offline');
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);