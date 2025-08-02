<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
            <div v-if="unreadCount > 0" class="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {{ unreadCount }}
            </div>
          </div>
          
          <button 
            @click="router.push('/feed')" 
            class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Back to Feed
          </button>
        </div>
      </div>
    </div>

    <!-- Chat List -->
    <div class="max-w-4xl mx-auto px-4 py-6">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="chatRooms.length === 0" class="text-center py-16">
        <div class="text-8xl mb-6">💬</div>
        <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">No conversations yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">Start chatting with other users from the community feed. Click "Start Chat" on any journal entry to begin a conversation!</p>
        <button 
          @click="router.push('/feed')"
          class="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
          Go to Community Feed
        </button>
      </div>
      
      <div v-else class="space-y-2">
        <!-- Chat Room Cards -->
        <div
          v-for="chatRoom in sortedChatRooms"
          :key="chatRoom.id"
          @click="openChat(chatRoom.id)"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer group overflow-hidden"
        >
          <div class="p-4 sm:p-6">
            <div class="flex items-center space-x-4">
              <!-- Avatar -->
              <div class="relative">
                <div class="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-2 ring-white group-hover:ring-4 group-hover:ring-blue-500/20 transition-all duration-300">
                  <span class="text-sm sm:text-base font-bold text-white">
                    {{ getOtherParticipant(chatRoom)?.initials }}
                  </span>
                </div>
                <div class="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              
              <!-- Chat Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {{ getOtherParticipant(chatRoom)?.name }}
                  </h3>
                  <div class="flex items-center space-x-2 ml-2">
                    <span v-if="chatRoom.lastMessage" class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {{ formatChatTime(chatRoom.lastMessage.timestamp) }}
                    </span>
                    <div v-if="isUnread(chatRoom)" class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                
                <!-- Last Message -->
                <div class="flex items-center justify-between">
                  <p v-if="chatRoom.lastMessage" class="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                    <span v-if="chatRoom.lastMessage.senderId === authStore.user?.uid" class="text-gray-500 dark:text-gray-400">You: </span>
                    {{ chatRoom.lastMessage.content }}
                  </p>
                  <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic flex-1">
                    No messages yet
                  </p>
                  
                  <!-- Unread Badge -->
                  <div v-if="isUnread(chatRoom)" class="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                </div>
              </div>
              
              <!-- Arrow -->
              <div class="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <Toast 
      :show="showToast" 
      :message="toastMessage" 
      :type="toastType"
      @close="showToast = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { notificationSound } from '@/utils/notificationSound'
import Toast from '@/components/Toast.vue'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

// Reactive state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')

// Computed properties
const chatRooms = computed(() => chatStore.chatRooms)
const sortedChatRooms = computed(() => chatStore.sortedChatRooms)
const unreadCount = computed(() => chatStore.unreadChatsCount)
const loading = computed(() => chatStore.loading)

// Methods
function getOtherParticipant(chatRoom: any) {
  return chatStore.getOtherParticipant(chatRoom)
}

function isUnread(chatRoom: any) {
  return chatRoom.lastMessage && 
         chatRoom.lastMessage.senderId !== authStore.user?.uid && 
         !chatRoom.lastMessage.isRead
}

function formatChatTime(timestamp: Date) {
  const now = new Date()
  const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}d`
  } else {
    return timestamp.toLocaleDateString()
  }
}

function openChat(chatRoomId: string) {
  router.push(`/chat/${chatRoomId}`)
}

function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Lifecycle
onMounted(async () => {
  if (!authStore.user) {
    router.push('/auth')
    return
  }
  
  // Initialize notification sounds
  await notificationSound.initialize()
  
  // Request notification permission if not already granted
  if (notificationSound.getNotificationPermission() === 'default') {
    const permission = await notificationSound.requestNotificationPermission()
    if (permission) {
      console.log('Browser notification permission granted')
    }
  }
  
  try {
    await chatStore.fetchChatRooms()
  } catch (error) {
    console.error('Error fetching chat rooms:', error)
    showToastMessage('Failed to load conversations.', 'error')
  }
})
</script>

<style scoped>
/* Enhanced hover animations */
.group:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.transform {
  transition: transform 0.3s ease;
}

/* Loading animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced shadows */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Enhanced gradients */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .space-x-4 > * + * {
    margin-left: 1rem;
  }
  
  .p-4 {
    padding: 1rem;
  }
  
  .text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}
</style>
