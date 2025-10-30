use anchor_lang::prelude::*;

declare_id!("2nGrkskjUEF5pkDgvrdSMsz9f59GX6a6M8rwZAahdTFL");

#[program]
pub mod fluxion_program {
    use super::*;

    /// Initialize a new user profile
    pub fn initialize_user(
        ctx: Context<InitializeUser>,
        username: String,
    ) -> Result<()> {
        require!(username.len() <= 32, FluxionError::UsernameTooLong);
        require!(username.len() > 0, FluxionError::UsernameEmpty);

        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.owner = ctx.accounts.user.key();
        user_profile.username = username;
        user_profile.elo = 1000; // Starting ELO
        user_profile.total_games = 0;
        user_profile.wins = 0;
        user_profile.losses = 0;
        user_profile.predict_games = 0;
        user_profile.battle_games = 0;
        user_profile.highest_elo = 1000;
        user_profile.total_earnings = 0;
        user_profile.created_at = Clock::get()?.unix_timestamp;
        user_profile.last_played = Clock::get()?.unix_timestamp;

        msg!("User profile initialized for: {}", user_profile.username);
        Ok(())
    }

    /// Update user ELO after a game
    pub fn update_elo(
        ctx: Context<UpdateElo>,
        elo_change: i16,
        game_won: bool,
        game_type: GameType,
    ) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        
        // Update ELO
        let new_elo = (user_profile.elo as i32 + elo_change as i32).max(0) as u16;
        user_profile.elo = new_elo;

        // Update highest ELO
        if new_elo > user_profile.highest_elo {
            user_profile.highest_elo = new_elo;
        }

        // Update game counts
        user_profile.total_games += 1;
        if game_won {
            user_profile.wins += 1;
        } else {
            user_profile.losses += 1;
        }

        match game_type {
            GameType::PredictBattle => user_profile.predict_games += 1,
            GameType::BattleRoyale => user_profile.battle_games += 1,
        }

        user_profile.last_played = Clock::get()?.unix_timestamp;

        msg!("ELO updated: {} -> {} (change: {})", 
            user_profile.elo - elo_change as u16, 
            user_profile.elo, 
            elo_change
        );
        
        Ok(())
    }

    /// Record a game result on-chain
    pub fn record_game_result(
        ctx: Context<RecordGameResult>,
        game_type: GameType,
        result: GameResultData,
    ) -> Result<()> {
        let game_result = &mut ctx.accounts.game_result;
        let user_profile = &ctx.accounts.user_profile;

        game_result.player = ctx.accounts.user.key();
        game_result.game_type = game_type;
        game_result.timestamp = Clock::get()?.unix_timestamp;
        game_result.won = result.won;
        game_result.elo_change = result.elo_change;
        game_result.final_elo = user_profile.elo;
        game_result.symbol = result.symbol;
        game_result.pnl = result.pnl;

        msg!("Game result recorded: {} {} (ELO: {})", 
            if result.won { "WIN" } else { "LOSS" },
            match game_type {
                GameType::PredictBattle => "Predict",
                GameType::BattleRoyale => "Battle",
            },
            user_profile.elo
        );

        Ok(())
    }

    /// Claim NFT reward (records the claim on-chain)
    pub fn claim_nft_reward(
        ctx: Context<ClaimNftReward>,
        reward_type: RewardType,
        metadata_uri: String,
    ) -> Result<()> {
        require!(metadata_uri.len() <= 200, FluxionError::UriTooLong);

        let nft_claim = &mut ctx.accounts.nft_claim;
        nft_claim.player = ctx.accounts.user.key();
        nft_claim.reward_type = reward_type;
        nft_claim.metadata_uri = metadata_uri;
        nft_claim.claimed_at = Clock::get()?.unix_timestamp;
        nft_claim.elo_at_claim = ctx.accounts.user_profile.elo;

        msg!("NFT reward claimed: {:?}", reward_type);
        Ok(())
    }
}

// ===================
// ACCOUNT STRUCTURES
// ===================

#[account]
pub struct UserProfile {
    pub owner: Pubkey,           // 32 bytes
    pub username: String,        // 4 + 32 = 36 bytes
    pub elo: u16,                // 2 bytes
    pub total_games: u32,        // 4 bytes
    pub wins: u32,               // 4 bytes
    pub losses: u32,             // 4 bytes
    pub predict_games: u32,      // 4 bytes
    pub battle_games: u32,       // 4 bytes
    pub highest_elo: u16,        // 2 bytes
    pub total_earnings: i64,     // 8 bytes (in lamports, can be negative)
    pub created_at: i64,         // 8 bytes
    pub last_played: i64,        // 8 bytes
}
// Total: ~114 bytes + overhead

#[account]
pub struct GameResult {
    pub player: Pubkey,          // 32 bytes
    pub game_type: GameType,     // 1 byte
    pub timestamp: i64,          // 8 bytes
    pub won: bool,               // 1 byte
    pub elo_change: i16,         // 2 bytes
    pub final_elo: u16,          // 2 bytes
    pub symbol: String,          // 4 + 10 = 14 bytes (e.g. "BTC/USD")
    pub pnl: i64,                // 8 bytes (profit/loss in smallest unit)
}
// Total: ~68 bytes + overhead

#[account]
pub struct NftClaim {
    pub player: Pubkey,          // 32 bytes
    pub reward_type: RewardType, // 1 byte
    pub metadata_uri: String,    // 4 + 200 = 204 bytes
    pub claimed_at: i64,         // 8 bytes
    pub elo_at_claim: u16,       // 2 bytes
}
// Total: ~247 bytes + overhead

// ===================
// CONTEXT STRUCTURES
// ===================

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 114 + 50, // discriminator + data + buffer
        seeds = [b"user_profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateElo<'info> {
    #[account(
        mut,
        seeds = [b"user_profile", user.key().as_ref()],
        bump,
        constraint = user_profile.owner == user.key() @ FluxionError::Unauthorized
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct RecordGameResult<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 68 + 30, // discriminator + data + buffer
    )]
    pub game_result: Account<'info, GameResult>,
    
    #[account(
        seeds = [b"user_profile", user.key().as_ref()],
        bump,
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimNftReward<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 247 + 20, // discriminator + data + buffer
    )]
    pub nft_claim: Account<'info, NftClaim>,
    
    #[account(
        seeds = [b"user_profile", user.key().as_ref()],
        bump,
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// ===================
// ENUMS & DATA TYPES
// ===================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum GameType {
    PredictBattle,
    BattleRoyale,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum RewardType {
    DailyLogin,
    TierAchievement,
    WinStreak,
    Tournament,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GameResultData {
    pub won: bool,
    pub elo_change: i16,
    pub symbol: String,
    pub pnl: i64,
}

// ===================
// ERRORS
// ===================

#[error_code]
pub enum FluxionError {
    #[msg("Username must be 32 characters or less")]
    UsernameTooLong,
    
    #[msg("Username cannot be empty")]
    UsernameEmpty,
    
    #[msg("Unauthorized: You don't own this profile")]
    Unauthorized,
    
    #[msg("Metadata URI too long (max 200 characters)")]
    UriTooLong,
}
