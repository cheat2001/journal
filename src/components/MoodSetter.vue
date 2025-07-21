<template>
  <div class="mood-setter">
    <!-- Current Mood Display -->
    <div v-if="moodStore.todaysMood" class="current-mood">
      <div class="mood-header">
        <div class="mood-avatar">
          <div class="avatar-circle">
            <span class="avatar-initials">{{ authStore.userInitials }}</span>
            <div class="mood-emoji">{{ moodStore.todaysMood.emoji }}</div>
          </div>
        </div>
        <div class="mood-info">
          <div class="mood-text">
            <span class="feeling-label">You're feeling</span>
            <span class="emotion-name">{{ moodStore.todaysMood.emotion }}</span>
            <span class="feeling-today">today</span>
          </div>
          <div v-if="moodStore.todaysMood.customMessage" class="mood-message">
            "{{ moodStore.todaysMood.customMessage }}"
          </div>
          <div class="mood-visibility">
            <div class="visibility-indicator" :class="{ public: moodStore.todaysMood.isPublic, private: !moodStore.todaysMood.isPublic }">
              <svg v-if="moodStore.todaysMood.isPublic" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span class="text-xs">{{ moodStore.todaysMood.isPublic ? 'Public' : 'Private' }}</span>
            </div>
          </div>
        </div>
        <div class="mood-actions">
          <button
            @click="showMoodEditor = true"
            class="edit-mood-btn"
            title="Edit mood"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button
            @click="deleteMood"
            class="delete-mood-btn"
            title="Remove mood"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mood Setting Interface -->
    <div v-else-if="!showMoodEditor" class="mood-prompt">
      <div class="prompt-content">
        <div class="prompt-icon">
          <div class="icon-circle">
            <span class="text-2xl">🌟</span>
          </div>
        </div>
        <div class="prompt-text">
          <h3 class="prompt-title">How are you feeling today?</h3>
          <p class="prompt-subtitle">Share your mood with the community or keep it private</p>
        </div>
        <button
          @click="showMoodEditor = true"
          class="set-mood-btn"
        >
          <span class="text-lg mr-2">✨</span>
          Set My Mood
        </button>
      </div>
    </div>

    <!-- Mood Editor Modal -->
    <div
      v-if="showMoodEditor"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
      @click.self="closeMoodEditor"
    >
      <div class="mood-editor-modal">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ moodStore.todaysMood ? 'Update Your Mood' : 'Set Your Mood' }}
          </h3>
          <button
            @click="closeMoodEditor"
            class="close-btn"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <!-- Emotion Selection -->
          <div class="emotion-section">
            <h4 class="section-title">Choose your emotion</h4>
            <div class="emotion-grid">
              <button
                v-for="emotion in EMOTION_OPTIONS"
                :key="emotion.value"
                @click="selectEmotion(emotion)"
                class="emotion-btn"
                :class="{ 
                  selected: selectedEmotion?.value === emotion.value,
                  positive: isPositiveEmotion(emotion.value),
                  neutral: isNeutralEmotion(emotion.value),
                  negative: isNegativeEmotion(emotion.value)
                }"
              >
                <span class="emotion-emoji">{{ emotion.emoji }}</span>
                <span class="emotion-label">{{ emotion.label }}</span>
              </button>
            </div>
          </div>

          <!-- Custom Message -->
          <div class="message-section">
            <h4 class="section-title">Add a message (optional)</h4>
            <div class="message-input-wrapper">
              <textarea
                v-model="customMessage"
                placeholder="What's making you feel this way? (Optional)"
                class="message-input"
                rows="3"
                maxlength="280"
              ></textarea>
              <div class="character-count">
                {{ customMessage.length }}/280
              </div>
            </div>
          </div>

          <!-- Privacy Settings -->
          <div class="privacy-section">
            <h4 class="section-title">Who can see this?</h4>
            <div class="privacy-options">
              <label class="privacy-option">
                <input
                  type="radio"
                  :value="true"
                  v-model="isPublic"
                  class="privacy-radio"
                />
                <div class="privacy-content">
                  <div class="privacy-icon public">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="privacy-text">
                    <div class="privacy-title">Public</div>
                    <div class="privacy-description">Visible to the community</div>
                  </div>
                </div>
              </label>

              <label class="privacy-option">
                <input
                  type="radio"
                  :value="false"
                  v-model="isPublic"
                  class="privacy-radio"
                />
                <div class="privacy-content">
                  <div class="privacy-icon private">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <div class="privacy-text">
                    <div class="privacy-title">Private</div>
                    <div class="privacy-description">Only visible to you</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            @click="closeMoodEditor"
            class="cancel-btn"
          >
            Cancel
          </button>
          <button
            @click="saveMood"
            :disabled="!selectedEmotion || moodStore.loading"
            class="save-btn"
          >
            <span v-if="moodStore.loading" class="loading-spinner"></span>
            {{ moodStore.loading ? 'Saving...' : (moodStore.todaysMood ? 'Update Mood' : 'Set Mood') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMoodStore } from '@/stores/mood'
import { useAuthStore } from '@/stores/auth'
import { EMOTION_OPTIONS } from '@/types/journal'
import type { EmotionOption } from '@/types/journal'

const moodStore = useMoodStore()
const authStore = useAuthStore()

const showMoodEditor = ref(false)
const selectedEmotion = ref<EmotionOption | null>(null)
const customMessage = ref('')
const isPublic = ref(true)

// Emotion categorization for styling
const positiveEmotions = ['happy', 'excited', 'calm', 'grateful', 'content']
const neutralEmotions = ['neutral', 'tired']
const negativeEmotions = ['stressed', 'anxious', 'sad', 'frustrated', 'overwhelmed']

const isPositiveEmotion = (emotion: string) => positiveEmotions.includes(emotion)
const isNeutralEmotion = (emotion: string) => neutralEmotions.includes(emotion)
const isNegativeEmotion = (emotion: string) => negativeEmotions.includes(emotion)

function selectEmotion(emotion: EmotionOption) {
  selectedEmotion.value = emotion
}

function closeMoodEditor() {
  showMoodEditor.value = false
  resetForm()
}

function resetForm() {
  selectedEmotion.value = null
  customMessage.value = ''
  isPublic.value = true
}

async function saveMood() {
  if (!selectedEmotion.value) return

  try {
    await moodStore.setTodaysMood(
      selectedEmotion.value.value,
      selectedEmotion.value.emoji,
      customMessage.value.trim() || undefined,
      isPublic.value
    )
    closeMoodEditor()
  } catch (error) {
    console.error('Failed to save mood:', error)
  }
}

async function deleteMood() {
  if (confirm('Are you sure you want to remove your mood for today?')) {
    try {
      await moodStore.deleteTodaysMood()
    } catch (error) {
      console.error('Failed to delete mood:', error)
    }
  }
}

// Initialize form with existing mood data when editing
function initializeForm() {
  if (moodStore.todaysMood) {
    const existingEmotion = EMOTION_OPTIONS.find(e => e.value === moodStore.todaysMood?.emotion)
    selectedEmotion.value = existingEmotion || null
    customMessage.value = moodStore.todaysMood.customMessage || ''
    isPublic.value = moodStore.todaysMood.isPublic
  }
}

onMounted(() => {
  if (showMoodEditor.value) {
    initializeForm()
  }
})

// Watch for when editor opens to initialize form
function openMoodEditor() {
  showMoodEditor.value = true
  initializeForm()
}

// Update the button click handlers
function editMood() {
  openMoodEditor()
}
</script>

<style scoped>
.mood-setter {
  @apply mb-8;
}

/* Current Mood Display */
.current-mood {
  @apply bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg;
}

.mood-header {
  @apply flex items-center gap-4;
}

.mood-avatar {
  @apply relative;
}

.avatar-circle {
  @apply relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg;
}

.avatar-initials {
  @apply text-sm font-bold;
}

.mood-emoji {
  @apply absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shadow-md border-2 border-white;
}

.mood-info {
  @apply flex-1;
}

.mood-text {
  @apply flex items-center gap-2 flex-wrap;
}

.feeling-label {
  @apply text-gray-600 text-sm;
}

.emotion-name {
  @apply font-semibold text-lg text-gray-900 capitalize;
}

.feeling-today {
  @apply text-gray-600 text-sm;
}

.mood-message {
  @apply mt-2 text-gray-700 italic;
}

.mood-visibility {
  @apply mt-2;
}

.visibility-indicator {
  @apply inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium;
}

.visibility-indicator.public {
  @apply bg-green-100 text-green-800;
}

.visibility-indicator.private {
  @apply bg-gray-100 text-gray-600;
}

.mood-actions {
  @apply flex gap-2;
}

.edit-mood-btn,
.delete-mood-btn {
  @apply p-2 rounded-lg transition-all duration-200 hover:shadow-md;
}

.edit-mood-btn {
  @apply bg-blue-100 text-blue-700 hover:bg-blue-200;
}

.delete-mood-btn {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}

/* Mood Prompt */
.mood-prompt {
  @apply bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8;
}

.prompt-content {
  @apply text-center;
}

.prompt-icon {
  @apply mb-4;
}

.icon-circle {
  @apply inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg;
}

.prompt-title {
  @apply text-xl font-bold text-gray-900 mb-2;
}

.prompt-subtitle {
  @apply text-gray-600 mb-6;
}

.set-mood-btn {
  @apply bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center;
}

/* Modal Styles */
.mood-editor-modal {
  @apply bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl slide-up;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-bold text-gray-900;
}

.close-btn {
  @apply p-2 hover:bg-gray-100 rounded-lg transition-colors;
}

.modal-content {
  @apply p-6 max-h-[60vh] overflow-y-auto;
}

.section-title {
  @apply font-semibold text-gray-900 mb-4;
}

/* Emotion Grid */
.emotion-section {
  @apply mb-6;
}

.emotion-grid {
  @apply grid grid-cols-3 sm:grid-cols-4 gap-3;
}

.emotion-btn {
  @apply flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md;
}

.emotion-btn.selected {
  @apply border-blue-500 bg-blue-50;
}

.emotion-btn.positive.selected {
  @apply border-green-500 bg-green-50;
}

.emotion-btn.neutral.selected {
  @apply border-yellow-500 bg-yellow-50;
}

.emotion-btn.negative.selected {
  @apply border-red-500 bg-red-50;
}

.emotion-emoji {
  @apply text-2xl mb-2;
}

.emotion-label {
  @apply text-sm font-medium text-gray-700;
}

/* Message Section */
.message-section {
  @apply mb-6;
}

.message-input-wrapper {
  @apply relative;
}

.message-input {
  @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none;
}

.character-count {
  @apply absolute bottom-2 right-2 text-xs text-gray-500;
}

/* Privacy Section */
.privacy-section {
  @apply mb-6;
}

.privacy-options {
  @apply space-y-3;
}

.privacy-option {
  @apply flex items-center cursor-pointer;
}

.privacy-radio {
  @apply sr-only;
}

.privacy-content {
  @apply flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors w-full;
}

.privacy-option:has(.privacy-radio:checked) .privacy-content {
  @apply border-blue-500 bg-blue-50;
}

.privacy-icon {
  @apply p-2 rounded-lg;
}

.privacy-icon.public {
  @apply bg-green-100 text-green-600;
}

.privacy-icon.private {
  @apply bg-gray-100 text-gray-600;
}

.privacy-title {
  @apply font-medium text-gray-900;
}

.privacy-description {
  @apply text-sm text-gray-600;
}

/* Modal Footer */
.modal-footer {
  @apply flex gap-3 p-6 border-t border-gray-200;
}

.cancel-btn {
  @apply flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200;
}

.save-btn {
  @apply flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2;
}

.loading-spinner {
  @apply w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
