import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme store after pinia is set up
import { useThemeStore } from './stores/theme'

app.mount('#app')

// Initialize theme after app is mounted
const themeStore = useThemeStore()
themeStore.initializeTheme()
