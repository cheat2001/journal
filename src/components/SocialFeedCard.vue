<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm group">
    <!-- Enhanced User Header -->
    <div class="px-4 sm:px-6 py-3 sm:py-5 border-b border-gray-100/80 bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-pink-50/30">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="relative">
            <div class="h-10 w-10 sm:h-13 sm:w-13 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-2 ring-white/80 group-hover:ring-4 group-hover:ring-blue-500/20 transition-all duration-300">
              <span class="text-xs sm:text-sm font-bold text-white">
                {{ entry.userInitials }}
              </span>
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
          </div>
          <div class="ml-3 sm:ml-4">
            <p class="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{{ entry.userDisplayName }}</p>
            <p class="text-xs text-gray-600 flex items-center mt-1">
              <svg class="w-3 h-3 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              {{ formatDate(entry.createdAt) }}
            </p>
          </div>
        </div>
        
        <!-- Enhanced Privacy Badge -->
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/50 shadow-sm">
            <svg class="w-3 h-3 mr-1 sm:mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
            Public
          </span>
        </div>
      </div>
    </div>

    <!-- Enhanced Content -->
    <div class="px-4 sm:px-6 py-4 sm:py-6">
      <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
        <span class="text-xl sm:text-3xl mr-2 sm:mr-3 opacity-80">✨</span>
        <span class="text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{{ formatEntryDate(entry.date) }}</span>
      </h3>
      
      <div class="space-y-4 sm:space-y-5">
        <!-- Enhanced Gratitude -->
        <div v-if="entry.gratitude" class="group-hover-section">
          <div class="bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-yellow-50/60 border-l-4 border-amber-400 p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-50 hover:via-orange-50 hover:to-yellow-50">
            <h4 class="font-semibold text-amber-900 text-sm mb-3 flex items-center">
              <span class="text-xl sm:text-2xl mr-2.5 drop-shadow-sm">🙏</span>
              <span class="uppercase tracking-wide text-xs sm:text-sm font-bold">Gratitude</span>
            </h4>
            <p v-if="!showFullContent && entry.gratitude.length > 120" class="text-amber-800 text-sm sm:text-base leading-relaxed">
              {{ entry.gratitude.substring(0, 120) }}...
              <button 
                @click="showFullContent = true"
                class="text-blue-600 hover:text-blue-700 font-medium ml-2 underline decoration-2 underline-offset-2 hover:decoration-blue-300 transition-all"
              >
                Read more
              </button>
            </p>
            <p v-else class="whitespace-pre-wrap text-amber-800 text-sm sm:text-base leading-relaxed">{{ entry.gratitude }}</p>
          </div>
        </div>

        <!-- Enhanced Emotion -->
        <div v-if="entry.emotion" class="group-hover-section">
          <div class="bg-gradient-to-r from-purple-50/70 via-pink-50/50 to-indigo-50/60 border-l-4 border-purple-400 p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-indigo-50">
            <h4 class="font-semibold text-purple-900 text-sm mb-3 flex items-center">
              <span class="text-xl sm:text-2xl mr-2.5 drop-shadow-sm">💭</span>
              <span class="uppercase tracking-wide text-xs sm:text-sm font-bold">Current Emotion</span>
            </h4>
            <p v-if="!showFullContent && entry.emotion.length > 120" class="text-purple-800 text-sm sm:text-base leading-relaxed">
              {{ entry.emotion.substring(0, 120) }}...
              <button 
                @click="showFullContent = true"
                class="text-blue-600 hover:text-blue-700 font-medium ml-2 underline decoration-2 underline-offset-2 hover:decoration-blue-300 transition-all"
              >
                Read more
              </button>
            </p>
            <p v-else class="whitespace-pre-wrap text-purple-800 text-sm sm:text-base leading-relaxed">{{ entry.emotion }}</p>
          </div>
        </div>

        <!-- Enhanced Challenges (if expanded) -->
        <div v-if="showFullContent && entry.challenges" class="group-hover-section">
          <div class="bg-gradient-to-r from-red-50/70 via-pink-50/50 to-rose-50/60 border-l-4 border-red-400 p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:via-pink-50 hover:to-rose-50">
            <h4 class="font-semibold text-red-900 text-sm mb-3 flex items-center">
              <span class="text-xl sm:text-2xl mr-2.5 drop-shadow-sm">🎯</span>
              <span class="uppercase tracking-wide text-xs sm:text-sm font-bold">Challenges</span>
            </h4>
            <p class="whitespace-pre-wrap text-red-800 text-sm sm:text-base leading-relaxed">{{ entry.challenges }}</p>
          </div>
        </div>

        <!-- Enhanced Learning (if expanded) -->
        <div v-if="showFullContent && entry.learning" class="group-hover-section">
          <div class="bg-gradient-to-r from-green-50/70 via-emerald-50/50 to-teal-50/60 border-l-4 border-green-400 p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gradient-to-r hover:from-green-50 hover:via-emerald-50 hover:to-teal-50">
            <h4 class="font-semibold text-green-900 text-sm mb-3 flex items-center">
              <span class="text-xl sm:text-2xl mr-2.5 drop-shadow-sm">📚</span>
              <span class="uppercase tracking-wide text-xs sm:text-sm font-bold">Learning</span>
            </h4>
            <p class="whitespace-pre-wrap text-green-800 text-sm sm:text-base leading-relaxed">{{ entry.learning }}</p>
          </div>
        </div>

        <!-- Enhanced Show more sections preview -->
        <div v-if="!showFullContent && (entry.challenges || entry.learning)" class="text-center pt-3">
          <button 
            @click="showFullContent = true"
            class="group-hover-expand inline-flex items-center px-6 py-3 text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200/50 shadow-sm hover:shadow-md hover:scale-[1.02]"
          >
            <span class="mr-2">+ {{ [entry.challenges, entry.learning].filter(Boolean).length }} more section{{ [entry.challenges, entry.learning].filter(Boolean).length > 1 ? 's' : '' }}</span>
            <svg class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Actions Bar -->
    <div class="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50/80 to-gray-50/80 border-t border-gray-100">
      <div class="flex justify-between items-center">
        <!-- Entry Stats -->
        <div class="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
          <div class="flex items-center space-x-1">
            <svg class="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span class="font-medium text-xs sm:text-sm">{{ entry.views || 0 }} views</span>
          </div>
        </div>
        
        <!-- Enhanced View Full Entry Button -->
        <button
          @click="viewFullEntry"
          class="group inline-flex items-center px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span class="text-blue-600 mr-1 text-sm sm:text-base">📖</span>
          <span class="hidden sm:inline">Read Full Entry</span>
          <span class="sm:hidden">Read Full</span>
          <svg class="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-0.5 transition-transform duration-200 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Enhanced Interactive Actions -->
    <div class="px-4 sm:px-6 py-3 sm:py-5 border-t border-gray-100">
      <div class="flex items-center space-x-2 sm:space-x-4">
        <!-- Enhanced Reaction Button -->
        <div class="relative" ref="reactionDropdown">
          <button
            @click="toggleReactionDropdown"
            class="flex items-center px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-base font-semibold transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
            :class="userHasReacted 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 hover:from-blue-600 hover:to-blue-700 hover:border-blue-600 shadow-blue-200' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-gray-200'"
          >
            <svg class="w-3 h-3 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.789l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
            </svg>
            <span class="text-xs sm:text-sm">{{ userHasReacted ? 'Liked' : 'React' }}</span>
          </button>

          <!-- Enhanced Reaction Dropdown -->
          <div v-if="showReactionDropdown" 
               class="absolute bottom-full left-0 mb-3 bg-white rounded-xl shadow-xl border border-gray-200 z-30 w-[240px] sm:w-[320px] ml-2 sm:ml-0 reaction-dropdown">
            <div class="flex p-2 sm:p-3 justify-between items-center bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <button
                v-for="reaction in REACTION_TYPES"
                :key="reaction.value"
                @click="handleReactionClick(reaction.value)"
                class="p-1.5 sm:p-2.5 rounded-lg hover:bg-white/80 text-base sm:text-lg transition-all duration-150 hover:scale-110 active:scale-95 w-[32px] h-[32px] sm:w-[42px] sm:h-[42px] flex items-center justify-center flex-shrink-0 shadow-sm hover:shadow-md"
                :title="reaction.label"
              >
                {{ reaction.emoji }}
              </button>
            </div>
          </div>
        </div>

        <!-- Enhanced Comment Button -->
        <button
          @click="toggleComments"
          class="flex items-center px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-base font-semibold transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
          :class="showComments 
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 hover:from-purple-600 hover:to-purple-700 hover:border-purple-600 shadow-purple-200' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-gray-200'"
        >
          <svg class="w-3 h-3 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span class="text-xs sm:text-sm">{{ showComments ? 'Hide' : 'Comment' }}</span>
        </button>
      </div>
    </div>

    <!-- Enhanced Reactions Display -->
    <div v-if="entry.reactions && entry.reactions.length > 0" class="px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-50 bg-gradient-to-r from-blue-50/30 to-purple-50/20">
      <div class="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
        <span class="font-semibold text-gray-800 text-xs sm:text-sm">Reactions:</span>
        <div class="flex items-center space-x-1.5 sm:space-x-3 flex-wrap">
          <div v-for="(reactionGroup, reactionType) in groupedReactions" 
               :key="reactionType"
               class="inline-flex items-center space-x-1 sm:space-x-2 bg-white/70 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white">
            <span class="text-sm sm:text-base">{{ getReactionEmoji(reactionType) }}</span>
            <span class="font-bold text-gray-800 text-xs sm:text-sm">{{ reactionGroup.length }}</span>
            
            <!-- User avatars in a clean row -->
            <div class="flex -space-x-0.5 sm:-space-x-1">
              <div v-for="reaction in reactionGroup.slice(0, 3)" 
                   :key="reaction.id"
                   class="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border border-white sm:border-2 text-xs font-bold text-white shadow-md hover:scale-110 transition-transform duration-200"
                   :title="reaction.userDisplayName">
                {{ reaction.userDisplayName[0] }}
              </div>
              <div v-if="reactionGroup.length > 3"
                   class="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-400 flex items-center justify-center border border-white sm:border-2 text-xs font-bold text-white shadow-md"
                   :title="`${reactionGroup.length - 3} more`">
                +{{ reactionGroup.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Comments Count Display -->
    <div v-if="entry.comments && entry.comments.length > 0" class="px-4 sm:px-6 py-2 sm:py-3"
         :class="entry.reactions && entry.reactions.length > 0 ? 'bg-gradient-to-r from-purple-50/20 to-pink-50/20' : 'border-t border-gray-50 bg-gradient-to-r from-green-50/30 to-blue-50/20'">
      <div class="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
        <span class="font-semibold text-gray-800 text-xs sm:text-sm">Comments:</span>
        <div class="flex items-center space-x-1 sm:space-x-2 bg-white/70 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-200/50 shadow-sm">
          <svg class="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span class="font-bold text-gray-800 text-xs sm:text-sm">{{ entry.comments.length }}</span>
          <span class="text-gray-600 font-medium text-xs sm:text-sm">{{ entry.comments.length === 1 ? 'comment' : 'comments' }}</span>
          
          <!-- Show first few commenters' avatars -->
          <div class="flex -space-x-0.5 sm:-space-x-1 ml-1 sm:ml-2">
            <div v-for="comment in entry.comments.slice(0, 3)" 
                 :key="comment.id"
                 class="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center border border-white sm:border-2 text-xs font-bold text-white shadow-md hover:scale-110 transition-transform duration-200"
                 :title="comment.userDisplayName">
              {{ comment.userInitials }}
            </div>
            <div v-if="entry.comments.length > 3"
                 class="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-400 flex items-center justify-center border border-white sm:border-2 text-xs font-bold text-white shadow-md"
                 :title="`${entry.comments.length - 3} more`">
              +{{ entry.comments.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Comments Section -->
    <div v-if="showComments" class="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
      <!-- Enhanced Add Comment Form -->
      <div class="px-4 sm:px-6 py-3 sm:py-5 bg-gradient-to-r from-gray-50/80 to-blue-50/30">
        <div class="flex space-x-2 sm:space-x-4">
          <div class="h-6 w-6 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span class="text-xs sm:text-sm font-bold text-white">
              {{ authStore.userDisplayName.split(' ').map(n => n[0]).join('') }}
            </span>
          </div>
          <div class="flex-1">
            <textarea
              v-model="newComment"
              placeholder="Share your thoughts..."
              rows="2"
              class="w-full text-xs sm:text-base border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm"
              @keydown.meta.enter="submitComment"
              @keydown.ctrl.enter="submitComment"
            ></textarea>
            <div class="mt-2 sm:mt-3 flex justify-between items-center">
              <span class="text-xs text-gray-500 flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span class="hidden sm:inline">Press ⌘+Enter to post</span>
                <span class="sm:hidden">⌘+Enter</span>
              </span>
              <button
                @click="submitComment"
                :disabled="!newComment.trim() || isSubmittingComment"
                class="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {{ isSubmittingComment ? 'Posting...' : 'Post Comment' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Comments List -->
      <div v-if="entry.comments && entry.comments.length > 0" class="px-4 sm:px-6 py-2 sm:py-4 space-y-3 sm:space-y-5">
        <div v-for="comment in sortedComments" :key="comment.id" class="flex space-x-2 sm:space-x-4 group-hover-comment">
          <div class="h-5 w-5 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-shadow">
            <span class="text-xs font-bold text-white">
              {{ comment.userInitials }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-100/60">
              <div class="flex justify-between items-start mb-1 sm:mb-2">
                <p class="text-xs sm:text-sm font-semibold text-gray-900 truncate">{{ comment.userDisplayName }}</p>
                <div class="flex items-center space-x-2 sm:space-x-3 ml-2 sm:ml-3 flex-shrink-0">
                  <span class="text-xs text-gray-500 font-medium">{{ formatDate(comment.createdAt) }}</span>
                  <button
                    v-if="comment.userId === authStore.user?.uid"
                    @click="deleteComment(comment.id)"
                    class="text-xs text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p class="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Toast 
      :show="showToast" 
      :message="toastMessage" 
      :type="toastType"
      @close="showToast = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { JournalEntry } from '@/types/journal'
import { REACTION_TYPES } from '@/types/journal'
import { useAuthStore } from '@/stores/auth'
import Toast from './Toast.vue'

interface Props {
  entry: JournalEntry
}

interface Emits {
  (e: 'reaction', data: { entryId: string; reactionType: string; isAdding: boolean }): void
  (e: 'comment', data: { entryId: string; content: string }): void
  (e: 'delete-comment', data: { entryId: string; commentId: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const router = useRouter()

// Reactive state
const showFullContent = ref(false)
const showReactionDropdown = ref(false)
const showComments = ref(false)
const newComment = ref('')
const isSubmittingComment = ref(false)
const reactionDropdown = ref<HTMLElement>()
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')

// Computed properties
const userHasReacted = computed(() => {
  if (!props.entry.reactions || !authStore.user) return false
  return props.entry.reactions.some(r => r.userId === authStore.user!.uid)
})

const groupedReactions = computed(() => {
  if (!props.entry.reactions) return {}
  
  return props.entry.reactions.reduce((groups, reaction) => {
    const type = reaction.type.value
    if (!groups[type]) groups[type] = []
    groups[type].push(reaction)
    return groups
  }, {} as Record<string, typeof props.entry.reactions>)
})

const sortedComments = computed(() => {
  if (!props.entry.comments) return []
  return [...props.entry.comments].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
})

// Methods
function formatEntryDate(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(d.getTime())) {
    return 'Unknown date'
  }
  
  const now = new Date()
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}d ago`
  } else {
    return d.toLocaleDateString()
  }
}

function getReactionEmoji(reactionType: string) {
  const reaction = REACTION_TYPES.find(r => r.value === reactionType)
  return reaction?.emoji || '👍'
}

function toggleReactionDropdown() {
  showReactionDropdown.value = !showReactionDropdown.value
}

function handleReactionClick(reactionType: string) {
  const userReaction = props.entry.reactions?.find(r => 
    r.userId === authStore.user?.uid && r.type.value === reactionType
  )
  
  emit('reaction', {
    entryId: props.entry.id!,
    reactionType,
    isAdding: !userReaction
  })
  
  showReactionDropdown.value = false
}

function toggleComments() {
  showComments.value = !showComments.value
}

async function submitComment() {
  if (!newComment.value.trim() || isSubmittingComment.value) return
  
  isSubmittingComment.value = true
  
  try {
    emit('comment', {
      entryId: props.entry.id!,
      content: newComment.value.trim()
    })
    newComment.value = ''
  } finally {
    isSubmittingComment.value = false
  }
}

function deleteComment(commentId: string) {
  emit('delete-comment', {
    entryId: props.entry.id!,
    commentId
  })
}

function viewFullEntry() {
  // Navigate to the full entry page
  router.push(`/entry/${props.entry.id}`)
}

function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Click outside handler for reaction dropdown
function handleClickOutside(event: Event) {
  if (reactionDropdown.value && !reactionDropdown.value.contains(event.target as Node)) {
    showReactionDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom animations and enhancements */
.reaction-dropdown {
  animation: slideInFromBottom 0.2s ease-out;
}

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced hover effects */
.group:hover .group-hover\:ring-4 {
  transition: all 0.3s ease;
}

.group-hover-section:hover {
  transform: scale(1.005);
  transition: transform 0.3s ease;
}

.group-hover-comment:hover .shadow-md {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Smooth scaling animations */
.transform {
  transition: transform 0.2s ease;
}

/* Enhanced shadow effects */
.shadow-blue-200 {
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
}

.shadow-purple-200 {
  box-shadow: 0 4px 6px -1px rgba(147, 51, 234, 0.1), 0 2px 4px -1px rgba(147, 51, 234, 0.06);
}

.shadow-gray-200 {
  box-shadow: 0 4px 6px -1px rgba(156, 163, 175, 0.1), 0 2px 4px -1px rgba(156, 163, 175, 0.06);
}

/* Enhanced backdrop blur */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Subtle gradient backgrounds */
.bg-gradient-to-r.from-blue-50\/30 {
  background: linear-gradient(to right, rgba(239, 246, 255, 0.3), rgba(245, 243, 255, 0.2), rgba(253, 244, 255, 0.3));
}

.bg-gradient-to-r.from-slate-50\/80 {
  background: linear-gradient(to right, rgba(248, 250, 252, 0.8), rgba(249, 250, 251, 0.8));
}

/* Enhanced text gradients */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Professional button enhancements */
.group-hover-expand:hover svg {
  transform: translateY(2px);
}

/* Enhanced focus states */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth transitions for all interactive elements */
button,
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced card hover effect */
.group:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Professional spacing adjustments */
.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-5 > * + * {
  margin-top: 1.25rem;
}

/* Enhanced mobile responsiveness */
@media (max-width: 640px) {
  .reaction-dropdown {
    width: 240px;
    margin-left: 8px;
  }
  
  .group-hover-section:hover {
    transform: none; /* Disable hover scaling on mobile */
  }
  
  /* Mobile-specific spacing adjustments */
  .space-x-2 > * + * {
    margin-left: 0.5rem;
  }
  
  .space-x-1\.5 > * + * {
    margin-left: 0.375rem;
  }
  
  /* Mobile text sizing */
  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
  
  /* Compact mobile buttons */
  .px-3.py-2 {
    padding: 0.5rem 0.75rem;
  }
  
  /* Mobile reaction display adjustments */
  .inline-flex.items-center.space-x-1 {
    padding: 0.25rem 0.5rem;
  }
  
  /* Smaller avatars on mobile */
  .w-4.h-4 {
    width: 1rem;
    height: 1rem;
    font-size: 0.5rem;
  }
}
</style>
