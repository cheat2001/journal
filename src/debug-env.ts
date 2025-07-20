// This file helps debug environment variables in production
// You can remove this after confirming everything works

console.log('=== ENVIRONMENT VARIABLE DEBUG ===')
console.log('All import.meta.env:', import.meta.env)
console.log('=================================')

export const envDebug = {
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  hasStorageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  hasMessagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
}
