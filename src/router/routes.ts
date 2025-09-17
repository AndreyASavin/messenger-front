import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home-view.vue'),
    meta: {requiresAuth: true},
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login-view.vue'),
    meta: {requiresGuest: true},
  },
  {
    path: '/registration',
    name: 'registration',
    component: () => import('@/views/register-view.vue'),
    meta: {requiresGuest: true},
  },
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'not-found',
  //   component: () => import('@views'),
  // },
]