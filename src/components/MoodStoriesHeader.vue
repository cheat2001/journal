<template>
  <div class="py-6 px-3 sm:px-4 bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-300 p-5">
        <div class="flex items-center gap-3 mb-5 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 m-0">Community Mood Stories</h2>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
            {{ publicMoodStories.length }} people shared today
          </span>
        </div>
      
        <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 max-h-80 overflow-y-auto">
          <!-- Add Mood Button -->
          <div class="story-card add-story" @click="openMoodModal">
          <div class="add-icon">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span class="story-label">Share your mood</span>
        </div>

        <!-- User Stories -->
        <div 
          v-for="story in publicMoodStories.slice(0, 11)" 
          :key="story.id"
          :id="`mood-story-${story.id}`"
          class="story-card user-story"
          @click="viewStory(story)"
        >
          <div class="story-avatar" :class="getMoodColor(story.emotion)">
            <span class="initials">{{ getInitials(story.userName) }}</span>
            <div class="mood-emoji">{{ story.emoji }}</div>
            <!-- Reaction indicator -->
            <div v-if="story.totalReactions && story.totalReactions > 0" class="reaction-indicator">
              {{ story.totalReactions }}
            </div>
          </div>
          <span class="story-label">{{ truncateName(story.userName) }}</span>
        </div>
      </div>
    </div>
  </div>

    <!-- Mood Modal -->
    <div v-if="showMoodModal" class="modal-overlay" @click="closeMoodModal">
      <div class="modal-content bg-white dark:bg-gray-800" @click.stop>
        <div class="modal-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-gray-900 dark:text-gray-100">Share Your Mood</h3>
          <button @click="closeMoodModal" class="close-btn">×</button>
        </div>

        <div class="modal-body bg-white dark:bg-gray-800">
          <div class="emotions-section">
            <label class="section-label text-gray-700 dark:text-gray-300">How are you feeling?</label>
            <div class="emotions-grid">
              <button
                v-for="emotion in EMOTION_OPTIONS"
                :key="emotion.value"
                @click="selectEmotion(emotion)"
                class="emotion-btn bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                :class="{ 
                  'active': selectedEmotion === emotion.value,
                  'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400': selectedEmotion === emotion.value
                }"
              >
                <span class="emoji">{{ emotion.emoji }}</span>
                <span class="name text-gray-700 dark:text-gray-300">{{ emotion.label }}</span>
              </button>
            </div>
          </div>

          <div class="message-section">
            <label class="section-label text-gray-700 dark:text-gray-300">Message (optional)</label>
            <textarea
              v-model="customMessage"
              placeholder="What's on your mind?"
              class="message-input bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
              rows="3"
              maxlength="100"
            ></textarea>
            <div class="char-count text-gray-500 dark:text-gray-400">{{ customMessage.length }}/100</div>
          </div>

          <div class="privacy-section">
            <label class="checkbox-label text-gray-700 dark:text-gray-300">
              <input type="checkbox" v-model="isPublic" class="accent-blue-500" />
              <span class="checkmark"></span>
              <span class="text-gray-700 dark:text-gray-300">Share with community</span>
            </label>
          </div>
        </div>

        <div class="modal-footer bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <button @click="closeMoodModal" class="btn btn-secondary bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button 
            @click="saveMood" 
            :disabled="!selectedEmotion || loading"
            class="btn btn-primary bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
            :class="{ 'opacity-50 cursor-not-allowed': !selectedEmotion || loading }"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sharing...
            </span>
            <span v-else>Share Mood</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Story Viewer Modal -->
    <div v-if="viewingStory" class="modal-overlay" @click="closeStoryViewer">
      <div class="story-modal bg-white dark:bg-gray-800" @click.stop>
        <div class="story-modal-header bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div class="user-info">
            <div class="user-avatar" :class="getMoodColor(viewingStory.emotion)">
              <span>{{ getInitials(viewingStory.userName) }}</span>
            </div>
            <div class="user-details">
              <h4 class="text-gray-900 dark:text-gray-100">{{ viewingStory.userName }}</h4>
              <p class="text-gray-600 dark:text-gray-400">{{ formatTimeAgo(viewingStory.createdAt) }}</p>
            </div>
          </div>
          <button @click="closeStoryViewer" class="close-btn bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">×</button>
        </div>

        <div class="story-modal-body bg-white dark:bg-gray-800">
          <div class="mood-display">
            <div class="big-emoji">{{ viewingStory.emoji }}</div>
            <div class="mood-text">
              <p class="text-gray-600 dark:text-gray-400">Feeling <strong class="text-gray-900 dark:text-gray-100">{{ viewingStory.emotion }}</strong></p>
              <p v-if="viewingStory.customMessage" class="message text-gray-700 dark:text-gray-300">
                "{{ viewingStory.customMessage }}"
              </p>
            </div>
          </div>
          
          <!-- Reactions Summary -->
          <div v-if="viewingStory.reactions && viewingStory.reactions.length > 0" class="reactions-summary bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h5 class="text-gray-700 dark:text-gray-300">{{ viewingStory.totalReactions }} {{ viewingStory.totalReactions === 1 ? 'reaction' : 'reactions' }}</h5>
            
            <!-- Detailed Reactions List -->
            <div class="reactions-list">
              <div v-for="reaction in viewingStory.reactions" :key="reaction.id" class="reaction-item">
                <div class="reaction-user bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                  <div class="user-initials">{{ getInitials(reaction.userName) }}</div>
                  <div class="reaction-details">
                    <span class="user-name text-gray-800 dark:text-gray-200">{{ reaction.userName }}</span>
                    <span class="reaction-type text-gray-600 dark:text-gray-400">{{ reaction.emoji }} {{ getReactionLabel(reaction.type) }}</span>
                  </div>
                  <span class="reaction-time text-gray-500 dark:text-gray-500">{{ formatTimeAgo(reaction.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Reaction Counts Summary -->
            <div class="reaction-counts">
              <div v-for="(count, type) in getReactionCounts(viewingStory)" :key="type" class="reaction-count bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                <span class="count-emoji">{{ getReactionEmoji(String(type)) }}</span>
                <span class="count-number text-gray-800 dark:text-gray-200">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="story-modal-footer bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <button
            v-for="reaction in quickReactions"
            :key="reaction.value"
            @click="reactToStory(viewingStory, reaction)"
            class="reaction-btn bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            :class="{ 
              'loading': reactionLoading === reaction.value,
              'user-reacted bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-200': hasUserReacted(viewingStory, reaction.value),
              'opacity-50 cursor-not-allowed': reactionLoading !== null && reactionLoading !== reaction.value
            }"
            :disabled="reactionLoading !== null"
          >
            <span v-if="reactionLoading === reaction.value" class="loading-spinner"></span>
            <span v-else class="reaction-emoji">{{ reaction.emoji }}</span>
            <span class="reaction-text">
              {{ reaction.label }}
              <span v-if="getReactionCounts(viewingStory)[reaction.value]" class="reaction-count-badge bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300">
                {{ getReactionCounts(viewingStory)[reaction.value] }}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { useMoodStore } from '@/stores/mood'
import { useAuthStore } from '@/stores/auth'
import { EMOTION_OPTIONS } from '@/types/journal'
import type { MoodStory } from '@/types/journal'

const route = useRoute()
const moodStore = useMoodStore()
const authStore = useAuthStore()

// State
const showMoodModal = ref(false)
const viewingStory = ref<MoodStory | null>(null)
const selectedEmotion = ref('')
const customMessage = ref('')
const isPublic = ref(true)
const loading = ref(false)
const reactionLoading = ref<string | null>(null) // Track which reaction is loading

// Quick reactions
const quickReactions = [
  { emoji: '❤️', label: 'Love', value: 'love' },
  { emoji: '👍', label: 'Support', value: 'support' },
  { emoji: '🤗', label: 'Hug', value: 'hug' }
]

// Computed
const publicMoodStories = computed(() => moodStore.publicMoodStories || [])

// Helper functions
function getInitials(name: string): string {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

function truncateName(name: string): string {
  return name?.length > 10 ? name.slice(0, 10) + '...' : name
}

function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

function getMoodColor(emotion: string): string {
  const positive = ['happy', 'excited', 'grateful', 'content', 'calm']
  const neutral = ['neutral', 'tired']
  const negative = ['sad', 'anxious', 'stressed', 'frustrated', 'overwhelmed']
  
  if (positive.includes(emotion)) return 'mood-positive'
  if (neutral.includes(emotion)) return 'mood-neutral'
  if (negative.includes(emotion)) return 'mood-negative'
  return 'mood-default'
}

function getReactionCounts(story: MoodStory) {
  const counts: { [key: string]: number } = {}
  story.reactions?.forEach(reaction => {
    counts[reaction.type] = (counts[reaction.type] || 0) + 1
  })
  return counts
}

function getReactionEmoji(type: string): string {
  const reaction = quickReactions.find(r => r.value === type)
  return reaction?.emoji || '👍'
}

function getReactionLabel(type: string): string {
  const reaction = quickReactions.find(r => r.value === type)
  return reaction?.label || 'Like'
}

function hasUserReacted(story: MoodStory | null, reactionType: string): boolean {
  if (!story || !authStore.user) return false
  return story.reactions?.some(r => r.userId === authStore.user?.uid && r.type === reactionType) || false
}

// Modal functions
function openMoodModal() {
  showMoodModal.value = true
}

function closeMoodModal() {
  showMoodModal.value = false
  selectedEmotion.value = ''
  customMessage.value = ''
  isPublic.value = true
}

function selectEmotion(emotion: typeof EMOTION_OPTIONS[0]) {
  selectedEmotion.value = emotion.value
}

async function saveMood() {
  if (!selectedEmotion.value) return

  const emotion = EMOTION_OPTIONS.find(e => e.value === selectedEmotion.value)
  if (!emotion) return

  loading.value = true
  try {
    await moodStore.setTodaysMood(
      emotion.value,
      emotion.emoji,
      customMessage.value.trim() || undefined,
      isPublic.value
    )
    closeMoodModal()
  } catch (error) {
    console.error('Failed to save mood:', error)
  } finally {
    loading.value = false
  }
}

// Story viewer functions
function viewStory(story: MoodStory) {
  viewingStory.value = story
}

function closeStoryViewer() {
  viewingStory.value = null
}

async function reactToStory(story: MoodStory, reaction: typeof quickReactions[0]) {
  if (!story.id || story.userId === authStore.user?.uid) return
  
  // Set loading state for this specific reaction
  reactionLoading.value = reaction.value
  
  try {
    // Make the API call without optimistic updates - let the store handle everything
    await moodStore.reactToMoodStory(story.id, reaction.value, reaction.emoji)
    
    // Show success feedback
    console.log(`✅ Reacted with ${reaction.emoji} ${reaction.label}`)
    
    // Update the viewing story with fresh data from the store
    if (viewingStory.value && viewingStory.value.id === story.id) {
      const updatedStory = moodStore.publicMoodStories.find(s => s.id === story.id)
      if (updatedStory) {
        viewingStory.value = updatedStory
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to react:', error)
  } finally {
    reactionLoading.value = null
  }
}

// Initialize
onMounted(async () => {
  console.log('🔄 MoodStoriesHeader mounted, checking auth state...')
  
  if (authStore.isAuthenticated) {
    console.log('✅ User authenticated, fetching mood stories...')
    try {
      // Check if we need to load more days for highlighted mood story
      const highlightId = route.query.highlight
      const daysBack = highlightId ? 7 : 0 // Load last 7 days if highlighting specific story
      
      await moodStore.fetchPublicMoodStories(daysBack)
      console.log('✅ Mood stories fetched successfully')
      
      // If highlighting a specific story, scroll to it after a short delay
      if (highlightId) {
        setTimeout(() => {
          const element = document.getElementById(`mood-story-${highlightId}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Add a highlight effect
            element.style.animation = 'pulse 2s ease-in-out 3'
          }
        }, 500)
      }
    } catch (error) {
      console.error('❌ Failed to fetch mood stories on mount:', error)
    }
  } else {
    console.log('⏳ User not yet authenticated, waiting...')
    // Watch for auth changes
    const unwatch = authStore.$subscribe(() => {
      if (authStore.isAuthenticated && !moodStore.loading) {
        console.log('✅ Auth state changed to authenticated, fetching stories...')
        
        // Check if we need to load more days for highlighted mood story
        const highlightId = route.query.highlight
        const daysBack = highlightId ? 7 : 0
        
        moodStore.fetchPublicMoodStories(daysBack)
        unwatch() // Stop watching after first successful auth
      }
    })
  }
})
</script>

<style scoped>
/* Story Card Styles - keeping CSS for complex hover states */

.story-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.story-card:hover {
  transform: translateY(-2px);
}

/* Add Story */
.add-story {
  opacity: 0.7;
}

.add-icon {
  width: 60px;
  height: 60px;
  border: 2px dashed #9ca3af;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
}

:deep(.dark) .add-icon {
  border: 2px dashed #6b7280;
  color: #9ca3af;
}

.add-story:hover .add-icon {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

:deep(.dark) .add-story:hover .add-icon {
  border-color: #60a5fa;
  color: #60a5fa;
  background: #1e3a8a;
}

/* User Story */
.story-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  position: relative;
  transition: all 0.2s;
}

.story-avatar:hover {
  transform: scale(1.05);
}

.story-avatar.mood-positive {
  border-color: #10b981;
}

.story-avatar.mood-neutral {
  border-color: #f59e0b;
}

.story-avatar.mood-negative {
  border-color: #ef4444;
}

.initials {
  font-size: 16px;
}

.mood-emoji {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.dark) .mood-emoji {
  background: #1f2937;
  border: 2px solid #1f2937;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.reaction-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.dark) .reaction-indicator {
  border: 2px solid #1f2937;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.story-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.dark) .story-label {
  color: #9ca3af;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
  overflow-y: auto;
}

@media (max-height: 700px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 20px 20px 40px;
  }
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 10px;
    align-items: flex-start;
  }
}

.modal-content {
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  margin: auto;
}

:deep(.dark) .modal-content {
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

@media (max-width: 640px) {
  .modal-content {
    max-height: calc(100vh - 20px);
    margin: 10px auto;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

@media (max-width: 640px) {
  .modal-body {
    padding: 16px;
  }
}

/* Emotions Section */
.emotions-section {
  margin-bottom: 20px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.emotions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 640px) {
  .emotions-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
}

.emotion-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 70px;
}

@media (max-width: 640px) {
  .emotion-btn {
    padding: 8px 4px;
    min-height: 60px;
  }
}

.emotion-btn:hover {
  border-color: #d1d5db;
}

.emotion-btn.active {
  border-color: #3b82f6;
}

.emotion-btn .emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

@media (max-width: 640px) {
  .emotion-btn .emoji {
    font-size: 20px;
    margin-bottom: 2px;
  }
}

.emotion-btn .name {
  font-size: 11px;
  font-weight: 500;
}

@media (max-width: 640px) {
  .emotion-btn .name {
    font-size: 10px;
  }
}

/* Message Section */
.message-section {
  margin-bottom: 20px;
}

.message-input {
  width: 100%;
  padding: 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 14px;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .message-input {
    padding: 10px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

.message-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.char-count {
  text-align: right;
  font-size: 12px;
  margin-top: 4px;
}

/* Privacy Section */
.privacy-section {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
  cursor: pointer;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .modal-footer {
    padding: 16px;
    gap: 8px;
  }
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

@media (max-width: 640px) {
  .btn {
    padding: 12px 16px;
    font-size: 14px;
  }
}

/* Button styles handled by Tailwind classes */

/* Story Modal */
.story-modal {
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

:deep(.dark) .story-modal {
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.story-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.user-details h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.user-details p {
  font-size: 12px;
  margin: 2px 0 0;
}

.story-modal-body {
  padding: 32px 20px;
  text-align: center;
}

.mood-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.big-emoji {
  font-size: 64px;
}

.mood-text p {
  font-size: 16px;
  margin: 0;
}

.mood-text .message {
  font-size: 14px;
  font-style: italic;
  margin-top: 8px;
}

/* Reactions Summary */
.reactions-summary {
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
}

.reactions-summary h5 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.reactions-list {
  margin-bottom: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.reaction-item {
  margin-bottom: 8px;
}

.reaction-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid;
}

.user-initials {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.reaction-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
}

.reaction-type {
  font-size: 12px;
}

.reaction-time {
  font-size: 11px;
  flex-shrink: 0;
}

.reaction-counts {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.reaction-count {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid;
  border-radius: 16px;
  font-size: 12px;
}

.count-emoji {
  font-size: 14px;
}

.count-number {
  font-weight: 600;
}

.story-modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
}

.reaction-btn {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.reaction-btn:hover {
  transform: translateY(-1px);
}

.reaction-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.reaction-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

:deep(.dark) .loading-spinner {
  border: 2px solid #4b5563;
  border-top: 2px solid #60a5fa;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% { 
    transform: scale(1.05); 
    box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.2);
  }
}

.reaction-emoji {
  font-size: 16px;
  line-height: 1;
}

.reaction-text {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.reaction-count-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
</style>