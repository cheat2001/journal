# Daily Journal App

A Vue.js application for daily journaling and personal reflection, built with Firebase for data persistence.

## Features

### Core Features ✅
- **Journal Entry Form**: Simple form with fields for gratitude, emotions, challenges, and learning
- **Entry Storage**: Firebase Firestore integration for persistent data storage
- **View Past Entries**: Browse and manage previous journal entries
- **Emotion Tracking**: Select from predefined emotions or enter custom ones
- **Mobile-Responsive**: Clean, minimal design that works on all devices
- **Dashboard**: Quick stats showing total entries, streak days, and most common emotions

### Optional Features (Future Enhancements)
- **Mood Tracker**: Visualize emotions over time with charts
- **Gratitude Cloud**: Word cloud of gratitude entries
- **Reminders**: Daily notifications to encourage journaling
- **Export/Import**: PDF or CSV export functionality
- **Categories/Tags**: Organize entries with custom tags
- **Inspiration Prompts**: Daily reflection prompts
- **Privacy**: Password protection and encryption

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Pinia
- **Database**: Firebase Firestore
- **Icons**: Heroicons
- **Package Manager**: pnpm
- **Date Handling**: date-fns

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Firebase project

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database:
   - Go to Firestore Database in your Firebase project
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select your preferred location
3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click "Web app" icon
   - Register your app and copy the config object

### Local Development Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Firebase**:
   - Edit the `.env` file with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
