import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import AddPage from '../pages/add/add-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import ProfilePage from '../pages/profile/profile-page';
import MapPage from '../pages/map/map-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/add': AddPage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/story/:id': StoryDetailPage,
  '/profile': ProfilePage,
  '/map': MapPage,
};

export default routes;
