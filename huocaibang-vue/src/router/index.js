import { createRouter, createWebHistory } from 'vue-router';
import WelcomePage from '../components/WelcomePage.vue';
import GamePlayPage from '../components/GamePlayPage.vue';

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: WelcomePage
  },
  {
    path: '/play',
    name: 'Play',
    component: GamePlayPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
