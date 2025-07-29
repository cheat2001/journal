<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- Chat Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Back Button -->
            <button 
              @click="router.back()" 
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            
            <!-- Chat Partner Info -->
            <div v-if="otherParticipant" class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <span class="text-sm font-bold text-white">
                  {{ otherParticipant.initials }}
                </span>
              </div>
              <div>
                <h1 class="text-lg font-semibold text-gray-900">{{ otherParticipant.name }}</h1>
                <p class="text-xs text-gray-500">Online</p>
              </div>
            </div>
          </div>
          
          <!-- Chat Actions -->
          <div class="flex items-center space-x-2">
            <!-- Sound Toggle Button -->
            <button 
              @click="toggleSound"
              class="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 relative sound-button"
              :class="{ 'sound-wave': soundEnabled }"
              :title="soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'"
            >
              <svg v-if="soundEnabled" class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.764 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.764l3.619-2.816a1 1 0 011.617.816zM12.804 8.196a.75.75 0 011.06-.028 4 4 0 010 5.664.75.75 0 11-1.032-1.088 2.5 2.5 0 000-3.536.75.75 0 01-.028-1.06z" clip-rule="evenodd"/>
                <path d="M14.8 5.61a.75.75 0 011.06-.014 8 8 0 010 11.314.75.75 0 11-1.046-1.074 6.5 6.5 0 000-9.166.75.75 0 01-.014-1.06z"/>
              </svg>
              <svg v-else class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 4a1 1 0 00-1.617-.816L4.764 6H2a1 1 0 00-1 1v6a1 1 0 001 1h2.764l3.619 2.816A1 1 0 0010 16V4z"/>
                <path d="M13.293 7.293a1 1 0 011.414 0L16 8.586l1.293-1.293a1 1 0 111.414 1.414L17.414 10l1.293 1.293a1 1 0 01-1.414 1.414L16 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
              </svg>
            </button>
            
            <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="max-w-4xl mx-auto">
      <div class="flex flex-col h-[calc(100vh-140px)]">
        <!-- Messages List -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          
          <div v-else-if="messages.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">💬</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Start the conversation!</h3>
            <p class="text-gray-600">Send a message to {{ otherParticipant?.name }} to begin chatting.</p>
          </div>
          
          <div v-else>
            <!-- Message Bubbles -->
            <div 
              v-for="message in messages" 
              :key="message.id"
              class="flex"
              :class="message.senderId === authStore.user?.uid ? 'justify-end' : 'justify-start'"
            >
              <div class="max-w-xs sm:max-w-md lg:max-w-lg">
                <!-- Other user's message -->
                <div v-if="message.senderId !== authStore.user?.uid" class="flex items-start space-x-2">
                  <div class="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span class="text-xs font-bold text-white">
                      {{ message.senderInitials }}
                    </span>
                  </div>
                  <div>
                    <div class="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-200">
                      <p class="text-sm text-gray-900 whitespace-pre-wrap break-words">{{ message.content }}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 ml-2">{{ formatMessageTime(message.timestamp) }}</p>
                  </div>
                </div>
                
                <!-- Current user's message -->
                <div v-else class="flex justify-end">
                  <div>
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
                      <p class="text-sm text-white whitespace-pre-wrap break-words">{{ message.content }}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 mr-2 text-right">
                      {{ formatMessageTime(message.timestamp) }}
                      <span v-if="message.isRead" class="ml-1">✓✓</span>
                      <span v-else class="ml-1">✓</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="border-t border-gray-200 bg-white px-4 py-4">
          <div class="flex items-end space-x-3">
            <div class="flex-1">
              <textarea
                v-model="newMessage"
                placeholder="Type your message..."
                rows="1"
                class="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm max-h-32 overflow-y-auto text-gray-900 bg-white placeholder-gray-500"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.shift.enter="addNewLine"
                @input="handleTyping"
                ref="messageInput"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1 ml-2">Press Enter to send, Shift+Enter for new line</p>
            </div>
            <button
              @click="sendMessage"
              :disabled="!newMessage.trim() || isSending"
              class="flex items-center justify-center h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg v-if="!isSending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </button>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { notificationSound } from '@/utils/notificationSound'
