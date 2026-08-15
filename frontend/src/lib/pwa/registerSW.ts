// src/lib/pwa/registerSW.ts
export function registerSW() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    // Registration is handled by VitePWA plugin
    // This is just for additional logging
    console.log('📱 PWA mode enabled');

    // Check if the app is running as a PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    if (isPWA) {
      console.log('📱 App is running as a standalone PWA');
    }

    // Listen for updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service worker controller changed, reloading...');
    });
  }
}