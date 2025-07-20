<template>
  <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Loading State -->
      <div v-if="journalStore.loading" class="text-center py-16">
        <LoadingSpinner />
        <p class="mt-4 text-gray-600">Loading your journal entries...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="journalStore.error" class="text-center py-16">
        <div class="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
          <div class="text-red-600 text-xl mb-2">📝</div>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Unable to load entries</h3>
          <p class="text-red-700 mb-4">{{ journalStore.error }}</p>
          <button 
            @click="journalStore.refreshEntries"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Welcome Section -->
      <div v-else class="text-center mb-12">
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
        v-if="journalStore.entries.length > 0 && !journalStore.loading"
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

      <!-- Gamification Section -->
      <div 
        v-if="journalStore.entries.length > 0 && !journalStore.loading"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
      >
        <StreakWidget />
        <AchievementWidget />
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
                    class="form-input"
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
      <div v-else-if="!journalStore.loading && journalStore.entries.length > 0" class="space-y-8">
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

    <!-- Footer -->
    <footer class="mt-16 py-8 border-t border-gray-200/50">
      <div class="text-center">
        <div class="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
          <span>Developed with</span>
          <span class="text-red-500">❤️</span>
          <span>by</span>
          <span class="font-semibold text-blue-600">Chansocheat.Sok</span>
          <span>•</span>
          <span>© 2025 Daily Journal</span>
        </div>
        
        <!-- Social Links -->
        <div class="flex items-center justify-center space-x-6 mb-3">
          <a 
            href="https://github.com/cheat2001/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm font-medium">GitHub</span>
          </a>
          
          <a 
            href="https://www.facebook.com/sok.chansocheat/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm font-medium">Facebook</span>
          </a>
          
          <a 
            href="https://www.linkedin.com/in/chansocheatsok/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center space-x-2 text-blue-700 hover:text-blue-900 transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm font-medium">LinkedIn</span>
          </a>
        </div>
        
        <p class="text-xs text-gray-400">
          Building tools for reflection and personal growth
        </p>
      </div>
    </footer>

    <!-- Badge Celebration Component -->
    <BadgeCelebration />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format, subDays } from 'date-fns'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useJournalStore } from '@/stores/journal'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'
import type { JournalEntry } from '@/types/journal'
import { EMOTION_OPTIONS } from '@/types/journal'
import JournalEntryForm from '@/components/JournalEntryForm.vue'
import JournalEntryCard from '@/components/JournalEntryCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import StreakWidget from '@/components/StreakWidget.vue'
import AchievementWidget from '@/components/AchievementWidget.vue'
import BadgeCelebration from '@/components/BadgeCelebration.vue'

const journalStore = useJournalStore()
const authStore = useAuthStore()
const gamificationStore = useGamificationStore()

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
onMounted(async () => {
  // Journal entries will be fetched automatically when user is authenticated
  // via the watcher in the journal store
  
  // Initialize gamification data
  if (authStore.isAuthenticated) {
    await gamificationStore.fetchUserStats()
  }
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
