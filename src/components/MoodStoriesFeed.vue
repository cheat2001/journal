<template>
  <div class="mood-stories-feed">
    <!-- Header -->
    <div class="stories-header">
      <h3 class="stories-title">
        <span class="title-icon">🌍</span>
        Today's Community Mood
      </h3>
      <div class="stories-count">
        {{ moodStore.publicMoodStories.length }} {{ moodStore.publicMoodStories.length === 1 ? 'person' : 'people' }} shared
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="moodStore.loading && moodStore.publicMoodStories.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading community moods...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="moodStore.publicMoodStories.length === 0" class="empty-state">
      <div class="empty-icon">🌟</div>
      <h4 class="empty-title">Be the first to share!</h4>
      <p class="empty-description">
        Start the conversation by sharing your mood with the community.
      </p>
    </div>

    <!-- Stories List -->
    <div v-else class="stories-list">
      <div 
        v-for="(story, index) in displayedStories" 
        :key="story.id"
        class="story-item fade-in"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <!-- User Avatar & Mood -->
        <div class="story-avatar">
          <div class="avatar-circle" :class="getMoodColorClass(story.emotion)">
            <span class="avatar-initials">{{ story.userInitials }}</span>
            <div class="mood-emoji">{{ story.emoji }}</div>
          </div>
        </div>

        <!-- Story Content -->
        <div class="story-content">
          <div class="story-header">
            <div class="story-text">
              <span class="user-name">{{ story.userName }}</span>
              <span class="feeling-text">is feeling</span>
              <span class="emotion-name" :class="getMoodTextClass(story.emotion)">{{ story.emotion }}</span>
            </div>
            <div class="story-time">{{ formatTimeAgo(story.createdAt) }}</div>
          </div>
          
          <div v-if="story.customMessage" class="story-message">
            "{{ story.customMessage }}"
          </div>
        </div>

        <!-- Reactions -->
        <div class="story-reactions">
          <div class="reaction-buttons">
            <button
              v-for="reactionType in MOOD_REACTION_TYPES"
              :key="reactionType.value"
              @click="reactToStory(story, reactionType)"
              class="reaction-btn"
              :class="{ 
                active: hasUserReacted(story, reactionType.value),
                loading: reactingToStory === story.id 
              }"
              :disabled="reactingToStory === story.id || story.userId === authStore.user?.uid"
              :title="story.userId === authStore.user?.uid ? 'Cannot react to your own mood' : reactionType.label"
            >
              <span class="reaction-emoji">{{ reactionType.emoji }}</span>
            </button>
          </div>
          
          <div v-if="story.totalReactions && story.totalReactions > 0" class="reaction-count">
            <span class="count-text">{{ story.totalReactions }}</span>
            <span class="count-label">{{ story.totalReactions === 1 ? 'reaction' : 'reactions' }}</span>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMoreStories" class="load-more-section">
        <button
          @click="loadMoreStories"
          class="load-more-btn"
          :disabled="moodStore.loading"
        >
          <span v-if="moodStore.loading" class="loading-spinner-small"></span>
          {{ moodStore.loading ? 'Loading...' : 'Load More Stories' }}
        </button>
      </div>
    </div>

    <!-- Refresh Button -->
    <div class="refresh-section">
      <button
        @click="refreshStories"
        class="refresh-btn"
        :disabled="moodStore.loading"
        title="Refresh stories"
      >
        <svg class="refresh-icon" :class="{ spinning: moodStore.loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h-.582M4.644 15A8.001 8.001 0 0019.418 15m0 0V15a8 8 0 01-15.356-2"></path>
        </svg>
        <span class="refresh-text">Refresh</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useMoodStore } from '@/stores/mood'
import { useAuthStore } from '@/stores/auth'
import { MOOD_REACTION_TYPES } from '@/types/journal'
import type { MoodStory } from '@/types/journal'

const moodStore = useMoodStore()
const authStore = useAuthStore()

const storiesPerPage = 10
const currentPage = ref(1)
const reactingToStory = ref<string | null>(null)

// Computed properties
const displayedStories = computed(() => {
  return moodStore.publicMoodStories.slice(0, currentPage.value * storiesPerPage)
})

const hasMoreStories = computed(() => {
  return moodStore.publicMoodStories.length > currentPage.value * storiesPerPage
})

// Emotion categorization for styling
const positiveEmotions = ['happy', 'excited', 'calm', 'grateful', 'content']
const neutralEmotions = ['neutral', 'tired']
const negativeEmotions = ['stressed', 'anxious', 'sad', 'frustrated', 'overwhelmed']

function getMoodColorClass(emotion: string) {
  if (positiveEmotions.includes(emotion)) return 'mood-positive'
  if (neutralEmotions.includes(emotion)) return 'mood-neutral'
  if (negativeEmotions.includes(emotion)) return 'mood-negative'
  return 'mood-default'
}

