<template>
  <form @submit.prevent="handleSubmit" class="card max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      {{ isEditing ? 'Edit' : 'New' }} Journal Entry
    </h2>

    <!-- Date Field -->
    <div class="mb-6">
      <label for="date" class="block text-sm font-medium text-gray-700 mb-2"> Date </label>
      <input id="date" v-model="form.date" type="date" :max="today" class="form-input" required />
    </div>

    <!-- Gratitude Field -->
    <div class="mb-6">
      <label for="gratitude" class="block text-sm font-medium text-gray-700 mb-2">
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
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2"> How are you feeling? </label>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <button
          v-for="emotion in EMOTION_OPTIONS"
          :key="emotion.value"
          type="button"
          @click="form.emotion = emotion.value"
          :class="[
            'p-3 rounded-lg border text-center transition-all duration-200',
            form.emotion === emotion.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400',
          ]"
        >
          <div class="text-2xl mb-1">{{ emotion.emoji }}</div>
          <div class="text-sm font-medium">{{ emotion.label }}</div>
        </button>
      </div>
      <input
        v-if="form.emotion && !EMOTION_OPTIONS.find((e) => e.value === form.emotion)"
        v-model="form.emotion"
        type="text"
        placeholder="Custom emotion"
        class="form-input mt-3"
      />
    </div>

    <!-- Challenges Field -->
    <div class="mb-6">
      <label for="challenges" class="block text-sm font-medium text-gray-700 mb-2">
        What challenges did you face?
      </label>
      <textarea
        id="challenges"
        v-model="form.challenges"
        rows="3"
        placeholder="Today's challenges..."
        class="form-textarea"
      ></textarea>
    </div>

    <!-- Learning Field -->
    <div class="mb-6">
      <label for="learning" class="block text-sm font-medium text-gray-700 mb-2">
        What did you learn today?
      </label>
      <textarea
        id="learning"
        v-model="form.learning"
        rows="3"
        placeholder="I learned that..."
        class="form-textarea"
      ></textarea>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 justify-end">
      <button type="button" @click="$emit('cancel')" class="btn-secondary" :disabled="loading">
        Cancel
      </button>
      <button
        type="submit"
        class="btn-primary"
        :disabled="loading || !form.gratitude.trim() || !form.emotion"
      >
        <LoadingSpinner v-if="loading" class="w-4 h-4 mr-2" />
        {{ isEditing ? 'Update Entry' : 'Save Entry' }}
      </button>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    >
      {{ error }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { EMOTION_OPTIONS } from '@/types/journal'
import type { JournalEntry } from '@/types/journal'
import { useJournalStore } from '@/stores/journal'
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  entry?: JournalEntry
}

interface Emits {
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const journalStore = useJournalStore()
const loading = ref(false)
const error = ref<string | null>(null)

const today = format(new Date(), 'yyyy-MM-dd')

const form = reactive({
  date: today,
  gratitude: '',
  emotion: '',
  challenges: '',
  learning: '',
})

const isEditing = computed(() => !!props.entry?.id)

onMounted(() => {
  if (props.entry) {
    Object.assign(form, {
      date: props.entry.date,
      gratitude: props.entry.gratitude,
      emotion: props.entry.emotion,
      challenges: props.entry.challenges,
      learning: props.entry.learning,
    })
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = null

  try {
    if (isEditing.value && props.entry?.id) {
      await journalStore.updateEntry(props.entry.id, { ...form })
    } else {
      await journalStore.addEntry({ ...form })
    }

    emit('success')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>
