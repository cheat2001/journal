import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { UserStats, Badge } from '@/types/journal'
import { ACHIEVEMENTS } from '@/types/journal'
import { useAuthStore } from './auth'
import { SecurityValidator, RATE_LIMITS } from '@/utils/security'

export const useGamificationStore = defineStore('gamification', () => {
  const userStats = ref<UserStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    badges: [],
    level: 1,
    xp: 0
  })
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  const newlyUnlockedBadges = ref<Badge[]>([])
  
  const authStore = useAuthStore()

  // Computed properties
  const currentLevel = computed(() => Math.floor(userStats.value.xp / 1000) + 1)
  const xpToNextLevel = computed(() => (currentLevel.value * 1000) - userStats.value.xp)
  const xpProgress = computed(() => (userStats.value.xp % 1000) / 1000 * 100)
  
  const availableAchievements = computed(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      isUnlocked: userStats.value.badges.some(badge => badge.id === achievement.badge.id)
    }))
  })

  const unlockedAchievements = computed(() => 
    availableAchievements.value.filter(a => a.isUnlocked)
  )

  const lockedAchievements = computed(() => 
    availableAchievements.value.filter(a => !a.isUnlocked)
  )

  // Actions
  async function fetchUserStats() {
    if (!authStore.user) return
    
    loading.value = true
    error.value = null

    try {
      const statsDoc = await getDoc(doc(db, 'user-stats', authStore.user.uid))
      
      if (statsDoc.exists()) {
        const data = statsDoc.data()
        userStats.value = {
          ...data,
          badges: data.badges?.map((badge: Record<string, unknown>) => ({
            ...badge,
            unlockedAt: badge.unlockedAt && typeof badge.unlockedAt === 'object' && 'toDate' in badge.unlockedAt
              ? (badge.unlockedAt as { toDate(): Date }).toDate()
              : new Date()
          })) || []
        } as UserStats
      } else {
        // Initialize user stats
        await initializeUserStats()
      }

      // Update level based on XP
      userStats.value.level = currentLevel.value
    } catch (err) {
      error.value = `Failed to fetch user stats: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error fetching user stats:', err)
    } finally {
      loading.value = false
    }
  }

  async function initializeUserStats() {
    if (!authStore.user) return

    const initialStats: UserStats = {
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      badges: [],
      level: 1,
      xp: 0
    }

    try {
      await setDoc(doc(db, 'user-stats', authStore.user.uid), initialStats)
      userStats.value = initialStats
    } catch (err) {
      console.error('Error initializing user stats:', err)
    }
  }

  async function updateStreak(entryDate: string) {
    if (!authStore.user) return

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    let newStreak = userStats.value.currentStreak

    if (entryDate === today) {
      // Entry for today
      if (userStats.value.lastEntryDate === yesterday) {
        // Continue streak
        newStreak = userStats.value.currentStreak + 1
      } else if (userStats.value.lastEntryDate !== today) {
        // Start new streak or first entry today
        newStreak = 1
      }
      // If already wrote today, don't change streak
    }

    const updates: Partial<UserStats> = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, userStats.value.longestStreak),
      lastEntryDate: entryDate,
      totalEntries: userStats.value.totalEntries + 1,
      xp: userStats.value.xp + 25 // Base XP for writing entry
    }

    if (newStreak === 1 && (!userStats.value.streakStartDate || userStats.value.currentStreak === 0)) {
      updates.streakStartDate = entryDate
    }

    await updateUserStats(updates)
    
    // Check for achievements
    await checkAndUnlockAchievements()
  }

  async function updateUserStats(updates: Partial<UserStats>) {
    if (!authStore.user) return

    // Security: Rate limiting check
    if (!SecurityValidator.checkRateLimit('UPDATE_STATS', RATE_LIMITS.UPDATE_STATS.maxRequests, RATE_LIMITS.UPDATE_STATS.timeWindow)) {
      throw new Error('Too many requests. Please wait before updating stats.')
    }

    // Security: Validate user stats data
    const statsToValidate = { ...userStats.value, ...updates }
    const validation = SecurityValidator.validateUserStats(statsToValidate)
    
    if (!validation.isValid) {
      throw new Error(`Invalid stats data: ${validation.errors.join(', ')}`)
    }

    try {
      // Update local state
      Object.assign(userStats.value, updates)
      userStats.value.level = currentLevel.value

      // Update in Firestore
      await updateDoc(doc(db, 'user-stats', authStore.user.uid), updates)
    } catch (err) {
      error.value = `Failed to update user stats: ${err instanceof Error ? err.message : 'Unknown error'}`
      console.error('Error updating user stats:', err)
    }
  }

  async function checkAndUnlockAchievements() {
    if (!authStore.user) return

    const batch = writeBatch(db)
    const newBadges: Badge[] = []

    // Get user's reaction count
    const reactionsQuery = query(
      collection(db, 'journal-entries'),
      where('userId', '==', authStore.user.uid)
    )
    const entriesSnapshot = await getDocs(reactionsQuery)
    let totalReactions = 0
    let publicEntries = 0
    
    entriesSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.reactions) {
        totalReactions += data.reactions.length
      }
      if (data.isPublic) {
        publicEntries++
      }
    })

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (userStats.value.badges.some(badge => badge.id === achievement.badge.id)) {
        continue
      }

      let shouldUnlock = false

      switch (achievement.requirement.type) {
        case 'entries':
          shouldUnlock = userStats.value.totalEntries >= achievement.requirement.count
          break
        case 'streak':
          shouldUnlock = userStats.value.currentStreak >= achievement.requirement.count
          break
        case 'reactions':
          shouldUnlock = totalReactions >= achievement.requirement.count
          break
        case 'public_entries':
          shouldUnlock = publicEntries >= achievement.requirement.count
          break
      }

      if (shouldUnlock) {
        const newBadge: Badge = {
          ...achievement.badge,
          unlockedAt: new Date()
        }
        
        newBadges.push(newBadge)
        userStats.value.badges.push(newBadge)
        userStats.value.xp += newBadge.xpReward
      }
    }

    if (newBadges.length > 0) {
      // Update user stats with new badges and XP
      batch.update(doc(db, 'user-stats', authStore.user.uid), {
        badges: userStats.value.badges,
        xp: userStats.value.xp,
        level: currentLevel.value
      })

      await batch.commit()
      
      // Show celebration
      newlyUnlockedBadges.value = newBadges
      
      // Clear after 5 seconds
      setTimeout(() => {
        newlyUnlockedBadges.value = []
      }, 5000)
    }
  }

  function clearNewBadges() {
    newlyUnlockedBadges.value = []
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    userStats,
    loading,
    error,
    newlyUnlockedBadges,
    
    // Computed
    currentLevel,
    xpToNextLevel,
    xpProgress,
    availableAchievements,
    unlockedAchievements,
    lockedAchievements,
    
    // Actions
    fetchUserStats,
    initializeUserStats,
    updateStreak,
    updateUserStats,
    checkAndUnlockAchievements,
    clearNewBadges,
    clearError
  }
})
