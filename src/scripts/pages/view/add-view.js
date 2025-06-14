export default class AddView {
  constructor() {
    this.stream = null; // Store stream reference in class
    this.isDestroyed = false; // Track if component is destroyed
  }

  renderSection() {
    return `
        <section class="container">
          <div class="add-story-container">
            <h1><i class="fa-solid fa-plus-circle" aria-hidden="true"></i> Tambah Cerita Baru</h1>
            <form id="add-story-form" autocomplete="off">
              <div class="form-group">
                <label for="description">Cerita Anda</label>
                <textarea id="description" name="description" placeholder="Bagikan pengalaman atau cerita menarik Anda di sini..." required></textarea>
              </div>
              <div class="form-group">
                <label for="camera-preview">Foto</label>
                <div class="camera-container">
                  <video id="camera-preview" autoplay playsinline></video>
                  <canvas id="camera-canvas" style="display:none;"></canvas>
                  <div class="camera-buttons">
                    <button type="button" id="start-camera-btn" class="btn-primary">
                      <i class="fa-solid fa-video" aria-hidden="true"></i> Nyalakan Kamera
                    </button>
                    <button type="button" id="stop-camera-btn" class="btn-secondary" style="display:none;">
                      <i class="fa-solid fa-video-slash" aria-hidden="true"></i> Matikan Kamera
                    </button>
                    <button type="button" id="capture-btn" class="btn-primary" style="display:none;">
                      <i class="fa-solid fa-camera" aria-hidden="true"></i> Ambil Foto
                    </button>
                    <button type="button" id="recapture-btn" class="btn-secondary" style="display:none;">
                      <i class="fa-solid fa-rotate" aria-hidden="true"></i> Ambil Ulang
                    </button>
                  </div>
                  <img id="captured-image" alt="Pratinjau foto yang diambil" style="display:none;" />
                </div>
              </div>
              <div class="form-group">
                <label for="location-map">Lokasi</label>
                <p>Klik pada peta untuk menandai lokasi cerita Anda</p>
                <div id="location-map" class="map-container"></div>
                <div class="location-display">
                  <input type="text" id="latitude" name="latitude" placeholder="Latitude" required readonly />
                  <input type="text" id="longitude" name="longitude" placeholder="Longitude" required readonly />
                </div>
              </div>
              <div class="form-submit">
                <button type="submit" id="submit-btn">
                  <i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Kirim Cerita
                </button>
              </div>
            </form>
            <div id="add-story-message" aria-live="polite"></div>
          </div>
        </section>
      `;
  }

  showCapturedImage(url) {
    const img = document.getElementById('captured-image');
    const video = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-btn');
    const recaptureBtn = document.getElementById('recapture-btn');
    img.src = url;
    img.style.display = 'block';
    video.style.display = 'none';
    captureBtn.style.display = 'none';
    recaptureBtn.style.display = 'inline-block';
  }
  
  setMarkerIcon(marker, url) {
    marker.setIcon(L.icon({
      iconUrl: url,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
      className: 'custom-marker-image',
    }));
  }

  showMessage(type, message) {
    const messageArea = document.getElementById('add-story-message');
    if (!messageArea) return;
    let icon = '';
    if (type === 'success') {
      icon = '<i class="fa-solid fa-check-circle" aria-hidden="true"></i>';
      messageArea.innerHTML = `<div class="alert alert-success">${icon} ${message}</div>`;
    } else {
      icon = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>';
      messageArea.innerHTML = `<div class="alert alert-error">${icon} ${message}</div>`;
    }
  }

  setSubmitButtonState(loading) {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      if (loading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Mengirim...';
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Kirim Cerita';
      }
    }
  }

  onFormSubmit(callback) {
    const form = document.getElementById('add-story-form');
    if (form) {
      form.addEventListener('submit', callback);
    }
  }

  resetCapturedImage() {
    const img = document.getElementById('captured-image');
    const video = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-btn');
    const recaptureBtn = document.getElementById('recapture-btn');
    img.src = '';
    img.style.display = 'none';
    video.style.display = 'block';
    captureBtn.style.display = 'inline-block';
    recaptureBtn.style.display = 'none';
  }
  
  resetMarkerIcon(marker) {
    marker.setIcon(L.Icon.Default.prototype);
  }

  resetFormUI() {
    const img = document.getElementById('captured-image');
    const video = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-btn');
    const recaptureBtn = document.getElementById('recapture-btn');
    const startCameraBtn = document.getElementById('start-camera-btn');
    const stopCameraBtn = document.getElementById('stop-camera-btn');
    
    if (img) img.style.display = 'none';
    if (video) video.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'none';
    if (recaptureBtn) recaptureBtn.style.display = 'none';
    if (startCameraBtn) startCameraBtn.style.display = 'inline-block';
    if (stopCameraBtn) stopCameraBtn.style.display = 'none';
    
    // Stop camera when resetting
    this.stopCamera();
  }

  navigateTo(url, delay = 0) {
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  }

  setLatLngInputs(lat, lng) {
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
  }

  // Method to start camera
  async startCamera() {
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    };
  
    const video = document.getElementById('camera-preview');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      window.activeCameraStream = this.stream;
  
      if (this.isDestroyed) {
        this.stopCamera();
        return;
      }
  
      video.srcObject = this.stream;
      video.style.display = 'block';
  
      const startCameraBtn = document.getElementById('start-camera-btn');
      const stopCameraBtn = document.getElementById('stop-camera-btn');
      const captureBtn = document.getElementById('capture-btn');
  
      // Update button states
      if (startCameraBtn) startCameraBtn.style.display = 'none';
      if (stopCameraBtn) stopCameraBtn.style.display = 'inline-block';
      if (captureBtn) {
        captureBtn.style.display = 'inline-block';
        captureBtn.disabled = false;
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      this.showMessage('error', 'Kamera tidak dapat diakses. Pastikan Anda memberikan izin kamera.');
    }
  }

  // Method to stop camera
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null;
    }

    const video = document.getElementById('camera-preview');
    const startCameraBtn = document.getElementById('start-camera-btn');
    const stopCameraBtn = document.getElementById('stop-camera-btn');
    const captureBtn = document.getElementById('capture-btn');

    if (video) {
      video.srcObject = null;
      video.style.display = 'none';
    }
    
    // Update button states
    if (startCameraBtn) startCameraBtn.style.display = 'inline-block';
    if (stopCameraBtn) stopCameraBtn.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'none';
  }

  // Method to destroy component and cleanup resources
  destroy() {
    this.isDestroyed = true;
    this.stopCamera();
    // Remove event listeners if needed
    window.removeEventListener('beforeunload', this.stopCamera.bind(this));
    window.removeEventListener('pagehide', this.stopCamera.bind(this));
  }

  // Camera and map setup for MVP compliance
  setupCameraAndMap({
    onCapture,
    onRecapture,
    onMapClick,
    onGeoSuccess,
    onGeoError,
  }) {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const recaptureBtn = document.getElementById('recapture-btn');
    const startCameraBtn = document.getElementById('start-camera-btn');
    const stopCameraBtn = document.getElementById('stop-camera-btn');
    const img = document.getElementById('captured-image');
    const mapContainer = document.getElementById('location-map');

    // Camera setup
    if (canvas) {
      canvas.width = 640;
      canvas.height = 480;
    }

    // Start camera button event
    if (startCameraBtn) {
      startCameraBtn.addEventListener('click', () => {
        this.startCamera();
      });
    }

    // Stop camera button event
    if (stopCameraBtn) {
      stopCameraBtn.addEventListener('click', () => {
        this.stopCamera();
      });
    }

    // Capture button event
    if (captureBtn) {
      captureBtn.addEventListener('click', () => {
        if (canvas && video) {
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (onCapture) onCapture(blob, img, video, captureBtn, recaptureBtn);
              // Stop camera after capture to save resources
              this.stopCamera();
            },
            'image/jpeg',
            0.95
          );
        }
      });
    }

    // Recapture button event
    if (recaptureBtn) {
      recaptureBtn.addEventListener('click', () => {
        if (onRecapture) onRecapture(img, video, captureBtn, recaptureBtn);
        // Restart camera for recapture
        this.startCamera();
      });
    }

    // Cleanup events
    const cleanup = () => {
      this.stopCamera();
    };

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);

    // Store cleanup function for later removal
    this._cleanup = cleanup;

    // Map setup
    if (typeof L !== 'undefined') {
      if (L.DomUtil.get('location-map') != null) {
        L.DomUtil.get('location-map')._leaflet_id = null;
      }
      const map = L.map('location-map').setView([-2.5, 118.0], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      let marker = null;
      map.on('click', (e) => {
        if (onMapClick)
          onMapClick(e, map, marker, (m) => {
            marker = m;
          });
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (onGeoSuccess)
            onGeoSuccess(position, map, marker, (m) => {
              marker = m;
            });
        },
        (error) => {
          if (onGeoError) onGeoError(error);
        }
      );
    }
  }
}