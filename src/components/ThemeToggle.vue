<template>
  <button
    @click="themeStore.toggleTheme()"
    class="theme-toggle"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <div class="theme-toggle-track">
      <div class="theme-toggle-thumb">
        <div class="theme-icon">
          <svg v-if="!isDark" class="sun-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="moon-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
</script>

<style scoped>
.theme-toggle {
  @apply relative inline-flex items-center justify-center p-1 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20;
}

.theme-toggle-track {
  @apply relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full shadow-inner transition-colors duration-300;
}

.theme-toggle-thumb {
  @apply absolute top-0.5 left-0.5 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center;
  transform: translateX(0);
}

.theme-toggle:hover .theme-toggle-thumb {
  @apply shadow-xl;
}

.theme-toggle[aria-label*="Switch to light"] .theme-toggle-thumb {
  transform: translateX(1.75rem);
}

.theme-icon {
  @apply w-4 h-4 text-yellow-500 dark:text-blue-400;
}

.sun-icon,
.moon-icon {
  @apply w-full h-full transition-all duration-300;
}

.sun-icon {
  @apply text-yellow-500;
}

.moon-icon {
  @apply text-blue-400;
}

/* Animation for smooth theme transition */
.theme-toggle {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle-track {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.theme-toggle[aria-label*="Switch to light"] .theme-toggle-track {
  background: linear-gradient(135deg, #1e40af, #3730a3);
}
</style>
