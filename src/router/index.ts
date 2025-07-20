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
      // Remove requiresAuth from home so it can handle both authenticated and non-authenticated states
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
    {
      path: '/feed',
      name: 'social-feed',
      component: () => import('../views/SocialFeedView.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

// Navigation guard to protect routes that require authentication
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  // Skip auth check for home route (it handles auth internally)
  if (to.path === '/') {
    return true
  }
  
  // For other routes that require auth, check authentication
  if (to.meta.requiresAuth) {
    // Initialize auth if not done yet
    if (authStore.loading) {
      await authStore.initializeAuthListener()
    }
    
    // If still not authenticated, redirect to home
    if (!authStore.isAuthenticated) {
      return '/'
    }
  }
  
  return true
})

export default router
