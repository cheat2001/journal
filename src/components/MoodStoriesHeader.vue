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
          class="story-card user-story"
          @click="viewStory(story)"
        >
          <div class="story-avatar" :class="getMoodColor(story.emotion)">
            <span class="initials">{{ getInitials(story.userName) }}</span>
            <div class="mood-emoji">{{ story.emoji }}</div>
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
        </div>

        <div class="story-modal-footer">
          <button
            v-for="reaction in quickReactions"
            :key="reaction.value"
            @click="reactToStory(viewingStory, reaction)"
            class="reaction-btn"
          >
            {{ reaction.emoji }} {{ reaction.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useMoodStore } from '@/stores/mood'
import { useAuthStore } from '@/stores/auth'
import { EMOTION_OPTIONS } from '@/types/journal'
import type { MoodStory } from '@/types/journal'

const moodStore = useMoodStore()
const authStore = useAuthStore()

// State
const showMoodModal = ref(false)
const viewingStory = ref<MoodStory | null>(null)
const selectedEmotion = ref('')
const customMessage = ref('')
const isPublic = ref(true)
const loading = ref(false)

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
  
  try {
    await moodStore.reactToMoodStory(story.id, reaction.value, reaction.emoji)
  } catch (error) {
    console.error('Failed to react:', error)
  }
}

// Initialize
onMounted(() => {
  if (authStore.isAuthenticated) {
    moodStore.fetchPublicMoodStories()
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
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

.emotion-btn .name {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
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
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
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

.story-modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.reaction-btn {
  flex: 1;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color:black;
}

.reaction-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}
</style>