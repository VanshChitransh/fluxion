# Firebase Setup Instructions

## 📋 Prerequisites
- Firebase project created (coctracker-5edbd)
- Environment variables configured in `.env.local`

## 🔥 Firebase Console Setup

### 1. Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **coctracker-5edbd**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable the following:
   - ✅ **Google** - Click Edit, Enable, Save
   - ✅ **Email/Password** - Click Edit, Enable, Save

### 2. Create Firestore Database

1. Navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll add rules)
4. Select a location (preferably closest to your users)
5. Click **Enable**

### 3. Setup Firestore Security Rules

Go to **Firestore Database** → **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if true;  // Public profiles
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow delete: if false;
    }
    
    // Predict battles
    match /predictBattles/{battleId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if false;  // No updates after creation
      allow delete: if false;
    }
    
    // Battles
    match /battles/{battleId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if false;  // Updates handled by backend
      allow delete: if false;
    }
    
    // Leaderboard - public read
    match /leaderboard/{userId} {
      allow read: if true;
      allow write: if false;  // Only backend can write
    }
    
    // NFT Rewards - public read
    match /nftRewards/{rewardId} {
      allow read: if true;
      allow write: if false;  // Only admin/seed script
    }
  }
}
```

Click **Publish** to save the rules.

### 4. Setup Firestore Indexes

Go to **Firestore Database** → **Indexes** tab

You may need to create indexes for:
- Collection: `leaderboard`
  - Fields: `elo` (Descending), `rank` (Ascending)
- Collection: `users`
  - Fields: `elo.rating` (Descending), `createdAt` (Descending)

*Note: Firebase will auto-suggest indexes when you run queries that need them*

### 5. Get Firebase Service Account (For Backend API)

1. Go to: https://console.firebase.google.com/project/coctracker-5edbd/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Download the JSON file
4. Add credentials to `.env.local` (see BACKEND_SETUP.md)

## 🌱 Seed Initial Data

### Seed NFT Rewards Collection

Run the seed script to populate the NFT rewards:

```bash
npm run seed:nft
```

This will create 8 NFT reward tiers in Firestore.

## ✅ Verification Checklist

- [ ] Google Authentication enabled
- [ ] Email/Password Authentication enabled
- [ ] Firestore Database created
- [ ] Security rules deployed
- [ ] NFT rewards seeded
- [ ] Test signup/login works
- [ ] User profile created automatically on signup

## 🧪 Testing Authentication

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Click "Sign In"
4. Try Google Sign In
5. Try Email Sign Up
6. Check Firestore console - you should see:
   - New document in `users` collection
   - New document in `leaderboard` collection
7. Verify ELO starts at 1000

## 🔐 Security Notes

- Environment variables are in `.env.local` (not committed to git)
- Firestore rules restrict write access to Next.js API backend only
- User profiles are public read (for leaderboard)
- Protected routes redirect unauthenticated users to home
- All ELO updates happen server-side via Next.js API routes

## 📚 Next Steps

After setup is complete:
1. ✅ Test authentication (sign up/login)
2. ✅ Seed NFT rewards: `npm run seed:nft`
3. ✅ Configure backend (BACKEND_SETUP.md)
4. 🎮 Build game modes (Predict Battle & Battle Royale)
5. 🚀 Deploy to Vercel

