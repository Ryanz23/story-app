const CACHE_NAME = 'storyapp-v1';
const STATIC_CACHE = 'storyapp-static-v1';
const DYNAMIC_CACHE = 'storyapp-dynamic-v1';

// Static files to cache
const staticAssets = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets as needed
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return Promise.allSettled(
          staticAssets.map(url => 
            cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err))
          )
        );
      }),
      // Pre-create dynamic cache
      caches.open(DYNAMIC_CACHE)
    ])
  );
  
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - Network First for API, Cache First for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests - Network First
  if (url.origin.includes('dicoding.dev')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }
  
  // Handle static assets - Cache First
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, fetch and cache
        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch((error) => {
            console.error('Fetch failed for:', request.url, error);
            // You could return a fallback page here
            throw error;
          });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Story App',
    body: 'You have a new notification!',
    icon: '/icon.png',
    badge: '/icon.png',
  };
  
  if (event.data) {
    try {
      // First, try to get the data as text
      const rawData = event.data.text();
      console.log('Raw push data:', rawData);
      
      // Check if it's JSON by trying to parse it
      let parsedData;
      try {
        parsedData = JSON.parse(rawData);
        console.log('Parsed JSON data:', parsedData);
      } catch (jsonError) {
        // If it's not JSON, treat it as plain text for the body
        console.log('Data is not JSON, using as plain text body');
        notificationData.body = rawData;
        parsedData = null;
      }
      
      // If we successfully parsed JSON, use it
      if (parsedData) {
        notificationData = {
          title: parsedData.title || notificationData.title,
          body: parsedData.body || notificationData.body,
          icon: parsedData.icon || notificationData.icon,
          badge: parsedData.badge || notificationData.badge,
          tag: parsedData.tag || 'story-app-notification',
          data: parsedData.url ? { url: parsedData.url } : {},
          actions: parsedData.actions || [
            {
              action: 'view',
              title: 'View',
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        };
      }
    } catch (error) {
      console.error('Error processing push data:', error);
      // Use default notification data if there's any error
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: false,
      vibrate: [200, 100, 200],
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const clickedNotification = event.notification;
  
  if (event.action === 'dismiss') {
    return;
  }

  // Handle view action or notification body click
  const urlToOpen = clickedNotification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open with this URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});