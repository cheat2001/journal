<template>
  <header class="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <!-- Logo and Title -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-xl">📖</span>
          </div>
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Daily Journal
            </h1>
            <p class="text-xs text-gray-500 hidden sm:block">Reflect & Grow</p>
          </div>
        </div>

        <!-- User Menu -->
        <div class="relative" v-if="authStore.isAuthenticated">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none group transition-all duration-200"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-200">
              {{ userInitials }}
            </div>
            <div class="hidden sm:block text-left">
              <div class="text-sm font-semibold text-gray-900">{{ authStore.userDisplayName }}</div>
              <div class="text-xs text-gray-500">{{ authStore.user?.email }}</div>
            </div>
            <ChevronDownIcon class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 py-2 z-50 fade-in"
          >
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{{ authStore.userDisplayName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
            </div>
            
            <button
              @click="showProfile = true; showUserMenu = false"
              class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
            >
              <UserIcon class="w-4 h-4 mr-3 text-gray-400" />
              Quick Profile Edit
            </button>
            
            <router-link
              to="/profile"
              @click="showUserMenu = false"
              class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
            >
              <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Profile Settings
            </router-link>
            
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
            >
              <ArrowRightOnRectangleIcon class="w-4 h-4 mr-3 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    <div
      v-if="showProfile"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl slide-up">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3 shadow-lg">
            {{ userInitials }}
          </div>
          <h3 class="text-xl font-bold text-gray-900">Profile Settings</h3>
        </div>
        
        <form @submit.prevent="handleUpdateProfile" class="space-y-6">
          <div>
            <label for="profile-name" class="block text-sm font-semibold text-gray-700 mb-2">
              Display Name
            </label>
            <input
              id="profile-name"
              v-model="profileForm.displayName"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200">
              {{ authStore.user?.email }}
            </div>
            <p class="text-xs text-gray-500 mt-2">Email cannot be changed</p>
          </div>

          <div v-if="profileError" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {{ profileError }}
          </div>

          <div v-if="profileSuccess" class="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Profile updated successfully!
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeProfile"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <span v-if="!authStore.loading">Save Changes</span>
              <div v-else class="flex items-center justify-center">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ChevronDownIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const showUserMenu = ref(false)
const showProfile = ref(false)
const profileError = ref<string | null>(null)
const profileSuccess = ref(false)

const profileForm = reactive({
  displayName: ''
})

const userInitials = computed(() => {
  const name = authStore.userDisplayName
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

async function handleLogout() {
  try {
    await authStore.logout()
    showUserMenu.value = false
  } catch {
    // Error handled by auth store
  }
}

async function handleUpdateProfile() {
  profileError.value = null
  profileSuccess.value = false
  
  try {
    await authStore.updateUserProfile({
      displayName: profileForm.displayName.trim()
    })
    profileSuccess.value = true
    setTimeout(() => {
      closeProfile()
    }, 1500)
  } catch (error) {
    profileError.value = error instanceof Error ? error.message : 'Failed to update profile'
  }
}

function closeProfile() {
  showProfile.value = false
  profileError.value = null
  profileSuccess.value = false
  // Reset form to current user data
  profileForm.displayName = authStore.userDisplayName
}

onMounted(() => {
  profileForm.displayName = authStore.userDisplayName
})
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
