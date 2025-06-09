// CSS imports
import '../styles/styles.css';
import '../styles/header.css'; // Import header-specific styles
import '../styles/footer.css'; // Import footer-specific styles
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

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the header component
  const header = initHeader();

  // Initialize the footer component
  const footer = initFooter();

  // Initialize the app
  const app = new App({
    content: document.querySelector('#main-content'),
  });
  await app.renderPage();

  // Handle page navigation
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    // Update auth UI on each navigation
    header.updateAuthState();
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

  const addView = new AddView();
  document.querySelector('#main-content').innerHTML = addView.renderSection();

  // Jalankan setup kamera dan peta
  addView.setupCameraAndMap({
    onCapture: (blob, img, video, captureBtn, recaptureBtn) => {
      const imageUrl = URL.createObjectURL(blob);
      img.src = imageUrl;
      img.style.display = 'block';
      video.style.display = 'none';
      captureBtn.style.display = 'none';
      recaptureBtn.style.display = 'inline-block';
      img._blob = blob;
    },

    onRecapture: (img, video, captureBtn, recaptureBtn) => {
      img.style.display = 'none';
      video.style.display = 'block';
      captureBtn.style.display = 'inline-block';
      recaptureBtn.style.display = 'none';
      delete img._blob;
    },
    onMapClick: (e, map, marker, setMarker) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        setMarker(L.marker([lat, lng]).addTo(map));
      }
      addView.setLatLngInputs(lat, lng);
    },
    onGeoSuccess: (position, map, marker, setMarker) => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 13);
      if (marker) {
        marker.setLatLng([latitude, longitude]);
      } else {
        setMarker(L.marker([latitude, longitude]).addTo(map));
      }
      addView.setLatLngInputs(latitude, longitude);
    },
    onGeoError: (err) => {
      console.warn('Geolocation error:', err);
    },
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

  // Handle submit
  addView.onFormSubmit(async (e) => {
    const token = localStorage.getItem('token');

    if (!token) {
      addView.showMessage('error', 'Anda belum login.');
      addView.setSubmitButtonState(false);
      return;
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        addView.showMessage('success', 'Cerita berhasil dikirim!');
        addView.resetFormUI();
        form.reset();
      } else {
        addView.showMessage(
          'error',
          result.message || 'Gagal mengirim cerita.'
        );
      }
    } catch (err) {
      addView.showMessage('error', 'Terjadi kesalahan jaringan.');
    }
  });
});
