import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Debug: Log environment variables directly
console.log('Raw Environment Variables:', {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
})

// Fallback to explicitly defined variables if import.meta.env fails
const getEnvVar = (key: string, fallbackKey: string) => {
  return import.meta.env[key] || (globalThis as Record<string, unknown>)[fallbackKey] || undefined
}

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', '__VITE_FIREBASE_API_KEY__'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', '__VITE_FIREBASE_AUTH_DOMAIN__'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', '__VITE_FIREBASE_PROJECT_ID__'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', '__VITE_FIREBASE_STORAGE_BUCKET__'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '__VITE_FIREBASE_MESSAGING_SENDER_ID__'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '__VITE_FIREBASE_APP_ID__'),
}

// Debug: Log configuration to verify environment variables are loaded
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Set' : 'Missing',
  appId: firebaseConfig.appId ? 'Set' : 'Missing',
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

export default app
