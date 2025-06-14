const CACHE_NAME = 'storyapp-shell-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/main.js',
  '/icon.png',
  '/manifest.json',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        throw error;
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Push Notification';
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'story-app-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});