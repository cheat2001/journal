import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  limit, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  setDoc 
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from './auth'
import type { Notification, NotificationSettings, ToastNotification } from '@/types/notification'
import { NotificationTemplates } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])
  const toasts = ref<ToastNotification[]>([])
  const settings = ref<NotificationSettings>({
    reactions: true,
    comments: true,
    achievements: true,
    streaks: true,
    reminders: true,
    insights: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    pushEnabled: false,
    emailEnabled: false
  })
  const loading = ref(false)
  const isInitialized = ref(false)

  // Auth store
  const authStore = useAuthStore()

  // Computed
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.isRead).length
  )

  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead).slice(0, 10)
  )

  const recentNotifications = computed(() => 
    notifications.value.slice(0, 20)
  )

  const isInQuietHours = computed(() => {
    if (!settings.value.quietHoursEnabled) return false
    
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const start = settings.value.quietHoursStart
    const end = settings.value.quietHoursEnd
    
    if (start < end) {
      return currentTime >= start && currentTime <= end
    } else {
      return currentTime >= start || currentTime <= end
    }
  })

  // Listeners
  let notificationUnsubscribe: (() => void) | null = null
  let settingsUnsubscribe: (() => void) | null = null

  // Initialize the notification system
  async function initialize() {
    if (!authStore.user?.uid || isInitialized.value) return
    
    console.log('🔔 Initializing notification system...')
    
    try {
      loading.value = true
      await loadNotificationSettings()
      startNotificationListener()
      isInitialized.value = true
      console.log('✅ Notification system initialized')
    } catch (error) {
      console.error('❌ Error initializing notifications:', error)
    } finally {
      loading.value = false
    }
  }

  function startNotificationListener() {
    if (!authStore.user?.uid || notificationUnsubscribe) return

    console.log('🎧 Starting notification listener for user:', authStore.user.uid)

    // Listen to notifications - simplified query to avoid index issues
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', authStore.user.uid),
      limit(50)
    )

    notificationUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📨 Notification update received:', snapshot.size, 'notifications')
        
        // Map documents and sort locally to avoid index requirement
        const notificationData = snapshot.docs
          .map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
            } as Notification
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        notifications.value = notificationData
      },
      (error) => {
        console.error('❌ Error in notification listener:', error)
        
        // Handle different types of errors
        if (error.code === 'permission-denied') {
          console.warn('⚠️ No permissions to read notifications - user may need to authenticate')
        } else if (error.code === 'failed-precondition' && error.message.includes('index')) {
          console.warn('⚠️ Firestore index needed - check console for index creation link')
          // Fallback: try without ordering to avoid index requirement
          startSimpleNotificationListener()
        } else {
          console.error('Unexpected error in notification listener:', error.message)
        }
      }
    )
  }

  // Fallback listener without ordering (no index needed)
  function startSimpleNotificationListener() {
    if (!authStore.user?.uid || notificationUnsubscribe) return

    console.log('🎧 Starting simple notification listener (fallback)')
    
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', authStore.user.uid)
    )

    notificationUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📨 Simple notification update received:', snapshot.size, 'notifications')
        
        // Sort locally since we can't use orderBy without index
        const notificationData = snapshot.docs
          .map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
            } as Notification
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 50) // Limit to 50 most recent
        
        notifications.value = notificationData
      },
      (error) => {
        console.error('❌ Error in simple notification listener:', error)
      }
    )
  }

  function stopNotificationListener() {
    if (notificationUnsubscribe) {
      notificationUnsubscribe()
      notificationUnsubscribe = null
    }
    if (settingsUnsubscribe) {
      settingsUnsubscribe()
      settingsUnsubscribe = null
    }
    notifications.value = []
    isInitialized.value = false
  }

  // Settings management
  async function loadNotificationSettings() {
    if (!authStore.user?.uid) return

    try {
      const settingsDoc = doc(db, 'notification-settings', authStore.user.uid)
      settingsUnsubscribe = onSnapshot(
        settingsDoc, 
        (doc) => {
          if (doc.exists()) {
            settings.value = { ...settings.value, ...doc.data() }
          }
        },
        (error) => {
          console.error('❌ Error loading notification settings:', error)
          // Handle permission errors gracefully
          if (error.code === 'permission-denied') {
            console.warn('⚠️ No permissions to read notification settings - using defaults')
          }
        }
      )
    } catch (error) {
      console.error('Error loading notification settings:', error)
    }
  }

  async function updateNotificationSettings(newSettings: Partial<NotificationSettings>) {
    if (!authStore.user?.uid) return

    try {
      settings.value = { ...settings.value, ...newSettings }
      await setDoc(doc(db, 'notification-settings', authStore.user.uid), settings.value, { merge: true })
      console.log('✅ Notification settings updated')
    } catch (error) {
      console.error('Error updating notification settings:', error)
    }
  }

  // Create notifications
  async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    try {
      // Don't send notification to yourself
      if (notification.userId === authStore.user?.uid) {
        console.log('⚠️ Skipping self-notification')
        return
      }

      const expiresAt = notification.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default

      console.log(`📬 Creating notification for user ${notification.userId}: ${notification.title}`)

      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt)
      })

      console.log(`✅ Created notification successfully`)
    } catch (error) {
      console.error('❌ Error creating notification:', error)
      
      // Show user-friendly error handling
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          console.warn('⚠️ Permission denied - notification not sent')
        } else if (error.message.includes('network')) {
          console.warn('⚠️ Network error - notification may not be sent')
        }
      }
    }
  }

  // Notification helpers for specific types
  async function notifyReaction(
    entryId: string, 
    entryOwnerId: string, 
    reactionType: { emoji: string; label: string }, 
    fromUserName: string
  ) {
    await createNotification({
      userId: entryOwnerId,
      type: 'reaction',
      title: NotificationTemplates.REACTION.title(fromUserName, reactionType.emoji),
      message: NotificationTemplates.REACTION.message(fromUserName, reactionType.label),
      data: {
        entryId,
        fromUserId: authStore.user?.uid,
        fromUserName,
        fromUserInitials: fromUserName.split(' ').map(n => n[0]).join(''),
        reactionType,
        redirectUrl: `/entry/${entryId}`
      },
      isRead: false,
      priority: 'normal'
    })
  }

  async function notifyComment(
    entryId: string, 
    entryOwnerId: string, 
    fromUserName: string, 
    commentPreview: string,
    commentId: string
  ) {
    await createNotification({
      userId: entryOwnerId,
      type: 'comment',
      title: NotificationTemplates.COMMENT.title(fromUserName),
      message: NotificationTemplates.COMMENT.message(fromUserName, commentPreview),
      data: {
        entryId,
        commentId,
        fromUserId: authStore.user?.uid,
        fromUserName,
        fromUserInitials: fromUserName.split(' ').map(n => n[0]).join(''),
        redirectUrl: `/entry/${entryId}`
      },
      isRead: false,
      priority: 'normal'
    })
  }

  async function notifyCommentParticipants(
    entryId: string,
    entryOwnerId: string,
    existingComments: Array<{ userId: string; userDisplayName: string }>,
    fromUserName: string,
    commentPreview: string,
    commentId: string
  ) {
    if (!authStore.user?.uid) return

    const currentUserId = authStore.user.uid
    
    // Get unique participants (excluding current user and entry owner who gets separate notification)
    const participants = new Set<string>()
    const participantDetails = new Map<string, string>()
    
    existingComments.forEach(comment => {
      if (comment.userId !== currentUserId && comment.userId !== entryOwnerId) {
        participants.add(comment.userId)
        participantDetails.set(comment.userId, comment.userDisplayName)
      }
    })

    // Notify entry owner (existing behavior)
    if (entryOwnerId !== currentUserId) {
      await notifyComment(entryId, entryOwnerId, fromUserName, commentPreview, commentId)
    }

    // Notify all comment participants
    for (const participantId of participants) {
      const participantName = participantDetails.get(participantId)
      await createNotification({
        userId: participantId,
        type: 'comment',
        title: NotificationTemplates.COMMENT_CONVERSATION.title(),
        message: NotificationTemplates.COMMENT_CONVERSATION.message(fromUserName, commentPreview),
        data: {
          entryId,
          commentId,
          fromUserId: currentUserId,
          fromUserName,
          fromUserInitials: fromUserName.split(' ').map(n => n[0]).join(''),
          redirectUrl: `/entry/${entryId}`,
          isConversationNotification: true
        },
        isRead: false,
        priority: 'normal'
      })
    }

    console.log(`Notified ${participants.size} comment participants about new comment on entry ${entryId}`)
  }

  async function notifyAchievement(achievementName: string, achievementDescription: string, achievementId: string) {
    if (!authStore.user?.uid) return

    await createNotification({
      userId: authStore.user.uid,
      type: 'achievement',
      title: NotificationTemplates.ACHIEVEMENT.title(achievementName),
      message: NotificationTemplates.ACHIEVEMENT.message(achievementName, achievementDescription),
      data: {
        achievementId,
        redirectUrl: '/'
      },
      isRead: false,
      priority: 'high'
    })

    // Also show toast for immediate feedback
    showToast({
      type: 'success',
      title: '🏆 Achievement Unlocked!',
      message: `${achievementName}: ${achievementDescription}`,
      duration: 8000,
      action: {
        label: 'View Profile',
        handler: () => {
          window.location.href = '/'
        }
      }
    })
  }

  async function notifyStreakMilestone(streakCount: number) {
    if (!authStore.user?.uid) return

    await createNotification({
      userId: authStore.user.uid,
      type: 'streak',
      title: NotificationTemplates.STREAK.title(streakCount),
      message: NotificationTemplates.STREAK.message(streakCount),
      data: {
        streakCount,
        redirectUrl: '/'
      },
      isRead: false,
      priority: 'high'
    })

    // Also show toast for immediate feedback
    showToast({
      type: 'success',
      title: `🔥 ${streakCount} Day Streak!`,
      message: `Amazing consistency! You've journaled for ${streakCount} days in a row!`,
      duration: 6000,
      action: {
        label: 'View Stats',
        handler: () => {
          window.location.href = '/'
        }
      }
    })
  }

  // Mark notifications as read
  async function markAsRead(notificationId: string) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      })
      
      // Update local state immediately for better UX
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async function markAllAsRead() {
    try {
      const unreadNotifs = notifications.value.filter(n => !n.isRead)
      
      const promises = unreadNotifs.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), { isRead: true })
      )
      
      await Promise.all(promises)
      
      // Update local state
      unreadNotifs.forEach(notification => {
        notification.isRead = true
      })
      
      console.log(`✅ Marked ${unreadNotifs.length} notifications as read`)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId))
      
      // Update local state
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  // Toast notifications
  function showToast(toast: Omit<ToastNotification, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastNotification = {
      id,
      duration: 5000,
      ...toast
    }

    toasts.value.push(newToast)

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  function removeToast(toastId: string) {
    const index = toasts.value.findIndex(t => t.id === toastId)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  // Navigation helper
  function navigateToNotification(notification: Notification) {
    console.log('🖱️ Navigating to notification:', notification)
    
    // Mark as read when user clicks
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    try {
      // Navigate to the relevant page
      if (notification.data.redirectUrl) {
        const url = notification.data.redirectUrl
        console.log('🔗 Navigating to URL:', url)
        
        // Use setTimeout to avoid immediate navigation issues
        setTimeout(() => {
          window.location.href = url
        }, 100)
        
      } else {
        // Default navigation based on notification type
        let defaultUrl = '/'
        
        if (notification.type === 'reaction' || notification.type === 'comment') {
          defaultUrl = '/feed'
        } else if (notification.type === 'achievement') {
          defaultUrl = '/'
        } else if (notification.type === 'streak') {
          defaultUrl = '/'
        }
        
        console.log('🔗 Using default navigation to:', defaultUrl)
        setTimeout(() => {
          window.location.href = defaultUrl
        }, 100)
      }
    } catch (error) {
      console.error('❌ Error navigating to notification:', error)
      // Fallback to home page
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    }
  }

  // Cleanup
  function cleanup() {
    stopNotificationListener()
    toasts.value = []
    console.log('🧹 Notification system cleaned up')
  }

  return {
    // State
    notifications,
    toasts,
    settings,
    loading,
    isInitialized,
    
    // Computed
    unreadCount,
    unreadNotifications,
    recentNotifications,
    isInQuietHours,
    
    // Actions
    initialize,
    cleanup,
    updateNotificationSettings,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    navigateToNotification,
    
    // Helpers
    notifyReaction,
    notifyComment,
    notifyCommentParticipants,
    notifyAchievement,
    notifyStreakMilestone,
    
    // Toast
    showToast,
    removeToast
  }
})
