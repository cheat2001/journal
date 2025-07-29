import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { ChatRoom, ChatMessage } from '@/types/chat'
import { useAuthStore } from './auth'
import { notificationSound } from '@/utils/notificationSound'

export const useChatStore = defineStore('chat', () => {
  const chatRooms = ref<ChatRoom[]>([])
  const currentChatMessages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentChatRoom = ref<ChatRoom | null>(null)
  
  const authStore = useAuthStore()
  let messagesUnsubscribe: Unsubscribe | null = null

  // Computed
  const sortedChatRooms = computed(() => {
    return chatRooms.value.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return b.updatedAt.getTime() - a.updatedAt.getTime()
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime()
    })
  })

  const unreadChatsCount = computed(() => {
    return chatRooms.value.reduce((count, room) => {
      if (!room.lastMessage) return count
      if (room.lastMessage.senderId === authStore.user?.uid) return count
      if (room.lastMessage.isRead) return count
      return count + 1
    }, 0)
  })

  // Actions
  async function fetchChatRooms() {
    if (!authStore.user) return
    
    loading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'chat-rooms'),
        where('participants', 'array-contains', authStore.user.uid)
      )
      
      const querySnapshot = await getDocs(q)
      const rooms = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate() || new Date()
          } : undefined
        } as ChatRoom
      })
      
      // Sort manually instead of using Firestore orderBy to avoid composite index
      chatRooms.value = rooms.sort((a, b) => {
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      })
    } catch (err) {
      error.value = `Failed to fetch chat rooms: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error fetching chat rooms:', err)
    } finally {
      loading.value = false
    }
  }

  async function getOrCreateChatRoom(otherUserId: string, otherUserName: string): Promise<string> {
    if (!authStore.user) throw new Error('User not authenticated')

    console.log('Chat store: getOrCreateChatRoom called', { otherUserId, otherUserName, currentUser: authStore.user.uid })

    try {
      // Check if chat room already exists
      console.log('Chat store: Checking for existing chat room')
      const q = query(
        collection(db, 'chat-rooms'),
        where('participants', 'array-contains', authStore.user.uid)
      )
      
      const querySnapshot = await getDocs(q)
      console.log('Chat store: Found', querySnapshot.docs.length, 'existing chat rooms')
      
      const existingRoom = querySnapshot.docs.find(doc => {
        const data = doc.data()
        const hasOtherUser = data.participants.includes(otherUserId)
        const isDirectChat = data.participants.length === 2
        console.log('Chat store: Checking room', doc.id, { participants: data.participants, hasOtherUser, isDirectChat })
        return hasOtherUser && isDirectChat
      })

      if (existingRoom) {
        console.log('Chat store: Found existing chat room:', existingRoom.id)
        return existingRoom.id
      }

      // Create new chat room
      console.log('Chat store: Creating new chat room')
      const currentUserName = authStore.userDisplayName
      const currentUserInitials = currentUserName.split(' ').map(n => n[0]).join('')
      const otherUserInitials = otherUserName.split(' ').map(n => n[0]).join('')
      
      const newChatRoom = {
        participants: [authStore.user.uid, otherUserId],
        participantNames: [currentUserName, otherUserName],
        participantInitials: [currentUserInitials, otherUserInitials],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        chatType: 'direct',
        isActive: true
      }

      console.log('Chat store: Creating chat room document', newChatRoom)
      const docRef = await addDoc(collection(db, 'chat-rooms'), newChatRoom)
      console.log('Chat store: Chat room created with ID:', docRef.id)

      return docRef.id
    } catch (err) {
      console.error('Chat store: Error in getOrCreateChatRoom:', err)
      error.value = `Failed to create chat room: ${err instanceof Error ? err.message : 'Unknown error'}`
      throw err
    }
  }

  async function sendMessage(chatRoomId: string, content: string, messageType: 'text' | 'journal-reference' | 'mood-share' = 'text') {
    if (!authStore.user || !content.trim()) return

    console.log('Chat store: sendMessage called', { chatRoomId, content, userId: authStore.user.uid })

    try {
      const currentUserName = authStore.userDisplayName
      const currentUserInitials = currentUserName.split(' ').map(n => n[0]).join('')
      
      const message = {
        chatRoomId,
        senderId: authStore.user.uid,
        senderName: currentUserName,
        senderInitials: currentUserInitials,
        content: content.trim(),
        messageType,
        timestamp: Timestamp.now(),
        isRead: false
      }

      console.log('Chat store: Creating message document', message)
      const docRef = await addDoc(collection(db, 'chat-messages'), message)
      console.log('Chat store: Message created with ID', docRef.id)

      // Update chat room's last message
      console.log('Chat store: Updating chat room last message')
      await updateDoc(doc(db, 'chat-rooms', chatRoomId), {
        lastMessage: {
          ...message,
          id: docRef.id
        },
        updatedAt: Timestamp.now()
      })

      console.log('Chat store: Message sent successfully')
      return docRef.id
    } catch (err) {
      console.error('Chat store: Error sending message:', err)
      error.value = `Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`
      throw err
    }
  }

  function subscribeToMessages(chatRoomId: string) {
    if (messagesUnsubscribe) {
      messagesUnsubscribe()
    }

    console.log('Chat store: Subscribing to messages for room:', chatRoomId)

    const q = query(
      collection(db, 'chat-messages'),
      where('chatRoomId', '==', chatRoomId)
    )

    let previousMessageCount = 0

    messagesUnsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('Chat store: Messages snapshot received, count:', querySnapshot.docs.length)
      
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as ChatMessage
      })
      
      // Sort manually by timestamp instead of using Firestore orderBy
      const sortedMessages = messages.sort((a, b) => 
        a.timestamp.getTime() - b.timestamp.getTime()
      )
      
      // Check if new messages were added (not just initial load)
      const newMessageCount = sortedMessages.length
      const hasNewMessages = newMessageCount > previousMessageCount && previousMessageCount > 0
      
      if (hasNewMessages) {
        // Find the newest message(s)
        const newMessages = sortedMessages.slice(previousMessageCount)
        
        // Play notification sound for messages from other users
        newMessages.forEach(message => {
          if (message.senderId !== authStore.user?.uid) {
            console.log('Playing notification sound for new message from:', message.senderName)
            notificationSound.playMessageReceived(message.senderName)
          }
        })
      }
      
      currentChatMessages.value = sortedMessages
      previousMessageCount = newMessageCount
      
      console.log('Chat store: Messages updated, count:', currentChatMessages.value.length)
    }, (error) => {
      console.error('Chat store: Error in messages subscription:', error)
    })
  }

  async function loadChatRoom(chatRoomId: string) {
    if (!authStore.user) return

    try {
      const docRef = doc(db, 'chat-rooms', chatRoomId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        currentChatRoom.value = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate() || new Date()
          } : undefined
        } as ChatRoom
        
        // Subscribe to messages
        subscribeToMessages(chatRoomId)
      }
    } catch (err) {
      error.value = `Failed to load chat room: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error loading chat room:', err)
    }
  }

  async function markMessagesAsRead(chatRoomId: string) {
    if (!authStore.user) return

    try {
      // This would typically be done with a batch update in a real implementation
      // For now, we'll just update the current room's lastMessage if it's unread
      if (currentChatRoom.value && currentChatRoom.value.lastMessage && 
          currentChatRoom.value.lastMessage.senderId !== authStore.user.uid &&
          !currentChatRoom.value.lastMessage.isRead) {
        
        await updateDoc(doc(db, 'chat-rooms', chatRoomId), {
          'lastMessage.isRead': true
        })
      }
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }

  function unsubscribeFromMessages() {
    if (messagesUnsubscribe) {
      messagesUnsubscribe()
      messagesUnsubscribe = null
    }
  }

  function clearCurrentChat() {
    currentChatRoom.value = null
    currentChatMessages.value = []
    unsubscribeFromMessages()
  }

  function getOtherParticipant(room: ChatRoom) {
    if (!authStore.user) return null
    
    const otherParticipantIndex = room.participants.findIndex(p => p !== authStore.user?.uid)
    if (otherParticipantIndex === -1) return null
    
    return {
      id: room.participants[otherParticipantIndex],
      name: room.participantNames[otherParticipantIndex],
      initials: room.participantInitials[otherParticipantIndex]
    }
  }

  return {
    // State
    chatRooms,
    currentChatMessages,
    currentChatRoom,
    loading,
    error,
    
    // Computed
    sortedChatRooms,
    unreadChatsCount,

    // Actions
    fetchChatRooms,
    getOrCreateChatRoom,
    sendMessage,
    loadChatRoom,
    markMessagesAsRead,
    clearCurrentChat,
    getOtherParticipant,
    subscribeToMessages,
    unsubscribeFromMessages
  }
})
