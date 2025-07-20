<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AuthForms from '@/components/AuthForms.vue'
import AppHeader from '@/components/AppHeader.vue'
import { RouterView } from 'vue-router'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuthListener()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Show authentication forms if user is not authenticated -->
    <AuthForms v-if="!authStore.isAuthenticated && !authStore.loading" />
    
    <!-- Show loading state while checking authentication -->
    <div v-else-if="authStore.loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
        <p class="text-gray-600 text-lg">Loading your journal...</p>
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
</template>

<style>
/* Remove any custom styling to let Tailwind handle everything */
</style>
