import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
// import CreateToken from '../components/CreateToken.vue';
// import Home from '../views/Home.vue';

const routes = [
  { path: '/', component: Home },
//   { path: '/create-token', component: CreateToken },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
