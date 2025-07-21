<template>
  <div class="journal-form-container">
    <form @submit.prevent="handleSubmit" class="journal-form">
      <div class="form-header">
        <h2 class="form-title">
          {{ isEditing ? 'Edit' : 'New' }} Journal Entry
        </h2>
        <p class="form-subtitle">Reflect on your day and capture your thoughts</p>
      </div>

      <!-- Date Field -->
      <div class="form-group">
        <label for="date" class="form-label">Date</label>
        <input 
          id="date" 
          v-model="form.date" 
          type="date" 
          :max="today" 
          class="form-input" 
          required 
        />
      </div>

      <!-- Gratitude Field -->
      <div class="form-group">
        <label for="gratitude" class="form-label">
          What are you grateful for today?
        </label>
        <textarea
          id="gratitude"
          v-model="form.gratitude"
          rows="3"
          placeholder="I'm grateful for..."
          class="form-textarea"
          required
        ></textarea>
      </div>

      <!-- Emotion Field -->
      <div class="form-group">
        <label class="form-label">How are you feeling?</label>
        <div class="emotions-grid">
          <button
            v-for="emotion in EMOTION_OPTIONS"
            :key="emotion.value"
            type="button"
            @click="form.emotion = emotion.value"
            class="emotion-card"
            :class="{ active: form.emotion === emotion.value }"
          >
            <span class="emotion-emoji">{{ emotion.emoji }}</span>
            <span class="emotion-label">{{ emotion.label }}</span>
          </button>
        </div>
      </div>

      <!-- Challenges Field -->
      <div class="form-group">
        <label for="challenges" class="form-label">
          What challenges did you face today?
        </label>
        <textarea
          id="challenges"
          v-model="form.challenges"
          rows="4"
          placeholder="Describe any challenges, obstacles, or difficult moments you experienced today..."
          class="form-textarea"
          required
        ></textarea>
      </div>

      <!-- Learning Field -->
      <div class="form-group">
        <label for="learning" class="form-label">
          What did you learn or discover?
        </label>
        <textarea
          id="learning"
          v-model="form.learning"
          rows="4"
          placeholder="Share any insights, lessons learned, or discoveries from your day..."
          class="form-textarea"
          required
        ></textarea>
      </div>

      <!-- Privacy & Mood Section -->
      <div class="form-section">
        <h3 class="section-title">Privacy & Sharing</h3>
        
        <div class="privacy-options">
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="form.isPublic" 
              class="form-checkbox"
            />
            <span class="checkbox-label">
              Make this entry public in community feed
            </span>
          </label>
        </div>

        <div v-if="form.isPublic" class="mood-sharing-section">
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="shareMoodStory" 
              class="form-checkbox"
            />
            <span class="checkbox-label">
              Also share my mood as a story
            </span>
          </label>
          
          <div v-if="shareMoodStory" class="mood-message-input">
            <label for="moodMessage" class="form-label">
              Mood story message (optional)
            </label>
            <textarea
              id="moodMessage"
              v-model="moodMessage"
              rows="2"
              placeholder="Add a message to your mood story..."
              class="form-textarea"
              maxlength="100"
            ></textarea>
            <div class="char-counter">{{ moodMessage.length }}/100</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <button
          v-if="isEditing"
          type="button"
          @click="$emit('cancel')"
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="journalStore.loading"
          class="btn btn-primary"
        >
          <span v-if="journalStore.loading" class="loading-content">
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
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
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

/* Form Inputs */
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 5rem;
  transition: all 0.2s;
  outline: none;
  font-family: inherit;
  color: black;
}

.form-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.emotion-card:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.emotion-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
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

/* Form Section */
.form-section {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem;
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

/* Mood Sharing Section */
.mood-sharing-section {
  padding-left: 1.75rem;
  border-left: 3px solid #e5e7eb;
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

.btn-secondary:hover {
  background: #e5e7eb;
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
