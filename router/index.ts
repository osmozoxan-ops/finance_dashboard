import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext, RouteRecordRaw } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'


const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = getAuth()
  
  // Проверяем, есть ли уже текущий пользователь
  if (auth.currentUser) {
    next()
    return
  }
  
  // Если нет, ждем изменения состояния аутентификации
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe() // Отписываемся сразу после получения состояния
    if (user) {
      next()
    } else {
      next('/')
    }
  })
}

const requireGuest = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = getAuth()
  
  // Проверяем, есть ли уже текущий пользователь
  if (!auth.currentUser) {
    next()
    return
  }
  
  // Если есть, ждем изменения состояния аутентификации
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe() // Отписываемся сразу после получения состояния
    if (!user) {
      next()
    } else {
      next('/dashboard')
    }
  })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
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
  routes: routes
})

export default router