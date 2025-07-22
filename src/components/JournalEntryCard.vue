<template>
  <div class="bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] hover:border-blue-200">
    <div class="flex justify-between items-start mb-6">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
            <span class="text-2xl">{{ getEmotionEmoji(entry.emotion) }}</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
              {{ formatDate(entry.date) }}
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 capitalize font-medium bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 rounded-full border border-gray-200">
                {{ entry.emotion }}
              </span>
              <span class="text-xs text-gray-400">
                {{ formatTime(entry.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <button
          @click="$emit('edit', entry)"
          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
          title="Edit entry"
        >
          <PencilIcon class="w-5 h-5" />
        </button>
        <button
          @click="entry.id && $emit('delete', entry.id)"
          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
          title="Delete entry"
          :disabled="!entry.id"
        >
          <TrashIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Gratitude -->
      <div v-if="entry.gratitude" class="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-xl p-4">
        <h4 class="text-sm font-bold text-gray-800 mb-2 flex items-center">
          <div class="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center mr-2">
            <HeartIcon class="w-4 h-4 text-pink-600" />
          </div>
          Grateful for
        </h4>
        <p class="text-gray-900 leading-relaxed">{{ entry.gratitude }}</p>
      </div>

      <!-- Challenges -->
      <div v-if="entry.challenges" class="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4">
        <h4 class="text-sm font-bold text-gray-800 mb-2 flex items-center">
          <div class="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
            <ExclamationTriangleIcon class="w-4 h-4 text-orange-600" />
          </div>
          Challenges
        </h4>
        <p class="text-gray-900 leading-relaxed">{{ entry.challenges }}</p>
      </div>

      <!-- Learning -->
      <div v-if="entry.learning" class="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100 rounded-xl p-4">
        <h4 class="text-sm font-bold text-gray-800 mb-2 flex items-center">
          <div class="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-2">
            <LightBulbIcon class="w-4 h-4 text-yellow-600" />
          </div>
          Learning
        </h4>
        <p class="text-gray-900 leading-relaxed">{{ entry.learning }}</p>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Created {{ formatDateTime(entry.createdAt) }}</span>
        <span v-if="entry.updatedAt && entry.updatedAt.getTime() !== entry.createdAt.getTime()" class="text-blue-600">
          Updated {{ formatDateTime(entry.updatedAt) }}
        </span>
      </div>
      
      <!-- Public Entry Social Features -->
      <div v-if="entry.isPublic" class="space-y-3">
        <!-- Social Stats -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <div class="flex items-center space-x-1">
              <HeartIcon class="w-4 h-4" />
              <span>{{ getTotalReactions(entry) }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <ChatBubbleLeftIcon class="w-4 h-4" />
              <span>{{ getCommentCount(entry) }}</span>
            </div>
          </div>
          <router-link
            :to="`/entry/${entry.id}`"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            View Full Entry
          </router-link>
        </div>

        <!-- Simple Reaction Buttons (counts only) -->
        <div v-if="showSocialFeatures" class="flex items-center justify-between pt-3">
          <div class="flex items-center space-x-4">
            <button
              @click="quickReact({ emoji: '❤️', label: 'Love' })"
              :class="[
                'flex items-center space-x-1 text-sm transition-all duration-200',
                hasUserReacted('❤️')
                  ? 'text-red-600 font-medium'
                  : 'text-gray-500 hover:text-red-600'
              ]"
              :disabled="!authStore.isAuthenticated"
              :title="!authStore.isAuthenticated ? 'Sign in to react' : 'Love this entry'"
            >
              <HeartIcon class="w-4 h-4" />
              <span v-if="getReactionCount('❤️')">{{ getReactionCount('❤️') }}</span>
            </button>
            
            <button
              @click="quickReact({ emoji: '👍', label: 'Like' })"
              :class="[
                'flex items-center space-x-1 text-sm transition-all duration-200',
                hasUserReacted('👍')
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-blue-600'
              ]"
              :disabled="!authStore.isAuthenticated"
              :title="!authStore.isAuthenticated ? 'Sign in to react' : 'Like this entry'"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
              </svg>
              <span v-if="getReactionCount('👍')">{{ getReactionCount('👍') }}</span>
            </button>
          </div>
          
          <span class="text-xs text-gray-400">
            {{ getTotalReactions(entry) + getCommentCount(entry) }} interactions
          </span>
        </div>

        <!-- Public indicator -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 text-xs text-gray-400">
            <EyeIcon class="w-3 h-3" />
            <span>Public entry</span>
          </div>
        </div>
      </div>

      <!-- Private entry indicator -->
      <div v-else class="flex items-center space-x-2 text-xs text-gray-400">
        <LockClosedIcon class="w-3 h-3" />
        <span>Private entry</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  PencilIcon,
  TrashIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useSocialStore } from '@/stores/social'
import { useNotificationStore } from '@/stores/notification'
import type { JournalEntry } from '@/types/journal'
import { EMOTION_OPTIONS } from '@/types/journal'

interface Props {
  entry: JournalEntry
  showSocialFeatures?: boolean
}

interface Emits {
  (e: 'edit', entry: JournalEntry): void
  (e: 'delete', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showSocialFeatures: true
})

defineEmits<Emits>()

const authStore = useAuthStore()
const socialStore = useSocialStore()
const notificationStore = useNotificationStore()

const reactions = computed(() => socialStore.getReactions(props.entry.id || ''))

function formatDate(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return format(date, 'EEEE, MMMM d, yyyy')
}

function formatTime(date: Date) {
  return format(date, 'h:mm a')
}

function formatDateTime(date: Date) {
  return format(date, "MMM d, yyyy 'at' h:mm a")
}

function getEmotionEmoji(emotion: string) {
  const emotionOption = EMOTION_OPTIONS.find((option) => option.value === emotion)
  return emotionOption?.emoji || '😐'
}

function getTotalReactions(entry: JournalEntry): number {
  return socialStore.getTotalReactions(entry)
}

function getCommentCount(entry: JournalEntry): number {
  return socialStore.getCommentCount(entry)
}

function hasUserReacted(emoji: string): boolean {
  return socialStore.hasUserReacted(props.entry.id || '', emoji)
}

function getReactionCount(emoji: string): number {
  return reactions.value[emoji] || 0
}

async function quickReact(reactionType: { emoji: string; label: string }) {
  if (!authStore.isAuthenticated || !props.entry.id) return

  try {
    const isRemoving = hasUserReacted(reactionType.emoji)
    
    await socialStore.toggleReaction(props.entry.id, reactionType.emoji)
    
    // Send notification if adding reaction (not removing)
    if (!isRemoving && props.entry.userId !== authStore.user?.uid) {
      await notificationStore.notifyReaction(
        props.entry.id,
        props.entry.userId,
        reactionType,
        authStore.userDisplayName
      )
    }
  } catch (error) {
    console.error('Error toggling reaction:', error)
  }
}
</script>
