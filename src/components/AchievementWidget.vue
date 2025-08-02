<template>
  <div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">🏆 Achievements</h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">Level {{ gamificationStore.currentLevel }}</span>
        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
          <span class="text-white text-xs font-bold">{{ gamificationStore.currentLevel }}</span>
        </div>
      </div>
    </div>

    <!-- XP Progress Bar -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Experience Points</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ gamificationStore.xpToNextLevel }} XP to level {{ gamificationStore.currentLevel + 1 }}</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div 
          class="h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
          :style="{ width: `${gamificationStore.xpProgress}%` }"
        ></div>
      </div>
      <div class="text-center mt-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ gamificationStore.userStats.xp }} XP</span>
      </div>
    </div>

    <!-- Recent Badges -->
    <div v-if="recentBadges.length > 0" class="mb-6">
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Achievements</h4>
      <div class="flex flex-wrap gap-2">
        <div 
          v-for="badge in recentBadges"
          :key="badge.id"
          class="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 border shadow-sm"
          :class="badgeRarityClasses(badge.rarity)"
        >
          <span class="text-lg">{{ badge.icon }}</span>
          <div>
            <div class="text-sm font-medium text-gray-900 dark:text-gray-600">{{ badge.name }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">+{{ badge.xpReward }} XP</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievement Progress -->
    <div>
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Progress</h4>
      <div class="space-y-3 max-h-48 overflow-y-auto">
        <div 
          v-for="achievement in sortedAchievements"
          :key="achievement.id"
          class="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200"
          :class="achievement.isUnlocked ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'"
        >
          <!-- Icon -->
          <div 
            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            :class="achievement.isUnlocked ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-600'"
          >
            <span 
              class="text-lg"
              :class="achievement.isUnlocked ? '' : 'opacity-50 grayscale'"
            >
              {{ achievement.icon }}
            </span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h5 
                class="text-sm font-medium truncate"
                :class="achievement.isUnlocked ? 'text-green-900 dark:text-green-200' : 'text-gray-900 dark:text-gray-100'"
              >
                {{ achievement.name }}
              </h5>
              <div class="flex items-center space-x-2">
                <span 
                  v-if="achievement.isUnlocked"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                >
                  ✓ Unlocked
                </span>
                <span 
                  v-else
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ getProgress(achievement) }}
                </span>
              </div>
            </div>
            <p 
              class="text-xs mt-1"
              :class="achievement.isUnlocked ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'"
            >
              {{ achievement.description }}
            </p>
            
            <!-- Progress bar for locked achievements -->
            <div v-if="!achievement.isUnlocked && getProgressPercent(achievement) > 0" class="mt-2">
              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                <div 
                  class="h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-500"
                  :style="{ width: `${getProgressPercent(achievement)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '@/stores/gamification'
import type { Achievement } from '@/types/journal'

const gamificationStore = useGamificationStore()

const recentBadges = computed(() => {
  return gamificationStore.userStats.badges
    .slice()
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3)
})

const sortedAchievements = computed(() => {
  return gamificationStore.availableAchievements
    .slice()
    .sort((a, b) => {
      // Unlocked achievements first, then by XP reward
      if (a.isUnlocked && !b.isUnlocked) return -1
      if (!a.isUnlocked && b.isUnlocked) return 1
      return b.badge.xpReward - a.badge.xpReward
    })
})

function badgeRarityClasses(rarity: string) {
  switch (rarity) {
    case 'legendary': return 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50'
    case 'epic': return 'border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50'
    case 'rare': return 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50'
    default: return 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
  }
}

function getProgress(achievement: Achievement) {
  const stats = gamificationStore.userStats
  
  switch (achievement.requirement.type) {
    case 'entries':
      return `${stats.totalEntries}/${achievement.requirement.count}`
    case 'streak':
      return `${stats.currentStreak}/${achievement.requirement.count}`
    case 'reactions':
      // TODO: Implement reaction counting
      return `0/${achievement.requirement.count}`
    case 'public_entries':
      // TODO: Implement public entry counting
      return `0/${achievement.requirement.count}`
    default:
      return '0/1'
  }
}

function getProgressPercent(achievement: Achievement) {
  const stats = gamificationStore.userStats
  
  let current = 0
  switch (achievement.requirement.type) {
    case 'entries':
      current = stats.totalEntries
      break
    case 'streak':
      current = stats.currentStreak
      break
    case 'reactions':
      current = 0 // TODO: Implement
      break
    case 'public_entries':
      current = 0 // TODO: Implement
      break
  }
  
  return Math.min((current / achievement.requirement.count) * 100, 100)
}
</script>
