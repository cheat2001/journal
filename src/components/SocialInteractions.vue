<template>
  <div class="p-4 sm:p-6">
    <!-- Detailed Reaction Summary -->
    <div v-if="totalReactions > 0" class="mb-4 sm:mb-6">
      <!-- Reaction Overview with Avatars -->
      <div class="flex items-center justify-between mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div class="flex -space-x-1 sm:-space-x-2">
            <div
              v-for="(count, emoji) in uniqueReactions"
              :key="emoji"
              class="w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-white rounded-full flex items-center justify-center text-sm sm:text-lg shadow-md hover:scale-110 transition-transform duration-200"
              :title="`${count} ${getReactionLabel(emoji)}`"
            >
              {{ emoji }}
            </div>
          </div>
          <div class="text-xs sm:text-sm">
            <p class="font-semibold text-gray-900">{{ totalReactions }} {{ totalReactions === 1 ? 'reaction' : 'reactions' }}</p>
            <p class="text-gray-600 hidden sm:block">{{ getTopReaction() }}</p>
          </div>
        </div>
        
        <!-- Recent Reactors -->
        <div v-if="recentReactors.length > 0" class="flex items-center space-x-1 sm:space-x-2">
          <div class="flex -space-x-1 sm:-space-x-2">
            <div
              v-for="reactor in recentReactors.slice(0, 3)"
              :key="reactor.userId"
              class="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm"
              :title="reactor.userDisplayName"
            >
              {{ getAuthorInitials(reactor.userDisplayName) }}
            </div>
          </div>
          <span class="text-xs text-gray-500 hidden sm:inline">
            {{ recentReactors.length > 3 ? `+${recentReactors.length - 3} more` : '' }}
          </span>
        </div>
      </div>

      <!-- Detailed Reaction Breakdown -->
      <div v-if="showReactionDetails" class="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
        <h4 class="font-semibold text-gray-900 mb-3">Who reacted</h4>
        <div class="space-y-3">
          <div
            v-for="(reactionGroup, emoji) in groupedReactions"
            :key="emoji"
            class="flex items-start space-x-3"
          >
            <div class="text-2xl">{{ emoji }}</div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 mb-1">{{ getReactionLabel(emoji) }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="reactor in reactionGroup"
                  :key="reactor.userId"
                  class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {{ reactor.userDisplayName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Reaction Buttons -->
    <div class="mb-4 sm:mb-6">
      <!-- Quick Reaction Bar (like the feed) -->
      <div class="flex items-center justify-between mb-3 sm:mb-4">
        <div class="flex items-center space-x-2 sm:space-x-3">
          <!-- Quick React Dropdown -->
          <div class="relative" ref="reactionDropdown">
            <button
              @click="toggleReactionDropdown"
              :class="[
                'inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105',
                hasAnyReaction
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              ]"
              :disabled="!authStore.isAuthenticated"
              :title="!authStore.isAuthenticated ? 'Sign in to react' : 'Quick react'"
            >
              <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.789l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
              </svg>
              <span class="hidden sm:inline">{{ hasAnyReaction ? 'Reacted' : 'React' }}</span>
              <span class="sm:hidden">{{ hasAnyReaction ? '👍' : 'React' }}</span>
              <svg class="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            <!-- Quick Reaction Dropdown -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95 -translate-y-2"
              enter-to-class="transform opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div v-if="showQuickReactionDropdown" 
                   class="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex space-x-1 z-10">
                <button
                  v-for="reactionType in reactionTypes"
                  :key="reactionType.emoji"
                  @click="toggleReaction(reactionType)"
                  :class="[
                    'p-2 rounded-md text-2xl transition-all duration-150 hover:scale-110',
                    hasUserReacted(reactionType.emoji) 
                      ? 'bg-blue-100 border-2 border-blue-300' 
                      : 'hover:bg-gray-100'
                  ]"
                  :title="reactionType.label"
                >
                  {{ reactionType.emoji }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Comment Button -->
          <button
            @click="focusCommentInput"
            class="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all duration-200"
            :disabled="!authStore.isAuthenticated"
            :title="!authStore.isAuthenticated ? 'Sign in to comment' : 'Write a comment'"
          >
            <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="hidden sm:inline">Comment</span>
            <span class="sm:hidden">💬</span>
          </button>

          <!-- View Details Button -->
          <button
            v-if="totalReactions > 0"
            @click="showReactionDetails = !showReactionDetails"
            class="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            <span class="hidden sm:inline">{{ showReactionDetails ? 'Hide details' : 'View reactions' }}</span>
            <span class="sm:hidden">{{ showReactionDetails ? 'Hide' : 'View' }}</span>
          </button>
        </div>
        
        <!-- Reaction Count Summary -->
        <div v-if="totalReactions > 0" class="text-xs sm:text-sm text-gray-500">
          {{ totalReactions }} {{ totalReactions === 1 ? 'reaction' : 'reactions' }}
        </div>
      </div>

      <!-- Individual Reaction Buttons (Alternative view) -->
      <div v-if="false" class="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
        <button
          v-for="reactionType in reactionTypes"
          :key="reactionType.emoji"
          @click="toggleReaction(reactionType)"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105',
            hasUserReacted(reactionType.emoji)
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          ]"
          :disabled="!authStore.isAuthenticated"
          :title="!authStore.isAuthenticated ? 'Sign in to react' : `${hasUserReacted(reactionType.emoji) ? 'Remove' : 'Add'} ${reactionType.label} reaction`"
        >
          <span class="text-lg">{{ reactionType.emoji }}</span>
          <span>{{ reactionType.label }}</span>
          <span v-if="getReactionCount(reactionType.emoji)" class="bg-white/20 px-2 py-1 rounded-full text-xs">
            {{ getReactionCount(reactionType.emoji) }}
          </span>
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
            ref="commentInput"
            v-model="newComment"
            placeholder="Write a comment..."
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-black"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSocialStore } from '@/stores/social'
import { useNotificationStore } from '@/stores/notification'
import type { JournalEntry } from '@/types/journal'
import { REACTION_TYPES } from '@/types/journal'

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
const showReactionDetails = ref(false)
const showQuickReactionDropdown = ref(false)
const reactionDropdown = ref<HTMLElement>()
const commentInput = ref<HTMLTextAreaElement>()

