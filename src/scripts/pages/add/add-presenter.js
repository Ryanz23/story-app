import AddModel from '../model/add-model.js';
import AddView from '../view/add-view.js';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path for Webpack/bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default class AddPresenter {
  constructor() {
    this.model = new AddModel();
    this.view = new AddView();
    this.stream = null;
    this.photoBlob = null;
    this.marker = null;
    this._map = null;
    this._stopCamera = null;
    this._marker = null;
    this._photoUrl = null;
  }

  async render() {
    return this.view.renderSection();
  }

  async afterRender() {
    this._photoBlob = null;
    this._photoUrl = null;
    this._marker = null;
    this._map = null;

    this.view.setupCameraAndMap({
      onCapture: (blob) => {
        this._photoBlob = blob;
        this._photoUrl = URL.createObjectURL(blob);
        this.view.showCapturedImage(this._photoUrl); // manipulasi DOM di View
        if (this._marker) {
          this.view.setMarkerIcon(this._marker, this._photoUrl); // manipulasi marker di View
        }
      },
      onRecapture: () => {
        this._photoBlob = null;
        this._photoUrl = null;
        this.view.resetCapturedImage();
        if (this._marker) {
          this.view.resetMarkerIcon(this._marker);
        }
      },
      onMapClick: (e, map, marker, setMarker) => {
        const { lat, lng } = e.latlng;
        this.view.setLatLngInputs(lat.toFixed(6), lng.toFixed(6));
        let icon = this._photoUrl
          ? this._createImageIcon(this._photoUrl)
          : undefined;
        if (marker) {
          marker.setLatLng(e.latlng);
          if (icon) marker.setIcon(icon);
        } else {
          marker = L.marker(e.latlng, icon ? { icon } : undefined).addTo(map);
          marker.bindPopup('Lokasi cerita Anda').openPopup();
        }
        this._marker = marker;
        setMarker(marker);
      },
      onGeoSuccess: (position, map, marker, setMarker) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);
        let icon = this._photoUrl
          ? this._createImageIcon(this._photoUrl)
          : undefined;
        marker = L.marker(
          [latitude, longitude],
          icon ? { icon } : undefined
        ).addTo(map);
        marker.bindPopup('Lokasi Anda saat ini').openPopup();
        this.view.setLatLngInputs(latitude.toFixed(6), longitude.toFixed(6));
        this._marker = marker;
        setMarker(marker);
        this._map = map;
      },
      onGeoError: (error) => {
        this.view.showMessage(
          'error',
          typeof error === 'string' ? error : 'Gagal mendapatkan lokasi.'
        );
      },
    });

    this.view.onFormSubmit(async (e) => {
      e.preventDefault();
      const form = e.target;
      const description = form.description.value.trim();
      const latitude = form.latitude.value.trim();
      const longitude = form.longitude.value.trim();

      if (!description || !latitude || !longitude || !this._photoBlob) {
        this.view.showMessage(
          'error',
          'Semua kolom harus diisi dan foto harus diambil.'
        );
        return;
      }

      this.view.setSubmitButtonState(true);

      try {
        const responseData = await this.model.submitStory(
          description,
          this._photoBlob,
          parseFloat(latitude),
          parseFloat(longitude)
        );

        if (responseData.error) {
          throw new Error(
            responseData.message || 'Terjadi kesalahan saat mengirim cerita'
          );
        }

        this.view.showMessage(
          'success',
          'Cerita berhasil dikirim! <a href="#/">Kembali ke Beranda</a>'
        );

        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification('Story berhasil dibuat', {
            body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
            icon: 'images/icon.png',
            badge: 'images/icon.png',
          });
        }

        form.reset();
        this.view.resetFormUI();
        if (this._marker && this._map) this._map.removeLayer(this._marker);

        this.view.navigateTo('#/', 3000);
      } catch (err) {
        this.view.showMessage(
          'error',
          `Error: ${err.message || 'Terjadi kesalahan saat mengirim cerita'}`
        );
      } finally {
        this.view.setSubmitButtonState(false);
      }
    });
  }

  _createImageIcon(url) {
    return L.icon({
      iconUrl: url,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
      className: 'custom-marker-image',
    });
  }

  async destroy() {
    // Stop camera if running
    if (typeof this._stopCamera === 'function') {
      this._stopCamera();
    }
    // Remove map if exists
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    // Revoke object URL if exists
    if (this._photoUrl) {
      URL.revokeObjectURL(this._photoUrl);
      this._photoUrl = null;
    }
    // Remove marker reference
    this._marker = null;
  }
}
