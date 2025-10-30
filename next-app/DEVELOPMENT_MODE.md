# Development Mode Guide

## Predict Battle - Mock Data Implementation

The Predict Battle game now works seamlessly in development mode using **only mock data** without requiring any API calls, authentication, or backend services.

## What Changed

### 1. **PredictBattleGame Component** (`src/components/game/PredictBattleGame.tsx`)

The main game component now includes comprehensive local mock data logic:

- **Mock Price Calculation**: Uses actual chart data collected during observation to calculate real price movements
- **Local ELO Simulation**: Generates realistic ELO changes based on prediction accuracy
- **Tier System**: Calculates tier promotions locally (Bronze → Silver → Gold → Platinum → Diamond)
- **AI Feedback**: Provides contextual feedback based on prediction result
- **No API Calls in Dev**: Completely bypasses API calls when `NODE_ENV === 'development'`

#### Mock Features:
- ✅ Real-time price chart using mock data
- ✅ Accurate prediction validation based on observed price movements
- ✅ Dynamic ELO calculations (+15 for correct, -10 for incorrect)
- ✅ Conviction bonus (+5 ELO for large price movements >2%)
- ✅ Tier promotions with celebration effects
- ✅ NFT unlock simulation (50% chance on tier up)
- ✅ Contextual AI feedback (different for wins vs losses)
- ✅ Confetti celebrations for wins and tier promotions

### 2. **Predict Page** (`src/app/predict/page.tsx`)

Updated to skip authentication requirements in development:

```typescript
// In development, skip authentication
if (process.env.NODE_ENV === 'development') {
  return <PredictBattleGame onComplete={() => router.push('/dashboard')} />;
}

// In production, require authentication
return (
  <ProtectedRoute>
    <PredictBattleGame onComplete={() => router.push('/dashboard')} />
  </ProtectedRoute>
);
```

### 3. **Price Data Hook** (`src/hooks/usePriceData.ts`)

Already configured to use mock data by default in development:

- Generates realistic SOL/USDC price movements
- Maintains price history of last 500 points
- Uses configurable volatility (default 0.02 = 2%)
- Provides smooth, continuous price updates

### 4. **Mock Data** (`src/lib/mock-data.ts`)

Contains pre-generated mock price data:
- 500 data points (8+ minutes of historical data)
- Realistic price movements with trends and volatility
- Base price: $24.50 (SOL/USDC)
- Range: $20-$30

## How to Use

### Starting the Development Server

```bash
cd /home/mohit/project2/fluxion_v2/next-app
npm run dev
```

### Playing Predict Battle

1. Navigate to: `http://localhost:3000/predict`
2. Click "🚀 Start Game"
3. **Observation Phase (7 seconds)**: Watch the live price chart
4. **Prediction Phase**: Choose UP 📈 or DOWN 📉
5. **Wait Phase (10 seconds)**: Price continues moving (chart hidden)
6. **Results**: See your prediction result with:
   - ✅/❌ Correct/Incorrect indicator
   - ELO change (+15 for wins, -10 for losses)
   - Price movement percentage
   - Your new ELO and tier
   - AI-generated feedback with strengths, improvements, and market insights
   - Tier promotion celebration (if applicable)
   - NFT unlock notification (if applicable)

### Game Flow

```
Ready → Countdown (3s) → Observing (7s) → Predicting → Waiting (10s) → Result
```

### ELO System (Mock)

- **Starting ELO**: Random between 1000-1500
- **Correct Prediction**: +15 ELO (base)
- **Incorrect Prediction**: -10 ELO
- **Conviction Bonus**: +5 ELO (if price moves >2% and you're correct)

### Tier Thresholds

| Tier | Min ELO | Max ELO |
|------|---------|---------|
| Bronze | 0 | 799 |
| Silver | 800 | 1199 |
| Gold | 1200 | 1599 |
| Platinum | 1600 | 1999 |
| Diamond | 2000+ | - |

### Mock vs Production

| Feature | Development | Production |
|---------|------------|------------|
| Authentication | ❌ Not required | ✅ Required (Firebase) |
| Price Data | 🎭 Mock (instant) | 📡 Real (Pyth Network) |
| API Calls | ❌ None | ✅ Full backend |
| ELO Persistence | ❌ Session only | ✅ Firestore DB |
| AI Feedback | 🎭 Pre-generated | 🤖 AI Service |
| NFT Rewards | 🎭 Mock | ✅ Real blockchain |

## Benefits of Mock Mode

1. **Instant Start**: No waiting for API connections
2. **No Dependencies**: Works without Firebase, backend, or external services
3. **Faster Development**: Test game mechanics quickly
4. **No Auth Required**: Skip login flows during testing
5. **Consistent Testing**: Reproducible price movements
6. **Offline Capable**: Works without internet connection

## Switching to Production

The code automatically switches to production mode when deployed:

1. Set `NODE_ENV=production`
2. Configure Firebase credentials
3. Set up backend API endpoints
4. Deploy to production environment

No code changes needed - the mode detection is automatic!

## Testing Scenarios

### Test Correct Prediction
1. Watch for upward price trend during observation
2. Predict UP
3. Should see +15 ELO (or +20 with conviction bonus)

### Test Incorrect Prediction
1. Watch price movement
2. Predict opposite direction
3. Should see -10 ELO

### Test Tier Promotion
1. Play multiple games
2. Accumulate ELO near tier threshold
3. Win to trigger tier promotion
4. See confetti celebration and tier up notification

## Troubleshooting

### Chart Not Showing
- Ensure dev server is running
- Check browser console for errors
- Verify `lightweight-charts` is installed

### No Price Updates
- Check that `usePriceData` hook is receiving `useMockData: true`
- Verify mock data in `src/lib/mock-data.ts`

### Game Stuck in Phase
- Check browser console for errors
- Ensure all timers are working (countdown, observe, wait)
- Refresh the page to restart

### API Errors in Development
- Should not happen! Check that `process.env.NODE_ENV === 'development'`
- Verify the mock data logic is executing (check console.log if needed)

## Files Modified

1. ✅ `src/components/game/PredictBattleGame.tsx` - Added complete mock data flow
2. ✅ `src/app/predict/page.tsx` - Removed auth requirement in dev
3. ℹ️ `src/hooks/usePriceData.ts` - Already had mock data support
4. ℹ️ `src/lib/mock-data.ts` - Already had mock price generation
5. ℹ️ `src/services/priceService.ts` - Already had fallback to mock data

## Next Steps for Production

When ready to deploy to production:

1. [ ] Set up Firebase Authentication
2. [ ] Configure Firestore database
3. [ ] Deploy backend API endpoints
4. [ ] Integrate real AI service for feedback
5. [ ] Connect to Pyth Network for live prices
6. [ ] Set up NFT minting contracts
7. [ ] Configure environment variables
8. [ ] Deploy to Vercel/hosting platform

---

**🎮 Happy Trading in Development Mode!**

The predict-battle game is now fully functional with rich mock data, realistic game mechanics, and comprehensive feedback - all without requiring any backend services!

