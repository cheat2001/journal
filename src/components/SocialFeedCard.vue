<template>
  <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
    <!-- User Header -->
    <div class="px-6 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span class="text-sm font-medium text-indigo-700">
              {{ entry.userInitials }}
            </span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ entry.userDisplayName }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(entry.createdAt) }}</p>
          </div>
        </div>
        
        <!-- Privacy Badge -->
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
          </svg>
          Public
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 py-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Daily Reflection - {{ formatEntryDate(entry.date) }}</h3>
      
      <div class="prose prose-sm max-w-none text-gray-700 space-y-3">
        <!-- Gratitude -->
        <div v-if="entry.gratitude">
          <h4 class="font-medium text-gray-900 text-sm mb-1">🙏 Gratitude</h4>
          <p v-if="!showFullContent && entry.gratitude.length > 150">
            {{ entry.gratitude.substring(0, 150) }}...
            <button 
              @click="showFullContent = true"
              class="text-indigo-600 hover:text-indigo-700 font-medium ml-1"
            >
              Read more
            </button>
          </p>
          <p v-else class="whitespace-pre-wrap">{{ entry.gratitude }}</p>
        </div>

        <!-- Emotion -->
        <div v-if="entry.emotion">
          <h4 class="font-medium text-gray-900 text-sm mb-1">💭 Emotion</h4>
          <p v-if="!showFullContent && entry.emotion.length > 150">
            {{ entry.emotion.substring(0, 150) }}...
            <button 
              @click="showFullContent = true"
              class="text-indigo-600 hover:text-indigo-700 font-medium ml-1"
            >
              Read more
            </button>
          </p>
          <p v-else class="whitespace-pre-wrap">{{ entry.emotion }}</p>
        </div>

        <!-- Challenges (if expanded) -->
        <div v-if="showFullContent && entry.challenges">
          <h4 class="font-medium text-gray-900 text-sm mb-1">🎯 Challenges</h4>
          <p class="whitespace-pre-wrap">{{ entry.challenges }}</p>
        </div>

        <!-- Learning (if expanded) -->
        <div v-if="showFullContent && entry.learning">
          <h4 class="font-medium text-gray-900 text-sm mb-1">📚 Learning</h4>
          <p class="whitespace-pre-wrap">{{ entry.learning }}</p>
        </div>

        <!-- Show more button if content is truncated -->
        <div v-if="!showFullContent && (entry.challenges || entry.learning)">
          <button 
            @click="showFullContent = true"
            class="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            Show full entry
          </button>
        </div>
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="px-6 py-3 bg-gray-50 border-t border-gray-10">
      <div class="flex flex-col gap-4">
        <!-- Reaction Summary -->
        <div class="flex items-center space-x-4 text-sm text-gray-500">
          <span v-if="(entry.totalReactions || 0) > 0">
            {{ entry.totalReactions }} {{ entry.totalReactions === 1 ? 'reaction' : 'reactions' }}
          </span>
          <span v-if="(entry.totalComments || 0) > 0">
            {{ entry.totalComments }} {{ entry.totalComments === 1 ? 'comment' : 'comments' }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-1">
          <!-- Reaction Button -->
          <div class="relative" ref="reactionDropdown">
            <button
              @click="toggleReactionDropdown"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :class="{ 'bg-indigo-50 border-indigo-300 text-indigo-700': userHasReacted }"
            >
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.789l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
              </svg>
              React
            </button>

            <!-- Reaction Dropdown -->
            <div v-if="showReactionDropdown" 
                 class="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex space-x-1 z-10">
              <button
                v-for="reaction in REACTION_TYPES"
                :key="reaction.value"
                @click="handleReactionClick(reaction.value)"
                class="p-2 rounded-md hover:bg-gray-100 text-xl transition-colors duration-150"
                :title="reaction.label"
              >
                {{ reaction.emoji }}
              </button>
            </div>
          </div>

          <!-- Comment Button -->
          <button
            @click="toggleComments"
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Comment
          </button>
        </div>
      </div>
    </div>

    <!-- Reactions Display -->
    <div v-if="entry.reactions && entry.reactions.length > 0" class="px-6 py-3 border-t border-gray-100">
      <div class="flex flex-wrap gap-2">
        <div v-for="(reactionGroup, reactionType) in groupedReactions" 
             :key="reactionType"
             class="inline-flex items-center bg-gray-100 rounded-full px-3 py-1">
          <span class="text-sm mr-1">{{ getReactionEmoji(reactionType) }}</span>
          <span class="text-sm text-gray-700">{{ reactionGroup.length }}</span>
          <div class="ml-2 flex -space-x-1">
            <div v-for="reaction in reactionGroup.slice(0, 3)" 
                 :key="reaction.id"
                 class="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center border border-white">
              <span class="text-xs text-indigo-700">
                {{ reaction.userDisplayName[0] }}
              </span>
            </div>
            <div v-if="reactionGroup.length > 3"
                 class="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center border border-white">
              <span class="text-xs text-gray-600">+{{ reactionGroup.length - 3 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comments Section -->
    <div v-if="showComments" class="border-t border-gray-100">
      <!-- Add Comment Form -->
      <div class="px-6 py-4 bg-gray-50">
        <div class="flex space-x-3">
          <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-medium text-indigo-700">
              {{ authStore.userDisplayName.split(' ').map(n => n[0]).join('') }}
            </span>
          </div>
          <div class="flex-1">
            <textarea
              v-model="newComment"
              placeholder="Write a comment..."
              rows="2"
              class="form-textarea"
              @keydown.meta.enter="submitComment"
              @keydown.ctrl.enter="submitComment"
            ></textarea>
            <div class="mt-2 flex justify-between items-center">
              <span class="text-xs text-gray-500">Press Cmd+Enter to post</span>
              <button
                @click="submitComment"
                :disabled="!newComment.trim() || isSubmittingComment"
                class="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmittingComment ? 'Posting...' : 'Post' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments List -->
      <div v-if="entry.comments && entry.comments.length > 0" class="px-6 py-4 space-y-4">
        <div v-for="comment in sortedComments" :key="comment.id" class="flex space-x-3">
          <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-medium text-gray-700">
              {{ comment.userInitials }}
            </span>
          </div>
          <div class="flex-1">
            <div class="bg-gray-100 rounded-lg px-3 py-2">
              <div class="flex justify-between items-start">
                <p class="text-sm font-medium text-gray-900">{{ comment.userDisplayName }}</p>
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                  <button
                    v-if="comment.userId === authStore.user?.uid"
                    @click="deleteComment(comment.id)"
                    class="text-xs text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { JournalEntry } from '@/types/journal'
import { REACTION_TYPES } from '@/types/journal'
import { useAuthStore } from '@/stores/auth'

interface Props {
  entry: JournalEntry
}

interface Emits {
  (e: 'reaction', data: { entryId: string; reactionType: string; isAdding: boolean }): void
  (e: 'comment', data: { entryId: string; content: string }): void
  (e: 'delete-comment', data: { entryId: string; commentId: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()

// Reactive state
const showFullContent = ref(false)
const showReactionDropdown = ref(false)
const showComments = ref(false)
const newComment = ref('')
const isSubmittingComment = ref(false)
const reactionDropdown = ref<HTMLElement>()

// Computed properties
const userHasReacted = computed(() => {
  if (!props.entry.reactions || !authStore.user) return false
  return props.entry.reactions.some(r => r.userId === authStore.user!.uid)
})

const groupedReactions = computed(() => {
  if (!props.entry.reactions) return {}
  
  return props.entry.reactions.reduce((groups, reaction) => {
    const type = reaction.type.value
    if (!groups[type]) groups[type] = []
    groups[type].push(reaction)
    return groups
  }, {} as Record<string, typeof props.entry.reactions>)
})

const sortedComments = computed(() => {
  if (!props.entry.comments) return []
  return [...props.entry.comments].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
})

// Methods
function formatEntryDate(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(d.getTime())) {
    return 'Unknown date'
  }
  
  const now = new Date()
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}d ago`
  } else {
    return d.toLocaleDateString()
  }
}

function getReactionEmoji(reactionType: string) {
  const reaction = REACTION_TYPES.find(r => r.value === reactionType)
  return reaction?.emoji || '👍'
}

function toggleReactionDropdown() {
  showReactionDropdown.value = !showReactionDropdown.value
}

function handleReactionClick(reactionType: string) {
  const userReaction = props.entry.reactions?.find(r => 
    r.userId === authStore.user?.uid && r.type.value === reactionType
  )
  
  emit('reaction', {
    entryId: props.entry.id!,
    reactionType,
    isAdding: !userReaction
  })
  
  showReactionDropdown.value = false
}

function toggleComments() {
  showComments.value = !showComments.value
}

async function submitComment() {
  if (!newComment.value.trim() || isSubmittingComment.value) return
  
  isSubmittingComment.value = true
  
  try {
    emit('comment', {
      entryId: props.entry.id!,
      content: newComment.value.trim()
    })
    newComment.value = ''
  } finally {
    isSubmittingComment.value = false
  }
}

function deleteComment(commentId: string) {
  emit('delete-comment', {
    entryId: props.entry.id!,
    commentId
  })
}

// Click outside handler for reaction dropdown
function handleClickOutside(event: Event) {
  if (reactionDropdown.value && !reactionDropdown.value.contains(event.target as Node)) {
    showReactionDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
