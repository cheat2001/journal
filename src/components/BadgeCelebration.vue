<template>
  <!-- Badge Unlock Celebration Modal -->
  <teleport to="body">
    <div 
      v-if="gamificationStore.newlyUnlockedBadges.length > 0" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click="handleBackdropClick"
    >
      <div 
        class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center transform transition-all duration-500 ease-out"
        :class="celebrationClasses"
        @click.stop
      >
        <!-- Celebration Header -->
        <div class="mb-6">
          <div class="text-6xl animate-bounce mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h2>
          <p class="text-gray-600">Congratulations on your progress!</p>
        </div>

        <!-- Badge Display -->
        <div class="space-y-4 mb-6">
          <div 
            v-for="(badge, index) in gamificationStore.newlyUnlockedBadges"
            :key="badge.id"
            class="p-4 rounded-xl border-2 transform transition-all duration-700 ease-out"
            :class="getBadgeClasses(badge.rarity)"
            :style="{ 
              animationDelay: `${index * 200}ms`,
              transform: showBadges ? 'scale(1) rotateY(0deg)' : 'scale(0.8) rotateY(180deg)'
            }"
          >
            <div class="text-4xl mb-2">{{ badge.icon }}</div>
            <h3 class="text-lg font-bold text-gray-900">{{ badge.name }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ badge.description }}</p>
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              +{{ badge.xpReward }} XP
            </div>
          </div>
        </div>

        <!-- Level Up Notice -->
        <div v-if="hasLeveledUp" class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div class="text-3xl mb-2">⬆️</div>
          <h3 class="text-lg font-bold text-purple-900">Level Up!</h3>
          <p class="text-purple-700">You reached Level {{ gamificationStore.currentLevel }}!</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button
            @click="shareBadge"
            class="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
          >
            Share Achievement
          </button>
          <button
            @click="closeCelebration"
            class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  </teleport>

  <!-- Floating Badge Notifications -->
  <div class="fixed top-4 right-4 z-40 space-y-2">
    <div 
      v-for="badge in floatingBadges"
      :key="`floating-${badge.id}`"
      class="bg-white rounded-lg shadow-lg border p-4 max-w-sm transform transition-all duration-500 ease-out"
      :class="floatingBadgeClasses"
    >
      <div class="flex items-center space-x-3">
        <div class="text-2xl">{{ badge.icon }}</div>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-gray-900">{{ badge.name }}</h4>
          <p class="text-xs text-gray-600">+{{ badge.xpReward }} XP</p>
        </div>
        <div class="text-lg">✨</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useGamificationStore } from '@/stores/gamification'
import type { Badge } from '@/types/journal'

const gamificationStore = useGamificationStore()

const showBadges = ref(false)
const floatingBadges = ref<Badge[]>([])
const previousLevel = ref(gamificationStore.currentLevel)

// Computed
const celebrationClasses = computed(() => {
  return showBadges.value ? 'scale-100 opacity-100' : 'scale-90 opacity-95'
})

const floatingBadgeClasses = computed(() => {
  return 'translate-x-0 opacity-100'
})

const hasLeveledUp = computed(() => {
  return gamificationStore.currentLevel > previousLevel.value
})

// Watch for new badges
watch(() => gamificationStore.newlyUnlockedBadges, (newBadges) => {
  if (newBadges.length > 0) {
    // Small delay to show entrance animation
    setTimeout(() => {
      showBadges.value = true
    }, 100)

    // Also show floating notifications for quick interactions
    floatingBadges.value = [...newBadges]
    setTimeout(() => {
      floatingBadges.value = []
    }, 4000)
  }
}, { immediate: true })

// Watch for level changes
watch(() => gamificationStore.currentLevel, (newLevel) => {
  if (newLevel > previousLevel.value) {
    // Level up detected
    console.log('Level up!', newLevel)
  }
  previousLevel.value = newLevel
})

onMounted(() => {
  previousLevel.value = gamificationStore.currentLevel
})

// Methods
function getBadgeClasses(rarity: string) {
  const baseClasses = 'animate-pulse-slow'
  switch (rarity) {
    case 'legendary':
      return `${baseClasses} border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 shadow-lg`
    case 'epic':
      return `${baseClasses} border-orange-300 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 shadow-md`
    case 'rare':
      return `${baseClasses} border-blue-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-md`
    default:
      return `${baseClasses} border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-sm`
  }
}

function handleBackdropClick() {
  closeCelebration()
}

function closeCelebration() {
  showBadges.value = false
  setTimeout(() => {
    gamificationStore.clearNewBadges()
    previousLevel.value = gamificationStore.currentLevel
  }, 300)
}

function shareBadge() {
  if (gamificationStore.newlyUnlockedBadges.length > 0) {
    const badge = gamificationStore.newlyUnlockedBadges[0]
    const text = `🎉 I just unlocked the "${badge.name}" achievement in my journaling journey! ${badge.icon} #JournalingGoals #PersonalGrowth`
    
    if (navigator.share) {
      navigator.share({
        title: 'Achievement Unlocked!',
        text: text,
        url: window.location.href
      }).catch(() => {
        // Fallback to clipboard
        copyToClipboard(text)
      })
    } else {
      copyToClipboard(text)
    }
  }
  closeCelebration()
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // Could show a toast notification here
    console.log('Achievement shared to clipboard!')
  }).catch(() => {
    console.error('Failed to copy to clipboard')
  })
}
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}
</style>
