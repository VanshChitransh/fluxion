# Fluxion Solana Program

A Solana smart contract (Anchor program) for the Fluxion trading game platform.

## 📋 Features

- **User Profiles**: On-chain user profiles with ELO ratings, stats, and game history
- **ELO System**: Dynamic rating system that updates after each game
- **Game Results**: Permanent, verifiable record of all game outcomes
- **NFT Rewards**: Claim and track NFT rewards for achievements
- **Multiple Game Modes**: Support for Predict Battle and Battle Royale

## 🏗️ Program Structure

```
fluxion_program/
├── programs/
│   └── fluxion_program/
│       └── src/
│           └── lib.rs          # Main program logic
├── tests/
│   └── fluxion_program.ts      # Comprehensive test suite
├── Anchor.toml                 # Anchor configuration
└── README.md                   # This file
```

## 📦 Accounts

### UserProfile
Stores player information and statistics:
- Owner (wallet address)
- Username
- ELO rating (current, highest)
- Game statistics (wins, losses, total games)
- Game mode counts
- Total earnings
- Timestamps

### GameResult
Records individual game outcomes:
- Player
- Game type (Predict/Battle)
- Win/loss
- ELO change
- Trading symbol
- P&L (profit/loss)
- Timestamp

### NftClaim
Tracks NFT reward claims:
- Player
- Reward type
- Metadata URI
- ELO at time of claim
- Timestamp

## 🚀 Quick Start

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install latest
avm use latest
```

### Build the Program

```bash
cd /home/mohit/project2/fluxion_v2/anchor-program/fluxion_program

# Build
anchor build

# The program ID will be in target/deploy/fluxion_program-keypair.json
```

### Run Tests

```bash
# Start local validator (in a separate terminal)
solana-test-validator

# Run tests
anchor test --skip-local-validator
```

## 📡 Deployment

### Deploy to Devnet

```bash
# Configure Solana CLI for devnet
solana config set --url devnet

# Create/check your wallet
solana-keygen new  # Only if you don't have one
solana address

# Airdrop SOL for deployment (devnet only)
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet
```

After deployment, copy the **Program ID** from the output.

### Update Program ID

1. Update `declare_id!()` in `programs/fluxion_program/src/lib.rs`:
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

2. Update `Anchor.toml`:
```toml
[programs.devnet]
fluxion_program = "YOUR_PROGRAM_ID_HERE"
```

3. Update frontend `.env.local`:
```bash
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
```

4. Rebuild and redeploy:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

## 🧪 Testing

The test suite includes:

- ✅ User profile initialization
- ✅ ELO updates (wins/losses)
- ✅ ELO floor (prevents negative ratings)
- ✅ Game result recording
- ✅ NFT reward claims
- ✅ Input validation (username length, URI length)
- ✅ Full game flow integration test

Run tests:
```bash
anchor test
```

## 📚 Usage Examples

### Initialize User Profile

```typescript
import { FluxionClient } from '@/lib/solana/program';

// Initialize profile
const tx = await client.initializeUser("MyUsername");
console.log("Profile created:", tx);
```

### Update ELO After Game

```typescript
// Player won and gained 30 ELO
await client.updateElo(30, true, GameType.PredictBattle);

// Player lost and dropped 20 ELO
await client.updateElo(-20, false, GameType.BattleRoyale);
```

### Record Game Result

```typescript
await client.recordGameResult(
  GameType.PredictBattle,
  true,           // won
  35,             // ELO change
  "BTC/USD",      // symbol
  15000           // P&L in cents ($150 profit)
);
```

### Fetch User Profile

```typescript
const profile = await client.getUserProfile();
console.log(`ELO: ${profile.elo}`);
console.log(`Win Rate: ${(profile.wins / profile.totalGames * 100).toFixed(1)}%`);
```

## 🔐 Security Features

- **PDAs (Program Derived Addresses)**: User profiles are derived from wallet address
- **Ownership Checks**: Only profile owners can update their data
- **Input Validation**: All inputs are validated for length and format
- **Signed Transactions**: All mutations require wallet signature
- **Immutable Results**: Game results are permanent once recorded

## 📊 Data Storage Costs

Approximate rent-exempt costs (devnet/mainnet):

- User Profile: ~0.002 SOL
- Game Result: ~0.001 SOL
- NFT Claim: ~0.003 SOL

Players pay rent for their own accounts (standard Solana model).

## 🛠️ Development

### Local Development

```bash
# Terminal 1: Start local validator
solana-test-validator

# Terminal 2: Watch for changes and rebuild
anchor build --watch

# Terminal 3: Run tests
anchor test --skip-local-validator
```

### Generate TypeScript Client

```bash
anchor build
# IDL will be generated in target/idl/fluxion_program.json
# Types will be in target/types/fluxion_program.ts
```

## 🌐 Network Configuration

```bash
# Localnet (for testing)
solana config set --url localhost

# Devnet (for development/hackathon)
solana config set --url devnet

# Mainnet (production)
solana config set --url mainnet-beta
```

## 📖 Additional Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Program Library](https://spl.solana.com/)

## 📝 License

MIT License - Built for Solana Hackathon

