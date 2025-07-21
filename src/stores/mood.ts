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
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { MoodStory, MoodReaction } from '@/types/journal'
import { useAuthStore } from './auth'
import { format } from 'date-fns'

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

export const useMoodStore = defineStore('mood', () => {
  const authStore = useAuthStore()
  
  const moodStories = ref<MoodStory[]>([])
  const todaysMood = ref<MoodStory | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const today = format(new Date(), 'yyyy-MM-dd')
  
  // Computed properties
  const publicMoodStories = computed(() => 
    moodStories.value.filter(story => story.isPublic && story.date === today)
  )
  
  const myMoodHistory = computed(() =>
    moodStories.value.filter(story => story.userId === authStore.user?.uid)
  )
  
  // Watch for authentication changes
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        fetchTodaysMood()
        fetchPublicMoodStories()
      } else {
        // Clear data when user logs out
        moodStories.value = []
        todaysMood.value = null
      }
    },
    { immediate: true }
  )
  
  // Set or update today's mood
  async function setTodaysMood(emotion: string, emoji: string, customMessage?: string, isPublic = true) {
    if (!authStore.user) {
      error.value = 'User not authenticated'
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const moodData = {
        userId: authStore.user.uid,
        userName: authStore.userDisplayName || 'Anonymous',
        userInitials: authStore.userInitials || '??',
        emotion,
        emoji,
        customMessage: customMessage || '',
        isPublic,
        date: today,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        reactions: [],
        totalReactions: 0,
      }
      
      if (todaysMood.value?.id) {
        // Update existing mood
        const moodRef = doc(db, 'mood-stories', todaysMood.value.id)
        await updateDoc(moodRef, {
          ...moodData,
          updatedAt: Timestamp.now(),
        })
        
        // Update local state
        todaysMood.value = {
          ...todaysMood.value,
          ...moodData,
          createdAt: safeToDate(moodData.createdAt),
          updatedAt: safeToDate(moodData.updatedAt),
        }
        
        // Update in moodStories array
        const index = moodStories.value.findIndex(story => story.id === todaysMood.value?.id)
        if (index !== -1) {
          moodStories.value[index] = todaysMood.value
        }
      } else {
        // Create new mood
        const docRef = await addDoc(collection(db, 'mood-stories'), moodData)
        
        const newMood: MoodStory = {
          id: docRef.id,
          ...moodData,
          createdAt: safeToDate(moodData.createdAt),
          updatedAt: safeToDate(moodData.updatedAt),
        }
        
        todaysMood.value = newMood
        moodStories.value.unshift(newMood)
      }
      
      console.log('Mood set successfully:', { emotion, emoji, isPublic })
    } catch (err) {
      error.value = `Failed to set mood: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error setting mood:', err)
    } finally {
      loading.value = false
    }
  }
  
  // Fetch today's mood for current user
  async function fetchTodaysMood() {
    if (!authStore.user) return
    
    try {
      const q = query(
        collection(db, 'mood-stories'),
        where('userId', '==', authStore.user.uid),
        where('date', '==', today)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        
        todaysMood.value = {
          id: doc.id,
          ...data,
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
        } as MoodStory
      } else {
        todaysMood.value = null
      }
    } catch (err) {
      console.error('Error fetching today\'s mood:', err)
    }
  }
  
  // Fetch public mood stories for today
  async function fetchPublicMoodStories() {
    if (!authStore.user) return
    
    loading.value = true
    
    try {
      // Simple query without orderBy to avoid index issues
      const q = query(
        collection(db, 'mood-stories'),
        where('isPublic', '==', true),
        where('date', '==', today),
        limit(50) // Limit to recent 50 stories
      )
      
      const querySnapshot = await getDocs(q)
      
      const stories = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
        }
      }) as MoodStory[]
      
      // Sort manually by creation time (newest first)
      stories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      // Merge with existing stories, avoiding duplicates
      const existingIds = new Set(moodStories.value.map(story => story.id))
      const newStories = stories.filter(story => !existingIds.has(story.id))
      
      moodStories.value = [...newStories, ...moodStories.value]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      console.log('Fetched public mood stories:', stories.length)
    } catch (err) {
      error.value = `Failed to fetch mood stories: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error fetching mood stories:', err)
    } finally {
      loading.value = false
    }
  }
  
  // React to someone's mood story
  async function reactToMoodStory(moodId: string, reactionType: string, reactionEmoji: string) {
    if (!authStore.user) {
      error.value = 'User not authenticated'
      return
    }
    
    try {
      // Check if user already reacted
      const story = moodStories.value.find(s => s.id === moodId)
      if (!story) return
      
      const existingReaction = story.reactions?.find(r => r.userId === authStore.user?.uid)
      
      if (existingReaction) {
        // Update existing reaction
        // For simplicity, we'll remove and add new reaction
        await removeReactionFromMood(moodId, existingReaction.id)
      }
      
      // Add new reaction
      const reactionData = {
        userId: authStore.user.uid,
        userName: authStore.userDisplayName || 'Anonymous',
        type: reactionType,
        emoji: reactionEmoji,
        createdAt: Timestamp.now(),
      }
      
      const reactionDocRef = await addDoc(collection(db, 'mood-reactions'), {
        ...reactionData,
        moodStoryId: moodId,
      })
      
      const newReaction: MoodReaction = {
        id: reactionDocRef.id,
        ...reactionData,
        createdAt: safeToDate(reactionData.createdAt),
      }
      
      // Update local state
      const storyIndex = moodStories.value.findIndex(s => s.id === moodId)
      if (storyIndex !== -1) {
        const updatedStory = { ...moodStories.value[storyIndex] }
        updatedStory.reactions = [...(updatedStory.reactions || []), newReaction]
        updatedStory.totalReactions = updatedStory.reactions.length
        moodStories.value[storyIndex] = updatedStory
      }
      
      console.log('Reaction added:', reactionType)
    } catch (err) {
      error.value = `Failed to react: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error reacting to mood:', err)
    }
  }
  
  // Remove reaction from mood story
  async function removeReactionFromMood(moodId: string, reactionId: string) {
    try {
      await deleteDoc(doc(db, 'mood-reactions', reactionId))
      
      // Update local state
      const storyIndex = moodStories.value.findIndex(s => s.id === moodId)
      if (storyIndex !== -1) {
        const updatedStory = { ...moodStories.value[storyIndex] }
        updatedStory.reactions = updatedStory.reactions?.filter(r => r.id !== reactionId) || []
        updatedStory.totalReactions = updatedStory.reactions.length
        moodStories.value[storyIndex] = updatedStory
      }
    } catch (err) {
      console.error('Error removing reaction:', err)
    }
  }
  
  // Delete today's mood
  async function deleteTodaysMood() {
    if (!todaysMood.value?.id) return
    
    try {
      await deleteDoc(doc(db, 'mood-stories', todaysMood.value.id))
      
      // Remove from local state
      moodStories.value = moodStories.value.filter(story => story.id !== todaysMood.value?.id)
      todaysMood.value = null
      
      console.log('Mood deleted successfully')
    } catch (err) {
      error.value = `Failed to delete mood: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error deleting mood:', err)
    }
  }
  
  // Refresh all data
  async function refreshMoodData() {
    await Promise.all([
      fetchTodaysMood(),
      fetchPublicMoodStories()
    ])
  }
  
  return {
    // State
    moodStories,
    todaysMood,
    loading,
    error,
    
    // Computed
    publicMoodStories,
    myMoodHistory,
    
    // Actions
    setTodaysMood,
    fetchTodaysMood,
    fetchPublicMoodStories,
    reactToMoodStory,
    removeReactionFromMood,
    deleteTodaysMood,
    refreshMoodData,
  }
})
