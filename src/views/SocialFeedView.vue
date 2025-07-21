<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">Community Feed</h1>
        <p class="text-gray-600 mt-1">Discover inspiring journal entries from our community</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Mood Stories Section -->
      <div class="mb-8">
        <MoodStoriesHeader />
      </div>

      <!-- Loading State -->
      <div v-if="socialStore.loading" class="flex justify-center items-center py-12 text-black">
        <LoadingSpinner />
      </div>

      <!-- Error State -->
      <div v-else-if="socialStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading feed</h3>
            <p class="text-sm text-red-700 mt-1">{{ socialStore.error }}</p>
            <button 
              @click="retryLoad"
              class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="socialStore.publicEntries.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No public entries yet</h3>
        <p class="mt-1 text-sm text-gray-500">
          Be the first to share your journey with the community!
        </p>
        <div class="mt-6">
          <RouterLink 
            to="/"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Create Entry
          </RouterLink>
        </div>
      </div>

      <!-- Feed -->
      <div v-else class="space-y-6">
        <SocialFeedCard
          v-for="entry in socialStore.publicEntries"
          :key="entry.id"
          :entry="entry"
          @reaction="handleReaction"
          @comment="handleComment"
          @delete-comment="handleDeleteComment"
        />
        
        <!-- Load More Button -->
        <div class="text-center py-6">
          <button
            @click="loadMore"
            :disabled="socialStore.loading"
            class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="socialStore.loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ socialStore.loading ? 'Loading...' : 'Load More' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Developer Attribution -->
    <div class="mt-16 bg-gray-100 border-t">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Built with ❤️ by 
            <span class="font-semibold text-indigo-600">Chansocheat.Sok</span>
          </p>
          <div class="mt-4 flex justify-center space-x-6">
            <a href="https://github.com/chansocheat" target="_blank" rel="noopener noreferrer" 
               class="text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <span class="sr-only">GitHub</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=100078062420056" target="_blank" rel="noopener noreferrer"
               class="text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <span class="sr-only">Facebook</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://linkedin.com/in/chansocheat-sok" target="_blank" rel="noopener noreferrer"
               class="text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <span class="sr-only">LinkedIn</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSocialStore } from '@/stores/social'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SocialFeedCard from '@/components/SocialFeedCard.vue'
import MoodStoriesHeader from '@/components/MoodStoriesHeader.vue'

const socialStore = useSocialStore()

onMounted(async () => {
  await socialStore.fetchPublicEntries()
})

async function retryLoad() {
  socialStore.clearError()
  await socialStore.fetchPublicEntries()
}

async function loadMore() {
  await socialStore.fetchPublicEntries(socialStore.publicEntries.length + 20)
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
