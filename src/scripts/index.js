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

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      return Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
          throw new Error('Permission not granted for Notification');
        }
        const applicationServerKey = urlB64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);
        // Unsubscribe jika sudah ada subscription lama
        return registration.pushManager.getSubscription()
          .then(sub => sub ? sub.unsubscribe() : null)
          .then(() => registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          }));
      });
    })
      .then((subscription) => {
        console.log('Push subscription:', JSON.stringify(subscription));
        // Kirim subscription ke server Anda untuk disimpan
        subscribeWebPush(subscription.endpoint, subscription.keys)
        .then(res => console.log('Subscription saved:', res))
        .catch(err => console.error('Failed to save subscription:', err));
      })
      .catch((error) => {
        console.error('Service Worker registration or push subscription failed:', error);
      });
  }
  
  // Helper untuk konversi VAPID key
  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
});
