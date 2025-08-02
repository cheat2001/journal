<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo Section -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-xl mb-6">
          <span class="text-3xl">📖</span>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent mb-3">
          Daily Journal
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Your personal space for reflection and growth
        </p>
      </div>

      <!-- Auth Form Container -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
        <!-- Show Sign In Form -->
        <SignInForm
          v-if="showSignIn"
          @switch-to-signup="switchToSignUp"
        />
        
        <!-- Show Sign Up Form -->
        <SignUpForm
          v-else
          @switch-to-signin="switchToSignIn"
        />
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Start your journaling journey today and discover the power of daily reflection.
        </p>
        <div class="flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
          <span>Developed by</span>
          <span class="font-semibold text-blue-600 dark:text-blue-400">Chansocheat.Sok</span>
          <span>•</span>
          <span>© 2025</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SignInForm from './SignInForm.vue'
import SignUpForm from './SignUpForm.vue'

const authStore = useAuthStore()
const showSignIn = ref(true)

// Clear errors when switching forms
watch(showSignIn, () => {
  authStore.clearError()
})

function switchToSignUp() {
  showSignIn.value = false
}

function switchToSignIn() {
  showSignIn.value = true
}
</script>
