<template>
  <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-900">🔥 Streak Progress</h3>
      <div class="text-right">
        <div class="text-2xl font-bold text-orange-600">{{ gamificationStore.userStats.currentStreak }}</div>
        <div class="text-xs text-gray-600">days</div>
      </div>
    </div>

    <!-- Flame Animation -->
    <div class="flex justify-center mb-6">
      <div class="relative">
        <!-- Flame base -->
        <div 
          class="w-16 h-20 rounded-full transform transition-all duration-1000 ease-out"
          :class="flameClasses"
        >
          <!-- Inner flame -->
          <div 
            class="absolute inset-2 rounded-full transform transition-all duration-700 ease-out"
            :class="innerFlameClasses"
          ></div>
          <!-- Core flame -->
          <div 
            class="absolute inset-4 rounded-full transform transition-all duration-500 ease-out"
            :class="coreFlameClasses"
          ></div>
        </div>
        
        <!-- Streak number overlay -->
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-white font-bold text-lg drop-shadow-lg">
            {{ gamificationStore.userStats.currentStreak }}
          </span>
        </div>
      </div>
    </div>

    <!-- Progress towards next milestone -->
    <div class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">Next milestone</span>
        <span class="text-sm text-gray-600">{{ nextMilestone }} days</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-500 ease-out"
          :class="progressBarClass"
          :style="{ width: `${milestoneProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 gap-4 pt-4 border-t border-orange-100">
      <div class="text-center">
        <div class="text-xl font-bold text-gray-900">{{ gamificationStore.userStats.longestStreak }}</div>
        <div class="text-xs text-gray-600">Longest Streak</div>
      </div>
      <div class="text-center">
        <div class="text-xl font-bold text-gray-900">{{ gamificationStore.userStats.totalEntries }}</div>
        <div class="text-xs text-gray-600">Total Entries</div>
      </div>
    </div>

    <!-- Motivational message -->
    <div class="mt-4 text-center">
      <p class="text-sm text-gray-600 italic">{{ motivationalMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '@/stores/gamification'

const gamificationStore = useGamificationStore()

// Computed properties for flame styling based on streak length
const flameClasses = computed(() => {
  const streak = gamificationStore.userStats.currentStreak
  if (streak >= 30) return 'bg-gradient-to-t from-purple-500 via-pink-500 to-yellow-400 animate-pulse scale-110'
  if (streak >= 14) return 'bg-gradient-to-t from-red-500 via-orange-500 to-yellow-400 animate-pulse scale-105'
  if (streak >= 7) return 'bg-gradient-to-t from-orange-500 via-red-500 to-yellow-500 scale-100'
  if (streak >= 3) return 'bg-gradient-to-t from-yellow-500 via-orange-500 to-red-500 scale-95'
  if (streak >= 1) return 'bg-gradient-to-t from-yellow-400 via-orange-400 to-red-400 scale-90'
  return 'bg-gradient-to-t from-gray-400 via-gray-500 to-gray-600 scale-75 opacity-50'
})

const innerFlameClasses = computed(() => {
  const streak = gamificationStore.userStats.currentStreak
  if (streak >= 30) return 'bg-gradient-to-t from-pink-400 via-yellow-400 to-white animate-pulse'
  if (streak >= 14) return 'bg-gradient-to-t from-orange-400 via-yellow-400 to-white animate-pulse'
  if (streak >= 7) return 'bg-gradient-to-t from-red-400 via-yellow-400 to-white'
  if (streak >= 3) return 'bg-gradient-to-t from-orange-400 via-yellow-400 to-white'
  if (streak >= 1) return 'bg-gradient-to-t from-yellow-300 via-yellow-200 to-white'
  return 'bg-gradient-to-t from-gray-300 via-gray-200 to-gray-100'
})

const coreFlameClasses = computed(() => {
  const streak = gamificationStore.userStats.currentStreak
  if (streak >= 30) return 'bg-gradient-to-t from-white via-yellow-200 to-transparent animate-pulse'
  if (streak >= 14) return 'bg-gradient-to-t from-white via-yellow-200 to-transparent animate-pulse'
  if (streak >= 7) return 'bg-gradient-to-t from-white via-yellow-100 to-transparent'
  if (streak >= 3) return 'bg-gradient-to-t from-white via-yellow-100 to-transparent'
  if (streak >= 1) return 'bg-gradient-to-t from-white via-yellow-50 to-transparent'
  return 'bg-gradient-to-t from-gray-100 via-gray-50 to-transparent'
})

const nextMilestone = computed(() => {
  const streak = gamificationStore.userStats.currentStreak
  if (streak < 7) return 7
  if (streak < 14) return 14
  if (streak < 30) return 30
  if (streak < 50) return 50
  if (streak < 100) return 100
  return Math.ceil((streak + 1) / 100) * 100
})

const milestoneProgress = computed(() => {
  const streak = gamificationStore.userStats.currentStreak
  const milestone = nextMilestone.value
  const previousMilestone = milestone === 7 ? 0 : 
    milestone === 14 ? 7 :
    milestone === 30 ? 14 :
    milestone === 50 ? 30 :
    milestone === 100 ? 50 :
    milestone - 100

  return ((streak - previousMilestone) / (milestone - previousMilestone)) * 100
})

const progressBarClass = computed(() => {
  const streak = gamificationStore.userStats.currentStreak
  if (streak >= 30) return 'bg-gradient-to-r from-purple-500 to-pink-500'
  if (streak >= 14) return 'bg-gradient-to-r from-red-500 to-orange-500'
  if (streak >= 7) return 'bg-gradient-to-r from-orange-500 to-yellow-500'
  if (streak >= 3) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  return 'bg-gradient-to-r from-yellow-400 to-orange-400'
})

const motivationalMessage = computed(() => {
  const streak = gamificationStore.userStats.currentStreak
  if (streak === 0) return "Ready to start your journey? ✨"
  if (streak < 3) return "You're building momentum! 🌱"
  if (streak < 7) return "Great consistency! Keep going! 💪"
  if (streak < 14) return "You're on fire! Amazing dedication! 🔥"
  if (streak < 30) return "Incredible commitment! You're unstoppable! 🚀"
  if (streak < 50) return "Master of consistency! Inspiring! 🏆"
  if (streak < 100) return "Legendary dedication! You're amazing! 💎"
  return "You are a journaling legend! 🌟"
})
</script>
