import { loginUser } from '../../data/api.js';

export default class LoginModel {
  async login(email, password) {
    return loginUser(email, password);
  }
}
