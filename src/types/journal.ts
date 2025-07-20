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
