const CACHE_NAME = 'storyapp-shell-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/main.js',
  '/icon.png',
  '/manifest.json',
];
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Push Notification';
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/icon.png', 
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
