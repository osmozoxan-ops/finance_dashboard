import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext, RouteRecordRaw } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'


const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = getAuth()
  
  onAuthStateChanged(auth, (user) => {
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
  
  onAuthStateChanged(auth, (user) => {
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
    component: () => import('@/views/LoginView.vue'),
    beforeEnter: requireGuest 
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/views/TransactionsView.vue'),
    beforeEnter: requireAuth
  }

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router