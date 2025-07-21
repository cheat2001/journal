<template>
  <div class="bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] hover:border-blue-200">
    <div class="flex justify-between items-start mb-6">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
            <span class="text-2xl">{{ getEmotionEmoji(entry.emotion) }}</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
              {{ formatDate(entry.date) }}
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 capitalize font-medium bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 rounded-full border border-gray-200">
                {{ entry.emotion }}
              </span>
              <span class="text-xs text-gray-400">
                {{ formatTime(entry.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <button
          @click="$emit('edit', entry)"
          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
          title="Edit entry"
        >
          <PencilIcon class="w-5 h-5" />
        </button>
        <button
          @click="entry.id && $emit('delete', entry.id)"
          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
          title="Delete entry"
          :disabled="!entry.id"
        >
          <TrashIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Gratitude -->
      <div v-if="entry.gratitude" class="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-xl p-4">
        <h4 class="text-sm font-bold text-gray-800 mb-2 flex items-center">
          <div class="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center mr-2">
            <HeartIcon class="w-4 h-4 text-pink-600" />
          </div>
          Grateful for
        </h4>
        <p class="text-gray-900 leading-relaxed">{{ entry.gratitude }}</p>
      </div>

      <!-- Challenges -->
      <div v-if="entry.challenges" class="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4">
        <h4 class="text-sm font-bold text-gray-800 mb-2 flex items-center">
          <div class="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
            <ExclamationTriangleIcon class="w-4 h-4 text-orange-600" />
          </div>
          Challenges
        </h4>
        <p class="text-gray-900 leading-relaxed">{{ entry.challenges }}</p>
      </div>

      <!-- Learning -->
      <div v-if="entry.learning" class="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100 rounded-xl p-4">
        <h4 class="text-sm font-bold text-gray-800 mb-2 flex items-center">
          <div class="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-2">
            <LightBulbIcon class="w-4 h-4 text-yellow-600" />
          </div>
          Learning
        </h4>
        <p class="text-gray-900 leading-relaxed">{{ entry.learning }}</p>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Created {{ formatDateTime(entry.createdAt) }}</span>
        <span v-if="entry.updatedAt && entry.updatedAt.getTime() !== entry.createdAt.getTime()" class="text-blue-600">
          Updated {{ formatDateTime(entry.updatedAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import {
  PencilIcon,
  TrashIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from '@heroicons/vue/24/outline'
import type { JournalEntry } from '@/types/journal'
import { EMOTION_OPTIONS } from '@/types/journal'

interface Props {
  entry: JournalEntry
}

interface Emits {
  (e: 'edit', entry: JournalEntry): void
  (e: 'delete', id: string): void
}

defineProps<Props>()
defineEmits<Emits>()

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return format(date, 'EEEE, MMMM d, yyyy')
}

function formatTime(date: Date) {
  return format(date, 'h:mm a')
}

function formatDateTime(date: Date) {
  return format(date, "MMM d, yyyy 'at' h:mm a")
}

function getEmotionEmoji(emotion: string) {
  const emotionOption = EMOTION_OPTIONS.find((option) => option.value === emotion)
  return emotionOption?.emoji || '😐'
}
</script>
