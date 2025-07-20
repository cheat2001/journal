<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo Section -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-xl mb-6">
          <span class="text-3xl">📖</span>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
          Daily Journal
        </h1>
        <p class="text-lg text-gray-600">
          Your personal space for reflection and growth
        </p>
      </div>

      <!-- Auth Form Container -->
      <div class="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 p-8">
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
        <p class="text-sm text-gray-500">
          Start your journaling journey today and discover the power of daily reflection.
        </p>
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
