import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  type User
} from 'firebase/auth'
import { auth } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.displayName || user.value?.email || 'User')

  // Actions
  function clearError() {
    error.value = null
  }

  function setError(message: string) {
    error.value = message
  }

  async function signUp(email: string, password: string, displayName?: string) {
    loading.value = true
    error.value = null
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName })
      }
      
      user.value = result.user
      return result.user
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      user.value = result.user
      return result.user
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signInWithGoogle() {
    loading.value = true
    error.value = null
    
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      user.value = result.user
      return result.user
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null
    
    try {
      await signOut(auth)
      user.value = null
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email: string) {
    loading.value = true
    error.value = null
    
    try {
      await sendPasswordResetEmail(auth, email)
      return 'Password reset email sent successfully!'
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUserProfile(updates: { displayName?: string }) {
    if (!user.value) return
    
    loading.value = true
    error.value = null
    
    try {
      await updateProfile(user.value, updates)
      // Trigger reactivity
      user.value = { ...user.value }
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state listener
  function initializeAuthListener() {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
        loading.value = false
        // Resolve the promise on the first auth state change
        resolve()
        // Don't unsubscribe, keep listening for auth changes
      })
      
      // Store the unsubscribe function for cleanup if needed
      return unsubscribe
    })
  }

  // Helper function to get user-friendly error messages
  function getAuthErrorMessage(error: unknown): string {
    const errorCode = (error as { code?: string })?.code || ''
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.'
      case 'auth/wrong-password':
        return 'Incorrect password.'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/user-disabled':
        return 'This account has been disabled.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.'
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed.'
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled.'
      default:
        return (error as { message?: string })?.message || 'An error occurred during authentication.'
    }
  }

  return {
    // State
    user,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    userDisplayName,
    
    // Actions
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    clearError,
    setError,
    initializeAuthListener
  }
})
