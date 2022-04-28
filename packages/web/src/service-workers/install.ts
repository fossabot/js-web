declare const self: ServiceWorkerGlobalScope;

export const initialize = () => {
  self.addEventListener('install', function (event: ExtendableEvent) {
    console.log('Installing Service Worker 🕐');
    event.waitUntil(self.skipWaiting()); // Activate worker immediately
  });

  self.addEventListener('activate', function (event: ExtendableEvent) {
    event.waitUntil(self.clients.claim()); // Become available to all pages
    console.log('Hello world from the Service Worker 🤙');
  });
};
