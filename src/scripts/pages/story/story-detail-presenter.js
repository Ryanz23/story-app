import StoryDetailModel from '../model/story-detail-model.js';
import StoryDetailView from '../view/story-detail-view.js';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { parseActivePathname } from '../../routes/url-parser.js';

export default class StoryDetailPresenter {
  constructor() {
    this.model = new StoryDetailModel();
    this.view = new StoryDetailView();
  }

  async render() {
    return this.view.renderSection();
  }

  async afterRender() {
    const params = parseActivePathname();
    const storyId = params.id;
    if (!storyId) {
      this.view.showError('ID cerita tidak ditemukan.');
      return;
    }
    try {
      const story = await this.model.fetchStoryDetail(storyId);
      if (!story) {
        this.view.showError(
          'Cerita tidak ditemukan atau Anda tidak memiliki akses.'
        );
        return;
      }
      const createdAt = new Date(story.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      this.view.showDetail(story, createdAt);
      if (story.lat && story.lon) {
        const map = L.map('detail-map').setView([story.lat, story.lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker
          .bindPopup(`<strong>${story.name}</strong><br>Lokasi cerita`)
          .openPopup();
      }
    } catch (error) {
      this.view.showError(
        `Terjadi kesalahan: ${error.message || 'Tidak dapat memuat cerita'}`
      );
    }
  }
}
