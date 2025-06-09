import { addStory } from '../../data/api.js';

export default class AddModel {
  async submitStory(description, photoBlob, latitude, longitude) {
    return addStory(description, photoBlob, latitude, longitude);
  }
}
