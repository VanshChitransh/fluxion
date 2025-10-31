/**
 * Fluxion Solana Program Client
 * 
 * TypeScript SDK for interacting with the Fluxion Anchor program
 */

import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';

// Import the IDL
import { FluxionProgram } from './idl/fluxion_program';
import IDL from './idl/fluxion_program.json';

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || '2nGrkskjUEF5pkDgvrdSMsz9f59GX6a6M8rwZAahdTFL'
);

export enum GameType {
  PredictBattle = 0,
  BattleRoyale = 1,
}

export enum RewardType {
  DailyLogin = 0,
  TierAchievement = 1,
  WinStreak = 2,
  Tournament = 3,
}

export interface UserProfile {
  owner: PublicKey;
  username: string;
  elo: number;
  totalGames: number;
  wins: number;
  losses: number;
  predictGames: number;
  battleGames: number;
  highestElo: number;
  totalEarnings: BN;
  createdAt: BN;
  lastPlayed: BN;
}

export interface GameResult {
  player: PublicKey;
  gameType: GameType;
  timestamp: BN;
  won: boolean;
  eloChange: number;
  finalElo: number;
  symbol: string;
  pnl: BN;
}

/**
 * Get the PDA for a user profile
 */
export function getUserProfilePDA(userPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user_profile'), userPubkey.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Initialize the Anchor provider
 */
export function getProvider(connection: Connection, wallet: AnchorWallet): AnchorProvider {
  return new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  });
}

/**
 * Fluxion Program Client
 */
export class FluxionClient {
  constructor(
    public program: Program<FluxionProgram>,
    public provider: AnchorProvider
  ) {}

  /**
   * Initialize a new user profile
   */
  async initializeUser(username: string): Promise<string> {
    if (!this.program || !this.program.methods) {
      throw new Error('Program not initialized. Please deploy the Anchor program and load the IDL.');
    }

    const [userProfilePDA] = getUserProfilePDA(this.provider.wallet.publicKey);

    const tx = await this.program.methods
      .initializeUser(username)
      .accounts({
        userProfile: userProfilePDA,
        user: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log('User initialized:', tx);
    return tx;
  }

  /**
   * Update user ELO after a game
   */
  async updateElo(
    eloChange: number,
    gameWon: boolean,
    gameType: GameType
  ): Promise<string> {
    if (!this.program || !this.program.methods) {
      throw new Error('Program not initialized. Please deploy the Anchor program and load the IDL.');
    }

    const [userProfilePDA] = getUserProfilePDA(this.provider.wallet.publicKey);

    const tx = await this.program.methods
      .updateElo(eloChange, gameWon, { [GameType[gameType].toLowerCase()]: {} })
      .accounts({
        userProfile: userProfilePDA,
        user: this.provider.wallet.publicKey,
      })
      .rpc();

    console.log('ELO updated:', tx);
    return tx;
  }

  /**
   * Record a game result on-chain
   */
  async recordGameResult(
    gameType: GameType,
    won: boolean,
    eloChange: number,
    symbol: string,
    pnl: number
  ): Promise<string> {
    if (!this.program || !this.program.methods) {
      throw new Error('Program not initialized. Please deploy the Anchor program and load the IDL.');
    }

    const [userProfilePDA] = getUserProfilePDA(this.provider.wallet.publicKey);
    const gameResultKeypair = Keypair.generate();

    const tx = await this.program.methods
      .recordGameResult(
        { [GameType[gameType].toLowerCase()]: {} },
        {
          won,
          eloChange,
          symbol,
          pnl: new BN(pnl),
        }
      )
      .accounts({
        gameResult: gameResultKeypair.publicKey,
        userProfile: userProfilePDA,
        user: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([gameResultKeypair])
      .rpc();

    console.log('Game result recorded:', tx);
    return tx;
  }

  /**
   * Claim an NFT reward
   */
  async claimNftReward(
    rewardType: RewardType,
    metadataUri: string
  ): Promise<string> {
    const [userProfilePDA] = getUserProfilePDA(this.provider.wallet.publicKey);
    const nftClaimKeypair = Keypair.generate();

    const tx = await this.program.methods
      .claimNftReward({ [RewardType[rewardType].toLowerCase()]: {} }, metadataUri)
      .accounts({
        nftClaim: nftClaimKeypair.publicKey,
        userProfile: userProfilePDA,
        user: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([nftClaimKeypair])
      .rpc();

    console.log('NFT reward claimed:', tx);
    return tx;
  }

  /**
   * Fetch user profile
   */
  async getUserProfile(userPubkey?: PublicKey): Promise<UserProfile | null> {
    if (!this.program || !this.program.account) {
      console.warn('Program not initialized. Please build and deploy the Anchor program first.');
      return null;
    }

    const pubkey = userPubkey || this.provider.wallet.publicKey;
    const [userProfilePDA] = getUserProfilePDA(pubkey);

    try {
      const profile = await this.program.account.userProfile.fetch(userProfilePDA);
      return profile as unknown as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Check if user profile exists
   */
  async userProfileExists(userPubkey?: PublicKey): Promise<boolean> {
    if (!this.program || !this.program.account) {
      console.warn('Program not initialized.');
      return false;
    }
    const profile = await this.getUserProfile(userPubkey);
    return profile !== null;
  }

  /**
   * Get all game results for a user
   */
  async getUserGameResults(userPubkey?: PublicKey): Promise<GameResult[]> {
    const pubkey = userPubkey || this.provider.wallet.publicKey;

    const results = await this.program.account.gameResult.all([
      {
        memcmp: {
          offset: 8, // After discriminator
          bytes: pubkey.toBase58(),
        },
      },
    ]);

    return results.map((r) => r.account as unknown as GameResult);
  }
}

/**
 * Create a FluxionClient instance
 */
export function createFluxionClient(
  connection: Connection,
  wallet: AnchorWallet,
  programId: PublicKey = PROGRAM_ID
): FluxionClient {
  const provider = getProvider(connection, wallet);
  // Create program instance with the loaded IDL
  const program = new Program(IDL as any, programId, provider);
  return new FluxionClient(program, provider);
}

