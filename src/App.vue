<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'
import { globalChatNotifications } from '@/utils/globalChatNotifications'
import AuthForms from '@/components/AuthForms.vue'
import AppHeader from '@/components/AppHeader.vue'
import ToastNotifications from '@/components/ToastNotifications.vue'
import { RouterView } from 'vue-router'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

onMounted(async () => {
  console.log('🔄 App.vue mounted, initializing auth listener...')
  
  // Initialize theme first (before any UI renders)
  themeStore.initializeTheme()
  
  await authStore.initializeAuthListener()
  console.log('✅ Auth listener initialized')
})

// Watch for authentication changes to initialize notifications
watch(
  () => ({ isAuthenticated: authStore.isAuthenticated, loading: authStore.loading }),
  async (authState) => {
    if (authState.isAuthenticated && !authState.loading && !notificationStore.isInitialized) {
      console.log('🔔 User authenticated, initializing notifications...')
      await notificationStore.initialize()
      
      // Initialize global chat notifications
      console.log('📱 [App] Initializing global chat notifications...')
      globalChatNotifications.initialize()
    } else if (!authState.isAuthenticated && !authState.loading && notificationStore.isInitialized) {
      console.log('🔔 User logged out, cleaning up notifications...')
      notificationStore.cleanup()
      
      // Stop global chat notifications
      globalChatNotifications.cleanup()
    }
  },
  { immediate: true }
)

// Cleanup notifications on unmount
onUnmounted(() => {
  notificationStore.cleanup()
  globalChatNotifications.cleanup()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden transition-colors duration-300">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-800/10 dark:to-purple-800/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-800/10 dark:to-pink-800/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 dark:from-indigo-800/10 dark:to-blue-800/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
    </div>
    
    <!-- Content -->
    <div class="relative z-10">
      <!-- Show authentication forms if user is not authenticated -->
      <AuthForms v-if="!authStore.isAuthenticated && !authStore.loading" />
      
      <!-- Show loading state while checking authentication -->
      <div v-else-if="authStore.loading" class="min-h-screen flex items-center justify-center">
        <div class="text-center scale-in">
          <div class="loading-spinner rounded-full h-16 w-16 border-4 border-blue-200 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 mx-auto mb-6"></div>
          <p class="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading your journal...</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Preparing your personal space</p>
        </div>
      </div>
      
      <!-- Show main app if authenticated -->
      <div v-else class="min-h-screen">
        <AppHeader />
        <main class="flex-1">
          <RouterView />
        </main>
      </div>
    </div>
    
    <!-- Global Toast Notifications -->
    <ToastNotifications />
  </div>
</template>

<style>
/* Remove any custom styling to let Tailwind handle everything */
</style>
