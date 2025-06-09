import { getData, isLoggedIn } from '../../data/api.js';

export default class HomeModel {
  async fetchStories(page = 1, size = 10) {
    return getData(page, size);
  }

  checkLogin() {
    return isLoggedIn();
  }
}
