
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/presentation/stores/user'

// Гварды теперь максимально простые и чистые
const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  
  // Если ID пользователя в сторе есть — пускаем, если нет — на логин
  if (userStore.userId) {
    next()
  } else {
    next('/')
  }
}

const requireGuest = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  
  // Если пользователь уже вошел — отправляем на дашборд, не даем логиниться снова
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
    // Динамический импорт для оптимизации (Lazy Loading)
    component: () => import('../src/presentation/views/LoginView.vue'),
    beforeEnter: requireGuest 
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../src/presentation/views/DashboardView.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('../src/presentation/views/TransactionsView.vue'),
    beforeEnter: requireAuth
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
