import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/ProfitForm.vue'),
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/components/ProfitabilityHistory.vue'),
  },
  {
    path: '/history/:id',
    name: 'history-details',
    component: () => import('@/components/ProfitabilityHistoryDetails.vue'),
    props: true,
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    redirect: { name: 'home' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
