# Fluxion v2 - Quick Start Guide

Get Fluxion up and running in 5 minutes! 🚀

## 📋 Prerequisites

```bash
# 1. Node.js (v18+)
node --version  # Should be 18.x or higher

# 2. Rust
rustc --version

# 3. Solana CLI
solana --version

# 4. Anchor
anchor --version

# 5. Phantom Wallet (browser extension)
# Download from: https://phantom.app/
```

## 🔧 Installation

### Step 1: Install Dependencies

```bash
# Frontend
cd /home/mohit/project2/fluxion_v2/next-app
npm install

# Smart Contract
cd /home/mohit/project2/fluxion_v2/anchor-program/fluxion_program
yarn install
```

### Step 2: Configure Solana Wallet

```bash
# Generate a new wallet (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# View your address
solana address

# Set to devnet
solana config set --url devnet

# Get some SOL for deployment
solana airdrop 2
```

### Step 3: Build & Deploy Smart Contract

```bash
cd /home/mohit/project2/fluxion_v2/anchor-program/fluxion_program

# Build
anchor build

# Deploy to devnet
./deploy.sh devnet

# Copy the Program ID from the output!
```

### Step 4: Update Program ID

After deployment, you'll get a Program ID. Update it in these files:

**1. Smart Contract** (`programs/fluxion_program/src/lib.rs`):
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**2. Anchor Config** (`Anchor.toml`):
```toml
[programs.devnet]
fluxion_program = "YOUR_PROGRAM_ID_HERE"
```

**3. Frontend Config** (`next-app/.env.local`):
```bash
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
```

Then rebuild:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

### Step 5: Configure Frontend

Create `.env.local` in `next-app/`:

```bash
cd /home/mohit/project2/fluxion_v2/next-app

cat > .env.local << EOF
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
EOF
```

### Step 6: Run the App

```bash
cd /home/mohit/project2/fluxion_v2/next-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🎮 First-Time User Flow

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Select Phantom (or your preferred wallet)
   - Approve the connection

2. **Initialize Profile**
   - On first visit, you'll be prompted to create a profile
   - Enter a username
   - Approve the transaction (~0.002 SOL for account rent)

3. **Play a Game**
   - Go to **Predict Battle** or **Battle Royale**
   - Follow the game instructions
   - After the game, your results will be recorded on-chain!

4. **View Your Stats**
   - Go to **Dashboard** to see your ELO, wins, and stats
   - All data is stored on Solana blockchain

## 🧪 Development Mode

For local development without blockchain (mock data only):

```bash
cd /home/mohit/project2/fluxion_v2/next-app

# No need to deploy smart contract
# No need for wallet connection
# Just run:
npm run dev
```

Games will work with mock data in development mode!

## 🔍 Verify Deployment

### Check Program is Deployed

```bash
# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/fluxion_program-keypair.json)

# Check program account
solana account $PROGRAM_ID --url devnet

# View in Explorer
echo "https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
```

### Test Smart Contract

```bash
cd /home/mohit/project2/fluxion_v2/anchor-program/fluxion_program

# Run tests (requires local validator)
# Terminal 1:
solana-test-validator

# Terminal 2:
anchor test --skip-local-validator
```

## 🐛 Troubleshooting

### "Wallet not connected"
- Make sure Phantom extension is installed
- Check that you're on devnet in Phantom settings
- Try refreshing the page

### "Transaction failed"
- Check you have SOL in your wallet: `solana balance`
- Get more: `solana airdrop 1`
- Verify program is deployed correctly

### "Profile not found"
- You need to initialize your profile first
- Go to Dashboard and click "Create Profile"
- Approve the transaction

### Build errors
```bash
# Clean and rebuild
cd /home/mohit/project2/fluxion_v2/anchor-program/fluxion_program
rm -rf target
anchor build
```

### Frontend errors
```bash
# Clean install
cd /home/mohit/project2/fluxion_v2/next-app
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

## 📚 Project Structure

```
fluxion_v2/
├── next-app/                        # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                    # Pages (Battle, Predict, etc.)
│   │   ├── components/             # UI components
│   │   │   ├── wallet/            # Wallet connection
│   │   │   └── game/              # Game components
│   │   ├── hooks/                 # React hooks
│   │   │   └── useProgram.ts      # Solana program hook
│   │   └── lib/
│   │       └── solana/
│   │           └── program.ts     # Program client SDK
│   └── .env.local                 # Configuration
│
└── anchor-program/                 # Smart Contract
    └── fluxion_program/
        ├── programs/
        │   └── fluxion_program/
        │       └── src/
        │           └── lib.rs     # Solana program
        ├── tests/                 # Test suite
        └── deploy.sh              # Deployment script
```

## 🎯 Key Features

### ✅ Implemented
- 🎮 **Predict Battle** - Price prediction game
- ⚔️ **Battle Royale** - Trading simulation vs AI/Players
- 💼 **Wallet Connection** - Phantom, Solflare, Backpack
- 🏆 **ELO System** - On-chain rating system
- 📊 **Game Results** - Permanent blockchain records
- 🎨 **Modern UI** - Beautiful, responsive design

### 🔄 In Progress
- 📈 **Dashboard** - Comprehensive stats view
- 🏅 **Leaderboard** - Global rankings
- 🎓 **Learn Page** - Trading education
- 🌐 **Markets Page** - Real-time market data

### 🚀 Future
- 🖼️ **NFT Rewards** - Claimable achievement NFTs
- 🏆 **Tournaments** - Competitive events
- 💰 **Token Rewards** - Play-to-earn mechanics

## 📊 Costs

All operations on devnet are free (test SOL). On mainnet:

| Operation | Cost |
|-----------|------|
| Create Profile | ~0.002 SOL (~$0.10) |
| Update ELO | ~0.000005 SOL (~$0.0003) |
| Record Game | ~0.001 SOL (~$0.05) |

Users only pay once for profile creation!

## 🔗 Useful Links

- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet
- **Anchor Docs**: https://www.anchor-lang.com/
- **Phantom Wallet**: https://phantom.app/
- **Solana Cookbook**: https://solanacookbook.com/

## 💡 Tips

1. **Use Devnet First**: Test everything on devnet before mainnet
2. **Keep Backups**: Save your wallet keypair securely
3. **Check Explorer**: Verify transactions on Solana Explorer
4. **Join Discord**: Get help from the Solana community

## 🎉 You're Ready!

You now have:
- ✅ Wallet connected
- ✅ Smart contract deployed
- ✅ Frontend running
- ✅ Ready to play!

Start by trying **Predict Battle** - it's the easiest game mode!

---

**Built for Solana Hackathon** 🚀

Need help? Check the [BLOCKCHAIN_INTEGRATION.md](./BLOCKCHAIN_INTEGRATION.md) for detailed documentation.

