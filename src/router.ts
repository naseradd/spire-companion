import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'hub', component: () => import('@/views/HubView.vue') },
  { path: '/cards', name: 'cards', component: () => import('@/views/CardsView.vue') },
  { path: '/c/:slug', name: 'character', component: () => import('@/views/CharacterView.vue') },
  { path: '/relics', name: 'relics', component: () => import('@/views/RelicsView.vue') },
  { path: '/glossary', name: 'glossary', component: () => import('@/views/GlossaryView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});
