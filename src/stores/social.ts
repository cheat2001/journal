import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  where, 
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { JournalEntry, Reaction, Comment } from '@/types/journal'
import { REACTION_TYPES } from '@/types/journal'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notification'

export const useSocialStore = defineStore('social', () => {
  const publicEntries = ref<JournalEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  // Actions
  async function fetchPublicEntries(limitCount = 20) {
    if (!authStore.user) return
    
    loading.value = true
    error.value = null

    try {
      // First, get all journal entries and filter client-side to avoid composite index requirement
      const q = query(
        collection(db, 'journal-entries'),
        where('isPublic', '==', true)
      )
      
      const querySnapshot = await getDocs(q)
      
      // Map and sort client-side
      const allPublicEntries = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        const entry = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // Convert reaction timestamps
          reactions: data.reactions?.map((reaction: Record<string, unknown>) => ({
            ...reaction,
            createdAt: reaction.createdAt && typeof reaction.createdAt === 'object' && 'toDate' in reaction.createdAt 
              ? (reaction.createdAt as { toDate(): Date }).toDate() 
              : new Date(reaction.createdAt as string | number | Date)
          })) || [],
          // Convert comment timestamps
          comments: data.comments?.map((comment: Record<string, unknown>) => ({
            ...comment,
            createdAt: comment.createdAt && typeof comment.createdAt === 'object' && 'toDate' in comment.createdAt
              ? (comment.createdAt as { toDate(): Date }).toDate()
              : new Date(comment.createdAt as string | number | Date),
            updatedAt: comment.updatedAt && typeof comment.updatedAt === 'object' && 'toDate' in comment.updatedAt
              ? (comment.updatedAt as { toDate(): Date }).toDate()
              : new Date(comment.updatedAt as string | number | Date)
          })) || [],
          totalReactions: data.reactions?.length || 0,
          totalComments: data.comments?.length || 0,
        } as JournalEntry
        return entry
      })

      // Sort by createdAt desc and limit client-side
      publicEntries.value = allPublicEntries
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limitCount)

      console.log('Fetched public entries:', publicEntries.value.length)
    } catch (err) {
      error.value = `Failed to fetch public entries: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error fetching public entries:', err)
    } finally {
      loading.value = false
    }
  }

  async function toggleEntryVisibility(entryId: string, isPublic: boolean) {
    if (!authStore.user) {
      throw new Error('User must be authenticated')
    }

    try {
      const entryRef = doc(db, 'journal-entries', entryId)
      await updateDoc(entryRef, {
        isPublic,
        updatedAt: new Date()
      })
      
      console.log('Entry visibility updated:', entryId, isPublic)
    } catch (err) {
      error.value = `Failed to update entry visibility: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error updating entry visibility:', err)
      throw err
    }
  }

  async function addReaction(entryId: string, reactionType: string) {
    if (!authStore.user) {
      throw new Error('User must be authenticated')
    }

    try {
      // Find the reaction type details
      const reactionTypeObj = REACTION_TYPES.find(r => r.value === reactionType) || 
        { value: reactionType, emoji: '👍', label: 'Like' }

      const reaction: Reaction = {
        id: crypto.randomUUID(),
        userId: authStore.user.uid,
        userDisplayName: authStore.userDisplayName,
        type: reactionTypeObj,
        createdAt: new Date()
      }

      const entryRef = doc(db, 'journal-entries', entryId)
      await updateDoc(entryRef, {
        reactions: arrayUnion(reaction),
        updatedAt: new Date()
      })

      // Update local state
      const entry = publicEntries.value.find(e => e.id === entryId)
      if (entry) {
        if (!entry.reactions) entry.reactions = []
        entry.reactions.push(reaction)
        entry.totalReactions = entry.reactions.length

        // 🔔 Send notification to entry owner
        if (entry.userId !== authStore.user.uid) {
          await notificationStore.notifyReaction(
            entryId,
            entry.userId,
            reactionTypeObj,
            authStore.userDisplayName
          )
        }
      }

      console.log('Reaction added:', reactionType)
    } catch (err) {
      error.value = `Failed to add reaction: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error adding reaction:', err)
      throw err
    }
  }

  async function removeReaction(entryId: string, reactionId: string) {
    if (!authStore.user) {
      throw new Error('User must be authenticated')
    }

    try {
      const entry = publicEntries.value.find(e => e.id === entryId)
      const reaction = entry?.reactions?.find(r => r.id === reactionId)
      
      if (!reaction) return

      const entryRef = doc(db, 'journal-entries', entryId)
      await updateDoc(entryRef, {
        reactions: arrayRemove(reaction),
        updatedAt: new Date()
      })

      // Update local state
      if (entry && entry.reactions) {
        entry.reactions = entry.reactions.filter(r => r.id !== reactionId)
        entry.totalReactions = entry.reactions.length
      }

      console.log('Reaction removed:', reactionId)
    } catch (err) {
      error.value = `Failed to remove reaction: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error removing reaction:', err)
      throw err
    }
  }

  async function addComment(entryId: string, content: string) {
    if (!authStore.user) {
      throw new Error('User must be authenticated')
    }

    try {
      const comment: Comment = {
        id: crypto.randomUUID(),
        userId: authStore.user.uid,
        userDisplayName: authStore.userDisplayName,
        userInitials: authStore.userDisplayName.split(' ').map(n => n[0]).join(''),
        content: content.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const entryRef = doc(db, 'journal-entries', entryId)
      await updateDoc(entryRef, {
        comments: arrayUnion(comment),
        updatedAt: new Date()
      })

      // Update local state
      const entry = publicEntries.value.find(e => e.id === entryId)
      if (entry) {
        if (!entry.comments) entry.comments = []
        entry.comments.push(comment)
        entry.totalComments = entry.comments.length

        // 🔔 Send notification to entry owner
        if (entry.userId !== authStore.user.uid) {
          await notificationStore.notifyComment(
            entryId,
            entry.userId,
            authStore.userDisplayName,
            content.trim(),
            comment.id
          )
        }
      }

      console.log('Comment added')
      return comment
    } catch (err) {
      error.value = `Failed to add comment: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error adding comment:', err)
      throw err
    }
  }

  async function deleteComment(entryId: string, commentId: string) {
    if (!authStore.user) {
      throw new Error('User must be authenticated')
    }

    try {
      const entry = publicEntries.value.find(e => e.id === entryId)
      const comment = entry?.comments?.find(c => c.id === commentId)
      
      if (!comment) return
      
      // Only allow deletion of own comments
      if (comment.userId !== authStore.user.uid) {
        throw new Error('You can only delete your own comments')
      }

      const entryRef = doc(db, 'journal-entries', entryId)
      await updateDoc(entryRef, {
        comments: arrayRemove(comment),
        updatedAt: new Date()
      })

      // Update local state
      if (entry && entry.comments) {
        entry.comments = entry.comments.filter(c => c.id !== commentId)
        entry.totalComments = entry.comments.length
      }

      console.log('Comment deleted:', commentId)
    } catch (err) {
      error.value = `Failed to delete comment: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error deleting comment:', err)
      throw err
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    publicEntries,
    loading,
    error,
    
    // Actions
    fetchPublicEntries,
    toggleEntryVisibility,
    addReaction,
    removeReaction,
    addComment,
    deleteComment,
    clearError
  }
})
