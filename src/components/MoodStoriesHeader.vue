<template>
  <div class="mood-stories-wrapper">
    <div class="stories-header">
      <div class="header-info">
        <h2 class="title">Community Mood Stories</h2>
        <span class="count">{{ publicMoodStories.length }} people shared today</span>
      </div>
      
      <div class="stories-grid">
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

    <!-- Mood Modal -->
    <div v-if="showMoodModal" class="modal-overlay" @click="closeMoodModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Share Your Mood</h3>
          <button @click="closeMoodModal" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <div class="emotions-section">
            <label class="section-label">How are you feeling?</label>
            <div class="emotions-grid">
              <button
                v-for="emotion in EMOTION_OPTIONS"
                :key="emotion.value"
                @click="selectEmotion(emotion)"
                class="emotion-btn"
                :class="{ active: selectedEmotion === emotion.value }"
              >
                <span class="emoji">{{ emotion.emoji }}</span>
                <span class="name">{{ emotion.label }}</span>
              </button>
            </div>
          </div>

          <div class="message-section">
            <label class="section-label">Message (optional)</label>
            <textarea
              v-model="customMessage"
              placeholder="What's on your mind?"
              class="message-input"
              rows="3"
              maxlength="100"
            ></textarea>
            <div class="char-count">{{ customMessage.length }}/100</div>
          </div>

          <div class="privacy-section">
            <label class="checkbox-label">
              <input type="checkbox" v-model="isPublic" />
              <span class="checkmark"></span>
              Share with community
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeMoodModal" class="btn btn-secondary">Cancel</button>
          <button 
            @click="saveMood" 
            :disabled="!selectedEmotion || loading"
            class="btn btn-primary"
          >
            {{ loading ? 'Sharing...' : 'Share Mood' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Story Viewer Modal -->
    <div v-if="viewingStory" class="modal-overlay" @click="closeStoryViewer">
      <div class="story-modal" @click.stop>
        <div class="story-modal-header">
          <div class="user-info">
            <div class="user-avatar" :class="getMoodColor(viewingStory.emotion)">
              <span>{{ getInitials(viewingStory.userName) }}</span>
            </div>
            <div class="user-details">
              <h4>{{ viewingStory.userName }}</h4>
              <p>{{ formatTimeAgo(viewingStory.createdAt) }}</p>
            </div>
          </div>
          <button @click="closeStoryViewer" class="close-btn">×</button>
        </div>

        <div class="story-modal-body">
          <div class="mood-display">
            <div class="big-emoji">{{ viewingStory.emoji }}</div>
            <div class="mood-text">
              <p>Feeling <strong>{{ viewingStory.emotion }}</strong></p>
              <p v-if="viewingStory.customMessage" class="message">
                "{{ viewingStory.customMessage }}"
              </p>
            </div>
          </div>
          
          <!-- Reactions Summary -->
          <div v-if="viewingStory.reactions && viewingStory.reactions.length > 0" class="reactions-summary">
            <h5>{{ viewingStory.totalReactions }} {{ viewingStory.totalReactions === 1 ? 'reaction' : 'reactions' }}</h5>
            
            <!-- Detailed Reactions List -->
            <div class="reactions-list">
              <div v-for="reaction in viewingStory.reactions" :key="reaction.id" class="reaction-item">
                <div class="reaction-user">
                  <div class="user-initials">{{ getInitials(reaction.userName) }}</div>
                  <div class="reaction-details">
                    <span class="user-name">{{ reaction.userName }}</span>
                    <span class="reaction-type">{{ reaction.emoji }} {{ getReactionLabel(reaction.type) }}</span>
                  </div>
                  <span class="reaction-time">{{ formatTimeAgo(reaction.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Reaction Counts Summary -->
            <div class="reaction-counts">
              <div v-for="(count, type) in getReactionCounts(viewingStory)" :key="type" class="reaction-count">
                <span class="count-emoji">{{ getReactionEmoji(String(type)) }}</span>
                <span class="count-number">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="story-modal-footer">
          <button
            v-for="reaction in quickReactions"
            :key="reaction.value"
            @click="reactToStory(viewingStory, reaction)"
            class="reaction-btn"
            :class="{ 
              'loading': reactionLoading === reaction.value,
              'user-reacted': hasUserReacted(viewingStory, reaction.value)
            }"
            :disabled="reactionLoading !== null"
          >
            <span v-if="reactionLoading === reaction.value" class="loading-spinner"></span>
            <span v-else class="reaction-emoji">{{ reaction.emoji }}</span>
            <span class="reaction-text">{{ reaction.label }}</span>
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
/* Main Container */
.mood-stories-wrapper {
  margin-bottom: 2rem;
}

/* Header */
.stories-header {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.count {
  font-size: 14px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 20px;
}

/* Stories Grid */
.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
}

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

.add-story:hover .add-icon {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
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
  background: white;
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
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
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
  color: #374151;
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
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
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
  background: #f9fafb;
}

.emotion-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
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
  color: #374151;
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
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  color: black;
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
  color: #6b7280;
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
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
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

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Story Modal */
.story-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.story-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
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
  color: #111827;
  margin: 0;
}

.user-details p {
  font-size: 12px;
  color: #6b7280;
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
  color: #6b7280;
  margin: 0;
}

.mood-text .message {
  font-size: 14px;
  color: #374151;
  font-style: italic;
  margin-top: 8px;
}

/* Reactions Summary */
.reactions-summary {
  margin-top: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.reactions-summary h5 {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
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
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
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
  color: #374151;
}

.reaction-type {
  font-size: 12px;
  color: #6b7280;
}

.reaction-time {
  font-size: 11px;
  color: #9ca3af;
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
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  font-size: 12px;
}

.count-emoji {
  font-size: 14px;
}

.count-number {
  font-weight: 600;
  color: #374151;
}

.story-modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.reaction-btn {
  flex: 1;
  padding: 10px 14px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.reaction-btn:hover {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-color: #64748b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: #1e293b;
}

.reaction-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.reaction-btn.user-reacted {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-color: #3b82f6;
  color: #1e40af;
}

.reaction-btn.user-reacted:hover {
  background: linear-gradient(135deg, #bfdbfe, #93c5fd);
  border-color: #2563eb;
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
}
</style>