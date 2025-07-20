import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

// Navigation guard to protect routes
router.beforeEach((to) => {
  const authStore = useAuthStore()
  
  // Allow access if route doesn't require auth or user is authenticated
  if (!to.meta.requiresAuth || authStore.isAuthenticated) {
    return true
  }
  
  // User is not authenticated and route requires auth
  // Redirect to home which will show auth forms
  return '/'
})

export default router
