<template>
  <div class="relative" data-notification-dropdown="true">
    <!-- Notification Bell Button -->
    <button
      @click="toggleDropdown"
      :class="[
        'relative p-2 rounded-lg transition-all duration-200',
        'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        unreadCount > 0 ? 'animate-pulse' : ''
      ]"
      aria-label="Open notifications"
    >
      <BellIcon class="w-6 h-6" />
      
      <!-- Unread Badge -->
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="scale-0 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition-all duration-200"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-0 opacity-0"
      >
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold leading-none text-white bg-red-500 rounded-full px-1"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Transition>
    </button>

    <!-- Dropdown Panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 focus:outline-none z-50"
        @click.stop
      >
        <!-- Header -->
        <div class="px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h3>
          <div class="flex items-center space-x-1 sm:space-x-2">
            <button
              v-if="unreadCount > 0"
              @click="handleMarkAllRead"
              class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <span class="hidden sm:inline">Mark all read</span>
              <span class="sm:hidden">Mark read</span>
            </button>
            <button
              @click="closeDropdown"
              class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Notification List -->
        <div class="max-h-80 sm:max-h-96 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="loading" class="p-4 sm:p-6 text-center">
            <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="recentNotifications.length === 0" class="p-4 sm:p-6 text-center">
            <BellSlashIcon class="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mb-2 sm:mb-3" />
            <h3 class="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              No notifications yet
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              When people interact with your entries, you'll see notifications here
            </p>
          </div>

          <!-- Notification Items -->
          <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
            <div
              v-for="notification in recentNotifications"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              :class="[
                'px-3 sm:px-4 py-3 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 relative',
                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              ]"
            >
                <!-- Unread indicator -->
                <div
                  v-if="!notification.isRead"
                  class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
                ></div>

                <div class="flex items-start space-x-2 sm:space-x-3">
                  <!-- Notification Icon -->
                  <div :class="['flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center', getNotificationBgColor(notification.type)]">
                    <component 
                      :is="getNotificationIcon(notification.type)" 
                      :class="['w-4 h-4 sm:w-5 sm:h-5', getNotificationIconColor(notification.type)]" 
                    />
                  </div>
                  
                  <!-- Notification Content -->
                  <div class="flex-1 min-w-0">
                    <!-- Header with title and time -->
                    <div class="flex items-start justify-between mb-1">
                      <p class="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 pr-1 sm:pr-2 leading-tight">
                        {{ notification.title }}
                      </p>
                      <div class="flex items-center space-x-1 flex-shrink-0">
                        <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {{ formatTime(notification.createdAt) }}
                        </span>
                        <div
                          v-if="!notification.isRead"
                          class="w-2 h-2 bg-blue-500 rounded-full"
                        ></div>
                      </div>
                    </div>
                    
                    <!-- Message -->
                    <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {{ notification.message }}
                    </p>
                    
                    <!-- User info for social notifications -->
                    <div v-if="notification.data.fromUserName && (notification.type === 'reaction' || notification.type === 'comment')" class="mt-1 sm:mt-2 flex items-center space-x-1 sm:space-x-2">
                      <div class="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span class="text-xs font-bold text-white">
                          {{ notification.data.fromUserInitials }}
                        </span>
                      </div>
                      <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {{ notification.data.fromUserName }}
                      </span>
                      
                      <!-- Reaction type for reactions -->
                      <span v-if="notification.type === 'reaction' && notification.data.reactionType" class="text-sm">
                        {{ notification.data.reactionType.emoji }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          <!-- View All Link -->
          <div v-if="notifications.length > recentNotifications.length" class="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button 
              @click="viewAllNotifications"
              class="w-full text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <span class="hidden sm:inline">View all {{ notifications.length }} notifications</span>
              <span class="sm:hidden">View all ({{ notifications.length }})</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop for mobile -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 md:hidden"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  BellIcon, 
  BellSlashIcon, 
  XMarkIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { formatDistanceToNow } from 'date-fns'
import type { Notification } from '@/types/notification'

const notificationStore = useNotificationStore()
const { notifications, recentNotifications, unreadCount, loading } = storeToRefs(notificationStore)
const { markAllAsRead } = notificationStore
const router = useRouter()

const isOpen = ref(false)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function handleNotificationClick(notification: Notification) {
  console.log('🖱️ Notification clicked:', notification.title)
  
  try {
    // Mark as read first
    if (!notification.isRead) {
      notificationStore.markAsRead(notification.id)
    }
    
    // Close dropdown
    closeDropdown()
    
    // Navigate after a short delay to ensure dropdown closes properly
    setTimeout(() => {
      console.log('🔗 Starting navigation for notification type:', notification.type)
      
      if (notification.data.redirectUrl) {
        console.log('🔗 Using redirect URL:', notification.data.redirectUrl)
        // Use Vue Router for internal navigation
        router.push(notification.data.redirectUrl)
      } else if (notification.data.entryId) {
        // For reactions and comments, navigate to the specific entry
        console.log('🔗 Navigating to entry:', notification.data.entryId)
        router.push(`/entry/${notification.data.entryId}`)
      } else {
        // Default navigation based on notification type
        let defaultRoute = '/'
        
        if (notification.type === 'reaction' || notification.type === 'comment') {
          defaultRoute = '/feed'
        } else if (notification.type === 'achievement' || notification.type === 'streak') {
          defaultRoute = '/'
        }
        
        console.log('🔗 Using default route:', defaultRoute)
        router.push(defaultRoute)
      }
    }, 150)
    
  } catch (error) {
    console.error('❌ Error handling notification click:', error)
    // Fallback to home page
    router.push('/')
  }
}

async function handleMarkAllRead() {
  console.log('📖 Marking all notifications as read...')
  await markAllAsRead()
}

function viewAllNotifications() {
  // Since we don't have a dedicated notifications page, just close the dropdown
  closeDropdown()
}

function getNotificationIcon(type: string) {
  const icons = {
    reaction: HeartIcon,
    comment: ChatBubbleLeftIcon,
    achievement: TrophyIcon,
    streak: FireIcon,
    reminder: ClockIcon,
    insight: InformationCircleIcon,
    milestone: TrophyIcon
  }
  return icons[type as keyof typeof icons] || InformationCircleIcon
}

function getNotificationIconColor(type: string) {
  const colors = {
    reaction: 'text-pink-600',
    comment: 'text-blue-600',
    achievement: 'text-yellow-600',
    streak: 'text-orange-600',
    reminder: 'text-purple-600',
    insight: 'text-green-600',
    milestone: 'text-indigo-600'
  }
  return colors[type as keyof typeof colors] || 'text-gray-600'
}

function getNotificationBgColor(type: string) {
  const colors = {
    reaction: 'bg-pink-100',
    comment: 'bg-blue-100',
    achievement: 'bg-yellow-100',
    streak: 'bg-orange-100',
    reminder: 'bg-purple-100',
    insight: 'bg-green-100',
    milestone: 'bg-indigo-100'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100'
}

function formatTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

// Handle click outside to close dropdown
function handleClickOutside(event: Event) {
  const target = event.target as Element
  if (!target.closest('[data-notification-dropdown]')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Notification animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Line clamp utilities */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
