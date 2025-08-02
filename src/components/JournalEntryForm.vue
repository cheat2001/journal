<template>
  <div class="max-w-4xl mx-auto p-4">
    <form @submit.prevent="handleSubmit" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg">
      <div class="mb-8">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-gray-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-2">
          {{ isEditing ? 'Edit' : 'New' }} Journal Entry
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-base">Reflect on your day and capture your thoughts</p>
      </div>

      <!-- Date Field -->
      <div class="mb-6">
        <label for="date" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
        <input 
          id="date" 
          v-model="form.date" 
          type="date" 
          :max="today" 
          class="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors" 
          required 
        />
      </div>

      <!-- Gratitude Field -->
      <div class="mb-6">
        <label for="gratitude" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          What are you grateful for today?
        </label>
        <textarea
          id="gratitude"
          v-model="form.gratitude"
          rows="3"
          placeholder="I'm grateful for..."
          class="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-vertical min-h-[5rem] transition-colors"
          required
        ></textarea>
      </div>

      <!-- Emotion Field -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">How are you feeling?</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            v-for="emotion in EMOTION_OPTIONS"
            :key="emotion.value"
            type="button"
            @click="form.emotion = emotion.value"
            class="flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
            :class="form.emotion === emotion.value 
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/50' 
              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'"
          >
            <span class="text-2xl mb-1">{{ emotion.emoji }}</span>
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{{ emotion.label }}</span>
          </button>
        </div>
      </div>

      <!-- Challenges Field -->
      <div class="mb-6">
        <label for="challenges" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          What challenges did you face today?
        </label>
        <textarea
          id="challenges"
          v-model="form.challenges"
          rows="4"
          placeholder="Describe any challenges, obstacles, or difficult moments you experienced today..."
          class="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-vertical min-h-[5rem] transition-colors"
          required
        ></textarea>
      </div>

      <!-- Learning Field -->
      <div class="mb-6">
        <label for="learning" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          What did you learn or discover?
        </label>
        <textarea
          id="learning"
          v-model="form.learning"
          rows="4"
          placeholder="Share any insights, lessons learned, or discoveries from your day..."
          class="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-vertical min-h-[5rem] transition-colors"
          required
        ></textarea>
      </div>

      <!-- Privacy & Mood Section -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Privacy & Sharing</h3>
        
        <div class="mb-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="form.isPublic" 
              class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Make this entry public in community feed
            </span>
          </label>
        </div>

        <div v-if="form.isPublic" class="pl-7 border-l-2 border-gray-300 dark:border-gray-600">
          <label class="flex items-center gap-3 cursor-pointer mb-4">
            <input 
              type="checkbox" 
              v-model="shareMoodStory" 
              class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Also share my mood as a story
            </span>
          </label>
          
          <div v-if="shareMoodStory" class="mt-4">
            <label for="moodMessage" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mood story message (optional)
            </label>
            <textarea
              id="moodMessage"
              v-model="moodMessage"
              rows="2"
              placeholder="Add a message to your mood story..."
              class="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-vertical transition-colors"
              maxlength="100"
            ></textarea>
            <div class="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{{ moodMessage.length }}/100</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 justify-end mt-8">
        <button
          v-if="isEditing"
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="journalStore.loading"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px]"
        >
          <span v-if="journalStore.loading" class="flex items-center gap-2">
            <LoadingSpinner class="w-4 h-4" />
            {{ isEditing ? 'Updating...' : 'Saving...' }}
          </span>
          <span v-else>
            {{ isEditing ? 'Update Entry' : 'Save Entry' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import { useJournalStore } from '@/stores/journal'
import { useMoodStore } from '@/stores/mood'
import { EMOTION_OPTIONS, type JournalEntry } from '@/types/journal'
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  entry?: JournalEntry | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const journalStore = useJournalStore()
const moodStore = useMoodStore()

// Form state
const form = ref({
  date: format(new Date(), 'yyyy-MM-dd'),
  gratitude: '',
  emotion: '',
  challenges: '',
  learning: '',
  isPublic: false
})

const shareMoodStory = ref(false)
const moodMessage = ref('')

// Computed
const today = computed(() => format(new Date(), 'yyyy-MM-dd'))
const isEditing = computed(() => !!props.entry)

// Initialize form
onMounted(() => {
  if (props.entry) {
    form.value = {
      date: format(props.entry.createdAt, 'yyyy-MM-dd'),
      gratitude: props.entry.gratitude,
      emotion: props.entry.emotion,
      challenges: props.entry.challenges,
      learning: props.entry.learning,
      isPublic: props.entry.isPublic || false
    }
  }
})

// Watch for entry changes
watch(() => props.entry, (newEntry) => {
  if (newEntry) {
    form.value = {
      date: format(newEntry.createdAt, 'yyyy-MM-dd'),
      gratitude: newEntry.gratitude,
      emotion: newEntry.emotion,
      challenges: newEntry.challenges,
      learning: newEntry.learning,
      isPublic: newEntry.isPublic || false
    }
  }
})

// Handle form submission
async function handleSubmit() {
  try {
    const entryData = {
      ...form.value,
      createdAt: new Date(form.value.date)
    }

    if (isEditing.value && props.entry) {
      await journalStore.updateEntry(props.entry.id!, entryData)
    } else {
      await journalStore.addEntry(entryData)
    }

    // Also share mood story if enabled
    if (form.value.isPublic && shareMoodStory.value && form.value.emotion) {
      const emotion = EMOTION_OPTIONS.find(e => e.value === form.value.emotion)
      if (emotion) {
        await moodStore.setTodaysMood(
          emotion.value,
          emotion.emoji,
          moodMessage.value.trim() || undefined,
          true
        )
      }
    }

    emit('success')
    
    // Reset form if not editing
    if (!isEditing.value) {
      form.value = {
        date: format(new Date(), 'yyyy-MM-dd'),
        gratitude: '',
        emotion: '',
        challenges: '',
        learning: '',
        isPublic: false
      }
      shareMoodStory.value = false
      moodMessage.value = ''
    }
  } catch (error) {
    console.error('Failed to save entry:', error)
  }
}
</script>

<style scoped>
/* Container */
.journal-form-container {
  max-width: 42rem;
  margin: 0 auto;
  padding: 1rem;
}

/* Form */
.journal-form {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

:global(.dark) .journal-form {
  background: #1f2937;
  border-color: #374151;
}

/* Header */
.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1f2937, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem;
}

.form-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

:global(.dark) .form-subtitle {
  color: #9ca3af;
}

/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

:global(.dark) .form-label {
  color: #d1d5db;
}

/* Form Inputs */
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #111827;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  outline: none;
}

:global(.dark) .form-input {
  border-color: #4b5563;
  background: #374151;
  color: #f9fafb;
}

.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:global(.dark) .form-input:focus {
  border-color: #60a5fa;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #111827;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 5rem;
  transition: all 0.2s;
  outline: none;
  font-family: inherit;
}

:global(.dark) .form-textarea {
  border-color: #4b5563;
  background: #374151;
  color: #f9fafb;
}

.form-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:global(.dark) .form-textarea:focus {
  border-color: #60a5fa;
}

/* Emotions Grid */
.emotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.emotion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

:global(.dark) .emotion-card {
  border-color: #4b5563;
  background: #374151;
}

.emotion-card:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

:global(.dark) .emotion-card:hover {
  border-color: #6b7280;
  background: #4b5563;
}

.emotion-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

:global(.dark) .emotion-card.active {
  border-color: #60a5fa;
  background: rgba(30, 58, 138, 0.5);
}

.emotion-emoji {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.emotion-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

:global(.dark) .emotion-label {
  color: #d1d5db;
}

/* Form Section */
.form-section {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

:global(.dark) .form-section {
  background: #1f2937;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem;
}

:global(.dark) .section-title {
  color: #d1d5db;
}

/* Privacy Options */
.privacy-options {
  margin-bottom: 1rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-bottom: 0.75rem;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

:global(.dark) .checkbox-label {
  color: #d1d5db;
}

/* Mood Sharing Section */
.mood-sharing-section {
  padding-left: 1.75rem;
  border-left: 3px solid #e5e7eb;
}

:global(.dark) .mood-sharing-section {
  border-left-color: #4b5563;
}

.mood-message-input {
  margin-top: 1rem;
}

.char-counter {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

:global(.dark) .char-counter {
  color: #9ca3af;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

:global(.dark) .btn-secondary {
  background: #4b5563;
  color: #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

:global(.dark) .btn-secondary:hover {
  background: #6b7280;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  min-width: 120px;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 640px) {
  .journal-form {
    padding: 1.5rem;
  }
  
  .emotions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
