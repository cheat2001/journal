<template>
  <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Welcome Section -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
          <span class="text-2xl">👋</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
          Welcome back, {{ authStore.userDisplayName }}!
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Ready to reflect on your day and continue your personal growth journey?
        </p>
      </div>

      <!-- Quick Stats -->
      <div
        v-if="journalStore.entries.length > 0"
        class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
          <div class="text-3xl font-bold text-blue-600 mb-2">
            {{ journalStore.entries.length }}
          </div>
          <div class="text-sm font-medium text-gray-600">Total Entries</div>
          <div class="text-xs text-gray-500 mt-1">Keep writing!</div>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ streakDays }}
          </div>
          <div class="text-sm font-medium text-gray-600">Day Streak</div>
          <div class="text-xs text-gray-500 mt-1">{{ streakDays > 0 ? 'Amazing!' : 'Start today!' }}</div>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
          <div class="text-3xl mb-2">{{ mostCommonEmotionEmoji }}</div>
          <div class="text-sm font-medium text-gray-600">Most Common Feeling</div>
          <div class="text-xs text-gray-500 mt-1">Your mood pattern</div>
        </div>
      </div>

      <!-- Action Section -->
      <div class="mb-12">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-lg">
          <div class="flex flex-col lg:flex-row gap-6 items-center">
            <!-- New Entry Button -->
            <button 
              @click="showNewEntryForm = true" 
              class="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
            >
              <PlusIcon class="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              <span class="text-lg">Create New Entry</span>
            </button>

            <!-- Divider -->
            <div class="hidden lg:block w-px h-12 bg-gray-200"></div>
            <div class="lg:hidden w-full h-px bg-gray-200"></div>

            <!-- Search Section -->
            <div class="flex-1 w-full">
              <div class="flex gap-3">
                <div class="flex-1">
                  <input
                    v-model="searchDate"
                    type="date"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    :max="today"
                    placeholder="Search by date"
                  />
                </div>
                <button 
                  @click="searchByDate" 
                  :disabled="!searchDate"
                  class="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 p-3 rounded-xl transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed"
                >
                  <MagnifyingGlassIcon class="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Entry Form Modal -->
      <div
        v-if="showNewEntryForm || editingEntry"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
        @click.self="closeForm"
      >
        <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl slide-up">
          <div class="p-8">
            <JournalEntryForm
              :entry="editingEntry || undefined"
              @success="handleFormSuccess"
              @cancel="closeForm"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="journalStore.loading && journalStore.entries.length === 0"
        class="text-center py-20"
      >
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <div class="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Loading your journal...</h3>
        <p class="text-gray-600">Fetching your thoughts and reflections</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="journalStore.entries.length === 0" class="text-center py-20">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 max-w-md mx-auto">
          <div class="text-6xl mb-6">📖</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Start Your Journal Journey</h3>
          <p class="text-gray-600 mb-8 text-lg leading-relaxed">
            Record your daily reflections, track your emotions, and celebrate your personal growth. 
            Every great journey begins with a single step.
          </p>
          <button 
            @click="showNewEntryForm = true" 
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center"
          >
            <PlusIcon class="w-6 h-6 mr-3" />
            Create Your First Entry
          </button>
        </div>
      </div>

      <!-- Entries List -->
      <div v-else class="space-y-8">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-900">Your Journal Entries</h3>
          <div class="text-sm text-gray-500">
            {{ journalStore.entries.length }} {{ journalStore.entries.length === 1 ? 'entry' : 'entries' }} total
          </div>
        </div>
        
        <div class="grid gap-6">
          <div 
            v-for="(entry, index) in displayedEntries" 
            :key="entry.id"
            class="fade-in"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <JournalEntryCard :entry="entry" @edit="handleEdit" @delete="handleDelete" />
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreEntries" class="text-center pt-8">
          <button 
            @click="loadMoreEntries" 
            class="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            Load More Entries
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="journalStore.error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div class="text-red-600 mb-3">
          <svg class="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <h4 class="font-semibold text-red-900 mb-2">Something went wrong</h4>
        <p class="text-red-700 text-sm mb-4">{{ journalStore.error }}</p>
        <button 
          @click="journalStore.clearError" 
          class="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Dismiss
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deletingEntryId"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl slide-up">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Delete Entry</h3>
          <p class="text-gray-600">
            Are you sure you want to delete this journal entry? This action cannot be undone and your reflection will be permanently lost.
          </p>
        </div>

        <div class="flex gap-3">
          <button 
            @click="deletingEntryId = null" 
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Delete Entry
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format, subDays } from 'date-fns'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useJournalStore } from '@/stores/journal'
import { useAuthStore } from '@/stores/auth'
import type { JournalEntry } from '@/types/journal'
import { EMOTION_OPTIONS } from '@/types/journal'
import JournalEntryForm from '@/components/JournalEntryForm.vue'
import JournalEntryCard from '@/components/JournalEntryCard.vue'

const journalStore = useJournalStore()
const authStore = useAuthStore()

const showNewEntryForm = ref(false)
const editingEntry = ref<JournalEntry | null>(null)
const deletingEntryId = ref<string | null>(null)
const searchDate = ref('')
const entriesPerPage = 10
const currentPage = ref(1)

const today = format(new Date(), 'yyyy-MM-dd')

// Computed properties
const displayedEntries = computed(() => {
  return journalStore.entries.slice(0, currentPage.value * entriesPerPage)
})

const hasMoreEntries = computed(() => {
  return journalStore.entries.length > currentPage.value * entriesPerPage
})

const streakDays = computed(() => {
  if (journalStore.entries.length === 0) return 0

  let streak = 0
  let currentDate = new Date()

  const entriesByDate = journalStore.entriesByDate

  while (streak < 365) {
    // Max streak of 365 days
    const dateString = format(currentDate, 'yyyy-MM-dd')
    if (entriesByDate[dateString]?.length > 0) {
      streak++
      currentDate = subDays(currentDate, 1)
    } else {
      break
    }
  }

  return streak
})

const mostCommonEmotionEmoji = computed(() => {
  if (journalStore.entries.length === 0) return '😐'

  const emotions = journalStore.emotionStats
  const mostCommon = Object.entries(emotions).sort(([, a], [, b]) => b - a)[0]

  if (!mostCommon) return '😐'

  const emotionOption = EMOTION_OPTIONS.find((option) => option.value === mostCommon[0])
  return emotionOption?.emoji || '😐'
})

// Methods
function closeForm() {
  showNewEntryForm.value = false
  editingEntry.value = null
}

function handleFormSuccess() {
  closeForm()
  currentPage.value = 1 // Reset to first page to see new entry
}

function handleEdit(entry: JournalEntry) {
  editingEntry.value = entry
}

function handleDelete(id: string) {
  deletingEntryId.value = id
}

async function confirmDelete() {
  if (deletingEntryId.value) {
    await journalStore.deleteEntry(deletingEntryId.value)
    deletingEntryId.value = null
  }
}

function loadMoreEntries() {
  currentPage.value++
}

async function searchByDate() {
  if (searchDate.value) {
    await journalStore.getEntriesByDate(searchDate.value)
    // You could implement a filtered view here
    // For now, we'll just scroll to the entry if it exists
    const targetEntry = journalStore.entries.find((entry) => entry.date === searchDate.value)
    if (targetEntry) {
      // Scroll to the entry (you'd need to implement this)
      console.log('Found entry for date:', searchDate.value)
    }
  }
}

// Lifecycle
onMounted(() => {
  journalStore.fetchEntries()
})
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
