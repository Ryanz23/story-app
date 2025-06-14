export default class HomeView {
  renderSection() {
    return `
      <section class="container">
        <div class="welcome-header">
          <h1>Berbagi Cerita</h1>
        </div>
          <div class="offline-actions">
          <button id="save-offline-btn">Simpan Cerita Pertama ke Offline</button>
          <button id="show-offline-btn">Tampilkan Cerita Offline</button>
          <button id="clear-offline-btn">Hapus Cerita Offline</button>
        </div>
        <div id="stories-list" aria-live="polite" class="story-grid" tabindex="0"></div>
      </section>
    `;
  }

  renderStoriesList(stories) {
    if (!stories || stories.length === 0) {
      return '<p class="no-stories">Belum ada cerita. Jadilah yang pertama berbagi cerita!</p>';
    }
    return stories
      .map(
        (item) => `
      <article class="story-card">
        <div class="card-header">
          <div class="user-info">
            <div class="avatar">
              <span>${item.name.charAt(0)}</span>
            </div>
            <div class="user-meta">
              <div class="username">${item.name}</div>
              <time class="post-time" datetime="${item.createdAt}">${this.formatDate(item.createdAt)}</time>
            </div>
          </div>
        </div>
        <div class="card-image-container">
          <a href="#/story/${item.id}" class="card-image-link">
            <img
              src="${item.photoUrl}"
              alt="Foto cerita oleh ${item.name}"
              class="card-image"
              loading="lazy"
            />
          </a>
        </div>
        <div class="card-content">
          <p class="story-excerpt">${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}</p>
          <div class="card-actions">
            <button class="action-btn like-btn">
              <i class="fa-solid fa-thumbs-up"></i>
              <span class="count">0</span>
            </button>
            <a href="#/story/${item.id}" class="action-btn comment-btn">
              <i class="fa-solid fa-comment"></i>
              <span class="count">0</span>
            </a>
            <button class="action-btn share-btn">
              <i class="fa-solid fa-share-nodes"></i>
            </button>
          </div>
        </div>
      </article>
    `
      )
      .join('');
  }

  renderError() {
    return '<p class="error-message">Gagal memuat data cerita. Silakan coba lagi nanti.</p>';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Baru saja';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} menit yang lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    } else if (diffDays < 7) {
      return `${diffDays} hari yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }
  updateStoriesList(stories) {
    const storiesList = document.getElementById('stories-list');
    if (storiesList) {
      storiesList.innerHTML = this.renderStoriesList(stories);
    }
  }

  showError() {
    const storiesList = document.getElementById('stories-list');
    if (storiesList) {
      storiesList.innerHTML = this.renderError();
    }
  }
}
