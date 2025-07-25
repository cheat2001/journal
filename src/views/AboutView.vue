<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Back Button -->
      <button
        @click="$router.push('/')"
        class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-200"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Journal
      </button>

      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-xl mb-8">
          <span class="text-4xl">📖</span>
        </div>
        <h1 class="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
          Daily Journal
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your personal space for reflection and growth. Built with modern technologies and designed for a seamless journaling experience.
        </p>
      </div>

      <!-- Developer Section -->
      <div class="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-12">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg mb-6">
            <span class="text-2xl font-bold text-white">CS</span>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-3">Developed by Chansocheat.Sok</h2>
          <p class="text-lg text-gray-600">Full-Stack Developer & UI/UX Enthusiast</p>
        </div>

        <div class="prose prose-lg mx-auto text-center">
          <p class="text-gray-700 leading-relaxed mb-6">
            Passionate about creating meaningful digital experiences that help people grow and reflect. 
            This journal application combines modern web technologies with thoughtful design to provide 
            a peaceful space for daily reflection and personal growth.
          </p>
          
          <!-- Social Links -->
          <div class="md:flex md:flex-row md:justify-center md:gap-3 flex-col gap-4">
            <a 
              href="https://github.com/cheat2001/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center space-x-3 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">GitHub</span>
            </a>
            
            <a 
              href="https://www.facebook.com/sok.chansocheat/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">Facebook</span>
            </a>
            
            <a 
              href="https://www.linkedin.com/in/chansocheatsok/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center space-x-3 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Tech Stack -->
      <div class="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-12">
        <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">Built With</h3>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
            <div class="text-3xl mb-2">⚡</div>
            <div class="font-semibold text-gray-900">Vue 3</div>
            <div class="text-sm text-gray-600">Composition API</div>
          </div>
          
          <div class="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
            <div class="text-3xl mb-2">📘</div>
            <div class="font-semibold text-gray-900">TypeScript</div>
            <div class="text-sm text-gray-600">Type Safety</div>
          </div>
          
          <div class="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
            <div class="text-3xl mb-2">🔥</div>
            <div class="font-semibold text-gray-900">Firebase</div>
            <div class="text-sm text-gray-600">Backend & Auth</div>
          </div>
          
          <div class="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
            <div class="text-3xl mb-2">🎨</div>
            <div class="font-semibold text-gray-900">Tailwind</div>
            <div class="text-sm text-gray-600">Styling</div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-12">
        <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">Features</h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900">Secure Authentication</h4>
              <p class="text-gray-600 text-sm">Firebase-powered login with Google integration</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900">Emotion Tracking</h4>
              <p class="text-gray-600 text-sm">Track your mood and feelings with each entry</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900">Beautiful Interface</h4>
              <p class="text-gray-600 text-sm">Clean, modern design that's easy on the eyes</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900">Real-time Sync</h4>
              <p class="text-gray-600 text-sm">Your entries are saved and synced instantly</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center py-8">
        <div class="flex items-center justify-center space-x-2 text-lg text-gray-600 mb-4">
          <span>Made with</span>
          <span class="text-red-500 text-xl">❤️</span>
          <span>by</span>
          <span class="font-bold text-blue-600">Chansocheat.Sok</span>
        </div>
        <p class="text-gray-500">
          © 2025 Daily Journal. Building tools for reflection and personal growth.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Nothing needed for this static page
</script>
