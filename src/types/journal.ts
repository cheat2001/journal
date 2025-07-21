export interface JournalEntry {
  id?: string
  userId: string
  userDisplayName?: string
  userInitials?: string
  date: string
  gratitude: string
  emotion: string
  challenges: string
  learning: string
  createdAt: Date
  updatedAt: Date
  // Social features
  isPublic: boolean
  reactions?: Reaction[]
  comments?: Comment[]
  totalReactions?: number
  totalComments?: number
}

export interface Reaction {
  id: string
  userId: string
  userDisplayName: string
  type: ReactionType
  createdAt: Date
}

export interface Comment {
  id: string
  userId: string
  userDisplayName: string
  userInitials: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface ReactionType {
  value: string
  emoji: string
  label: string
}

export const REACTION_TYPES: ReactionType[] = [
  { value: 'like', emoji: '👍', label: 'Like' },
  { value: 'love', emoji: '❤️', label: 'Love' },
  { value: 'inspire', emoji: '✨', label: 'Inspiring' },
  { value: 'support', emoji: '🤗', label: 'Support' },
  { value: 'strength', emoji: '💪', label: 'Strength' },
  { value: 'wisdom', emoji: '🧠', label: 'Wisdom' },
]

export interface EmotionOption {
  value: string
  label: string
  emoji: string
}

export const EMOTION_OPTIONS: EmotionOption[] = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'excited', label: 'Excited', emoji: '🤩' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'content', label: 'Content', emoji: '😊' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'stressed', label: 'Stressed', emoji: '😰' },
  { value: 'anxious', label: 'Anxious', emoji: '😟' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { value: 'overwhelmed', label: 'Overwhelmed', emoji: '😵' },
]

// Mood Stories Feature Types
export interface MoodStory {
  id?: string
  userId: string
  userName: string
  userInitials?: string
  userAvatar?: string
  emotion: string
  emoji: string
  customMessage?: string
  isPublic: boolean
  date: string // yyyy-MM-dd format
  createdAt: Date
  updatedAt: Date
  reactions?: MoodReaction[]
  totalReactions?: number
}

export interface MoodReaction {
  id: string
  userId: string
  userName: string
  type: string // 'support', 'love', 'strength'
  emoji: string
  createdAt: Date
}

export const MOOD_REACTION_TYPES = [
  { value: 'support', emoji: '🤗', label: 'Send Support' },
  { value: 'love', emoji: '❤️', label: 'Send Love' },
  { value: 'strength', emoji: '💪', label: 'Send Strength' },
  { value: 'care', emoji: '🫂', label: 'I Care' },
  { value: 'inspire', emoji: '✨', label: 'Inspiring' },
]

// Gamification System Types
export interface UserStats {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  badges: Badge[]
  level: number
  xp: number
  lastEntryDate?: string
  streakStartDate?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: {
    type: 'streak' | 'entries' | 'reactions' | 'comments' | 'public_entries'
    count: number
  }
  badge: Omit<Badge, 'unlockedAt'>
  isUnlocked?: boolean
}

// Predefined Achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Write your very first journal entry',
    icon: '🎯',
    requirement: { type: 'entries', count: 1 },
    badge: {
      id: 'first_step_badge',
      name: 'First Step',
      description: 'Took the first step in your journaling journey',
      icon: '🎯',
      rarity: 'common',
      xpReward: 50
    }
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day writing streak',
    icon: '🔥',
    requirement: { type: 'streak', count: 7 },
    badge: {
      id: 'week_warrior_badge',
      name: 'Week Warrior',
      description: 'Showed dedication with a 7-day streak',
      icon: '🔥',
      rarity: 'rare',
      xpReward: 200
    }
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Achieve a 30-day writing streak',
    icon: '🏆',
    requirement: { type: 'streak', count: 30 },
    badge: {
      id: 'month_master_badge',
      name: 'Month Master',
      description: 'Incredible consistency with 30 days of journaling',
      icon: '🏆',
      rarity: 'epic',
      xpReward: 1000
    }
  },
  {
    id: 'century_scholar',
    name: 'Century Scholar',
    description: 'Write 100 journal entries',
    icon: '📚',
    requirement: { type: 'entries', count: 100 },
    badge: {
      id: 'century_scholar_badge',
      name: 'Century Scholar',
      description: 'Profound dedication with 100 entries',
      icon: '📚',
      rarity: 'epic',
      xpReward: 800
    }
  },
  {
    id: 'community_star',
    name: 'Community Star',
    description: 'Receive 50 reactions from the community',
    icon: '⭐',
    requirement: { type: 'reactions', count: 50 },
    badge: {
      id: 'community_star_badge',
      name: 'Community Star',
      description: 'Inspired others with your authentic sharing',
      icon: '⭐',
      rarity: 'rare',
      xpReward: 300
    }
  },
  {
    id: 'hundred_days',
    name: 'Hundred Days',
    description: 'Maintain a 100-day writing streak',
    icon: '💎',
    requirement: { type: 'streak', count: 100 },
    badge: {
      id: 'hundred_days_badge',
      name: 'Hundred Days',
      description: 'Legendary commitment to personal growth',
      icon: '💎',
      rarity: 'legendary',
      xpReward: 2500
    }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share 25 entries publicly',
    icon: '🦋',
    requirement: { type: 'public_entries', count: 25 },
    badge: {
      id: 'social_butterfly_badge',
      name: 'Social Butterfly',
      description: 'Brave enough to share your journey openly',
      icon: '🦋',
      rarity: 'rare',
      xpReward: 400
    }
  }
]
