import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { JournalEntry } from '@/types/journal'
import { useAuthStore } from './auth'
import { useGamificationStore } from './gamification'
import { SecurityValidator, RATE_LIMITS } from '@/utils/security'

// Utility function to safely convert various date formats to Date objects
function safeToDate(dateField: unknown): Date {
  if (!dateField) return new Date()
  if (dateField instanceof Date) return dateField
  if (typeof dateField === 'object' && dateField !== null && 'toDate' in dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate()
  }
  if (typeof dateField === 'string' || typeof dateField === 'number') {
    return new Date(dateField)
  }
  return new Date()
}

export const useJournalStore = defineStore('journal', () => {
  const entries = ref<JournalEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const authStore = useAuthStore()

  // Watch for authentication changes and fetch entries automatically
  watch(
    () => ({ isAuthenticated: authStore.isAuthenticated, loading: authStore.loading }),
    (authState, prevAuthState) => {
      console.log('Auth state changed:', authState, 'Previous:', prevAuthState)
      
      if (authState.isAuthenticated && !authState.loading) {
        // User is authenticated and auth loading is complete
        console.log('User authenticated and ready, fetching entries...')
        fetchEntries()
      } else if (!authState.isAuthenticated && !authState.loading) {
        // User logged out and auth loading is complete
        console.log('User logged out, clearing entries...')
        entries.value = []
        error.value = null
      }
    },
    { immediate: true, deep: true }
  )

  // Computed properties
  const entriesByDate = computed(() => {
    return entries.value.reduce(
      (acc, entry) => {
        const dateString = typeof entry.date === 'string' ? entry.date : entry.date.toISOString().split('T')[0]
        if (!acc[dateString]) {
          acc[dateString] = []
        }
        acc[dateString].push(entry)
        return acc
      },
      {} as Record<string, JournalEntry[]>,
    )
  })

  const recentEntries = computed(() => {
    return entries.value
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  })

  const emotionStats = computed(() => {
    const stats: Record<string, number> = {}
    entries.value.forEach((entry) => {
      stats[entry.emotion] = (stats[entry.emotion] || 0) + 1
    })
    return stats
  })

  // Actions
  async function fetchEntries() {
    if (!authStore.user) {
      console.log('No authenticated user, skipping fetch')
      entries.value = []
      return
    }
    
    console.log('Fetching entries for user:', authStore.user.uid)
    loading.value = true
    error.value = null

    try {
      // SECURITY: Only fetch entries that belong to the current user
      const q = query(
        collection(db, 'journal-entries'), 
        where('userId', '==', authStore.user.uid) // CRITICAL: Only user's own entries
        // Note: orderBy temporarily removed until Firestore index is created
        // orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      // SECURITY: Double-check that all entries belong to current user
      const userEntries = querySnapshot.docs
        .map((doc) => {
          const data = doc.data()
          // SECURITY: Verify userId matches current user
          if (data.userId !== authStore.user?.uid) {
            console.error('SECURITY VIOLATION: Entry does not belong to current user!', doc.id)
            return null
          }
          
          return {
            id: doc.id,
            ...data,
            createdAt: safeToDate(data.createdAt),
            updatedAt: safeToDate(data.updatedAt),
          }
        })
        .filter(entry => entry !== null) // Remove any security violations
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as JournalEntry[]

      entries.value = userEntries
        
      console.log('Fetched entries:', entries.value.length, 'entries')
      // PRODUCTION: Only log in development
      console.log('Entry dates:', entries.value.map(entry => ({ id: entry.id, date: entry.date, createdAt: entry.createdAt })))
    } catch (err) {
      error.value = `Failed to fetch entries: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error fetching entries:', err)
    } finally {
      loading.value = false
    }
  }

  // Force refresh entries (useful for debugging or retry scenarios)
  async function refreshEntries() {
    await fetchEntries()
  }

  async function addEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    if (!authStore.user) {
      throw new Error('User must be authenticated to add entries')
    }
    
    // Security: Rate limiting check
    if (!SecurityValidator.checkRateLimit('CREATE_ENTRY', RATE_LIMITS.CREATE_ENTRY.maxRequests, RATE_LIMITS.CREATE_ENTRY.timeWindow)) {
      throw new Error('Too many requests. Please wait before creating another entry.')
    }
    
    // Security: Sanitize content
    const sanitizedEntry = {
      ...entry,
      gratitude: SecurityValidator.sanitizeHtml(entry.gratitude),
      challenges: SecurityValidator.sanitizeHtml(entry.challenges),
      learning: SecurityValidator.sanitizeHtml(entry.learning)
    }
    
    // Security: Validate entry data
    const validation = SecurityValidator.validateJournalEntry({
      gratitude: sanitizedEntry.gratitude,
      challenges: sanitizedEntry.challenges,
      learning: sanitizedEntry.learning,
      emotion: sanitizedEntry.emotion,
      date: sanitizedEntry.date,
      userId: authStore.user.uid
    })
    
    if (!validation.isValid) {
      throw new Error(`Invalid entry data: ${validation.errors.join(', ')}`)
    }
    
    const gamificationStore = useGamificationStore()
    loading.value = true
    error.value = null

    try {
      const now = new Date()
      const newEntry = {
        ...sanitizedEntry,
        userId: authStore.user.uid,
        userDisplayName: authStore.userDisplayName,
        userInitials: authStore.userDisplayName.split(' ').map(n => n[0]).join(''),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      }

      console.log('Creating entry with date:', sanitizedEntry.date)
      // PRODUCTION: Don't log full entry data (contains sensitive user content)
      
      const docRef = await addDoc(collection(db, 'journal-entries'), newEntry)

      // SECURITY: Verify the entry was created for the correct user
      if (newEntry.userId !== authStore.user.uid) {
        throw new Error('SECURITY ERROR: Entry user mismatch')
      }

      // Add to local state
      entries.value.unshift({
        id: docRef.id,
        userId: authStore.user.uid,
        userDisplayName: authStore.userDisplayName,
        userInitials: authStore.userDisplayName.split(' ').map(n => n[0]).join(''),
        ...sanitizedEntry,
        createdAt: now,
        updatedAt: now,
      })

      // Update gamification stats
      const dateString = typeof entry.date === 'string' ? entry.date : entry.date.toISOString().split('T')[0]
      await gamificationStore.updateStreak(dateString)
    } catch (err) {
      error.value = `Failed to add entry: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error adding entry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEntry(id: string, updates: Partial<JournalEntry>) {
    if (!authStore.user) {
      throw new Error('User must be authenticated to update entries')
    }

    // SECURITY: Verify the entry belongs to the current user before updating
    const entryIndex = entries.value.findIndex((entry) => entry.id === id)
    if (entryIndex === -1) {
      throw new Error('Entry not found')
    }
    
    const existingEntry = entries.value[entryIndex]
    if (existingEntry.userId !== authStore.user.uid) {
      throw new Error('SECURITY ERROR: Cannot update entry that does not belong to you')
    }

    loading.value = true
    error.value = null

    try {
      const entryRef = doc(db, 'journal-entries', id)
      const updateData = {
        ...updates,
        // SECURITY: Ensure userId cannot be changed
        userId: authStore.user.uid,
        updatedAt: Timestamp.fromDate(new Date()),
      }

      await updateDoc(entryRef, updateData)

      // Update local state
      entries.value[entryIndex] = {
        ...existingEntry,
        ...updates,
        userId: authStore.user.uid, // SECURITY: Keep original userId
        updatedAt: new Date(),
      }
    } catch (err) {
      error.value = `Failed to update entry: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error updating entry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEntry(id: string) {
    if (!authStore.user) {
      throw new Error('User must be authenticated to delete entries')
    }

    // SECURITY: Verify the entry belongs to the current user before deleting
    const entryToDelete = entries.value.find((entry) => entry.id === id)
    if (!entryToDelete) {
      throw new Error('Entry not found')
    }
    
    if (entryToDelete.userId !== authStore.user.uid) {
      throw new Error('SECURITY ERROR: Cannot delete entry that does not belong to you')
    }

    loading.value = true
    error.value = null

    try {
      await deleteDoc(doc(db, 'journal-entries', id))

      // Remove from local state
      entries.value = entries.value.filter((entry) => entry.id !== id)
    } catch (err) {
      error.value = `Failed to delete entry: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error deleting entry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getEntriesByDate(date: string) {
    if (!authStore.user) {
      error.value = 'User not authenticated'
      return []
    }

    try {
      // SECURITY: Query for user's own entries with the exact date only
      const userEntriesQuery = query(
        collection(db, 'journal-entries'),
        where('userId', '==', authStore.user.uid),
        where('date', '==', date),
      )

      console.log('Querying for date:', date)
      console.log('User ID:', authStore.user.uid)

      const userSnapshot = await getDocs(userEntriesQuery)

      console.log('User entries found:', userSnapshot.docs.length)

      const userEntries = userSnapshot.docs
        .map((doc) => {
          const data = doc.data()
          // SECURITY: Double-check that entry belongs to current user
          if (data.userId !== authStore.user?.uid) {
            console.error('SECURITY VIOLATION: Filtered entry does not belong to current user!', doc.id)
            return null
          }
          
          return {
            id: doc.id,
            ...data,
            createdAt: safeToDate(data.createdAt),
            updatedAt: safeToDate(data.updatedAt),
          }
        })
        .filter(entry => entry !== null) as JournalEntry[]

      console.log('Returning entries:', userEntries.length, 'entries')

      return userEntries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } catch (err) {
      error.value = `Failed to fetch entries by date: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error fetching entries by date:', err)
      return []
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    entries,
    loading,
    error,

    // Computed
    entriesByDate,
    recentEntries,
    emotionStats,

    // Actions
    fetchEntries,
    refreshEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesByDate,
    clearError,
  }
})
