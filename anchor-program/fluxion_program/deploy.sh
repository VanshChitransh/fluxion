#!/bin/bash

# Fluxion Program Deployment Script
# Usage: ./deploy.sh [devnet|mainnet]

CLUSTER=${1:-devnet}

echo "🚀 Deploying Fluxion Program to $CLUSTER"
echo "=========================================="

# Set the Solana cluster
echo "📡 Setting cluster to $CLUSTER..."
solana config set --url $CLUSTER

# Check wallet balance
echo ""
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance)
echo "Balance: $BALANCE"

if [ "$CLUSTER" = "devnet" ]; then
    echo ""
    echo "🪂 Airdropping SOL for deployment..."
    solana airdrop 2 || echo "Airdrop failed (rate limit or balance cap), continuing..."
fi

# Build the program
echo ""
echo "🔨 Building program..."
anchor build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build successful!"

# Deploy the program
echo ""
echo "📦 Deploying to $CLUSTER..."
anchor deploy --provider.cluster $CLUSTER

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"

# Get the program ID
PROGRAM_ID=$(solana address -k target/deploy/fluxion_program-keypair.json)

echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo "=========================================="
echo ""
echo "Program ID: $PROGRAM_ID"
echo "Cluster: $CLUSTER"
echo ""
echo "📝 Next steps:"
echo "1. Update declare_id!() in programs/fluxion_program/src/lib.rs"
echo "2. Update Anchor.toml [programs.$CLUSTER]"
echo "3. Update NEXT_PUBLIC_PROGRAM_ID in frontend .env.local"
echo "4. Rebuild: anchor build"
echo "5. Redeploy: anchor deploy --provider.cluster $CLUSTER"
echo ""
echo "🔗 View on Explorer:"
echo "https://explorer.solana.com/address/$PROGRAM_ID?cluster=$CLUSTER"
echo ""

