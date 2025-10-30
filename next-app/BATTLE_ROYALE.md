# Battle Royale - 1v1 Trading Competition

## 🎯 Overview

Battle Royale is a fast-paced 1v1 trading game mode where players compete to generate the highest profit in **30 seconds** of live SOL/USDC trading.

## ⚔️ Game Flow

### 1. **Ready Phase**
- Shows game rules and starting conditions
- Players review objectives
- Click "Start Battle" to begin

### 2. **Countdown (3 seconds)**
- Brief countdown before trading begins
- Players prepare their strategy

### 3. **Trading Phase (30 seconds)**
- **Live chart** showing real-time SOL/USDC prices
- **Trading panel** with BUY/SELL buttons
- **Real-time stats** showing current P&L
- **AI opponent** making autonomous trades

### 4. **Results Phase**
- Final profit/loss calculation
- Winner determination
- ELO adjustment (+25 win, -10 loss)
- Performance comparison with opponent

## 💰 Game Rules

### Starting Conditions
- **Starting Balance**: $1,000 (virtual USD)
- **SOL Holdings**: 0
- **Max Trades**: 5 total trades allowed
- **Duration**: 30 seconds

### Trading Options

**BUY SOL:**
- 25% of balance
- 50% of balance  
- 100% of balance (ALL IN)

**SELL SOL:**
- 25% of holdings
- 50% of holdings
- 100% of holdings (ALL OUT)

### Winning Condition
- Player with **highest final portfolio value** wins
- Final Value = Cash Balance + (SOL Holdings × Current Price)
- Ties are possible but rare

## 📊 Features

### Real-Time Trading Chart
- Professional lightweight-charts integration
- Interactive price chart with zoom/pan
- Live price updates every second
- Clear visualization of price movements

### Trading Panel
- **Portfolio Display**:
  - Current balance
  - SOL holdings
  - Current SOL price
  
- **Quick Trade Buttons**:
  - One-click percentage-based trading
  - Instant execution
  - Clear feedback

- **Trade History**:
  - Live list of all your trades
  - Shows type (BUY/SELL), amount, and price
  - Scrollable history

### Real-Time Stats
- **Timer**: Counts down from 30 seconds
- **Portfolio Value**: Live total value calculation
- **P&L Percentage**: Real-time profit/loss %
- **Trades Counter**: Shows X/5 trades used

### AI Opponent

The AI opponent trades autonomously with realistic behavior:

**AI Strategy:**
- Makes trades every 3-8 seconds (random intervals)
- Buys when balance > $300
- Sells when SOL holdings > 0
- Randomized trade amounts (30-100% of available)
- Subject to same 5-trade limit
- Uses same price data

## 🎮 How to Play

### Step-by-Step Guide

1. **Navigate** to `/battle`
2. **Click "Start Battle"** on ready screen
3. **Wait** for 3-second countdown
4. **Trading Phase Begins:**
   - Monitor the live price chart
   - Look for price movements
   - Click BUY buttons when you think price will rise
   - Click SELL buttons when you think price will fall
   - Watch your P&L update in real-time
5. **Battle Ends** at 30 seconds
6. **See Results:**
   - Your final value vs AI opponent
   - Win/loss determination
   - ELO change
   - Performance breakdown

### Strategies

**Momentum Trading:**
- Buy when price is rising
- Sell when price starts falling
- Quick entries and exits

**Value Trading:**
- Buy at price dips
- Hold until price rises
- Fewer, larger trades

**Scalping:**
- Make many small trades
- Capture tiny price movements
- Use all 5 trades

**All-In Gamble:**
- Go all-in on one direction
- High risk, high reward
- Best for confident predictions

## 💡 Tips & Tricks

### For Success
1. **Watch the Chart** - Price movements tell the story
2. **Don't Panic** - You have 30 full seconds
3. **Diversify** - Don't use all trades at once
4. **Time Your Exits** - Selling at the right time matters
5. **Learn from AI** - Watch opponent trades in history

### Common Mistakes to Avoid
- ❌ Using all 5 trades in first 5 seconds
- ❌ Holding SOL until timer expires (might drop)
- ❌ Buying high, selling low
- ❌ Ignoring the chart movements
- ❌ Trading without a plan

## 🏆 Scoring & ELO

### ELO Changes
- **Win**: +25 ELO
- **Loss**: -10 ELO
- **Tie**: ±0 ELO (rare)

