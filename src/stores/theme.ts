import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDark = ref(false)
  
  // Getters
  const theme = computed(() => isDark.value ? 'dark' : 'light')
  const themeClass = computed(() => isDark.value ? 'dark' : '')
  
  // Actions
  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
    saveThemePreference()
  }
  
  function setTheme(theme: 'light' | 'dark' | 'system') {
    if (theme === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = theme === 'dark'
    }
    applyTheme()
    saveThemePreference()
  }
  
  function applyTheme() {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  function saveThemePreference() {
    localStorage.setItem('theme-preference', isDark.value ? 'dark' : 'light')
  }
  
  function loadThemePreference() {
    const saved = localStorage.getItem('theme-preference')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // Default to system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }
  
  function initializeTheme() {
    loadThemePreference()
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      const saved = localStorage.getItem('theme-preference')
      if (!saved) {
        // Only auto-update if user hasn't set a preference
        isDark.value = e.matches
        applyTheme()
      }
    })
  }
  
  return {
    isDark,
    theme,
    themeClass,
    toggleTheme,
    setTheme,
    initializeTheme
  }
})
