import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import { useAuthStore } from './auth'

export const useJournalStore = defineStore('journal', () => {
  const entries = ref<JournalEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const authStore = useAuthStore()

  // Computed properties
  const entriesByDate = computed(() => {
    return entries.value.reduce(
      (acc, entry) => {
        const date = entry.date
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(entry)
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
      entries.value = []
      return
    }
    
    loading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'journal-entries'), 
        where('userId', '==', authStore.user.uid)
        // Note: orderBy temporarily removed until Firestore index is created
        // orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      entries.value = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as JournalEntry[]
    } catch (err) {
      error.value = `Failed to fetch entries: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error fetching entries:', err)
    } finally {
      loading.value = false
    }
  }

  async function addEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    if (!authStore.user) {
      throw new Error('User must be authenticated to add entries')
    }
    
    loading.value = true
    error.value = null

    try {
      const now = new Date()
      const newEntry = {
        ...entry,
        userId: authStore.user.uid,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      }

      const docRef = await addDoc(collection(db, 'journal-entries'), newEntry)

      // Add to local state
      entries.value.unshift({
        id: docRef.id,
        userId: authStore.user.uid,
        ...entry,
        createdAt: now,
        updatedAt: now,
      })
    } catch (err) {
      error.value = `Failed to add entry: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error adding entry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEntry(id: string, updates: Partial<JournalEntry>) {
    loading.value = true
    error.value = null

    try {
      const entryRef = doc(db, 'journal-entries', id)
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      }

      await updateDoc(entryRef, updateData)

      // Update local state
      const index = entries.value.findIndex((entry) => entry.id === id)
      if (index !== -1) {
        entries.value[index] = {
          ...entries.value[index],
          ...updates,
          updatedAt: new Date(),
        }
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
    const targetDate = parseISO(date)
    const startDate = startOfDay(targetDate)
    const endDate = endOfDay(targetDate)

    try {
      const q = query(
        collection(db, 'journal-entries'),
        where('date', '>=', format(startDate, 'yyyy-MM-dd')),
        where('date', '<=', format(endDate, 'yyyy-MM-dd')),
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as JournalEntry[]
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
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesByDate,
    clearError,
  }
})