function getMoodTextClass(emotion: string) {
  if (positiveEmotions.includes(emotion)) return 'text-positive'
  if (neutralEmotions.includes(emotion)) return 'text-neutral'
  if (negativeEmotions.includes(emotion)) return 'text-negative'
  return 'text-default'
}

function formatTimeAgo(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true })
}

function hasUserReacted(story: MoodStory, reactionType: string) {
  return story.reactions?.some(
    reaction => reaction.userId === authStore.user?.uid && reaction.type === reactionType
  ) || false
}

async function reactToStory(story: MoodStory, reactionType: { value: string; emoji: string; label: string }) {
  if (!story.id || story.userId === authStore.user?.uid) return
  
  reactingToStory.value = story.id
  
  try {
    await moodStore.reactToMoodStory(story.id, reactionType.value, reactionType.emoji)
  } catch (error) {
    console.error('Failed to react to story:', error)
  } finally {
    reactingToStory.value = null
  }
}

function loadMoreStories() {
  currentPage.value++
}

async function refreshStories() {
  currentPage.value = 1
  await moodStore.fetchPublicMoodStories()
}

onMounted(() => {
  // Stories are automatically fetched when auth state changes
  // We can trigger a refresh here if needed
})
</script>

<style scoped>
.mood-stories-feed {
  @apply bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg;
}

/* Header */
.stories-header {
  @apply flex items-center justify-between mb-6;
}

.stories-title {
  @apply flex items-center gap-2 text-xl font-bold text-gray-900;
}

.title-icon {
  @apply text-2xl;
}

.stories-count {
  @apply text-sm text-gray-500 font-medium;
}

/* Loading State */
.loading-state {
  @apply text-center py-8;
}

.loading-spinner {
  @apply inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4;
}

.loading-text {
  @apply text-gray-600;
}

/* Empty State */
.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-4xl mb-4;
}

.empty-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.empty-description {
  @apply text-gray-600;
}

/* Stories List */
.stories-list {
  @apply space-y-4;
}

.story-item {
  @apply flex items-start gap-4 p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors duration-200;
}

/* Story Avatar */
.story-avatar {
  @apply flex-shrink-0;
}

.avatar-circle {
  @apply relative w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md;
}

.avatar-circle.mood-positive {
  @apply bg-gradient-to-br from-green-400 to-green-600;
}

.avatar-circle.mood-neutral {
  @apply bg-gradient-to-br from-yellow-400 to-yellow-600;
}

.avatar-circle.mood-negative {
  @apply bg-gradient-to-br from-red-400 to-red-600;
}

.avatar-circle.mood-default {
  @apply bg-gradient-to-br from-blue-400 to-blue-600;
}

.avatar-initials {
  @apply text-xs font-bold;
}

.mood-emoji {
  @apply absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm shadow-md border-2 border-white;
}

/* Story Content */
.story-content {
  @apply flex-1 min-w-0;
}

.story-header {
  @apply flex items-start justify-between gap-2 mb-1;
}

.story-text {
  @apply flex items-center gap-1 flex-wrap text-sm;
}

.user-name {
  @apply font-semibold text-gray-900;
}

.feeling-text {
  @apply text-gray-600;
}

.emotion-name {
  @apply font-medium capitalize;
}

.text-positive {
  @apply text-green-700;
}

.text-neutral {
  @apply text-yellow-700;
}

.text-negative {
  @apply text-red-700;
}

.text-default {
  @apply text-blue-700;
}

.story-time {
  @apply text-xs text-gray-500 flex-shrink-0;
}

.story-message {
  @apply text-sm text-gray-700 italic mt-1 p-2 bg-white/60 rounded-lg;
}

/* Reactions */
.story-reactions {
  @apply flex flex-col items-end gap-2;
}

.reaction-buttons {
  @apply flex gap-1;
}

.reaction-btn {
  @apply p-2 rounded-lg hover:bg-white/80 transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed;
}

.reaction-btn.active {
  @apply bg-blue-100 shadow-sm transform scale-110;
}

.reaction-btn.loading {
  @apply animate-pulse;
}

.reaction-emoji {
  @apply text-lg;
}

.reaction-count {
  @apply text-xs text-gray-500 text-center;
}

.count-text {
  @apply font-medium;
}

.count-label {
  @apply block;
}

/* Load More */
.load-more-section {
  @apply text-center pt-4;
}

.load-more-btn {
  @apply bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-xl transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed inline-flex items-center gap-2;
}

.loading-spinner-small {
  @apply w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin;
}

/* Refresh Section */
.refresh-section {
  @apply flex justify-center mt-6 pt-4 border-t border-gray-200;
}

.refresh-btn {
  @apply flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm font-medium;
}

.refresh-icon {
  @apply w-4 h-4;
}

.refresh-icon.spinning {
  @apply animate-spin;
}

.refresh-text {
  @apply hidden sm:inline;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
