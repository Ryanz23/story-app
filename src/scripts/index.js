// CSS imports
import '../styles/styles.css';
import '../styles/header.css';
import '../styles/footer.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Component imports
import App from './pages/app';
import Header from './components/header';
import Footer from './components/footer';
import {
  headerLoggedInTemplate,
  headerLoggedOutTemplate,
} from './components/header-template';

// API and config imports
import { isLoggedIn, getData, subscribeWebPush } from './data/api';
import CONFIG from './config';

// Global state
let appInstance = null;
let headerInstance = null;
let footerInstance = null;

// Initialize the header component
const initHeader = () => {
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    if (isLoggedIn()) {
      headerContainer.innerHTML = headerLoggedInTemplate;
    } else {
      headerContainer.innerHTML = headerLoggedOutTemplate(window.location.hash);
    }
  }
  return new Header();
};

// Initialize the footer component
const initFooter = () => {
  return new Footer();
};


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

// Service Worker and Push Notification Setup
async function initServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Service Worker or Push Manager not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully');

    if (registration.installing) {
      await new Promise(resolve => {
        registration.installing.addEventListener('statechange', () => {
          if (registration.installing.state === 'installed') {
            resolve();
          }
        });
      });
    }

    await subscribeToPushNotifications(registration);
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Cek VAPID key ada atau tidak
    if (!CONFIG.VAPID_PUBLIC_KEY) {
      console.warn('VAPID public key not configured');
      return;
    }

    // Subscribe to push notifications
    const applicationServerKey = urlB64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      } catch (subscribeError) {
        console.error('Failed to subscribe to push notifications:', subscribeError);
        return; // Exit gracefully
      }
    }
    
    console.log('Push subscription:', subscription);

    // Send subscription to server
    try {
      const response = await subscribeWebPush(subscription.endpoint, subscription.keys);
      console.log('Push subscription successful:', response);
    } catch (apiError) {
      console.error('Failed to send subscription to server:', apiError);
    }
    
  } catch (error) {
    console.error('Service Worker setup failed:', error);
  }
}

async function subscribeToPushNotifications(registration) {
  try {
    // Check if push notifications are supported
    if (!('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    // Request permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: CONFIG.VAPID_PUBLIC_KEY
      });
    }

    const { endpoint, keys } = subscription.toJSON();

    // Send subscription to server
    const response = await subscribeWebPush({endpoint, keys});
    console.log('Push subscription successful:', response);

    console.log('Push subscription:', subscription);
    
    // Send subscription to your server
    // await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
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

// Skip link functionality
function initSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.getElementById('stories-list') || document.getElementById('main-content');

  if (!skipLink || !mainContent) return;

  const handleSkipLinkClick = (e) => {
    e.preventDefault();
    const originalTabIndex = mainContent.getAttribute('tabindex');
    mainContent.setAttribute('tabindex', '-1');
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      if (originalTabIndex !== null) {
        mainContent.setAttribute('tabindex', originalTabIndex);
      } else {
        mainContent.removeAttribute('tabindex');
      }
    }, 100);
  };

  skipLink.removeEventListener('click', handleSkipLinkClick);
  skipLink.addEventListener('click', handleSkipLinkClick);
}

// Camera stream management
function stopActiveCameraStream() {
  if (window.activeCameraStream) {
    window.activeCameraStream.getTracks().forEach(track => track.stop());
    window.activeCameraStream = null;
  }
}

// File input handler
function initFileInput() {
  const fileInput = document.getElementById('image-upload');
  const img = document.getElementById('captured-image');

  if (!fileInput || !img) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        img.src = ev.target.result;
        img.style.display = 'block';
        delete img._blob; // Remove camera data if exists
      };
      reader.readAsDataURL(file);
    }
  });
}

// Hash change handler
async function handleHashChange() {
  stopActiveCameraStream();

  if (appInstance) {
    await appInstance.renderPage();
  }

  if (headerInstance) {
    headerInstance.updateAuthState();
  }

  initSkipLink();
}

// View transition handler
function initViewTransitions() {
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
}

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Handle default route
  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '#/';
    return;
  }

  try {
    // Initialize service worker and push notifications
    await initServiceWorker();

    // Initialize components
    headerInstance = initHeader();
    footerInstance = initFooter();

    // Initialize main app
    const mainContentElement = document.querySelector('#main-content');
    if (mainContentElement) {
      appInstance = new App({ content: mainContentElement });
      await appInstance.renderPage();
    }

    // Initialize other features
    initSkipLink();
    initFileInput();
    initViewTransitions();

    // Set up hash change listener
    window.addEventListener('hashchange', handleHashChange);

    console.log('Application initialized successfully');

  } catch (error) {
    console.error('Application initialization failed:', error);
  }
});