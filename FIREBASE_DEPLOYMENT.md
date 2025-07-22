# Firebase Deployment Instructions

## 🔥 Deploy Updated Firestore Rules

The Firestore security rules have been updated to fix the permission errors for individual entry viewing. You need to deploy these rules to your Firebase project.

### Steps:

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click the "Rules" tab

3. **Update the Rules**
   - Copy the entire content from `firestore.rules` file in this project
   - Paste it into the Firebase Console rules editor
   - Click "Publish" to deploy the updated rules

### Key Changes Made:

✅ **Fixed Collection Name**: Updated EntryView to use `journal-entries` collection (matches the rules)  
✅ **Added View Count Permission**: Allow incrementing view counts on public entries  
✅ **Enhanced Auth Checks**: Ensure proper authentication before accessing entries  
✅ **Improved Error Handling**: Better handling of missing/private entries  

### What These Rules Allow:

- ✅ **Read public entries** - Anyone authenticated can view public journal entries
- ✅ **Read own entries** - Users can view their own private entries  
- ✅ **Increment view counts** - Authenticated users can update view counts on public entries
- ✅ **Social interactions** - Reactions and comments on public entries
- ✅ **Proper privacy** - Private entries remain private to their owners

### After Deployment:

The individual entry pages should work correctly without permission errors!

🚀 **Test the fix**: Navigate to any public entry using the "View Full Entry" link.
