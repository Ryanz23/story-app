// CSS imports
import '../styles/styles.css';
import '../styles/header.css'; 
import '../styles/footer.css'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import App from './pages/app';
import Header from './components/header';
import Footer from './components/footer';
import {
  headerLoggedInTemplate,
  headerLoggedOutTemplate,
} from './components/header-template';
import { isLoggedIn } from './data/api';
import { getData } from './data/api';
import CONFIG from './config';
import { subscribeWebPush } from './data/api';

// Initialize the header component
const initHeader = () => {
  // Insert header HTML into the page based on login state
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    if (isLoggedIn()) {
      headerContainer.innerHTML = headerLoggedInTemplate;
    } else {
      headerContainer.innerHTML = headerLoggedOutTemplate(window.location.hash);
    }
  }

  // Initialize header functionality
  return new Header();
};

// Improved Service Worker Registration
if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful:', registration);
        
        // Request notification permission
        return Notification.requestPermission();
      })
      .then((permission) => {
        console.log('Notification permission:', permission);
        
        if (permission !== 'granted') {
          console.warn('Notification permission not granted');
          return null; // Don't throw error, just skip push subscription
        }
        
        // Get service worker registration
        return navigator.serviceWorker.ready;
      })
      .then((registration) => {
        if (!registration) return null;
        
        // Check if VAPID key exists
        if (!CONFIG.VAPID_PUBLIC_KEY) {
          console.warn('VAPID_PUBLIC_KEY not found in config');
          return null;
        }
        
        const applicationServerKey = urlB64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);
        
        // Get existing subscription
        return registration.pushManager.getSubscription()
          .then((existingSubscription) => {
            if (existingSubscription) {
              console.log('Existing subscription found');
              return existingSubscription;
            }
            
            // Subscribe to push notifications
            return registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey,
            });
          });
      })
      .then((subscription) => {
        if (!subscription) {
          console.log('No push subscription created');
          return;
        }
        
        console.log('Push subscription:', JSON.stringify(subscription));
        
        // Send subscription to server
        return subscribeWebPush(subscription.endpoint, subscription.keys);
      })
      .then((result) => {
        if (result) {
          console.log('Subscription saved to server:', result);
        }
      })
      .catch((error) => {
        console.error('Service Worker registration or push subscription failed:', error);
        
        // Don't let SW registration failure break the app
        if (error.name === 'AbortError') {
          console.log('Registration was aborted - this is usually fine');
        }
      });
  });
} else {
  console.log('Service Worker or Push Manager not supported');
}

// Helper function for VAPID key conversion
function urlB64ToUint8Array(base64String) {
  if (!base64String) {
    throw new Error('Base64 string is required');
  }
  
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
    
  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  } catch (error) {
    console.error('Failed to decode VAPID key:', error);
    throw new Error('Invalid VAPID key format');
  }
}

// Initialize the footer component
const initFooter = () => {
  // Footer is initialized directly by the class
  return new Footer();
};

async function attachSkipLinkListener() {
  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.getElementById('stories-list');
  if (skipLink && mainContent) {
    skipLink.onclick = function(e) {
      e.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '#/';
    return; 
  }

  // Initialize the header component
  const header = initHeader();

  const skipLink = document.querySelector('.skip-link');
  window.addEventListener('hashchange', () => {
    // Re-attach skip link event listener jika header di-render ulang
    const newSkipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('stories-list');
    if (newSkipLink && mainContent) {
      newSkipLink.addEventListener('click', function(e) {
        e.preventDefault();
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });

  const mainContent = document.getElementById('stories-list');
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Initialize the footer component
  const footer = initFooter();

  // Initialize the app
  const app = new App({
    content: document.querySelector('#main-content'),
  });
  await app.renderPage();
  attachSkipLinkListener();

  function stopActiveCameraStream() {
    if (window.activeCameraStream) {
      window.activeCameraStream.getTracks().forEach(track => track.stop());
      window.activeCameraStream = null;
    }
  }

  window.addEventListener('hashchange', async () => {
    stopActiveCameraStream(); // Stop camera stream on hash change
    await app.renderPage();
    header.updateAuthState();
    attachSkipLinkListener();
  });

  // Handle view transitions for links
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href.includes('#/')) {
      if (document.startViewTransition) {
        e.preventDefault();
        document.startViewTransition(() => {
          window.location.href = e.target.href;
        });
      }
    }
  });

  const fileInput = document.getElementById('image-upload');
  const img = document.getElementById('captured-image');
  if (fileInput && img) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          img.src = ev.target.result;
          img.style.display = 'block';
          delete img._blob; // Hapus data kamera jika ada
        };
        reader.readAsDataURL(file);
      }
    });
  }
});
