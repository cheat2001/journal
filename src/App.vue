<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useRoute } from 'vue-router'
import AuthForms from '@/components/AuthForms.vue'
import AppHeader from '@/components/AppHeader.vue'
import ToastNotifications from '@/components/ToastNotifications.vue'
import NotificationDebug from '@/components/NotificationDebug.vue'
import { RouterView } from 'vue-router'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const route = useRoute()

const showDebugPanel = ref(false)

onMounted(async () => {
  console.log('🔄 App.vue mounted, initializing auth listener...')
  await authStore.initializeAuthListener()
  console.log('✅ Auth listener initialized')

  // Check if debug mode is enabled via URL parameter
  showDebugPanel.value = route.query.debug === 'true'
})

// Watch for authentication changes to initialize notifications
watch(
  () => ({ isAuthenticated: authStore.isAuthenticated, loading: authStore.loading }),
  async (authState) => {
    if (authState.isAuthenticated && !authState.loading && !notificationStore.isInitialized) {
      console.log('🔔 User authenticated, initializing notifications...')
      await notificationStore.initialize()
    } else if (!authState.isAuthenticated && !authState.loading && notificationStore.isInitialized) {
      console.log('🔔 User logged out, cleaning up notifications...')
      notificationStore.cleanup()
    }
  },
  { immediate: true }
)

// Cleanup notifications on unmount
onUnmounted(() => {
  notificationStore.cleanup()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
    </div>
    
    <!-- Content -->
    <div class="relative z-10">
      <!-- Show authentication forms if user is not authenticated -->
      <AuthForms v-if="!authStore.isAuthenticated && !authStore.loading" />
      
      <!-- Show loading state while checking authentication -->
      <div v-else-if="authStore.loading" class="min-h-screen flex items-center justify-center">
        <div class="text-center scale-in">
          <div class="loading-spinner rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <p class="text-gray-600 text-lg font-medium">Loading your journal...</p>
          <p class="text-gray-400 text-sm mt-2">Preparing your personal space</p>
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

    <!-- Debug Panel (only in development with ?debug=true) -->
    <NotificationDebug 
      v-if="showDebugPanel" 
      @close="showDebugPanel = false"
    />
  </div>
</template>

<style>
/* Remove any custom styling to let Tailwind handle everything */
</style>
