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

            <router-link
              to="/"
              class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
            >
              <UserIcon class="w-4 h-4 mr-3 text-gray-400" />
              Journal Home
            </router-link>
            
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
            
            <router-link
              to="/feed"
              @click="showUserMenu = false"
              class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
            >
              <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Community Feed
            </router-link>
            
            <router-link
              to="/about"
              @click="showUserMenu = false"
              class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
            >
              <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              About
            </router-link>
            
            <!-- Developer Social Links -->
            <div class="px-4 py-2 border-t border-gray-100">
              <p class="text-xs font-medium text-gray-500 mb-3">Connect with Developer</p>
              <div class="flex justify-center space-x-4">
                <a 
                  href="https://github.com/cheat2001/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  title="GitHub"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path>
                  </svg>
                </a>
                
                <a 
                  href="https://www.facebook.com/sok.chansocheat/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  title="Facebook"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clip-rule="evenodd"></path>
                  </svg>
                </a>
                
                <a 
                  href="https://www.linkedin.com/in/chansocheatsok/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-blue-700 hover:text-blue-900 transition-colors duration-200"
                  title="LinkedIn"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            
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
