<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 left-4 sm:left-auto z-[9999] max-w-sm sm:max-w-md mx-auto sm:mx-0 space-y-2 pointer-events-none">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'relative bg-white rounded-lg shadow-lg border pointer-events-auto transform transition-all duration-300',
            getToastBorderColor(toast.type)
          ]"
        >
          <!-- Progress bar for duration -->
          <div 
            v-if="toast.duration && toast.duration > 0"
            class="absolute top-0 left-0 h-1 bg-blue-500 rounded-t-lg transition-all ease-linear"
            :style="{ width: '100%', animationDuration: `${toast.duration}ms` }"
            style="animation: shrink linear forwards"
          ></div>
          
          <div class="p-4">
            <div class="flex items-start space-x-3">
              <!-- Toast Icon -->
              <div :class="['flex-shrink-0 w-6 h-6', getToastIconColor(toast.type)]">
                <component :is="getToastIcon(toast.type)" class="w-6 h-6" />
              </div>
              
              <!-- Toast Content -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-gray-900 mb-1">
                  {{ toast.title }}
                </h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  {{ toast.message }}
                </p>
                
                <!-- Action Button -->
                <div v-if="toast.action" class="mt-3 flex">
                  <button
                    @click="toast.action.handler"
                    class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors duration-200"
                  >
                    {{ toast.action.label }}
                  </button>
                </div>
              </div>
              
              <!-- Close Button -->
              <button
                @click="removeToast(toast.id)"
                class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { 
  CheckCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/vue/24/outline'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'

const notificationStore = useNotificationStore()
const { toasts } = storeToRefs(notificationStore)
const { removeToast } = notificationStore

function getToastIcon(type: string) {
  const icons = {
    success: CheckCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XCircleIcon
  }
  return icons[type as keyof typeof icons] || InformationCircleIcon
}

function getToastIconColor(type: string) {
  const colors = {
    success: 'text-green-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  }
  return colors[type as keyof typeof colors] || 'text-blue-500'
}

function getToastBorderColor(type: string) {
  const colors = {
    success: 'border-green-200',
    info: 'border-blue-200',
    warning: 'border-yellow-200',
    error: 'border-red-200'
  }
  return colors[type as keyof typeof colors] || 'border-blue-200'
}
</script>

<style scoped>
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}

/* Toast animations */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .fixed.top-4.right-4 {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>
