import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  type Unsubscribe 
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'
import { notificationSound } from './notificationSound'
import type { ChatMessage } from '@/types/chat'

class GlobalChatNotificationService {
  private unsubscribeAllChats: Unsubscribe | null = null
  private roomUnsubscribes: Map<string, Unsubscribe> = new Map()
  private isInitialized = false
  private lastProcessedMessageTime = new Date()

  async initialize() {
    if (this.isInitialized) return
    
    const authStore = useAuthStore()
    if (!authStore.user) {
      console.log('🔔 [GlobalChat] No user authenticated')
      return
    }

    console.log('🔔 [GlobalChat] Initializing for user:', authStore.user.uid)
    this.isInitialized = true

    // Subscribe to user's chat rooms to monitor for new rooms
    this.subscribeToUserChatRooms(authStore.user.uid)
  }

  private subscribeToUserChatRooms(userId: string) {
    const q = query(
      collection(db, 'chat-rooms'),
      where('participants', 'array-contains', userId)
    )

    this.unsubscribeAllChats = onSnapshot(q, (querySnapshot) => {
      console.log('🔔 [GlobalChat] Chat rooms snapshot received, count:', querySnapshot.docs.length)
      
      const currentRoomIds = new Set(querySnapshot.docs.map(doc => doc.id))
      const subscribedRoomIds = new Set(this.roomUnsubscribes.keys())

      // Subscribe to new rooms
      currentRoomIds.forEach(roomId => {
        if (!subscribedRoomIds.has(roomId)) {
          console.log('🔔 [GlobalChat] New chat room detected, subscribing:', roomId)
          this.subscribeToRoomMessages(roomId, userId)
        }
      })

      // Unsubscribe from rooms the user is no longer part of
      subscribedRoomIds.forEach(roomId => {
        if (!currentRoomIds.has(roomId)) {
          console.log('🔔 [GlobalChat] User left chat room, unsubscribing:', roomId)
          const unsubscribe = this.roomUnsubscribes.get(roomId)
          if (unsubscribe) {
            unsubscribe()
            this.roomUnsubscribes.delete(roomId)
          }
        }
      })

      console.log('🔔 [GlobalChat] Currently monitoring', this.roomUnsubscribes.size, 'chat rooms')
    }, (error) => {
      console.error('🔔 [GlobalChat] Error in chat rooms subscription:', error)
    })
  }

  private subscribeToRoomMessages(chatRoomId: string, currentUserId: string) {
    const q = query(
      collection(db, 'chat-messages'),
      where('chatRoomId', '==', chatRoomId)
    )

    let isFirstSnapshot = true

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(`🔔 [GlobalChat] Messages snapshot for room ${chatRoomId}, count:`, querySnapshot.docs.length)
      
      if (isFirstSnapshot) {
        isFirstSnapshot = false
        console.log(`🔔 [GlobalChat] Skipping initial snapshot for room ${chatRoomId}`)
        return
      }

      querySnapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const messageData = change.doc.data()
          const message: ChatMessage = {
            id: change.doc.id,
            chatRoomId: messageData.chatRoomId,
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            senderInitials: messageData.senderInitials,
            content: messageData.content,
            messageType: messageData.messageType,
            timestamp: messageData.timestamp?.toDate() || new Date(),
            isRead: messageData.isRead || false
          }

          console.log('🔔 [GlobalChat] New message in room', chatRoomId, ':', {
            id: message.id,
            senderName: message.senderName,
            senderId: message.senderId,
            currentUserId,
            timestamp: message.timestamp
          })

          // Only process messages from other users
          const isFromOtherUser = message.senderId !== currentUserId
          
          if (isFromOtherUser) {
            console.log('🔔 [GlobalChat] New message from other user')
            
            // Check if user is currently in this specific chat room
            const isInSameChatRoom = this.isUserInActiveChatRoom(message.chatRoomId)
            
            console.log('🔔 [GlobalChat] Route check result:', {
              chatRoomId: message.chatRoomId,
              isInSameChatRoom,
              shouldShowNotification: !isInSameChatRoom
            })
            
            if (!isInSameChatRoom) {
              console.log('🔔 [GlobalChat] User not in this chat room, showing notification')
              
              // Play notification sound and show browser notification
              notificationSound.playMessageReceived(message.senderName)
              
              // Show browser notification with chat room context
              this.showChatNotification(message)
            } else {
              console.log('🔔 [GlobalChat] User is in this chat room, skipping global notification')
            }
          } else {
            console.log('🔔 [GlobalChat] Skipping own message')
          }
        }
      })
    }, (error) => {
      console.error(`🔔 [GlobalChat] Error in subscription for room ${chatRoomId}:`, error)
    })

    // Store the unsubscribe function
    this.roomUnsubscribes.set(chatRoomId, unsubscribe)
  }

  private async getUserChatRooms(userId: string): Promise<string[]> {
    try {
      const q = query(
        collection(db, 'chat-rooms'),
        where('participants', 'array-contains', userId)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => doc.id)
    } catch (error) {
      console.error('Global chat notifications: Error fetching user chat rooms:', error)
      return []
    }
  }

  private isUserInActiveChatRoom(chatRoomId: string): boolean {
    // Check if user is currently in the specific chat room
    if (typeof window !== 'undefined' && window.location) {
      const currentPath = window.location.pathname
      const currentHash = window.location.hash
      
      // Check if we're on a chat page with the specific room
      const isOnChatPage = currentPath.includes('/chat') || currentHash.includes('/chat')
      const isInSpecificRoom = currentPath.includes(chatRoomId) || currentHash.includes(chatRoomId)
      
      console.log('🔍 [GlobalChat] Route check:', {
        currentPath,
        currentHash,
        chatRoomId,
        isOnChatPage,
        isInSpecificRoom,
        result: isOnChatPage && isInSpecificRoom
      })
      
      return isOnChatPage && isInSpecificRoom
    }
    
    return false
  }

  private showChatNotification(message: ChatMessage) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`New message from ${message.senderName}`, {
        body: message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content,
        icon: '/icon.svg',
        badge: '/favicon.ico',
        tag: `chat-${message.chatRoomId}`,
        requireInteraction: false,
        silent: false
      })

      // Auto-close after 6 seconds
      setTimeout(() => {
        notification.close()
      }, 6000)

      // Navigate to chat when clicked
      notification.onclick = () => {
        window.focus()
        window.location.href = `/#/chat/${message.chatRoomId}`
        notification.close()
      }
    }
  }

  cleanup() {
    if (this.unsubscribeAllChats) {
      console.log('🔔 [GlobalChat] Cleaning up main subscription')
      this.unsubscribeAllChats()
      this.unsubscribeAllChats = null
    }
    
    // Clean up all room subscriptions
    if (this.roomUnsubscribes && this.roomUnsubscribes.size > 0) {
      console.log('🔔 [GlobalChat] Cleaning up', this.roomUnsubscribes.size, 'room subscriptions')
      this.roomUnsubscribes.forEach((unsubscribe, roomId) => {
        console.log('🔔 [GlobalChat] Cleaning up subscription for room:', roomId)
        unsubscribe()
      })
      this.roomUnsubscribes.clear()
    }
    
    this.isInitialized = false
  }

  updateLastProcessedTime() {
    this.lastProcessedMessageTime = new Date()
  }
}

// Create singleton instance
export const globalChatNotifications = new GlobalChatNotificationService()
