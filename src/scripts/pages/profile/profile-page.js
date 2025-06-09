// src/scripts/pages/profile-page.js

import ProfilePresenter from './profile-presenter.js';

const ProfilePage = {
  presenter: new ProfilePresenter(),

  async render() {
    return this.presenter.render();
  },

  async afterRender() {
    return this.presenter.afterRender();
  },
};

export default ProfilePage;
