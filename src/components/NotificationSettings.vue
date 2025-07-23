<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        Notification Preferences
      </h2>
      <p class="text-sm text-gray-600">
        Customize how you want to receive notifications about your journal activity
      </p>
    </div>

    <div class="space-y-6">
      <!-- General Settings -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">
          General Settings
        </h3>

        <!-- Notification Types -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-700">Activity Notifications</h4>
            
            <label class="flex items-center space-x-3">
                              v-model="settings.reactions"
                @change="updateSettings"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <span class="text-sm font-medium text-gray-900">Reactions</span>
                <p class="text-xs text-gray-500">When someone reacts to your entries</p>
              </div>
            </label>

            <label class="flex items-center space-x-3">
                              v-model="settings.comments"
                @change="updateSettings"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <span class="text-sm font-medium text-gray-900">Comments</span>
                <p class="text-xs text-gray-500">When someone comments on your entries</p>
              </div>
            </label>
          </div>

          <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Progress Notifications</h4>
            
            <label class="flex items-center space-x-3">
              <input
                v-model="localSettings.achievements"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div class="flex-1">
                <span class="text-sm font-medium text-gray-900 dark:text-white">Achievements</span>
                <p class="text-xs text-gray-500 dark:text-gray-400">When you unlock badges and achievements</p>
              </div>
            </label>

            <label class="flex items-center space-x-3">
              <input
                v-model="localSettings.streaks"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div class="flex-1">
                <span class="text-sm font-medium text-gray-900 dark:text-white">Streak Milestones</span>
                <p class="text-xs text-gray-500 dark:text-gray-400">When you reach journaling streak goals</p>
              </div>
            </label>

            <label class="flex items-center space-x-3">
              <input
                v-model="localSettings.reminders"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div class="flex-1">
                <span class="text-sm font-medium text-gray-900 dark:text-white">Writing Reminders</span>
                <p class="text-xs text-gray-500 dark:text-gray-400">Gentle daily reminders to journal</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Quiet Hours -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Quiet Hours</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Don't send notifications during these hours</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="localSettings.quietHoursEnabled"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div v-if="localSettings.quietHoursEnabled" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time
            </label>
            <input
              v-model="localSettings.quietHoursStart"
              type="time"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Time
            </label>
            <input
              v-model="localSettings.quietHoursEnd"
              type="time"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Future Features -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Coming Soon</h3>
        <div class="space-y-3 opacity-50">
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              disabled
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</span>
              <p class="text-xs text-gray-500 dark:text-gray-400">Browser notifications when app is closed</p>
            </div>
          </label>

          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              disabled
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</span>
              <p class="text-xs text-gray-500 dark:text-gray-400">Weekly summary emails</p>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Changes are saved automatically
        </p>
        <div class="flex space-x-3">
          <button
            @click="resetToDefaults"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Reset to Defaults
          </button>
          <div class="flex items-center">
            <CheckCircleIcon v-if="saved" class="w-5 h-5 text-green-500 mr-2" />
            <span v-if="saved" class="text-sm text-green-600 dark:text-green-400">Saved!</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import type { NotificationSettings } from '@/types/notification'

const notificationStore = useNotificationStore()
const { settings } = storeToRefs(notificationStore)
const { updateNotificationSettings } = notificationStore

const saved = ref(false)
const localSettings = reactive<NotificationSettings>({
  reactions: true,
  comments: true,
  achievements: true,
  streaks: true,
  reminders: false,
  insights: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  pushEnabled: false,
  emailEnabled: false
})

// Initialize with current settings
onMounted(() => {
  if (settings.value) {
    Object.assign(localSettings, settings.value)
  }
})

// Watch for changes and auto-save
watch(localSettings, async (newSettings) => {
  await updateNotificationSettings(newSettings)
  showSavedIndicator()
}, { deep: true })

function showSavedIndicator() {
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2000)
}

function resetToDefaults() {
  Object.assign(localSettings, {
    reactions: true,
    comments: true,
    achievements: true,
    streaks: true,
    reminders: false,
    insights: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    pushEnabled: false,
    emailEnabled: false
  })
}
</script>

<style scoped>
/* Custom toggle switch styling is handled by Tailwind classes */
</style>
