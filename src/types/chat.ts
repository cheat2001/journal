export interface ChatMessage {
  id: string
  chatRoomId: string
  senderId: string
  senderName: string
  senderInitials: string
  content: string
  messageType: 'text' | 'journal-reference' | 'mood-share'
  timestamp: Date
  isRead: boolean
  referenceData?: {
    entryId?: string
    entryPreview?: string
    moodEmoji?: string
  }
}

export interface ChatRoom {
  id: string
  participants: string[]
  participantNames: string[]
  participantInitials: string[]
  lastMessage?: ChatMessage
  createdAt: Date
  updatedAt: Date
  chatType: 'direct'
  isActive: boolean
}

export interface ChatUser {
  id: string
  displayName: string
  initials: string
  isOnline: boolean
  lastSeen?: Date
}
