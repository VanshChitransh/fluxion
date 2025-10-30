/**
 * Script to seed NFT rewards collection in Firestore
 * Run this once to populate the nftRewards collection
 * 
 * Usage: npx tsx scripts/seedNFTRewards.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const nftRewards = [
  {
    tierId: 1,
    tierName: 'Bronze Trader',
    eloRequirement: 0,
    name: 'Bronze Merchant Card',
    description: 'A humble beginning for every trader. This card marks your entry into the world of Fluxion.',
    imageUrl: '/nfts/bronze-merchant.png', // TODO: Add actual images
    perk: 'None',
    rarity: 'common' as const,
  },
  {
    tierId: 2,
    tierName: 'Silver Trader',
    eloRequirement: 1000,
    name: 'Silver Merchant Card',
    description: 'Your trading skills are beginning to shine. +5% XP boost helps you climb faster.',
    imageUrl: '/nfts/silver-merchant.png',
    perk: '+5% XP boost',
    rarity: 'common' as const,
  },
  {
    tierId: 3,
    tierName: 'Gold Trader',
    eloRequirement: 1200,
    name: 'Gold Merchant Card',
    description: 'Golden opportunities await those who reach this tier. +10% XP boost accelerates your progress.',
    imageUrl: '/nfts/gold-merchant.png',
    perk: '+10% XP boost',
    rarity: 'rare' as const,
  },
  {
    tierId: 4,
    tierName: 'Platinum Trader',
    eloRequirement: 1400,
    name: 'Platinum Strategist Card',
    description: 'Your strategies are refined and precise. Gain access to exclusive high-stakes battles.',
    imageUrl: '/nfts/platinum-strategist.png',
    perk: 'Access to exclusive battles',
    rarity: 'rare' as const,
  },
  {
    tierId: 5,
    tierName: 'Diamond Trader',
    eloRequirement: 1600,
    name: 'Diamond Strategist Card',
    description: 'A brilliant trader with unmatched precision. Unlock advanced AI insights for every battle.',
    imageUrl: '/nfts/diamond-strategist.png',
    perk: 'AI insights unlocked',
    rarity: 'epic' as const,
  },
  {
    tierId: 6,
    tierName: 'Master Trader',
    eloRequirement: 1800,
    name: 'Master Sage Card',
    description: 'Wisdom and skill combined. Your custom profile badge shows your mastery to all.',
    imageUrl: '/nfts/master-sage.png',
    perk: 'Custom profile badge',
    rarity: 'epic' as const,
  },
  {
    tierId: 7,
    tierName: 'Grandmaster',
    eloRequirement: 2000,
    name: 'Grandmaster Oracle Card',
    description: 'Among the elite few. Compete in exclusive tournaments with the best traders worldwide.',
    imageUrl: '/nfts/grandmaster-oracle.png',
    perk: 'Exclusive tournaments',
    rarity: 'legendary' as const,
  },
  {
    tierId: 8,
    tierName: 'Legendary',
    eloRequirement: 2300,
    name: 'Legendary Flux Master Card',
    description: 'The pinnacle of trading excellence. Your name will forever be etched in the Hall of Fame.',
    imageUrl: '/nfts/legendary-flux-master.png',
    perk: 'Hall of Fame entry',
    rarity: 'legendary' as const,
  },
];

async function seedNFTRewards() {
  console.log('🌱 Starting NFT Rewards seeding...\n');

  try {
    for (const reward of nftRewards) {
      const rewardRef = doc(db, 'nftRewards', `tier_${reward.tierId}`);
      await setDoc(rewardRef, reward);
      console.log(`✅ Created: ${reward.name} (${reward.tierName})`);
    }

    console.log('\n🎉 NFT Rewards seeding completed successfully!');
    console.log(`📊 Total rewards created: ${nftRewards.length}`);
  } catch (error) {
    console.error('❌ Error seeding NFT rewards:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seed function
seedNFTRewards();

