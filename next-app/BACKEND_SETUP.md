# Backend Setup - Next.js API Routes

## Overview

We're using **Next.js API Routes** as our backend instead of a separate Express server or Firebase Functions. This gives us:
- ✅ Server-side code in the same project
- ✅ No CORS issues
- ✅ TypeScript support
- ✅ Easy deployment with Vercel
- ✅ No Firebase Functions billing

## Architecture

```
Frontend (Client)          Backend (Next.js API Routes)      Firebase
─────────────────          ────────────────────────────      ────────
React Components    ──→    /api/elo/update          ──→      Firestore
  (with auth token)        (verifies token)                  (updates user data)
                           
useElo Hook         ──→    Firebase Admin SDK       ──→      Auth
  (calls API)              (server-side only)                (verifies users)
```

## Setup Instructions

### 1. Get Firebase Service Account

1. Go to: https://console.firebase.google.com/project/coctracker-5edbd/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Download the JSON file

### 2. Add Environment Variables

Create `/next-app/.env.local`:

```env
# Client-side Firebase (already have these)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=coctracker-5edbd.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=coctracker-5edbd
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=coctracker-5edbd.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=866728160948
NEXT_PUBLIC_FIREBASE_APP_ID=1:866728160948:web:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-PQHKC7FCDQ

# Server-side Firebase Admin SDK (NEW - from service account JSON)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@coctracker-5edbd.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

**Important:** Keep the private key in quotes and keep the `\n` characters!

### 3. That's It!

The API routes will automatically work once you have the env variables set.

## API Endpoints

### POST `/api/elo/update`

Updates user's ELO after a game.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user123",
  "eloChange": 15,
  "gameType": "predict",
  "won": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "oldElo": 1000,
    "newElo": 1015,
    "eloChange": 15,
    "oldTier": "Bronze Trader",
    "newTier": "Silver Trader",
    "tierChanged": true,
    "tierUp": true,
    "nftUnlocked": {
      "tierId": 2,
      "tierName": "Silver Trader",
      "imageUrl": "/nfts/silver-merchant.png",
      "name": "Silver Merchant Card"
    }
  }
}
```

## How It Works

1. **Frontend** calls API with Firebase ID token
2. **API Route** verifies token with Firebase Admin SDK
3. **API Route** calculates ELO changes server-side
4. **API Route** updates Firestore directly (secure)
5. **API Route** detects tier changes & unlocks NFTs
6. **API Route** updates leaderboard
7. **Frontend** receives result and updates UI

## Files Structure

```
src/
├── app/api/                     # API Routes
│   └── elo/
│       └── update/
│           └── route.ts         # ELO update endpoint
│
├── lib/server/                  # Server-only code
│   ├── firebaseAdmin.ts        # Firebase Admin SDK init
│   ├── eloCalculations.ts      # ELO formulas
│   └── authMiddleware.ts       # Token verification
│
└── hooks/
    └── useElo.ts               # Frontend hook (calls API)
```

## Security

- ✅ All ELO calculations happen server-side
- ✅ Firebase tokens are verified on every request
- ✅ Users can only update their own ELO
- ✅ Firestore security rules still apply
- ✅ No client-side manipulation possible

## Testing

```typescript
// In any component
import { useElo } from '@/hooks/useElo';

const { updateElo } = useElo();

const result = await updateElo({
  userId: user.uid,
  eloChange: 15,
  gameType: 'predict',
  won: true
});

console.log('New ELO:', result.newElo);
```

## Deployment

Works automatically on Vercel:
1. Push to GitHub
2. Vercel builds & deploys
3. Add env variables in Vercel dashboard
4. Done! ✅

## Cost

- Next.js API Routes on Vercel: **FREE** (hobby plan)
- Firestore reads/writes: **FREE** (within limits)
- No Firebase Functions charges!

## Future Endpoints

We'll add these as we build the games:

- `POST /api/game/predict` - Submit prediction battle result
- `POST /api/game/battle` - Submit battle royale result  
- `GET /api/leaderboard` - Get ranked players
- `POST /api/ai/feedback` - Generate AI analysis

---

Ready to build! 🚀