### Performance Metrics Tracked
- Final Portfolio Value
- Profit/Loss Amount ($)
- Profit/Loss Percentage (%)
- Number of Trades Used
- Trade Win Rate

## 🎯 Development Mode Features

In development mode, the game uses:

### Mock Data
- ✅ Real-time mock price generation
- ✅ Higher volatility (3% vs 2% in Predict Battle)
- ✅ No API calls required
- ✅ Fully offline capable

### AI Opponent
- ✅ Local AI trading logic
- ✅ Randomized behavior
- ✅ Simulates realistic trader
- ✅ No backend required

### Local Calculations
- ✅ P&L calculated client-side
- ✅ No Firebase dependencies
- ✅ Instant results
- ✅ Mock ELO changes

## 🔧 Technical Details

### Component Structure
```
BattleRoyaleGame
├── Chart (lightweight-charts)
├── Trading Panel
│   ├── Portfolio Stats
│   ├── BUY Buttons
│   ├── SELL Buttons
│   └── Trade History
├── Stats Bar (Timer, P&L, Trades)
└── Results Screen
```

### State Management
- Player state (balance, holdings, trades)
- Opponent state (AI trader)
- Game phase (ready/countdown/trading/finished)
- Real-time P&L calculation
- Trade validation

### Trade Execution
```typescript
1. Validate trade type (BUY/SELL)
2. Check trade limit (max 5)
3. Verify sufficient balance/holdings
4. Calculate SOL amount from USD amount
5. Update balance and holdings
6. Record trade in history
7. Update UI
```

### P&L Calculation
```typescript
Final Value = Balance + (SOL Holdings × Current Price)
Profit/Loss = Final Value - Starting Balance ($1000)
P&L % = (Profit/Loss / Starting Balance) × 100
```

## 📱 Browser Compatibility

Fully tested on:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)

## 🚀 Future Enhancements (Planned)

### Matchmaking
- [ ] Real-time player matching
- [ ] ELO-based pairing
- [ ] Waiting room/lobby
- [ ] Player vs Player (not AI)

### Advanced Features
- [ ] Multiple timeframes (15s, 30s, 60s)
- [ ] Different trading pairs (BTC, ETH, etc.)
- [ ] Tournament mode
- [ ] Spectator mode
- [ ] Replays
- [ ] Advanced analytics
- [ ] Trade recommendations
- [ ] Social features (friend battles)

### Production Features
- [ ] Firebase backend integration
- [ ] Real ELO persistence
- [ ] Battle history storage
- [ ] Leaderboards
- [ ] Achievements
- [ ] Streak tracking
- [ ] Season rankings

## 🎨 UI/UX Features

### Visual Feedback
- ✅ Color-coded P&L (green=profit, red=loss)
- ✅ Real-time chart updates
- ✅ Progress bars for time
- ✅ Confetti for victories
- ✅ Clear trade confirmations

### Responsive Design
- ✅ Desktop optimized (best experience)
- ✅ Mobile compatible
- ✅ Adaptive layouts
- ✅ Touch-friendly buttons

### Accessibility
- ✅ Clear visual hierarchy
- ✅ Large, readable text
- ✅ Color contrast
- ✅ Keyboard navigation ready

## 📊 Example Battle Scenario

**Starting State:**
- Balance: $1,000
- SOL: 0
- Price: $25.00

**Trade 1** (5s): BUY $500 → Get 20 SOL @ $25.00
- Balance: $500
- SOL: 20

**Trade 2** (12s): Price rises to $26.00, SELL 10 SOL → Get $260
- Balance: $760
- SOL: 10
- Current P&L: +$10 (+1%)

**Trade 3** (20s): Price drops to $24.50, BUY $380 → Get 15.51 SOL
- Balance: $380
- SOL: 25.51

**Battle Ends** (30s): Price at $25.50
- Final SOL Value: 25.51 × $25.50 = $650.50
- Final Portfolio: $380 + $650.50 = $1,030.50
- **Result: +$30.50 (+3.05% profit)**

**vs AI Opponent:**
- AI Final Value: $1,015.00
- **YOU WIN! 🏆**
- +25 ELO

---

**Status**: ✅ Fully Functional in Development Mode
**Last Updated**: October 30, 2025
**Game Mode**: Battle Royale 1v1

