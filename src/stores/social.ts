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
  arrayRemove,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { JournalEntry, Reaction, Comment } from '@/types/journal'
import { REACTION_TYPES } from '@/types/journal'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notification'

export const useSocialStore = defineStore('social', () => {
  const publicEntries = ref<JournalEntry[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)
  const lastDoc = ref<DocumentSnapshot | null>(null)
  
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  // Actions
  async function fetchPublicEntries(limitCount = 20, isLoadMore = false) {
    if (!authStore.user) return
    
    if (isLoadMore) {
      loadingMore.value = true
    } else {
      loading.value = true
      // Reset pagination state for fresh fetch
      lastDoc.value = null
      hasMore.value = true
      publicEntries.value = []
    }
    error.value = null

    try {
      let q = query(
        collection(db, 'journal-entries'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      // Add pagination cursor if loading more
      if (isLoadMore && lastDoc.value) {
        q = query(
          collection(db, 'journal-entries'),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc.value),
          limit(limitCount)
        )
      }
      
      const querySnapshot = await getDocs(q)
      
      // Map entries
      const newEntries = querySnapshot.docs.map((doc) => {
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

      // Update state
      if (isLoadMore) {
        publicEntries.value = [...publicEntries.value, ...newEntries]
      } else {
        publicEntries.value = newEntries
      }

      // Update pagination state
      if (querySnapshot.docs.length > 0) {
        lastDoc.value = querySnapshot.docs[querySnapshot.docs.length - 1]
      }
      
      // Check if there are more documents
      hasMore.value = querySnapshot.docs.length === limitCount

      console.log(`${isLoadMore ? 'Loaded more' : 'Fetched'} public entries:`, newEntries.length, 'Total:', publicEntries.value.length)
    } catch (err) {
      error.value = `Failed to fetch public entries: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error fetching public entries:', err)
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  async function loadMoreEntries() {
    if (!hasMore.value || loadingMore.value) return
    await fetchPublicEntries(20, true)
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
        authorName: authStore.userDisplayName, // Add authorName alias
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

  // New methods for enhanced social interactions
  function getReactions(entryId: string): Record<string, number> {
    const entry = publicEntries.value.find(e => e.id === entryId)
    if (!entry?.reactions) return {}

    const reactionCounts: Record<string, number> = {}
    entry.reactions.forEach(reaction => {
      const emoji = reaction.type.emoji
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1
    })
    
    return reactionCounts
  }

  function getAllReactions(entryId: string): Reaction[] {
    const entry = publicEntries.value.find(e => e.id === entryId)
    return entry?.reactions || []
  }

  function getComments(entryId: string): Comment[] {
    const entry = publicEntries.value.find(e => e.id === entryId)
    return entry?.comments || []
  }

  function getTotalReactions(entry: JournalEntry): number {
    return entry.reactions?.length || 0
  }

  function getCommentCount(entry: JournalEntry): number {
    return entry.comments?.length || 0
  }

  function hasUserReacted(entryId: string, emoji: string): boolean {
    const entry = publicEntries.value.find(e => e.id === entryId)
    if (!entry?.reactions || !authStore.user) return false

    return entry.reactions.some(reaction => 
      reaction.userId === authStore.user!.uid && reaction.type.emoji === emoji
    )
  }

  async function toggleReaction(entryId: string, emoji: string) {
    if (!authStore.user) {
      throw new Error('User must be authenticated')
    }

    const entry = publicEntries.value.find(e => e.id === entryId)
    if (!entry) throw new Error('Entry not found')

    const existingReaction = entry.reactions?.find(r => 
      r.userId === authStore.user!.uid && r.type.emoji === emoji
    )

    if (existingReaction) {
      // Remove reaction
      await removeReaction(entryId, existingReaction.id)
    } else {
      // Add reaction
      const reactionType = REACTION_TYPES.find(r => r.emoji === emoji) || 
        { value: 'like', emoji: emoji, label: 'Like' }
      await addReaction(entryId, reactionType.value)
    }
  }

  async function loadEntryInteractions(_entryId: string) {
    // For now, we'll use the existing publicEntries data
    // In a real implementation, you might want to fetch specific entry data
    return Promise.resolve()
  }

  return {
    // State
    publicEntries,
    loading,
    loadingMore,
    error,
    hasMore,
    
    // Actions
    fetchPublicEntries,
    loadMoreEntries,
    toggleEntryVisibility,
    addReaction,
    removeReaction,
    addComment,
    deleteComment,
    clearError,
    
    // New methods for enhanced social interactions
    getReactions,
    getAllReactions,
    getComments,
    getTotalReactions,
    getCommentCount,
    hasUserReacted,
    toggleReaction,
    loadEntryInteractions
  }
})