import Toast from '@/components/Toast.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

// Reactive state
const newMessage = ref('')
const isSending = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()
const soundEnabled = ref(localStorage.getItem('chatSoundsEnabled') !== 'false')

// Computed properties
const chatRoomId = computed(() => route.params.id as string)
const currentChatRoom = computed(() => chatStore.currentChatRoom)
const messages = computed(() => chatStore.currentChatMessages)
const loading = computed(() => chatStore.loading)

const otherParticipant = computed(() => {
  if (!currentChatRoom.value) return null
  return chatStore.getOtherParticipant(currentChatRoom.value)
})

// Methods
function formatMessageTime(timestamp: Date) {
  const now = new Date()
  const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}d ago`
  } else {
    return timestamp.toLocaleDateString()
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || isSending.value) return
  
  console.log('Sending message:', newMessage.value.trim())
  isSending.value = true
  
  try {
    await chatStore.sendMessage(chatRoomId.value, newMessage.value.trim())
    
    // Play subtle sound for sent message
    notificationSound.playMessageSent()
    
    newMessage.value = ''
    adjustTextareaHeight()
    scrollToBottom()
    console.log('Message sent successfully')
  } catch (error) {
    console.error('Error sending message:', error)
    showToastMessage('Failed to send message. Please try again.', 'error')
  } finally {
    isSending.value = false
  }
}

function addNewLine() {
  newMessage.value += '\n'
  nextTick(() => {
    adjustTextareaHeight()
  })
}

function adjustTextareaHeight() {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }
}

let typingSoundTimeout: number | null = null

function handleTyping() {
  adjustTextareaHeight()
  
  // Play subtle typing sound (throttled)
  if (soundEnabled.value && !typingSoundTimeout) {
    notificationSound.playTyping()
    typingSoundTimeout = window.setTimeout(() => {
      typingSoundTimeout = null
    }, 200) // Throttle typing sounds to every 200ms
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  localStorage.setItem('chatSoundsEnabled', soundEnabled.value.toString())
  notificationSound.setEnabled(soundEnabled.value)
  
  // Play a test sound when enabling
  if (soundEnabled.value) {
    notificationSound.playMessageReceived()
  }
  
  showToastMessage(
    soundEnabled.value ? 'Notification sounds enabled 🔊' : 'Notification sounds disabled 🔇',
    'info'
  )
}

// Watchers
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  if (!authStore.user) {
    router.push('/auth')
    return
  }
  
  // Initialize notification sounds
  await notificationSound.initialize()
  notificationSound.setEnabled(soundEnabled.value)
  
  // Request notification permission if not already granted
  if (notificationSound.getNotificationPermission() === 'default') {
    const permission = await notificationSound.requestNotificationPermission()
    if (permission) {
      console.log('Browser notification permission granted')
    } else {
      console.log('Browser notification permission denied')
    }
  }
  
  try {
    await chatStore.loadChatRoom(chatRoomId.value)
    await chatStore.markMessagesAsRead(chatRoomId.value)
    scrollToBottom()
  } catch (error) {
    console.error('Error loading chat room:', error)
    showToastMessage('Failed to load chat room.', 'error')
    router.push('/feed')
  }
})

onUnmounted(() => {
  chatStore.clearCurrentChat()
})
</script>

<style scoped>
/* Custom scrollbar for messages */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}

/* Message animations */
.flex.justify-end,
.flex.justify-start {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced shadows */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Sound button animation */
.sound-button:hover {
  transform: scale(1.05);
}

.sound-wave {
  animation: soundWave 0.6s ease-in-out;
}

@keyframes soundWave {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

/* Message bubble enhancements */
.rounded-2xl {
  border-radius: 1rem;
}

.rounded-tl-md {
  border-top-left-radius: 0.375rem;
}

.rounded-tr-md {
  border-top-right-radius: 0.375rem;
}

/* Enhanced textarea */
.resize-none {
  resize: none;
}

.max-h-32 {
  max-height: 8rem;
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

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-xs {
    max-width: 16rem;
  }
  
  .px-4.py-4 {
    padding: 1rem;
  }
  
  .space-x-3 > * + * {
    margin-left: 0.75rem;
  }
}
</style>
