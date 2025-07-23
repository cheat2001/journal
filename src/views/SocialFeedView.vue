<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Header -->
    <MoodStoriesHeader />
    
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Error State -->
      <div v-if="socialStore.error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="text-sm text-red-700 mt-1">{{ socialStore.error }}</p>
            <button 
              @click="retryLoad"
              class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State (Initial Load) -->
      <div v-if="socialStore.loading && socialStore.publicEntries.length === 0" class="space-y-6">
        <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div class="h-3 bg-gray-300 rounded w-1/6"></div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-300 rounded"></div>
            <div class="h-4 bg-gray-300 rounded w-5/6"></div>
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!socialStore.loading && socialStore.publicEntries.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No public entries yet</h3>
        <p class="mt-1 text-sm text-gray-500">Start sharing your journal entries with the community!</p>
      </div>

      <!-- Feed Content -->
      <div v-else class="space-y-6">
        <!-- Feed Cards -->
        <SocialFeedCard
          v-for="entry in socialStore.publicEntries"
          :key="entry.id"
          :entry="entry"
          @reaction="handleReaction"
          @comment="handleComment"
        />

        <!-- Loading More Indicator -->
        <div v-if="socialStore.loadingMore" class="flex justify-center py-8">
          <div class="flex items-center space-x-2 text-blue-600">
            <LoadingSpinner size="sm" />
            <span class="text-sm font-medium">Loading more entries...</span>
          </div>
        </div>

        <!-- Load More Trigger (Intersection Observer Target) -->
        <div 
          ref="loadMoreTrigger" 
          v-if="socialStore.hasMore && !socialStore.loadingMore"
          class="h-4"
        ></div>

        <!-- End of Feed Message -->
        <div v-if="!socialStore.hasMore && socialStore.publicEntries.length > 0" class="text-center py-8">
          <p class="text-gray-500 text-sm">You've reached the end of the feed 🎉</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useSocialStore } from '@/stores/social'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SocialFeedCard from '@/components/SocialFeedCard.vue'
import MoodStoriesHeader from '@/components/MoodStoriesHeader.vue'

const socialStore = useSocialStore()
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(async () => {
  // Load initial entries
  await socialStore.fetchPublicEntries()
  
  // Set up intersection observer for lazy loading after next tick
  await nextTick()
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Watch for when the trigger element becomes available
watch(loadMoreTrigger, (newVal) => {
  if (newVal && socialStore.hasMore) {
    setupIntersectionObserver()
  }
})

function setupIntersectionObserver() {
  // Disconnect existing observer
  if (observer) {
    observer.disconnect()
  }
  
  if (!loadMoreTrigger.value || !socialStore.hasMore) return

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting && socialStore.hasMore && !socialStore.loadingMore) {
        console.log('Loading more entries via intersection observer')
        socialStore.loadMoreEntries()
      }
    },
    {
      root: null,
      rootMargin: '100px', // Start loading 100px before the trigger is visible
      threshold: 0.1
    }
  )

  observer.observe(loadMoreTrigger.value)
}

async function retryLoad() {
  socialStore.clearError()
  await socialStore.fetchPublicEntries()
  // Re-setup observer after retry
  await nextTick()
  setupIntersectionObserver()
}

async function handleReaction(data: { entryId: string; reactionType: string; isAdding: boolean }) {
  try {
    if (data.isAdding) {
      await socialStore.addReaction(data.entryId, data.reactionType)
    } else {
      // Find user's existing reaction to remove
      const entry = socialStore.publicEntries.find(e => e.id === data.entryId)
      const userReaction = entry?.reactions?.find(r => r.type.value === data.reactionType)
      if (userReaction) {
        await socialStore.removeReaction(data.entryId, userReaction.id)
      }
    }
  } catch (error) {
    console.error('Error handling reaction:', error)
  }
}

async function handleComment(data: { entryId: string; content: string }) {
  try {
    await socialStore.addComment(data.entryId, data.content)
  } catch (error) {
    console.error('Error adding comment:', error)
  }
}

async function handleDeleteComment(data: { entryId: string; commentId: string }) {
  try {
    await socialStore.deleteComment(data.entryId, data.commentId)
  } catch (error) {
    console.error('Error deleting comment:', error)
  }
}
</script>
