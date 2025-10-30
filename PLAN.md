# Fluxion v2 - Trading Game Platform
## Project Plan & Architecture

---

## 🎯 PROJECT OVERVIEW

**Fluxion v2** is a simplified, Firebase-powered trading game platform with two game modes:
1. **Predict Battle** - Solo prediction game (5-7 sec chart glimpse)
2. **Battle Royale** - 1v1 real-time trading competition (30 sec)

### Why v2?
- v1 had excessive client-side rendering
- Codebase was messy (vibe-coded)
- Need cleaner architecture with server-side logic
- Deadline: Tonight (so we're keeping it SIMPLE but functional)

### What We're Skipping (for now)
- ❌ Blockchain/Solana integration (too complex for deadline)
- ❌ Complex ELO systems stored on-chain
- ❌ IPFS/Arweave replay storage
- ❌ Full Learn Module CMS
- ❌ Smart contracts

### What We're Building
- ✅ Firebase Auth + Firestore + Functions
- ✅ Two game modes (Predict Battle + Battle Royale)
- ✅ **ELO Rating System** (core progression mechanic)
- ✅ Real-time SOL/USDC price data (via Pyth or mock data)
- ✅ AI feedback after battles (using OpenAI/Claude API)
- ✅ **Enhanced Dashboard** (ELO roadmap, NFT rewards visualization)
- ✅ **Markets Page** (real-time charts + Jupiter integration for buying SOL)
- ✅ Leaderboard & user stats
- ✅ Learning page (trading education)
- ✅ Clean, modern Next.js UI
- ✅ Reusable components from v1 (trader cards, NFT designs)

---

## 🎖️ ELO RATING SYSTEM

### Overview
The ELO system is the **core progression mechanic** in Fluxion. Players gain/lose ELO based on game performance, unlocking NFT rewards and higher leagues.

### ELO Calculation

**Starting ELO:** 1000

**After Predict Battle:**
```typescript
// Win: +10 to +20 ELO (based on streak)
// Loss: -5 ELO
eloChange = correct ? (10 + streakBonus) : -5
```

**After Battle Royale (1v1):**
```typescript
// K-factor based ELO (like chess)
expectedScore = 1 / (1 + 10^((opponentElo - playerElo) / 400))
eloChange = K * (actualScore - expectedScore)
// K = 32 for new players (< 30 games)
// K = 24 for established players
// actualScore = 1 (win), 0.5 (draw), 0 (loss)
```

**Example:**
- Player A (ELO 1200) beats Player B (ELO 1300)
- Expected score: 0.36 (underdog)
- ELO gain: 32 * (1 - 0.36) = +20 ELO
- Player A: 1200 → 1220
- Player B: 1300 → 1280

### ELO Tiers & NFT Rewards

| Tier | ELO Range | Tier Name | NFT Reward | Special Perk |
|------|-----------|-----------|------------|--------------|
| 1 | 0-999 | Bronze Trader | Bronze Merchant Card | - |
| 2 | 1000-1199 | Silver Trader | Silver Merchant Card | +5% XP boost |
| 3 | 1200-1399 | Gold Trader | Gold Merchant Card | +10% XP boost |
| 4 | 1400-1599 | Platinum Trader | Platinum Strategist Card | Access to exclusive battles |
| 5 | 1600-1799 | Diamond Trader | Diamond Strategist Card | AI insights unlocked |
| 6 | 1800-1999 | Master Trader | Master Sage Card | Custom profile badge |
| 7 | 2000-2299 | Grandmaster | Grandmaster Oracle Card | Exclusive tournaments |
| 8 | 2300+ | Legendary | Legendary Flux Master Card | Hall of Fame entry |

### ELO Decay
- Inactive for 30 days: -5 ELO per day after
- Encourages consistent play
- Can be paused (coming soon)

### Roadmap Visualization (Dashboard)
```
     1000 ──────▶ 1200 ──────▶ 1400 ──────▶ 1600
    Bronze        Silver        Gold       Platinum
      🥉           🥈           🥇          💎
                              ↑
                         YOU ARE HERE
                         (1350 ELO)
                    Need 50 more ELO
```

**Zig-zag Roadway Structure:**
- Visual path showing progression
- Current position highlighted
- Next milestone with NFT preview
- ELO gap calculation
- Estimated games needed

---

## 🎮 GAME MODES DETAILED

### Mode 1: Predict Battle (Solo)
**Flow:**
1. User enters game
2. Real SOL/USDC chart shown for 5-7 seconds
3. Chart disappears
4. User predicts: UP or DOWN
5. After 10-15 seconds, reveal actual price movement
6. Award points based on correctness
7. AI gives brief feedback on market conditions

**Scoring:**
- Correct prediction: +10 points
- Wrong prediction: 0 points
- Streak bonus: +5 per consecutive correct

**Firebase Function:**
```
predictBattle({
  userId: string,
  prediction: 'UP' | 'DOWN',
  startPrice: number,
  startTime: timestamp
})
→ Returns: { correct: boolean, endPrice: number, points: number, aiComment: string }
```

---

### Mode 2: Battle Royale (1v1)
**Flow:**
1. Two users matched (or user vs AI)
2. Both see live SOL/USDC chart for 30 seconds
3. Each can execute BUY/SELL orders during the 30 seconds
4. Starting balance: $1000 virtual
5. After 30 sec, calculate P&L for both
6. Winner = highest profit (or lowest loss)
7. AI analyzes both strategies and gives feedback

**Actions:**
- BUY: Purchase SOL at current price
- SELL: Sell held SOL at current price
- Max 5 trades per battle

**Scoring:**
- Winner: +20 points
- Loser: +5 participation points
- P&L shown as percentage

**Firebase Function:**
```
battleRoyale({
  battleId: string,
  userId: string,
  actions: [
    { type: 'BUY', amount: number, timestamp: number, price: number },
    { type: 'SELL', amount: number, timestamp: number, price: number }
  ]
})
→ Returns: { winner: userId, p&l: { user1: number, user2: number }, aiAnalysis: string }
```

---

## 🏗️ FOLDER STRUCTURE

```
/fluxion-v2
├── /src
│   ├── /app                          # Next.js App Router
│   │   ├── /page.tsx                # Home/landing
│   │   ├── /layout.tsx              # Root layout
│   │   ├── /globals.css             # Global styles
│   │   │
│   │   ├── /dashboard              # Enhanced dashboard with ELO roadmap
│   │   │   └── page.tsx
│   │   │
│   │   ├── /battle                  # Battle Royale mode
│   │   │   ├── /page.tsx           # Matchmaking/lobby
│   │   │   └── /[battleId]
│   │   │       └── page.tsx        # Active battle
│   │   │
│   │   ├── /predict                 # Predict Battle mode
│   │   │   └── page.tsx
│   │   │
│   │   ├── /markets                 # Real-time SOL/USDC + Jupiter buy
│   │   │   └── page.tsx
│   │   │
│   │   ├── /leaderboard            # Global rankings
│   │   │   └── page.tsx
│   │   │
│   │   └── /learn                  # Trading education
│   │       └── page.tsx
│   │
│   ├── /components                  # React Components
│   │   ├── /dashboard
│   │   │   ├── EloRoadmap.tsx      # Zig-zag ELO progression visual
│   │   │   ├── StatsCard.tsx       # Win/loss, games played
│   │   │   ├── NFTRewardCard.tsx   # Next NFT unlock preview
│   │   │   ├── RecentGames.tsx     # Game history
│   │   │   └── AchievementBadges.tsx
│   │   │
│   │   ├── /game
│   │   │   ├── PredictChart.tsx    # 5-7 sec chart display
│   │   │   ├── BattleChart.tsx     # Real-time 30 sec chart
│   │   │   ├── OrderPanel.tsx      # Buy/Sell interface
│   │   │   ├── Countdown.tsx       # Timer component
│   │   │   └── AIFeedback.tsx      # Display AI analysis
│   │   │
│   │   ├── /markets
│   │   │   ├── LiveChart.tsx       # Real-time SOL/USDC chart
│   │   │   ├── JupiterBuyPanel.tsx # Jupiter integration for buying
│   │   │   └── PriceStats.tsx      # 24h high/low, volume
│   │   │
│   │   ├── /layout
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── /trader-cards           # Reused from v1
│   │   │   └── TraderCard.tsx
│   │   │
│   │   └── /ui                     # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ... (others)
│   │
│   ├── /lib
│   │   ├── firebase.ts             # Firebase client config
│   │   ├── utils.ts                # Helper functions
│   │   └── constants.ts            # Game constants
│   │
│   ├── /hooks
│   │   ├── useAuth.ts              # Firebase auth hook
│   │   ├── useElo.ts               # ELO calculation & tier info
│   │   ├── usePriceData.ts         # Real-time price hook
│   │   ├── useBattle.ts            # Battle state management
│   │   ├── useLeaderboard.ts       # Leaderboard data
│   │   └── useJupiter.ts           # Jupiter API for token swaps
│   │
│   ├── /services
│   │   ├── priceService.ts         # Fetch SOL/USDC prices
│   │   ├── battleService.ts        # Battle logic
│   │   └── aiService.ts            # AI feedback generation
│   │
│   └── /types
│       ├── game.ts                 # Game type definitions
│       ├── user.ts                 # User/profile types
│       └── battle.ts               # Battle types
│
├── /functions                       # Firebase Cloud Functions
│   ├── /src
│   │   ├── index.ts                # Function exports
│   │   ├── /predict
│   │   │   └── evaluatePrediction.ts
│   │   │
│   │   ├── /battle
│   │   │   ├── createBattle.ts     # Initialize battle
│   │   │   ├── joinBattle.ts       # Player joins
│   │   │   ├── executeTrade.ts     # Process buy/sell
│   │   │   └── finalizeBattle.ts   # Calculate winner
│   │   │
│   │   ├── /leaderboard
│   │   │   └── updateRankings.ts
│   │   │
│   │   └── /ai
│   │       └── generateFeedback.ts # AI analysis
│   │
│   └── package.json
│
├── /public
│   ├── /images
│   └── /sounds
│
├── /firestore.rules                # Security rules
├── /firestore.indexes.json         # Database indexes
├── /firebase.json                  # Firebase config
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄️ FIRESTORE DATA STRUCTURE

### Collections

#### 1. **users** (collection)
```typescript
{
  uid: string,                    // Firebase Auth UID
  displayName: string,
  email: string,
  photoURL?: string,
  
  // ELO System
  elo: {
    rating: number,               // Current ELO (starts at 1000)
    tier: string,                 // 'Bronze', 'Silver', 'Gold', etc.
    tierLevel: number,            // 1-8
    highestElo: number,           // Peak ELO achieved
    lastUpdated: timestamp
  },
  
  // Stats
  stats: {
    totalGames: number,
    wins: number,
    losses: number,
    draws: number,
    points: number,
    currentStreak: number,
    bestStreak: number,
    predictBattles: {
      played: number,
      correct: number,
      accuracy: number            // percentage
    },
    battleRoyale: {
      played: number,
      wins: number,
      avgProfitLoss: number
    }
  },
  
  // NFT Rewards Unlocked
  nftRewards: [
    {
      tierId: number,
      tierName: string,
      unlockedAt: timestamp,
      claimed: boolean
    }
  ],
  
  createdAt: timestamp,
  lastActive: timestamp
}
```

#### 2. **predictBattles** (collection)
```typescript
{
  id: string,
  userId: string,
  startTime: timestamp,
  endTime: timestamp,
  startPrice: number,
  endPrice: number,
  prediction: 'UP' | 'DOWN',
  correct: boolean,
  pointsEarned: number,
  aiComment: string,
  chartData: number[]            // Price points shown
}
```

#### 3. **battles** (collection)
```typescript
{
  id: string,
  type: 'PVP' | 'PVE',           // Player vs Player or Player vs AI
  status: 'waiting' | 'active' | 'finished',
  players: [
    {
      userId: string,
      displayName: string,
      trades: [
        {
          type: 'BUY' | 'SELL',
          amount: number,
          price: number,
          timestamp: number
        }
      ],
      finalBalance: number,
      profitLoss: number,
      profitLossPercent: number
    }
  ],
  startTime: timestamp,
  endTime: timestamp,
  duration: 30,                  // seconds
  startingBalance: 1000,
  marketData: {
    symbol: 'SOL/USDC',
    prices: number[]             // Price points during battle
  },
  winner: string,                // userId of winner
  aiAnalysis: {
    winner: string,
    loser: string,
    summary: string
  }
}
```

#### 4. **leaderboard** (collection)
```typescript
{
  userId: string,
  displayName: string,
  photoURL?: string,
  elo: number,
  tier: string,
  tierLevel: number,
  points: number,
  wins: number,
  totalGames: number,
  winRate: number,              // percentage
  rank: number,
  updatedAt: timestamp
}
```

#### 5. **nftRewards** (collection) - NFT metadata
```typescript
{
  tierId: number,
  tierName: string,
  eloRequirement: number,
  name: string,                 // "Silver Merchant Card"
  description: string,
  imageUrl: string,
  perk: string,                 // "+5% XP boost"
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}
```

---

## 🔧 FIREBASE FUNCTIONS API

### 1. Predict Battle Functions

#### `evaluatePrediction`
**Trigger:** HTTPS Callable  
**Input:**
```typescript
{
  userId: string,
  prediction: 'UP' | 'DOWN',
  startPrice: number,
  startTime: timestamp,
  chartData: number[]
}
```
**Process:**
1. Wait appropriate time (10-15 sec after start)
2. Fetch current SOL/USDC price
3. Compare to startPrice
4. Calculate if prediction correct
5. Update user points in Firestore
6. Generate AI comment via OpenAI API
7. Create predictBattles document

**Output:**
```typescript
{
  correct: boolean,
  endPrice: number,
  priceChange: number,
  priceChangePercent: number,
  pointsEarned: number,
  newStreak: number,
  eloChange: number,            // NEW
  newElo: number,               // NEW
  tierChanged: boolean,         // NEW
  newTier?: string,             // NEW
  aiComment: string
}
```

---

### 0. ELO Management Functions

#### `updateUserElo`
**Trigger:** Called internally by other functions  
**Input:**
```typescript
{
  userId: string,
  eloChange: number,
  gameType: 'predict' | 'battle',
  won: boolean
}
```
**Process:**
1. Get current user ELO
2. Apply ELO change
3. Check if tier changed
4. If tier changed, add NFT reward to user's nftRewards array
5. Update leaderboard
6. Return new ELO and tier info

**Output:**
```typescript
{
  oldElo: number,
  newElo: number,
  eloChange: number,
  oldTier: string,
  newTier: string,
  tierChanged: boolean,
  nftUnlocked?: {
    tierId: number,
    tierName: string,
    imageUrl: string
  }
}
```

---

### 2. Battle Royale Functions

#### `createBattle`
**Trigger:** HTTPS Callable  
**Input:**
```typescript
{
  userId: string,
  type: 'PVP' | 'PVE'
}
```
**Process:**
1. Create new battle document with status 'waiting'
2. If PVE, auto-add AI opponent
3. If PVP, add to matchmaking queue

**Output:**
```typescript
{
  battleId: string,
  status: 'waiting'
}
```

---

#### `joinBattle`
**Trigger:** HTTPS Callable  
**Input:**
```typescript
{
  battleId: string,
  userId: string
}
```
**Process:**
1. Add player to battle
2. If 2 players, start battle (status = 'active')
3. Record startTime
4. Begin price data stream

**Output:**
```typescript
{
  success: boolean,
  status: 'waiting' | 'active'
}
```

---

#### `executeTrade`
**Trigger:** HTTPS Callable  
**Input:**
```typescript
{
  battleId: string,
  userId: string,
  tradeType: 'BUY' | 'SELL',
  amount: number,
  price: number,
  timestamp: number
}
```
**Process:**
1. Validate battle is active
2. Validate user is participant
3. Validate trade rules (max 5 trades, sufficient balance/holdings)
4. Record trade in battle document
5. Update player's position

**Output:**
```typescript
{
  success: boolean,
  currentBalance: number,
  currentHoldings: number
}
```

---

#### `finalizeBattle`
**Trigger:** Scheduled (runs every second for active battles) or HTTPS  
**Input:**
```typescript
{
  battleId: string
}
```
**Process:**
1. Check if 30 seconds elapsed
2. Calculate final P&L for both players
3. Determine winner
4. Update user stats (wins, points)
5. Generate AI analysis of both strategies
6. Update battle status to 'finished'
7. Update leaderboard

**Output:**
```typescript
{
  winner: string,
  players: [
    {
      userId: string,
      finalBalance: number,
      profitLoss: number,
      profitLossPercent: number
    }
  ],
  aiAnalysis: {
    winner: string,
    loser: string,
    summary: string
  }
}
```

---

### 3. AI Feedback Function

#### `generateFeedback`
**Trigger:** Called internally by other functions  
**Input:**
```typescript
// For Predict Battle
{
  type: 'predict',
  correct: boolean,
  priceChange: number,
  marketContext: {
    volatility: number,
    trend: 'bullish' | 'bearish' | 'sideways'
  }
}

// For Battle Royale
{
  type: 'battle',
  winner: {
    trades: Trade[],
    profitLoss: number
  },
  loser: {
    trades: Trade[],
    profitLoss: number
  },
  priceData: number[]
}
```

**Process:**
1. Call OpenAI/Claude API with structured prompt
2. Generate contextual feedback:
   - For predict: Why market moved that way
   - For battle: What winner did right, what loser could improve
3. Keep feedback concise (2-3 sentences)

**Output:**
```typescript
{
  comment: string  // AI-generated feedback
}
```

---

## 💰 PRICE DATA SERVICE

### Real-time SOL/USDC Prices

**Option A: Pyth Network API (Recommended)**
```typescript
// services/priceService.ts
async function getCurrentPrice(): Promise<number> {
  const response = await fetch('https://hermes.pyth.network/api/latest_price_feeds?ids[]=0x...');
  // Parse and return SOL/USDC price
}
```

**Option B: Mock Data (For testing)**
```typescript
// Generate realistic mock prices
function generateMockPrices(duration: number): number[] {
  // Simulated price movement with volatility
}
```

**Real-time Updates:**
- Use Firebase Realtime Database or Firestore listeners
- Update every 1 second during active battles
- Store historical data for replay

---

## 🎨 UI/UX DESIGN PRINCIPLES

### Design Goals
- **Fast**: Minimal loading, instant feedback
- **Clean**: No clutter, focus on game
- **Modern**: Gradient backgrounds, glassmorphism, smooth animations
- **Mobile-friendly**: Responsive design

### Key Screens

#### 1. **Home/Landing**
- Hero section with "Play Now" CTA
- Two game mode cards: Predict Battle / Battle Royale
- Mini leaderboard preview (Top 5)
- Current user ELO badge

#### 2. **Dashboard** (Main hub)
**Top Section:**
- User profile card (avatar, name, ELO)
- Current tier badge with glow effect
- Quick stats: W/L ratio, games played, current streak

**ELO Roadmap (Center - Zig-zag layout):**
```
     Bronze ──────▶ Silver ──────▶ Gold
       🥉             🥈            🥇
                       ↑
                  YOU (1150)
                  
      ─────────▶ Platinum ──────▶ Diamond
                   💎              💠
```
- Interactive nodes showing each tier
- Progress bar between current and next tier
- Hover shows NFT preview for each tier
- "50 ELO to next tier" indicator

**Right Sidebar:**
- Next NFT Reward Card (3D flip animation)
- NFT name, image, perks
- "Unlock at 1200 ELO" text

**Bottom Section:**
- Recent Games (last 5)
- Achievement badges
- Daily login streak

#### 3. **Predict Battle**
- Fullscreen chart (5-7 sec)
- After hide: Big UP/DOWN buttons
- Loading spinner while waiting for result
- Result screen with AI feedback
- ELO change indicator (+15 ELO)

#### 4. **Battle Royale - Lobby**
- Waiting for opponent
- Avatar display with ELO
- "Finding opponent..." animation
- Quick stats comparison (both players)
- Expected ELO change preview

#### 5. **Battle Royale - Active**
- Live chart (prominent, left side 70%)
- Order panel (BUY/SELL buttons, right side 30%)
- Current holdings & balance display
- Countdown timer (30 sec, top center)
- Trade history sidebar
- Opponent's trade count (not details)
- Real-time P&L ticker

#### 6. **Battle Result**
- Winner announcement with confetti 🎉
- ELO changes (+20, -12)
- Tier up notification if applicable
- NFT unlock modal if new tier reached
- P&L comparison chart
- Trade timeline visualization
- AI analysis card (expandable)
- "View Full Replay" button
- Play Again button

#### 7. **Markets Page** (Implement last)
**Layout:**
- Left side (70%): Full-height live SOL/USDC chart
  - TradingView-style interface
  - Time intervals: 1m, 5m, 15m, 1h, 4h, 1D
  - Technical indicators toggle
  - 24h stats bar (high, low, volume, change%)

- Right side (30%): Jupiter Buy Panel
  - "Quick Buy SOL" section
  - Input: Amount in USD or SOL
  - Shows current price
  - Slippage settings
  - "Connect Wallet" button (if not connected)
  - "Buy SOL" button
  - Recent transaction history
  - Disclaimer: "Not financial advice"

**Features:**
- Real-time price updates (1-second intervals)
- Price alerts (optional for later)
- Chart drawing tools (optional for later)

#### 8. **Leaderboard**
- Top 100 players
- Columns: Rank, Avatar, Name, ELO, Tier, W/L, Win Rate
- Filter: Daily / Weekly / All-time
- Search bar
- User's rank highlighted with glow
- "Challenge" button next to players (future feature)

#### 9. **Learn Page**
- Trading concepts library
- Interactive lessons
- Progress tracking
- Quizzes (optional for later)

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Setup & Foundation (45 min)
- [ ] Initialize Next.js 14 project with App Router
- [ ] Setup Firebase project (Auth, Firestore, Functions)
- [ ] Install dependencies (shadcn/ui, tailwind, firebase, recharts)
- [ ] Configure Firebase in Next.js
- [ ] Setup folder structure as defined above
- [ ] Create basic layout (Header, Sidebar)

### Phase 2: Authentication & User System (30 min)
- [ ] Firebase Auth setup (Google + Email)
- [ ] useAuth hook
- [ ] Protected routes
- [ ] User profile creation with ELO initialization (1000)
- [ ] Seed nftRewards collection with tier data

### Phase 3: ELO System Core (45 min)
- [ ] Create constants for ELO tiers & calculations
- [ ] useElo hook (calculate tier, next milestone, etc.)
- [ ] updateUserElo Firebase function
- [ ] ELO calculation logic (K-factor formula)
- [ ] Tier change detection
- [ ] NFT reward unlocking logic

### Phase 4: Enhanced Dashboard (1.5 hours)
- [ ] Dashboard page layout
- [ ] Profile card component (avatar, name, ELO)
- [ ] EloRoadmap component (zig-zag visual)
- [ ] StatsCard component (W/L, accuracy, etc.)
- [ ] NFTRewardCard component (next unlock)
- [ ] RecentGames list
- [ ] Achievement badges (basic)
- [ ] Integrate with real user data

### Phase 5: Price Service (30 min)
- [ ] Implement Pyth API integration
- [ ] Create priceService.ts
- [ ] Setup mock data fallback
- [ ] usePriceData hook (real-time updates)
- [ ] Test price fetching

### Phase 6: Predict Battle (2 hours)
- [ ] Create predict battle page
- [ ] PredictChart component (shows 5-7 sec, then hides)
- [ ] UP/DOWN prediction UI
- [ ] Firebase function: evaluatePrediction (with ELO update)
- [ ] Result display with ELO change
- [ ] Tier up modal (if applicable)
- [ ] AI feedback integration
- [ ] Update user stats & ELO

### Phase 7: Battle Royale (3.5 hours)
- [ ] Battle matchmaking page
- [ ] ELO-based matchmaking logic
- [ ] Create/join battle functions
- [ ] BattleChart component (real-time 30 sec)
- [ ] OrderPanel component (BUY/SELL)
- [ ] executeTrade function with validation
- [ ] Real-time trade updates
- [ ] finalizeBattle function (with ELO calculation)
- [ ] Winner/result screen with ELO changes
- [ ] NFT unlock modal
- [ ] Trade timeline visualization

### Phase 8: AI Feedback System (1 hour)
- [ ] Setup OpenAI/Claude API
- [ ] generateFeedback function
- [ ] Context-aware prompts (predict vs battle)
- [ ] Integrate in predict battle
- [ ] Integrate in battle royale
- [ ] AIFeedback component with expandable details

### Phase 9: Leaderboard (45 min)
- [ ] Leaderboard page
- [ ] Query top 100 by ELO
- [ ] Display with tier badges
- [ ] Filter tabs (Daily/Weekly/All-time)
- [ ] Search functionality
- [ ] Highlight current user
- [ ] Real-time updates

### Phase 10: Learn Page (30 min - Basic)
- [ ] Learn page layout
- [ ] Trading concepts list (hardcoded for now)
- [ ] Interactive lesson cards
- [ ] Progress tracking (optional)

### Phase 11: Markets Page (2 hours - LAST)
- [ ] Markets page layout (70/30 split)
- [ ] LiveChart component (TradingView lightweight charts)
- [ ] Real-time price updates
- [ ] Time interval selector
- [ ] 24h stats display
- [ ] JupiterBuyPanel component
- [ ] Wallet connection
- [ ] Jupiter API integration
- [ ] Buy SOL flow
- [ ] Transaction confirmation

### Phase 12: Polish & Testing (2 hours)
- [ ] Copy good components from v1 (trader cards, NFT designs)
- [ ] Improve animations (confetti, tier up, etc.)
- [ ] Test all user flows
- [ ] Fix bugs and edge cases
- [ ] Mobile responsiveness
- [ ] Loading states & skeletons
- [ ] Error handling
- [ ] Toast notifications
- [ ] Performance optimization

**Total Estimated Time: ~14 hours**

**Priority Order for Deadline:**
1. Phases 1-3: Foundation & ELO ✅ Critical
2. Phase 4: Dashboard ✅ Critical (showcase feature)
3. Phases 5-7: Core games ✅ Critical
4. Phase 8: AI Feedback ✅ Important
5. Phase 9: Leaderboard ✅ Important
6. Phase 10: Learn Page ⚠️ Can be minimal
7. Phase 11: Markets ⚠️ Do LAST or skip if running out of time
8. Phase 12: Polish ✅ As much as time allows

---

## 🛠️ TECH STACK

### Frontend
- **Next.js 14** (App Router, React Server Components)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (component library)
- **Framer Motion** (animations)
- **Recharts** or **Lightweight Charts** (price charts)
- **Firebase SDK** (client-side)

### Backend
- **Firebase Functions** (Node.js + TypeScript)
- **Firestore** (database)
- **Firebase Auth** (authentication)

### External APIs
- **Pyth Network** (SOL/USDC price data)
- **OpenAI API** or **Anthropic Claude** (AI feedback)

### Dev Tools
- **ESLint** + **Prettier**
- **Git**

---

## 🔐 SECURITY CONSIDERATIONS

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if true;  // Public profiles
      allow write: if request.auth.uid == userId;
    }
    
    // Predict battles - users can only write their own
    match /predictBattles/{battleId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if false;  // No updates, only functions
    }
    
    // Battles - read if participant, write only via functions
    match /battles/{battleId} {
      allow read: if request.auth != null;
      allow write: if false;  // Only Cloud Functions can write
    }
    
    // Leaderboard - public read, function write only
    match /leaderboard/{userId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Function Security
- Validate all inputs
- Rate limiting (max 10 games/minute per user)
- Verify auth tokens
- Prevent trade tampering (server-side price validation)
- Sanitize AI responses

---

## 📊 MONITORING & ANALYTICS

### Key Metrics to Track
- Daily Active Users (DAU)
- Games played per user
- Average game duration
- Win/loss ratios
- Most popular game mode
- AI feedback quality (user ratings?)

### Firebase Analytics Events
```typescript
logEvent('predict_battle_start', { userId });
logEvent('predict_battle_result', { userId, correct, points });
logEvent('battle_royale_start', { battleId, player1, player2 });
logEvent('battle_royale_trade', { battleId, userId, tradeType });
logEvent('battle_royale_result', { battleId, winner });
```

---

## 🎯 SUCCESS CRITERIA (For Tonight)

### Must Have ✅
- [ ] User can sign up / log in
- [ ] Predict Battle fully functional (chart show → predict → result)
- [ ] Battle Royale fully functional (matchmaking → trade → winner)
- [ ] AI feedback appears after games
- [ ] Basic leaderboard works
- [ ] Mobile-responsive

### Nice to Have 🎁
- [ ] Smooth animations
- [ ] Sound effects
- [ ] Achievement badges
- [ ] Tutorial/onboarding
- [ ] Share results

### Can Skip for Deadline ❌
- [ ] Advanced analytics
- [ ] Social features (friends, chat)
- [ ] Tournament mode
- [ ] NFT integration
- [ ] Blockchain integration

---

## 🚨 POTENTIAL ISSUES & SOLUTIONS

### Issue 1: Price Data Latency
**Problem:** Pyth API might be slow  
**Solution:** Use mock data with realistic volatility for tonight

### Issue 2: AI API Costs
**Problem:** OpenAI calls can get expensive  
**Solution:** 
- Use simpler models (GPT-3.5-turbo)
- Cache common responses
- Limit to 150 tokens per response

### Issue 3: Real-time Sync Issues
**Problem:** Trade execution timing in Battle Royale  
**Solution:** 
- Use server timestamps (not client)
- Accept slight delays
- Lock trades after 30 sec server-side

### Issue 4: Matchmaking Delays
**Problem:** Not enough players for PVP  
**Solution:** Default to PVE (vs AI) for tonight

---

## 📚 COMPONENT REUSE FROM V1

### What to Copy
1. **Trader Card designs** - keep the NFT-style cards
2. **Chart components** - if they're clean
3. **Firebase function utilities** - auth helpers, etc.
4. **UI components** - buttons, modals if well-designed
5. **Types** - TypeScript interfaces for users, games, etc.

### What to Rewrite
1. State management - use simpler hooks
2. Routing - use App Router properly
3. Data fetching - server components where possible
4. Complex animations - keep it simple

---

## 🎉 POST-LAUNCH (After Deadline)

### Future Enhancements
- **Blockchain Integration:** Migrate to Solana + Anchor
- **NFT Rewards:** Mint trader cards as NFTs
- **Advanced ELO:** Proper ranking system
- **Tournaments:** Weekly competitions
- **Learn Module:** Full DeFi education platform
- **Mobile App:** React Native version
- **Replay System:** IPFS storage for battle replays
- **Social Features:** Friends, guilds, chat

---

## 📝 FINAL CHECKLIST

Before going live:
- [ ] Test all user flows (signup → play → see results)
- [ ] Verify Firebase security rules
- [ ] Check mobile responsiveness
- [ ] Test with different screen sizes
- [ ] Ensure AI feedback is appropriate
- [ ] Test edge cases (network issues, etc.)
- [ ] Deploy to Firebase Hosting or Vercel
- [ ] Setup custom domain (optional)

---

## 🚀 DEPLOYMENT

### Hosting Options

**Option A: Firebase Hosting (Recommended for tonight)**
```bash
firebase deploy --only hosting,functions
```

**Option B: Vercel**
```bash
vercel deploy --prod
```

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
OPENAI_API_KEY=...
PYTH_API_KEY=...
```

---

## 💡 TIPS FOR TONIGHT

1. **Start with mock data** - Don't block on Pyth integration
2. **Keep AI simple** - Even random tips are better than nothing
3. **Focus on core gameplay** - Skip fancy features
4. **Test frequently** - Don't wait till the end
5. **Deploy early** - Deploy a basic version first
6. **Copy liberally from v1** - No shame, we're on a deadline
7. **Don't over-engineer** - Simple solutions first

---

## 🎮 LET'S BUILD THIS!

Start with Phase 1 (setup) and work through sequentially. The goal is a working product by tonight, not perfection. We can always iterate later!

**Good luck! 🚀**

