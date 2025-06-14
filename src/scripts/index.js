// CSS imports
import '../styles/styles.css';
import '../styles/header.css'; 
import '../styles/footer.css'; 
import 'leaflet/dist/leaflet.css';
import AddView from './pages/view/add-view';
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
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  } else {
    console.warn('Push messaging is not supported in this browser.');
  }
});
