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
          <p class="text-gray-700 leading-relaxed">
            Passionate about creating meaningful digital experiences that help people grow and reflect. 
            This journal application combines modern web technologies with thoughtful design to provide 
            a peaceful space for daily reflection and personal growth.
          </p>
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
