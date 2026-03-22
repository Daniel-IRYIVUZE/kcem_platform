import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { replayQueue } from './utils/offlineQueue.ts'
import { API_BASE_URL } from './services/api.ts'
import { syncFromAPI } from './utils/apiSync.ts'

// Register service worker for offline-first PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Service worker registration failed:', err);
    });

    // Handle SW-triggered sync messages (e.g. when tab was in background)
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.data?.type === 'SYNC_QUEUE' && navigator.onLine) {
        const storedUser = localStorage.getItem('ecotrade_user');
        if (!storedUser) return;
        try {
          const { synced } = await replayQueue(API_BASE_URL);
          if (synced > 0) {
            const u = JSON.parse(storedUser);
            syncFromAPI(u.role).catch(() => {});
          }
        } catch { /* ignore */ }
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
