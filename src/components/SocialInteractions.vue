<template>
  <div class="p-6">
    <!-- Reactions Section -->
    <div class="mb-6">
      <!-- Reaction Summary -->
      <div v-if="totalReactions > 0" class="flex items-center space-x-2 mb-4">
        <div class="flex -space-x-1">
          <div
            v-for="(count, emoji) in uniqueReactions"
            :key="emoji"
            class="w-6 h-6 bg-white border-2 border-white rounded-full flex items-center justify-center text-sm shadow-sm"
          >
            {{ emoji }}
          </div>
        </div>
        <span class="text-sm text-gray-600">{{ totalReactions }} {{ totalReactions === 1 ? 'reaction' : 'reactions' }}</span>
      </div>

      <!-- Reaction Buttons -->
      <div class="flex items-center space-x-2 pb-4 border-b border-gray-100">
        <button
          v-for="reactionType in reactionTypes"
          :key="reactionType.emoji"
          @click="toggleReaction(reactionType)"
          :class="[
            'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            hasUserReacted(reactionType.emoji)
              ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent'
          ]"
          :disabled="!authStore.isAuthenticated"
          :title="!authStore.isAuthenticated ? 'Sign in to react' : `React with ${reactionType.label}`"
        >
          <span class="text-lg">{{ reactionType.emoji }}</span>
          <span>{{ getReactionCount(reactionType.emoji) || '' }}</span>
        </button>
      </div>
    </div>

    <!-- Comments Section -->
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          Comments ({{ comments.length }})
        </h3>
        <button
          v-if="!showFullComments && comments.length > 3"
          @click="showFullComments = true"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all {{ comments.length }} comments
        </button>
      </div>

      <!-- Add Comment -->
      <div v-if="authStore.isAuthenticated" class="flex space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {{ authStore.userInitials }}
        </div>
        <div class="flex-1">
          <textarea
            v-model="newComment"
            placeholder="Write a comment..."
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            @keydown.ctrl.enter="addComment"
            @keydown.meta.enter="addComment"
          ></textarea>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-gray-500">
              Press Ctrl+Enter to post
            </span>
            <button
              @click="addComment"
              :disabled="!newComment.trim() || isAddingComment"
              class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span v-if="isAddingComment">Posting...</span>
              <span v-else>Comment</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Sign in to comment -->
      <div v-else class="text-center py-8 bg-gray-50 rounded-lg">
        <p class="text-gray-600 mb-4">Sign in to join the conversation</p>
        <router-link
          to="/auth"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Sign In
        </router-link>
      </div>

      <!-- Comments List -->
      <div class="space-y-4">
        <div
          v-for="comment in displayedComments"
          :key="comment.id"
          class="flex space-x-3"
        >
          <div class="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {{ getAuthorInitials(comment.authorName) }}
          </div>
          <div class="flex-1">
            <div class="bg-gray-50 rounded-lg px-4 py-3">
              <div class="flex items-center space-x-2 mb-1">
                <span class="font-medium text-gray-900 text-sm">{{ comment.authorName }}</span>
                <span class="text-xs text-gray-500">{{ formatTimeAgo(comment.createdAt) }}</span>
              </div>
              <p class="text-gray-800 text-sm leading-relaxed">{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <!-- Load More Comments -->
        <div v-if="!showFullComments && comments.length > 3" class="text-center">
          <button
            @click="showFullComments = true"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View {{ comments.length - 3 }} more comments
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="comments.length === 0 && !authStore.isAuthenticated" class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
      </div>

      <div v-else-if="comments.length === 0" class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">No comments yet. Share your thoughts!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSocialStore } from '@/stores/social'
import { useNotificationStore } from '@/stores/notification'
import type { JournalEntry } from '@/types/journal'

interface Props {
  entry: JournalEntry
  showFullComments?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFullComments: false
})

const authStore = useAuthStore()
const socialStore = useSocialStore()
const notificationStore = useNotificationStore()

const newComment = ref('')
const isAddingComment = ref(false)
const showFullComments = ref(props.showFullComments)

const reactionTypes = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '👍', label: 'Like' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😂', label: 'Laugh' }
]

const reactions = computed(() => socialStore.getReactions(props.entry.id || ''))
const comments = computed(() => socialStore.getComments(props.entry.id || ''))

const totalReactions = computed(() => {
  return Object.values(reactions.value).reduce((sum: number, count: number) => sum + count, 0)
})

const uniqueReactions = computed(() => {
  const filtered: Record<string, number> = {}
  Object.entries(reactions.value).forEach(([emoji, count]) => {
    if ((count as number) > 0) {
      filtered[emoji] = count as number
    }
  })
  return filtered
})

const displayedComments = computed(() => {
  if (showFullComments.value) {
    return comments.value
  }
  return comments.value.slice(0, 3)
})

onMounted(async () => {
  if (props.entry.id) {
    await socialStore.loadEntryInteractions(props.entry.id)
  }
})

watch(() => props.entry.id, async (newId) => {
  if (newId) {
    await socialStore.loadEntryInteractions(newId)
  }
})

function hasUserReacted(emoji: string): boolean {
  return socialStore.hasUserReacted(props.entry.id || '', emoji)
}

function getReactionCount(emoji: string): number {
  return reactions.value[emoji] || 0
}

async function toggleReaction(reactionType: { emoji: string; label: string }) {
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

async function addComment() {
  if (!authStore.isAuthenticated || !newComment.value.trim() || isAddingComment.value || !props.entry.id) return

  isAddingComment.value = true
  
  try {
    await socialStore.addComment(props.entry.id, newComment.value.trim())
    
    // Send notification to entry author
    if (props.entry.userId !== authStore.user?.uid) {
      await notificationStore.notifyComment(
        props.entry.id,
        props.entry.userId,
        authStore.userDisplayName,
        newComment.value.trim(),
        crypto.randomUUID() // Comment ID will be generated in the store
      )
    }
    
    newComment.value = ''
  } catch (error) {
    console.error('Error adding comment:', error)
  } finally {
    isAddingComment.value = false
  }
}

function getAuthorInitials(name: string): string {
  if (!name || typeof name !== 'string') return 'U'
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}
</script>
