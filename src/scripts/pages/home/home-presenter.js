import HomeModel from '../model/home-model.js';
import HomeView from '../view/home-view.js';
import { saveStory, getAllStories, deleteStory } from '../../utils/indexed-db.js';
import Swal from 'sweetalert2';

export default class HomePresenter {
  constructor() {
    this.model = new HomeModel();
    this.view = new HomeView();
  }

  async render() {
    return this.view.renderSection();
  }

  async afterRender() {
    try {
      const { stories } = await this.model.fetchStories(1, 10);
      this.view.updateStoriesList(stories);
    } catch (e) {
      this.view.showError();
    }
  
    // Event: Simpan cerita pertama ke offline
    const saveBtn = document.getElementById('save-offline-btn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const { stories } = await this.model.fetchStories(1, 10);
        if (stories && stories.length > 0) {
          await saveStory(stories[0]);
          Swal.fire({
            toast: true,
            position: 'bottom',
            icon: 'success',
            title: 'Cerita pertama disimpan ke offline!',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: '#222',
            color: '#ffd600'
          });
        }
      };
    }
  
    // Event: Tampilkan cerita offline
    const showBtn = document.getElementById('show-offline-btn');
    if (showBtn) {
      showBtn.onclick = async () => {
        const offlineStories = await getAllStories();
        this.view.updateStoriesList(offlineStories);
      };
    }
  
    // Event: Hapus semua cerita offline
    const clearBtn = document.getElementById('clear-offline-btn');
    if (clearBtn) {
      clearBtn.onclick = async () => {
        const offlineStories = await getAllStories();
        for (const story of offlineStories) {
          await deleteStory(story.id);
        }
        this.view.updateStoriesList([]);
        Swal.fire({
          toast: true,
          position: 'bottom',
          icon: 'success',
          title: 'Semua cerita offline dihapus!',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#222',
          color: '#ffd600'
        });
      };
    }
  }
}
