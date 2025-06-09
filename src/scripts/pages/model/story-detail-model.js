import { getStoryDetail } from '../../data/api.js';

export default class StoryDetailModel {
  async fetchStoryDetail(storyId) {
    return getStoryDetail(storyId);
  }
}
