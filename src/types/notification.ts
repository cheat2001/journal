export interface Notification {
  id: string
  userId: string // Recipient
  type: 'reaction' | 'comment' | 'achievement' | 'streak' | 'reminder' | 'insight' | 'milestone'
  title: string
  message: string
  data: {
    entryId?: string
    commentId?: string
    reactionType?: { emoji: string; label: string }
    fromUserId?: string
    fromUserName?: string
    fromUserInitials?: string
    achievementId?: string
    streakCount?: number
    redirectUrl?: string
    isConversationNotification?: boolean
    moodStoryId?: string
    moodReactionType?: string
    moodReactionEmoji?: string
    moodEmoji?: string
  }
  isRead: boolean
  priority: 'low' | 'normal' | 'high'
  createdAt: Date
  expiresAt?: Date
}

export interface NotificationSettings {
  reactions: boolean
  comments: boolean
  achievements: boolean
  streaks: boolean
  reminders: boolean
  insights: boolean
  quietHoursEnabled: boolean
  quietHoursStart: string // "22:00"
  quietHoursEnd: string   // "07:00"
  pushEnabled: boolean
  emailEnabled: boolean
}

export interface ToastNotification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    handler: () => void
  }
}

// Notification templates for consistency
export const NotificationTemplates = {
  REACTION: {
    title: (userName: string, reaction: string) => `${reaction} New reaction!`,
    message: (userName: string, reactionLabel: string) => 
      `${userName} reacted ${reactionLabel} to your journal entry`
  },
  COMMENT: {
    title: (userName: string) => `💬 ${userName} commented`,
    message: (userName: string, preview: string) => 
      `${userName}: "${preview.length > 50 ? preview.substring(0, 50) + '...' : preview}"`
  },
  COMMENT_CONVERSATION: {
    title: () => `💬 New comment in conversation`,
    message: (userName: string, preview: string) => 
      `${userName} joined the conversation: "${preview.length > 50 ? preview.substring(0, 50) + '...' : preview}"`
  },
  MOOD_REACTION: {
    title: (userName: string, reactionEmoji: string) => `${reactionEmoji} ${userName} reacted to your mood`,
    message: (userName: string, reactionLabel: string, moodEmoji: string) => 
      `${userName} sent ${reactionLabel} to your ${moodEmoji} mood story`
  },
  ACHIEVEMENT: {
    title: (achievementName: string) => `🏆 Achievement Unlocked!`,
    message: (achievementName: string, description: string) => 
      `You earned "${achievementName}" - ${description}`
  },
  STREAK: {
    title: (days: number) => `🔥 ${days} Day Streak!`,
    message: (days: number) => 
      `Amazing consistency! You've journaled for ${days} days in a row!`
  }
}
