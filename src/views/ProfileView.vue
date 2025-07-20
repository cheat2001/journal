<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const router = useRouter()

const profileForm = reactive({
  displayName: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const showPasswordChange = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const passwordMismatch = computed(() => {
  return profileForm.newPassword && profileForm.confirmPassword && 
         profileForm.newPassword !== profileForm.confirmPassword
})

const isPasswordFormValid = computed(() => {
  return profileForm.currentPassword.length >= 6 && 
         profileForm.newPassword.length >= 6 && 
         profileForm.newPassword === profileForm.confirmPassword
})

async function handleUpdateProfile() {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    await authStore.updateUserProfile({
      displayName: profileForm.displayName.trim()
    })
    successMessage.value = 'Profile updated successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}

async function handlePasswordChange() {
  if (!isPasswordFormValid.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    // Note: Firebase doesn't allow password change without re-authentication
    // This would need additional implementation with re-authentication
    successMessage.value = 'Password change functionality needs re-authentication. Please sign out and use forgot password.'
    
    // Reset password form
    profileForm.currentPassword = ''
    profileForm.newPassword = ''
    profileForm.confirmPassword = ''
    showPasswordChange.value = false
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to change password'
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  router.push('/')
}

onMounted(() => {
  profileForm.displayName = authStore.userDisplayName
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Journal
        </button>
        
        <div class="text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
            {{ authStore.userDisplayName?.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) }}
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p class="text-gray-600">Manage your account information</p>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          {{ successMessage }}
        </div>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {{ errorMessage }}
      </div>

      <!-- Profile Form -->
      <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
        
        <form @submit.prevent="handleUpdateProfile" class="space-y-6">
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              v-model="profileForm.displayName"
              type="text"
              required
              class="form-input"
              :disabled="isLoading"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-600">
              {{ authStore.user?.email }}
            </div>
            <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="isLoading || !profileForm.displayName.trim()"
              class="btn-primary"
            >
              <LoadingSpinner v-if="isLoading" class="w-4 h-4 mr-2" />
              {{ isLoading ? 'Updating...' : 'Update Profile' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Password Change Section -->
      <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Security</h2>
          <button
            @click="showPasswordChange = !showPasswordChange"
            class="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            {{ showPasswordChange ? 'Cancel' : 'Change Password' }}
          </button>
        </div>

        <div v-if="!showPasswordChange" class="text-gray-600">
          <p>Keep your account secure by regularly updating your password.</p>
        </div>

        <form v-else @submit.prevent="handlePasswordChange" class="space-y-6">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              id="currentPassword"
              v-model="profileForm.currentPassword"
              type="password"
              required
              class="form-input"
              :disabled="isLoading"
              placeholder="Enter your current password"
            />
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              id="newPassword"
              v-model="profileForm.newPassword"
              type="password"
              required
              class="form-input"
              :disabled="isLoading"
              placeholder="Enter new password (min. 6 characters)"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              v-model="profileForm.confirmPassword"
              type="password"
              required
              class="form-input"
              :disabled="isLoading"
              placeholder="Confirm your new password"
            />
          </div>

          <div v-if="passwordMismatch" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Passwords do not match
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showPasswordChange = false"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading || !isPasswordFormValid"
              class="flex-1 btn-primary"
            >
              <LoadingSpinner v-if="isLoading" class="w-4 h-4 mr-2" />
              {{ isLoading ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Account Actions -->
      <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8 mt-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Account Actions</h2>
        
        <div class="space-y-4">
          <button
            @click="authStore.logout()"
            class="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-3 px-6 rounded-lg border border-red-200 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
