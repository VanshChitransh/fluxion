#!/bin/bash

# Script to copy Anchor IDL to frontend after building

echo "🔄 Copying Anchor IDL to frontend..."

# Check if IDL exists
IDL_PATH="anchor-program/fluxion_program/target/idl/fluxion_program.json"
TYPES_PATH="anchor-program/fluxion_program/target/types/fluxion_program.ts"

if [ ! -f "$IDL_PATH" ]; then
    echo "❌ IDL not found at $IDL_PATH"
    echo "Please build the Anchor program first:"
    echo "  cd anchor-program/fluxion_program"
    echo "  anchor build"
    exit 1
fi

# Create destination directory
mkdir -p next-app/src/lib/solana/idl

# Copy IDL
cp "$IDL_PATH" next-app/src/lib/solana/idl/fluxion_program.json
echo "✅ Copied IDL to next-app/src/lib/solana/idl/"

# Copy TypeScript types if they exist
if [ -f "$TYPES_PATH" ]; then
    cp "$TYPES_PATH" next-app/src/lib/solana/idl/fluxion_program.ts
    echo "✅ Copied types to next-app/src/lib/solana/idl/"
fi

echo ""
echo "🎉 IDL copied successfully!"
echo ""
echo "Next steps:"
echo "1. Update src/lib/solana/program.ts to import the IDL"
echo "2. Restart the frontend: npm run dev"
echo ""

