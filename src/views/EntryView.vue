<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Entry Not Found -->
      <div v-else-if="!entry" class="text-center py-16">
        <div class="mb-6">
          <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Entry Not Found</h2>
        <p class="text-gray-600 mb-6">This entry doesn't exist or is private.</p>
        <router-link to="/feed" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Browse Community Feed
        </router-link>
      </div>

      <!-- Private Entry -->
      <div v-else-if="!entry.isPublic" class="text-center py-16">
        <div class="mb-6">
          <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Private Entry</h2>
        <p class="text-gray-600 mb-6">This entry is private and can only be viewed by the author.</p>
        <router-link to="/feed" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Browse Community Feed
        </router-link>
      </div>

      <!-- Entry Content -->
      <div v-else class="space-y-8">
        <!-- Entry Header -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
          <!-- Author Info -->
          <div class="flex items-center space-x-4 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
              {{ getAuthorInitials(entry.authorName || entry.userDisplayName || 'Unknown') }}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ entry.authorName || entry.userDisplayName || 'Unknown User' }}</h3>
              <p class="text-sm text-gray-500">{{ formatDate(entry.date) }}</p>
            </div>
            <div class="ml-auto">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                </svg>
                Public
              </span>
            </div>
          </div>

          <!-- Entry Title -->
          <h1 class="text-3xl font-bold text-gray-900 mb-6">{{ entry.title || `Journal Entry - ${formatDate(entry.date)}` }}</h1>

          <!-- Mood Display -->
          <div v-if="entry.mood" class="flex items-center space-x-3 mb-6 p-4 bg-gray-50 rounded-xl">
            <div class="text-2xl">{{ entry.mood.emoji }}</div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ entry.mood.label }}</p>
              <p class="text-xs text-gray-500">Mood when writing</p>
            </div>
          </div>

          <!-- Entry Content -->
          <div class="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
            {{ entry.content || entry.gratitude || 'No content available' }}
          </div>

          <!-- Entry Stats -->
          <div class="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <div class="flex items-center space-x-6">
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>{{ entry.views || 0 }} views</span>
              </div>
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ getTotalReactions(entry) }} reactions</span>
              </div>
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span>{{ getCommentCount(entry) }} comments</span>
              </div>
            </div>
            <div class="text-xs text-gray-400">
              {{ formatTimeAgo(entry.createdAt) }}
            </div>
          </div>
        </div>

        <!-- Social Interaction Section -->
        <SocialInteractions
          :entry="entry"
          :show-full-comments="true"
          class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100"
        />

        <!-- Related Entries -->
        <div v-if="relatedEntries.length > 0" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 class="text-xl font-bold text-gray-900 mb-6">More from {{ entry.authorName || entry.userDisplayName || 'this user' }}</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <router-link
              v-for="relatedEntry in relatedEntries"
              :key="relatedEntry.id"
              :to="`/entry/${relatedEntry.id}`"
              class="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <h4 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ relatedEntry.title || `Entry from ${formatDate(relatedEntry.date)}` }}</h4>
              <p class="text-sm text-gray-600 line-clamp-3 mb-3">{{ relatedEntry.content || relatedEntry.gratitude || 'No preview available' }}</p>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>{{ formatDate(relatedEntry.date) }}</span>
                <div class="flex items-center space-x-3">
                  <span>{{ getTotalReactions(relatedEntry) }} reactions</span>
                  <span>{{ getCommentCount(relatedEntry) }} comments</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, updateDoc, increment } from 'firebase/firestore'
import { format } from 'date-fns'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'
import { useSocialStore } from '@/stores/social'
import SocialInteractions from '@/components/SocialInteractions.vue'
import type { JournalEntry } from '@/types/journal'

const route = useRoute()
const authStore = useAuthStore()
const socialStore = useSocialStore()

const entry = ref<JournalEntry | null>(null)
const relatedEntries = ref<JournalEntry[]>([])
const loading = ref(true)

onMounted(async () => {
  // Ensure auth is initialized first
  if (authStore.loading) {
    await authStore.initializeAuthListener()
  }
  
  await loadEntry()
  await loadRelatedEntries()
  await incrementViewCount()
})

async function loadEntry() {
  try {
    const entryId = route.params.id as string
    
    // Try to load the entry document
    const entryDoc = await getDoc(doc(db, 'journal-entries', entryId))
    
    if (entryDoc.exists()) {
      const data = entryDoc.data()
      
      // Check if entry is public or user is the owner
      const isOwner = authStore.user?.uid === data.userId
      if (!data.isPublic && !isOwner) {
        // Entry exists but is private and user is not the owner
        entry.value = null
        return
      }
      
      entry.value = {
        id: entryDoc.id,
        ...data,
        authorName: data.userDisplayName || data.authorName || 'Unknown User',
        title: data.title || `Journal Entry`,
        content: data.content || data.gratitude || '',
        date: data.date?.toDate?.() || new Date(data.date),
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        views: data.views || 0
      } as JournalEntry
      
      // Load social interactions for this entry
      if (entry.value.isPublic) {
        await socialStore.loadEntryInteractions(entryId)
      }
    } else {
      entry.value = null
    }
  } catch (error) {
    console.error('Error loading entry:', error)
    entry.value = null
  } finally {
    loading.value = false
  }
}

async function loadRelatedEntries() {
  if (!entry.value || !entry.value.isPublic) return

  try {
    // Get other public entries from the same author
    const relatedQuery = query(
      collection(db, 'journal-entries'),
      where('userId', '==', entry.value.userId),
      where('isPublic', '==', true),
      limit(4)
    )
    
    const relatedSnapshot = await getDocs(relatedQuery)
    relatedEntries.value = relatedSnapshot.docs
      .filter(doc => doc.id !== entry.value?.id) // Exclude current entry
      .slice(0, 3) // Only show 3 related entries
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(doc.data().date),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      })) as JournalEntry[]
  } catch (error) {
    console.error('Error loading related entries:', error)
    relatedEntries.value = []
  }
}

async function incrementViewCount() {
  if (!entry.value || !entry.value.isPublic || !authStore.isAuthenticated) return

  try {
    // Only increment view count for public entries when user is authenticated
    await updateDoc(doc(db, 'journal-entries', entry.value.id), {
      views: increment(1)
    })
    
    // Update local state
    if (entry.value) {
      entry.value.views = (entry.value.views || 0) + 1
    }
  } catch (error) {
    console.error('Error incrementing view count:', error)
    // Don't fail the whole page if view count update fails
  }
}

function formatDate(dateInput: string | Date) {
  if (!dateInput) return 'Unknown date'
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return 'Invalid date'
    return format(date, 'EEEE, MMMM d, yyyy')
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Unknown date'
  }
}

function formatTimeAgo(date: Date): string {
  if (!date || isNaN(date.getTime())) return 'Unknown time'
  
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

function getAuthorInitials(name: string): string {
  if (!name || typeof name !== 'string') return 'U'
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getTotalReactions(entry: JournalEntry): number {
  return socialStore.getTotalReactions(entry)
}

function getCommentCount(entry: JournalEntry): number {
  return socialStore.getCommentCount(entry)
}
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
</style>
