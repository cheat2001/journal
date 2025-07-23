<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
    <!-- User Header -->
    <div class="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-50 bg-gradient-to-r from-blue-25 to-purple-25">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="relative">
            <div class="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-2 ring-white">
              <span class="text-sm font-bold text-white">
                {{ entry.userInitials }}
              </span>
            </div>
            <div class="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-semibold text-gray-900">{{ entry.userDisplayName }}</p>
            <p class="text-xs text-gray-600 flex items-center mt-1">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              {{ formatDate(entry.createdAt) }}
            </p>
          </div>
        </div>
        
        <!-- Privacy Badge -->
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
            Public
          </span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-5 sm:px-6 py-5 sm:py-6">
      <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 flex items-center">
        <span class="text-xl sm:text-2xl mr-3">✨</span>
        <span class="text-base sm:text-lg">{{ formatEntryDate(entry.date) }}</span>
      </h3>
      
      <div class="space-y-4 sm:space-y-5">
        <!-- Gratitude -->
        <div v-if="entry.gratitude" class="group">
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-200">
            <h4 class="font-semibold text-amber-900 text-sm mb-3 flex items-center">
              <span class="text-lg sm:text-xl mr-2">🙏</span>
              <span class="uppercase tracking-wide text-xs sm:text-sm">Gratitude</span>
            </h4>
            <p v-if="!showFullContent && entry.gratitude.length > 100" class="text-amber-800 text-sm sm:text-base leading-relaxed">
              {{ entry.gratitude.substring(0, 100) }}...
              <button 
                @click="showFullContent = true"
                class="text-blue-600 hover:text-blue-700 font-medium ml-2 underline decoration-2 underline-offset-2"
              >
                Read more
              </button>
            </p>
            <p v-else class="whitespace-pre-wrap text-amber-800 text-sm sm:text-base leading-relaxed">{{ entry.gratitude }}</p>
          </div>
        </div>

        <!-- Emotion -->
        <div v-if="entry.emotion" class="group">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-200">
            <h4 class="font-semibold text-purple-900 text-sm mb-3 flex items-center">
              <span class="text-lg sm:text-xl mr-2">💭</span>
              <span class="uppercase tracking-wide text-xs sm:text-sm">Current Emotion</span>
            </h4>
            <p v-if="!showFullContent && entry.emotion.length > 100" class="text-purple-800 text-sm sm:text-base leading-relaxed">
              {{ entry.emotion.substring(0, 100) }}...
              <button 
                @click="showFullContent = true"
                class="text-blue-600 hover:text-blue-700 font-medium ml-2 underline decoration-2 underline-offset-2"
              >
                Read more
              </button>
            </p>
            <p v-else class="whitespace-pre-wrap text-purple-800 text-sm sm:text-base leading-relaxed">{{ entry.emotion }}</p>
          </div>
        </div>

        <!-- Challenges (if expanded) -->
        <div v-if="showFullContent && entry.challenges" class="group">
          <div class="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-200">
            <h4 class="font-semibold text-red-900 text-sm mb-3 flex items-center">
              <span class="text-lg sm:text-xl mr-2">🎯</span>
              <span class="uppercase tracking-wide text-xs sm:text-sm">Challenges</span>
            </h4>
            <p class="whitespace-pre-wrap text-red-800 text-sm sm:text-base leading-relaxed">{{ entry.challenges }}</p>
          </div>
        </div>

        <!-- Learning (if expanded) -->
        <div v-if="showFullContent && entry.learning" class="group">
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-200">
            <h4 class="font-semibold text-green-900 text-sm mb-3 flex items-center">
              <span class="text-lg sm:text-xl mr-2">📚</span>
              <span class="uppercase tracking-wide text-xs sm:text-sm">Learning</span>
            </h4>
            <p class="whitespace-pre-wrap text-green-800 text-sm sm:text-base leading-relaxed">{{ entry.learning }}</p>
          </div>
        </div>

        <!-- Show more sections preview -->
        <div v-if="!showFullContent && (entry.challenges || entry.learning)" class="text-center pt-2">
          <button 
            @click="showFullContent = true"
            class="inline-flex items-center px-5 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 group border border-blue-200"
          >
            <span>+ {{ [entry.challenges, entry.learning].filter(Boolean).length }} more section{{ [entry.challenges, entry.learning].filter(Boolean).length > 1 ? 's' : '' }}</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="px-5 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
      <div class="flex justify-between items-center gap-4">
        <!-- View Full Entry Button -->
        <button
          @click="viewFullEntry"
          class="group inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105 active:scale-95 ml-auto"
        >
          <span class="hidden sm:inline mr-2">✨</span>
          <span class="hidden sm:inline">View Full Entry</span>
          <span class="sm:hidden">View Full</span>
          <svg class="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Interactive Actions -->
    <div class="px-5 sm:px-6 py-4 sm:py-5 border-t border-gray-200">
      <div class="flex items-center space-x-4 sm:space-x-6">
        <!-- Reaction Button -->
        <div class="relative" ref="reactionDropdown">
          <button
            @click="toggleReactionDropdown"
            class="flex items-center px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-200 rounded-xl border-2"
            :class="userHasReacted 
              ? 'bg-blue-500 text-white border-blue-500 shadow-lg hover:bg-blue-600 hover:border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md'"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.789l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
            </svg>
            <span>{{ userHasReacted ? 'Liked' : 'React' }}</span>
          </button>

          <!-- Enhanced Reaction Dropdown -->
          <div v-if="showReactionDropdown" 
               class="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 z-30 w-[280px] sm:w-[320px] ml-4 sm:ml-0">
            <div class="flex p-2.5 justify-between items-center">
              <button
                v-for="reaction in REACTION_TYPES"
                :key="reaction.value"
                @click="handleReactionClick(reaction.value)"
                class="p-2 rounded-lg hover:bg-gray-50 text-lg transition-all duration-150 hover:scale-110 active:scale-95 w-[38px] h-[38px] flex items-center justify-center flex-shrink-0"
                :title="reaction.label"
              >
                {{ reaction.emoji }}
              </button>
            </div>
          </div>
        </div>

        <!-- Comment Button -->
        <button
          @click="toggleComments"
          class="flex items-center px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-200 rounded-xl border-2"
          :class="showComments 
            ? 'bg-purple-500 text-white border-purple-500 shadow-lg hover:bg-purple-600 hover:border-purple-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md'"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span>{{ showComments ? 'Hide' : 'Comment' }}</span>
        </button>
      </div>
    </div>

    <!-- Reactions Display -->
    <div v-if="entry.reactions && entry.reactions.length > 0" class="px-4 sm:px-6 py-3 border-t border-gray-100">
      <div class="flex items-center space-x-3 text-sm text-gray-600">
        <span class="font-medium">Reactions:</span>
        <div class="flex items-center space-x-2">
          <div v-for="(reactionGroup, reactionType) in groupedReactions" 
               :key="reactionType"
               class="inline-flex items-center space-x-1.5">
            <span class="text-base">{{ getReactionEmoji(reactionType) }}</span>
            <span class="font-semibold text-gray-800">{{ reactionGroup.length }}</span>
            
            <!-- User avatars in a clean row -->
            <div class="flex -space-x-1">
              <div v-for="reaction in reactionGroup.slice(0, 3)" 
                   :key="reaction.id"
                   class="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border border-white text-xs font-bold text-white shadow-sm hover:scale-110 transition-transform"
                   :title="reaction.userDisplayName">
                {{ reaction.userDisplayName[0] }}
              </div>
              <div v-if="reactionGroup.length > 3"
                   class="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center border border-white text-xs font-bold text-white shadow-sm"
                   :title="`${reactionGroup.length - 3} more`">
                +{{ reactionGroup.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comments Section -->
    <div v-if="showComments" class="border-t border-gray-100">
      <!-- Add Comment Form -->
      <div class="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50">
        <div class="flex space-x-2 sm:space-x-3">
          <div class="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-bold text-white">
              {{ authStore.userDisplayName.split(' ').map(n => n[0]).join('') }}
            </span>
          </div>
          <div class="flex-1">
            <textarea
              v-model="newComment"
              placeholder="Write a comment..."
              rows="2"
              class="w-full text-sm sm:text-base border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              @keydown.meta.enter="submitComment"
              @keydown.ctrl.enter="submitComment"
            ></textarea>
            <div class="mt-2 flex justify-between items-center">
              <span class="text-xs text-gray-500">Press Cmd+Enter to post</span>
              <button
                @click="submitComment"
                :disabled="!newComment.trim() || isSubmittingComment"
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {{ isSubmittingComment ? 'Posting...' : 'Post' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments List -->
      <div v-if="entry.comments && entry.comments.length > 0" class="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
        <div v-for="comment in sortedComments" :key="comment.id" class="flex space-x-2 sm:space-x-3">
          <div class="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-medium text-gray-700">
              {{ comment.userInitials }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="bg-gray-100 rounded-lg px-3 py-2">
              <div class="flex justify-between items-start mb-1">
                <p class="text-xs sm:text-sm font-medium text-gray-900 truncate">{{ comment.userDisplayName }}</p>
                <div class="flex items-center space-x-2 ml-2 flex-shrink-0">
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
              <p class="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Toast 
      :show="showToast" 
      :message="toastMessage" 
      :type="toastType"
      @close="showToast = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { JournalEntry } from '@/types/journal'
import { REACTION_TYPES } from '@/types/journal'
import { useAuthStore } from '@/stores/auth'
import Toast from './Toast.vue'

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
const router = useRouter()

// Reactive state
const showFullContent = ref(false)
const showReactionDropdown = ref(false)
const showComments = ref(false)
const newComment = ref('')
const isSubmittingComment = ref(false)
const reactionDropdown = ref<HTMLElement>()
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')

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

function viewFullEntry() {
  // Navigate to the full entry page
  router.push(`/entry/${props.entry.id}`)
}

function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showToast.value = false
  }, 3000)
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
