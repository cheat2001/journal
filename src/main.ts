import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Developer attribution
console.log(
  '%c🎨 Daily Journal %c- Developed by Chansocheat.Sok',
  'color: #3B82F6; font-weight: bold; font-size: 16px;',
  'color: #6B7280; font-size: 14px;'
)
console.log(
  '%cBuilding tools for reflection and personal growth ✨',
  'color: #10B981; font-style: italic;'
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