// Use the same reaction types as the community feed
const reactionTypes = REACTION_TYPES

const reactions = computed(() => socialStore.getReactions(props.entry.id || ''))
const comments = computed(() => socialStore.getComments(props.entry.id || ''))

const totalReactions = computed(() => {
  return Object.values(reactions.value).reduce((sum: number, count: number) => sum + count, 0)
})

const uniqueReactions = computed(() => {
  const filtered: Record<string, number> = {}
  for (const [emoji, count] of Object.entries(reactions.value)) {
    if (count > 0) {
      filtered[emoji] = count
    }
  }
  return filtered
})

// Get recent reactors for display
const recentReactors = computed(() => {
  const allReactions = socialStore.getAllReactions(props.entry.id || '')
  return allReactions
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
})

// Group reactions by emoji for detailed view
const groupedReactions = computed(() => {
  const allReactions = socialStore.getAllReactions(props.entry.id || '')
  const grouped: Record<string, Array<{userId: string, userDisplayName: string}>> = {}
  
  allReactions.forEach(reaction => {
    const emoji = reaction.type.emoji
    if (!grouped[emoji]) {
      grouped[emoji] = []
    }
    grouped[emoji].push({
      userId: reaction.userId,
      userDisplayName: reaction.userDisplayName
    })
  })
  
  return grouped
})

const displayedComments = computed(() => {
  if (showFullComments.value) {
    return comments.value
  }
  return comments.value.slice(0, 3)
})

const hasAnyReaction = computed(() => {
  return reactionTypes.some(type => hasUserReacted(type.emoji))
})

onMounted(async () => {
  if (props.entry.id) {
    await socialStore.loadEntryInteractions(props.entry.id)
  }
  
  // Add click outside handler for dropdown
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Remove click outside handler
  document.removeEventListener('click', handleClickOutside)
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

function toggleReactionDropdown() {
  showQuickReactionDropdown.value = !showQuickReactionDropdown.value
}

function focusCommentInput() {
  setTimeout(() => {
    commentInput.value?.focus()
  }, 100)
}

async function toggleReaction(reactionType: { emoji: string; label: string }) {
  if (!authStore.isAuthenticated || !props.entry.id) return

  try {
    const isRemoving = hasUserReacted(reactionType.emoji)
    
    await socialStore.toggleReaction(props.entry.id, reactionType.emoji)
    
    // Close dropdown after reaction
    showQuickReactionDropdown.value = false
    
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
    // The social store now handles all notifications (entry owner + participants)
    await socialStore.addComment(props.entry.id, newComment.value.trim())
    newComment.value = ''
  } catch (error) {
    console.error('Error adding comment:', error)
  } finally {
    isAddingComment.value = false
  }
}

function getReactionLabel(emoji: string): string {
  const reactionType = reactionTypes.find(r => r.emoji === emoji)
  return reactionType?.label || 'Reaction'
}

function getTopReaction(): string {
  const sorted = Object.entries(uniqueReactions.value)
    .sort(([,a], [,b]) => b - a)
  
  if (sorted.length === 0) return ''
  
  const [topEmoji, count] = sorted[0]
  const label = getReactionLabel(topEmoji)
  
  if (sorted.length === 1) {
    return `${count} ${label.toLowerCase()}${count === 1 ? '' : 's'}`
  } else {
    return `${count} ${label.toLowerCase()}${count === 1 ? '' : 's'} and ${sorted.length - 1} other reaction${sorted.length > 2 ? 's' : ''}`
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

// Click outside handler for reaction dropdown
function handleClickOutside(event: Event) {
  const target = event.target as Element
  if (reactionDropdown.value && !reactionDropdown.value.contains(target)) {
    showQuickReactionDropdown.value = false
  }
}
</script>
