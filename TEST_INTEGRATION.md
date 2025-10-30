# Test the Blockchain Integration 🧪

Quick guide to test that everything is working!

## 🚀 Quick Start (5 minutes)

### Step 1: Start the Frontend
```bash
cd /home/mohit/project2/fluxion_v2/next-app
npm run dev
```

Open http://localhost:3000

### Step 2: Connect Wallet
1. Click **"Connect Wallet"** in the header
2. Select **Phantom** (make sure it's on devnet)
3. Approve the connection

### Step 3: Create Profile (First Time Only)
1. You'll see a profile creation screen
2. Enter a username (3-32 characters)
3. Click **"Create Profile (0.002 SOL)"**
4. Approve the transaction in Phantom
5. Wait for confirmation ✅

### Step 4: Play a Game
1. Navigate to **"Predict"** page
2. Click **"Start Game"**
3. Watch the countdown (3... 2... 1...)
4. Observe price movements (15 seconds)
5. Make your prediction (UP or DOWN)
6. Wait for result (3 seconds)
7. **Watch the transaction notification appear!** 🎉

### Step 5: View Stats on Dashboard
1. Go to **"Dashboard"** page
2. See your on-chain stats:
   - ELO rating
   - Win/loss record
   - Total games
   - All pulled from blockchain!
3. Click **"View on Explorer"** to verify on Solana

---

## ✅ Checklist

Test each feature:

### Wallet Connection
- [ ] Can connect Phantom wallet
- [ ] Wallet address shows in header
- [ ] Can disconnect wallet

### Profile System
- [ ] Profile creation screen appears (first time)
- [ ] Can enter username
- [ ] Transaction completes successfully
- [ ] Success screen appears

### Game Flow
- [ ] Game starts normally
- [ ] Price chart displays
- [ ] Can make prediction
- [ ] Result appears after game

### Blockchain Recording
- [ ] Transaction notification appears after game
- [ ] Shows "Processing transaction..."
- [ ] Shows "Transaction confirmed!" with link
- [ ] Can click to view on Solana Explorer

### Dashboard
- [ ] Shows correct username
- [ ] Shows current ELO
- [ ] Shows win/loss stats
- [ ] Shows total games
- [ ] "Refresh" button works
- [ ] "View on Explorer" link works

---

## 🔍 Verification Steps

### 1. Verify Transaction on Solana Explorer

After playing a game:
1. Click the Explorer link in the notification
2. Verify transaction is "Success" ✅
3. Check "Program" is your Fluxion program
4. See the transaction details

### 2. Check Profile Data

In Solana Explorer:
1. Go to your wallet address
2. Look for "Token Accounts" or "Program Accounts"
3. Find your UserProfile account
4. Verify data matches what's shown in Dashboard

### 3. Test Multiple Games

Play 3 games in a row:
- [ ] ELO updates after each game
- [ ] Win count increases when you win
- [ ] Loss count increases when you lose
- [ ] Total games increments each time
- [ ] Dashboard refreshes automatically

---

## 📊 Expected Behavior

### First Game (Win):
- Starting ELO: 1000
- Win: +30 ELO
- New ELO: 1030
- Wins: 1, Losses: 0, Total: 1

### Second Game (Loss):
- Starting ELO: 1030
- Loss: -20 ELO
- New ELO: 1010
- Wins: 1, Losses: 1, Total: 2

### Third Game (Win):
- Starting ELO: 1010
- Win: +30 ELO
- New ELO: 1040
- Wins: 2, Losses: 1, Total: 3

---

## 🐛 Common Issues & Fixes

### Issue: "Wallet not connected"
**Fix**: Click "Connect Wallet" in header

### Issue: "Profile not found"
**Fix**: Go through profile creation flow

### Issue: "Transaction failed"
**Fix**: 
```bash
# Check you have SOL
solana balance

# Get more SOL (devnet only)
solana airdrop 1
```

### Issue: "Stats not updating"
**Fix**: Click "Refresh" button on Dashboard

### Issue: "Game works but no blockchain notification"
**Cause**: Wallet not connected or profile doesn't exist
**Fix**: Ensure wallet is connected AND profile exists

---

## 🎯 What to Look For

### ✅ Good Signs:
- Transaction notifications appear
- Explorer links work
- Dashboard shows increasing game count
- ELO changes after each game
- Transactions visible on Solana Explorer

### ❌ Red Flags:
- No transaction notification after game
- Dashboard always shows 0 games
- Explorer link gives 404
- Transactions not appearing on-chain

---

## 🔬 Advanced Testing

### Test Error Handling:

#### 1. Test Without Wallet
- Don't connect wallet
- Try to play game
- Game should work (mock mode)
- No blockchain recording

#### 2. Test With Wallet But No Profile
- Connect wallet
- Delete profile (or use new wallet)
- Should see profile creation screen

#### 3. Test Transaction Rejection
- Play game
- Reject transaction in wallet
- Error notification should appear
- Game result still shows locally

---

## 📱 Mobile Testing (Optional)

If testing on mobile:
1. Use Phantom mobile app
2. Open site in mobile browser
3. Connect via WalletConnect
4. Same flow as desktop

---

## 🎬 Demo Recording Tips

### For Hackathon Presentation:

**Record these screens:**
1. Homepage with "Connect Wallet" button
2. Wallet connection flow
3. Profile creation (show transaction)
4. Playing a game
5. Transaction notification appearing
6. Dashboard with on-chain stats
7. Solana Explorer showing transaction

**Narration points:**
- "All user data is stored on Solana"
- "Every game result is recorded on-chain"
- "This transaction is verifiable on Solana Explorer"
- "Stats are pulled directly from the blockchain"

---

## 📸 Screenshots to Capture

For documentation/pitch deck:

1. **Profile Creation Modal**
   - Shows blockchain integration upfront
   - Clear UX for Web3 interaction

2. **Transaction Notification**
   - Shows real-time blockchain feedback
   - Links to Explorer for transparency

3. **Dashboard with Stats**
   - All data labeled as "on-chain"
   - Professional, polished UI

4. **Solana Explorer**
   - Proof that transactions are real
   - Shows program interactions

5. **Side-by-side**
   - Dashboard stats next to Explorer data
   - Shows 1:1 match

---

## 🚦 Quick Status Check

Run this checklist before demo:

```bash
# 1. Check wallet has SOL
solana balance
# Should show > 0.1 SOL

# 2. Verify program is deployed
solana account YOUR_PROGRAM_ID --url devnet
# Should show account exists

# 3. Test frontend
curl http://localhost:3000
# Should return HTML

# 4. Check wallet is on devnet in Phantom
# Settings → Change Network → Devnet
```

---

## ✨ Success Criteria

Your integration is working if:

✅ Can create profile on-chain
✅ Can play games
✅ Transactions appear after each game
✅ Dashboard shows correct stats
✅ Explorer confirms transactions
✅ No crashes or errors
✅ Smooth user experience

---

## 🎉 You're Ready!

If all tests pass, you have a **fully functional Web3 game** with:
- Real smart contract
- On-chain data storage
- Verifiable transactions
- Professional UX

**Perfect for the hackathon demo!** 🚀

---

## 💡 Pro Tips

1. **Keep Phantom open** in a separate window during demo
2. **Have Explorer tab ready** to quickly show transactions
3. **Use a fresh wallet** for demo (starting at ELO 1000 is cleaner)
4. **Test the night before** to ensure everything works
5. **Have backup slides** showing transactions if live demo fails

---

Good luck! 🍀

