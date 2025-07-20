export interface JournalEntry {
  id?: string
  userId: string
  date: string
  gratitude: string
  emotion: string
  challenges: string
  learning: string
  createdAt: Date
  updatedAt: Date
}

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
