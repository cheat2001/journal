<template>
  <div class="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
    <h3 class="font-bold mb-2">🔔 Notification Debug</h3>
    <div class="space-y-2 text-sm">
      <div>Status: {{ notificationStore.isInitialized ? '✅ Initialized' : '❌ Not initialized' }}</div>
      <div>Notifications: {{ notificationStore.notifications.length }}</div>
      <div>Unread: {{ notificationStore.unreadCount }}</div>
      <div>User ID: {{ authStore.user?.uid?.slice(-8) || 'None' }}</div>
    </div>
    
    <div class="mt-3 space-y-2">
      <button
        @click="createTest"
        :disabled="!authStore.isAuthenticated || loading"
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs transition-colors"
      >
        {{ loading ? 'Creating...' : 'Create Test Notification' }}
      </button>
      
      <button
        @click="createReactionTest"
        :disabled="!authStore.isAuthenticated || loading"
        class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs transition-colors"
      >
        Test Reaction Notification
      </button>
      
      <button
        @click="showToast"
        class="w-full bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition-colors"
      >
        Show Test Toast
      </button>
      
      <button
        @click="toggleDebug"
        class="w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs transition-colors"
      >
        Hide Debug Panel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  close: []
}>()

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const loading = ref(false)

async function createTest() {
  if (!authStore.isAuthenticated) return
  
  loading.value = true
  try {
    await notificationStore.createTestNotification()
  } finally {
    loading.value = false
  }
}

async function createReactionTest() {
  if (!authStore.isAuthenticated) return
  
  loading.value = true
  try {
    await notificationStore.notifyReaction(
      'test-entry-123',
      authStore.user!.uid,
      { emoji: '❤️', label: 'love' },
      'Test User'
    )
  } finally {
    loading.value = false
  }
}

function showToast() {
  notificationStore.showToast({
    type: 'success',
    title: 'Test Toast! 🎉',
    message: 'This is a test toast notification to verify the toast system is working.',
    duration: 5000
  })
}

function toggleDebug() {
  emit('close')
}
</script>
