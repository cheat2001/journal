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
import { useNotificationStore } from './notification'
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
  const notificationStore = useNotificationStore()
  
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
  
  // Fetch public mood stories for today and recent days
  async function fetchPublicMoodStories(daysBack: number = 0) {
    if (!authStore.user) {
      console.log('❌ Cannot fetch mood stories: user not authenticated')
      return
    }
    
    loading.value = true
    
    try {
      const allStories: MoodStory[] = []
      
      // Fetch stories day by day to avoid composite index requirement
      for (let i = 0; i <= daysBack; i++) {
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() - i)
        const dateStr = format(targetDate, 'yyyy-MM-dd')
        
        console.log(`🔄 Fetching mood stories for ${dateStr}`)
        
        const q = query(
          collection(db, 'mood-stories'),
          where('isPublic', '==', true),
          where('date', '==', dateStr),
          limit(50)
        )
        
        const querySnapshot = await getDocs(q)
        console.log(`📝 Found ${querySnapshot.size} stories for ${dateStr}`)
        
        const dayStories = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userInitials: data.userInitials,
            userAvatar: data.userAvatar,
            emotion: data.emotion,
            emoji: data.emoji,
            customMessage: data.customMessage,
            isPublic: data.isPublic,
            date: data.date,
            createdAt: safeToDate(data.createdAt),
            updatedAt: safeToDate(data.updatedAt),
            reactions: [], // Initialize empty reactions array
            totalReactions: 0, // Initialize total reactions
          } as MoodStory
        })

        allStories.push(...dayStories)
      }

      // Fetch reactions for all stories
      console.log('🔄 Fetching reactions for stories...', {
        authUser: authStore.user?.uid,
        storiesCount: allStories.length,
        timestamp: new Date().toISOString()
      })
      await fetchReactionsForStories(allStories)

      // Sort manually by creation time (newest first)
      allStories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      // Merge with existing stories, avoiding duplicates
      const existingIds = new Set(moodStories.value.map(story => story.id))
      const newStories = allStories.filter(story => !existingIds.has(story.id))

      // Update the moodStories array
      if (newStories.length > 0) {
        moodStories.value = [...newStories, ...moodStories.value]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        console.log(`✅ Added ${newStories.length} new stories to the list`)
      } else {
        // If no new stories, just update existing ones with fresh reaction data
        allStories.forEach(freshStory => {
          const existingIndex = moodStories.value.findIndex(s => s.id === freshStory.id)
          if (existingIndex !== -1) {
            moodStories.value[existingIndex] = freshStory
          }
        })
        console.log('✅ Updated existing stories with fresh reaction data')
      }

      console.log(`✅ Completed fetching mood stories. Total in store: ${moodStories.value.length}`)
    } catch (err) {
      error.value = `Failed to fetch mood stories: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('❌ Error fetching mood stories:', err)
    } finally {
      loading.value = false
    }
  }
  
  // Helper function to fetch reactions for multiple stories
  async function fetchReactionsForStories(stories: MoodStory[]) {
    try {
      const storyIds = stories.map(story => story.id).filter(Boolean) as string[]
      console.log('🔍 Starting fetchReactionsForStories:', {
        storyIds,
        authUser: authStore.user?.uid,
        authState: !!authStore.user,
        timestamp: new Date().toISOString()
      })
      
      if (storyIds.length === 0) {
        console.log('No story IDs to fetch reactions for')
        return
      }

      // Firestore 'in' queries are limited to 10 items, so we need to batch them
      const batchSize = 10
      const reactionsByStory: { [storyId: string]: MoodReaction[] } = {}
      
      for (let i = 0; i < storyIds.length; i += batchSize) {
        const batch = storyIds.slice(i, i + batchSize)
        console.log(`Fetching reactions batch ${Math.floor(i / batchSize) + 1}:`, batch)
        
        const reactionsQuery = query(
          collection(db, 'mood-reactions'),
          where('moodStoryId', 'in', batch)
        )
        
        try {
          const reactionsSnapshot = await getDocs(reactionsQuery)
          console.log(`Found ${reactionsSnapshot.size} reactions in batch`)
          
          // Debug authentication state during fetch
          if (reactionsSnapshot.empty) {
            console.log('No reactions found - checking auth state:', {
              isAuthenticated: !!authStore.user,
              userId: authStore.user?.uid,
              batch: batch
            })
          }
          
          reactionsSnapshot.docs.forEach(doc => {
            const data = doc.data()
            const reaction: MoodReaction = {
              id: doc.id,
              userId: data.userId,
              userName: data.userName,
              type: data.type,
              emoji: data.emoji,
              createdAt: safeToDate(data.createdAt),
            }
            
            const storyId = data.moodStoryId
            if (!reactionsByStory[storyId]) {
              reactionsByStory[storyId] = []
            }
            reactionsByStory[storyId].push(reaction)
          })
        } catch (batchError) {
          console.error('Permission error fetching reactions batch:', batchError)
          console.log('Auth state during error:', {
            isAuthenticated: !!authStore.user,
            userId: authStore.user?.uid,
            batch: batch
          })
        }
      }
      
      // Update stories with their reactions
      let totalReactionsFound = 0
      stories.forEach(story => {
        if (story.id) {
          const reactions = reactionsByStory[story.id] || []
          story.reactions = reactions
          story.totalReactions = reactions.length
          totalReactionsFound += reactions.length
        }
      })
      
      console.log(`✅ Fetched reactions: ${totalReactionsFound} total reactions for ${Object.keys(reactionsByStory).length} stories`)
    } catch (err) {
      console.error('❌ Error fetching reactions:', err)
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
      console.log('🔍 Checking existing reaction:', {
        existingReaction,
        userId: authStore.user?.uid,
        storyReactions: story.reactions,
        newReactionType: reactionType
      })
      
      if (existingReaction) {
        // If user clicked the same reaction, remove it (toggle off)
        if (existingReaction.type === reactionType) {
          console.log('👆 Toggling off same reaction type')
          await removeReactionFromMood(moodId, existingReaction.id)
          return
        } else {
          // Update existing reaction to new type
          console.log('🔄 Switching reaction type from', existingReaction.type, 'to', reactionType)
          await removeReactionFromMood(moodId, existingReaction.id)
        }
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
      
      // Update local state immediately
      const storyIndex = moodStories.value.findIndex(s => s.id === moodId)
      if (storyIndex !== -1) {
        const updatedStory = { ...moodStories.value[storyIndex] }
        
        // Add the new reaction
        updatedStory.reactions = [...(updatedStory.reactions || []), newReaction]
        updatedStory.totalReactions = updatedStory.reactions.length
        moodStories.value[storyIndex] = updatedStory

        // 🔔 Send notification to mood story owner
        try {
          await notificationStore.notifyMoodReaction(
            moodId,
            updatedStory.userId,
            authStore.userDisplayName || 'Someone',
            reactionType,
            reactionEmoji,
            updatedStory.emoji
          )
        } catch (notificationError) {
          console.warn('⚠️ Failed to send mood reaction notification:', notificationError)
          // Don't throw - notification failure shouldn't break the reaction
        }
      }
      
      console.log('✅ Reaction added successfully:', reactionType)
    } catch (err) {
      error.value = `Failed to react: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('❌ Error reacting to mood:', err)
      throw err // Re-throw to handle in component
    }
  }
  
  // Remove reaction from mood story
  async function removeReactionFromMood(moodId: string, reactionId: string) {
    try {
      console.log('🗑️ Attempting to remove reaction:', {
        moodId,
        reactionId,
        userId: authStore.user?.uid,
        timestamp: new Date().toISOString()
      })
      
      await deleteDoc(doc(db, 'mood-reactions', reactionId))
      console.log('✅ Successfully removed reaction from Firestore')
      
      // Update local state
      const storyIndex = moodStories.value.findIndex(s => s.id === moodId)
      if (storyIndex !== -1) {
        const updatedStory = { ...moodStories.value[storyIndex] }
        updatedStory.reactions = updatedStory.reactions?.filter(r => r.id !== reactionId) || []
        updatedStory.totalReactions = updatedStory.reactions.length
        moodStories.value[storyIndex] = updatedStory
        console.log('✅ Updated local state after reaction removal')
      }
    } catch (err) {
      console.error('❌ Error removing reaction:', err)
      console.log('Debug info:', {
        moodId,
        reactionId,
        userId: authStore.user?.uid,
        error: err
      })
      throw err // Re-throw to handle in calling function
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
    console.log('🔄 Refreshing all mood data...')
    await Promise.all([
      fetchTodaysMood(),
      fetchPublicMoodStories()
    ])
    console.log('✅ All mood data refreshed')
  }
  
  // Force refresh reactions for all current stories
  async function refreshAllReactions() {
    console.log('🔄 Force refreshing reactions for all stories...')
    if (moodStories.value.length > 0) {
      await fetchReactionsForStories(moodStories.value)
      console.log('✅ All reactions refreshed')
    } else {
      console.log('ℹ️ No stories to refresh reactions for')
    }
  }
  
  // Refresh reactions for a specific story (for real-time sync)
  async function refreshStoryReactions(storyId: string) {
    try {
      const reactionsQuery = query(
        collection(db, 'mood-reactions'),
        where('moodStoryId', '==', storyId)
      )
      
      const reactionsSnapshot = await getDocs(reactionsQuery)
      const reactions: MoodReaction[] = []
      
      reactionsSnapshot.docs.forEach(doc => {
        const data = doc.data()
        reactions.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          type: data.type,
          emoji: data.emoji,
          createdAt: safeToDate(data.createdAt),
        })
      })
      
      // Update the story in local state
      const storyIndex = moodStories.value.findIndex(s => s.id === storyId)
      if (storyIndex !== -1) {
        const updatedStory = { ...moodStories.value[storyIndex] }
        updatedStory.reactions = reactions
        updatedStory.totalReactions = reactions.length
        moodStories.value[storyIndex] = updatedStory
      }
      
      return reactions
    } catch (err) {
      console.error('Error refreshing story reactions:', err)
      return []
    }
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
    refreshAllReactions,
    refreshStoryReactions,
  }
})
