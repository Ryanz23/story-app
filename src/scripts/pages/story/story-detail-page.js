// src/scripts/pages/story-detail-page.js

import StoryDetailPresenter from './story-detail-presenter.js';

const StoryDetailPage = {
  presenter: new StoryDetailPresenter(),

  async render() {
    return this.presenter.render();
  },

  async afterRender() {
    return this.presenter.afterRender();
  },
};

export default StoryDetailPage;
