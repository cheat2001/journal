// Security validation utilities
// This provides client-side validation as an additional security layer

interface ValidationEntry {
  gratitude?: unknown
  challenges?: unknown
  learning?: unknown
  emotion?: unknown
  date?: unknown
  userId?: unknown
  [key: string]: unknown
}

interface ValidationStats {
  currentStreak?: unknown
  longestStreak?: unknown
  totalEntries?: unknown
  badges?: unknown
  level?: unknown
  xp?: unknown
  [key: string]: unknown
}

export class SecurityValidator {
  // Validate journal entry data before sending to Firestore
  static validateJournalEntry(entry: ValidationEntry): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Required fields check
    const requiredFields = ['gratitude', 'challenges', 'learning', 'emotion', 'date', 'userId']
    for (const field of requiredFields) {
      if (!entry[field]) {
        errors.push(`Missing required field: ${field}`)
      }
    }
    
    // Type validation
    if (entry.gratitude !== undefined && typeof entry.gratitude !== 'string') {
      errors.push('Gratitude must be a string')
    }
    
    if (entry.challenges !== undefined && typeof entry.challenges !== 'string') {
      errors.push('Challenges must be a string')
    }
    
    if (entry.learning !== undefined && typeof entry.learning !== 'string') {
      errors.push('Learning must be a string')
    }
    
    if (entry.emotion !== undefined && typeof entry.emotion !== 'string') {
      errors.push('Emotion must be a string')
    }
    
    if (entry.userId !== undefined && typeof entry.userId !== 'string') {
      errors.push('User ID must be a string')
    }
    
    // Length validation
    if (typeof entry.gratitude === 'string' && entry.gratitude.length > 1000) {
      errors.push('Gratitude must be 1000 characters or less')
    }
    
    if (typeof entry.challenges === 'string' && entry.challenges.length > 1000) {
      errors.push('Challenges must be 1000 characters or less')
    }
    
    if (typeof entry.learning === 'string' && entry.learning.length > 1000) {
      errors.push('Learning must be 1000 characters or less')
    }
    
    // Emotion validation
    const validEmotions = [
      'happy', 'excited', 'calm', 'grateful', 'content', 'neutral',
      'tired', 'stressed', 'anxious', 'sad', 'frustrated', 'overwhelmed'
    ]
    if (typeof entry.emotion === 'string' && !validEmotions.includes(entry.emotion)) {
      errors.push('Invalid emotion selected')
    }
    
    // Date validation
    if (typeof entry.date === 'string' && !this.isValidDateString(entry.date)) {
      errors.push('Invalid date format')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Validate user stats data
  static validateUserStats(stats: ValidationStats): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Required fields check
    const requiredFields = ['currentStreak', 'longestStreak', 'totalEntries', 'badges', 'level', 'xp']
    for (const field of requiredFields) {
      if (stats[field] === undefined || stats[field] === null) {
        errors.push(`Missing required field: ${field}`)
      }
    }
    
    // Type and range validation
    if (typeof stats.currentStreak !== 'number' || stats.currentStreak < 0) {
      errors.push('Current streak must be a non-negative number')
    }
    
    if (typeof stats.longestStreak !== 'number' || stats.longestStreak < 0) {
      errors.push('Longest streak must be a non-negative number')
    }
    
    if (typeof stats.totalEntries !== 'number' || stats.totalEntries < 0) {
      errors.push('Total entries must be a non-negative number')
    }
    
    if (typeof stats.level !== 'number' || stats.level < 1) {
      errors.push('Level must be a positive number')
    }
    
    if (typeof stats.xp !== 'number' || stats.xp < 0) {
      errors.push('XP must be a non-negative number')
    }
    
    if (!Array.isArray(stats.badges)) {
      errors.push('Badges must be an array')
    }
    
    // Logical validation
    if (typeof stats.currentStreak === 'number' && 
        typeof stats.longestStreak === 'number' && 
        stats.currentStreak > stats.longestStreak) {
      errors.push('Current streak cannot be longer than longest streak')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Validate that user can only access their own data
  static validateUserOwnership(userId: string, currentUserId: string): boolean {
    return userId === currentUserId
  }
  
  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(content: string): string {
    // Basic HTML sanitization - remove script tags and other dangerous elements
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
  }
  
  // Rate limiting helper
  static checkRateLimit(action: string, maxRequests: number, timeWindow: number): boolean {
    const key = `rateLimit_${action}`
    const now = Date.now()
    
    // Get stored requests from localStorage
    const stored = localStorage.getItem(key)
    let requests: number[] = stored ? JSON.parse(stored) : []
    
    // Remove requests outside time window
    requests = requests.filter(timestamp => now - timestamp < timeWindow)
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      return false
    }
    
    // Add current request
    requests.push(now)
    localStorage.setItem(key, JSON.stringify(requests))
    
    return true
  }
  
  private static isValidDateString(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }
}

// Rate limiting constants
export const RATE_LIMITS = {
  CREATE_ENTRY: { maxRequests: 10, timeWindow: 60000 }, // 10 entries per minute
  UPDATE_ENTRY: { maxRequests: 20, timeWindow: 60000 }, // 20 updates per minute
  DELETE_ENTRY: { maxRequests: 5, timeWindow: 60000 },  // 5 deletions per minute
  UPDATE_STATS: { maxRequests: 50, timeWindow: 60000 }  // 50 stat updates per minute
}
