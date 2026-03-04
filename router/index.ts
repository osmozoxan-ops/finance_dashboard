import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/presentation/stores/user'

// 1. Гвард для защищенных страниц
const requireAuth = (
  to: RouteLocationNormalized, 
  from: RouteLocationNormalized, 
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  // Если сессия загружена в main.ts, userId уже будет в сторе
  if (userStore.userId) {
    next()
  } else {
    next('/')
  }
}

// 2. Гвард для гостей (страница логина)
const requireGuest = (
  to: RouteLocationNormalized, 
  from: RouteLocationNormalized, 
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  if (!userStore.userId) {
    next()
  } else {
    next('/dashboard')
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/presentation/views/LoginView.vue'),
    beforeEnter: requireGuest 
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/presentation/views/NotFoundView.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/presentation/views/DashboardView.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/presentation/views/TransactionsView.vue'),
    beforeEnter: requireAuth
  },
  // 3. Добавляем редирект для несуществующих страниц (404)
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  // Используем алиасы для путей, если они настроены в Vite
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
