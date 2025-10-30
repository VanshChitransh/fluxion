import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FluxionProgram } from "../target/types/fluxion_program";
import { expect } from "chai";

describe("fluxion_program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FluxionProgram as Program<FluxionProgram>;
  const user = provider.wallet;

  // Helper function to get user profile PDA
  function getUserProfilePDA(userPubkey: anchor.web3.PublicKey): [anchor.web3.PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), userPubkey.toBuffer()],
      program.programId
    );
  }

  describe("User Profile", () => {
    it("Initializes a new user profile", async () => {
      const username = "SolanaTrader";
      const [userProfilePDA] = getUserProfilePDA(user.publicKey);

      const tx = await program.methods
        .initializeUser(username)
        .accounts({
          userProfile: userProfilePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("User initialized:", tx);

      // Fetch and verify the account
      const userProfile = await program.account.userProfile.fetch(userProfilePDA);

      expect(userProfile.username).to.equal(username);
      expect(userProfile.owner.toString()).to.equal(user.publicKey.toString());
      expect(userProfile.elo).to.equal(1000);
      expect(userProfile.totalGames).to.equal(0);
      expect(userProfile.wins).to.equal(0);
      expect(userProfile.losses).to.equal(0);
      expect(userProfile.highestElo).to.equal(1000);
    });

    it("Fails to initialize with empty username", async () => {
      const newUser = anchor.web3.Keypair.generate();
      const [userProfilePDA] = getUserProfilePDA(newUser.publicKey);

      // Fund the new user
      const airdropSig = await provider.connection.requestAirdrop(
        newUser.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      try {
        await program.methods
          .initializeUser("")
          .accounts({
            userProfile: userProfilePDA,
            user: newUser.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([newUser])
          .rpc();

        expect.fail("Should have failed with empty username");
      } catch (error) {
        expect(error.toString()).to.include("UsernameEmpty");
      }
    });

    it("Fails to initialize with username too long", async () => {
      const newUser = anchor.web3.Keypair.generate();
      const [userProfilePDA] = getUserProfilePDA(newUser.publicKey);

      // Fund the new user
      const airdropSig = await provider.connection.requestAirdrop(
        newUser.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      const longUsername = "a".repeat(33); // 33 characters (max is 32)

      try {
        await program.methods
          .initializeUser(longUsername)
          .accounts({
            userProfile: userProfilePDA,
            user: newUser.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([newUser])
          .rpc();

        expect.fail("Should have failed with username too long");
      } catch (error) {
        expect(error.toString()).to.include("UsernameTooLong");
      }
    });
  });

  describe("ELO System", () => {
    it("Updates ELO after winning a game", async () => {
      const [userProfilePDA] = getUserProfilePDA(user.publicKey);

      // Get initial state
      let userProfile = await program.account.userProfile.fetch(userProfilePDA);
      const initialElo = userProfile.elo;
      const initialWins = userProfile.wins;

      // Update ELO (win +30)
      const eloChange = 30;
      await program.methods
        .updateElo(eloChange, true, { predictBattle: {} })
        .accounts({
          userProfile: userProfilePDA,
          user: user.publicKey,
        })
        .rpc();

      // Verify changes
      userProfile = await program.account.userProfile.fetch(userProfilePDA);
      expect(userProfile.elo).to.equal(initialElo + eloChange);
      expect(userProfile.wins).to.equal(initialWins + 1);
      expect(userProfile.totalGames).to.equal(1);
      expect(userProfile.predictGames).to.equal(1);
      expect(userProfile.highestElo).to.equal(initialElo + eloChange);
    });

    it("Updates ELO after losing a game", async () => {
      const [userProfilePDA] = getUserProfilePDA(user.publicKey);

      // Get initial state
      let userProfile = await program.account.userProfile.fetch(userProfilePDA);
      const initialElo = userProfile.elo;
      const initialLosses = userProfile.losses;
      const initialTotalGames = userProfile.totalGames;

      // Update ELO (loss -20)
      const eloChange = -20;
      await program.methods
        .updateElo(eloChange, false, { battleRoyale: {} })
        .accounts({
          userProfile: userProfilePDA,
          user: user.publicKey,
        })
        .rpc();

      // Verify changes
      userProfile = await program.account.userProfile.fetch(userProfilePDA);
      expect(userProfile.elo).to.equal(initialElo + eloChange);
      expect(userProfile.losses).to.equal(initialLosses + 1);
      expect(userProfile.totalGames).to.equal(initialTotalGames + 1);
      expect(userProfile.battleGames).to.equal(1);
    });

    it("Prevents ELO from going below zero", async () => {
      const newUser = anchor.web3.Keypair.generate();
      const [userProfilePDA] = getUserProfilePDA(newUser.publicKey);

      // Fund and initialize new user
      const airdropSig = await provider.connection.requestAirdrop(
        newUser.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      await program.methods
        .initializeUser("TestUser")
        .accounts({
          userProfile: userProfilePDA,
          user: newUser.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([newUser])
        .rpc();

      // Try to reduce ELO by more than starting amount (1000)
      await program.methods
        .updateElo(-1500, false, { predictBattle: {} })
        .accounts({
          userProfile: userProfilePDA,
          user: newUser.publicKey,
        })
        .signers([newUser])
        .rpc();

      // Verify ELO is 0, not negative
      const userProfile = await program.account.userProfile.fetch(userProfilePDA);
      expect(userProfile.elo).to.equal(0);
    });
  });

  describe("Game Results", () => {
    it("Records a Predict Battle game result", async () => {
      const [userProfilePDA] = getUserProfilePDA(user.publicKey);
      const gameResultKeypair = anchor.web3.Keypair.generate();

      const gameData = {
        won: true,
        eloChange: 25,
        symbol: "BTC/USD",
        pnl: new anchor.BN(15000), // $150 profit
      };

      await program.methods
        .recordGameResult({ predictBattle: {} }, gameData)
        .accounts({
          gameResult: gameResultKeypair.publicKey,
          userProfile: userProfilePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([gameResultKeypair])
        .rpc();

      // Verify the game result
      const gameResult = await program.account.gameResult.fetch(
        gameResultKeypair.publicKey
      );

      expect(gameResult.player.toString()).to.equal(user.publicKey.toString());
      expect(gameResult.won).to.be.true;
      expect(gameResult.eloChange).to.equal(25);
      expect(gameResult.symbol).to.equal("BTC/USD");
      expect(gameResult.pnl.toString()).to.equal("15000");
    });

    it("Records a Battle Royale game result", async () => {
      const [userProfilePDA] = getUserProfilePDA(user.publicKey);
      const gameResultKeypair = anchor.web3.Keypair.generate();

      const gameData = {
        won: false,
        eloChange: -15,
        symbol: "ETH/USD",
        pnl: new anchor.BN(-8000), // $80 loss
      };

      await program.methods
        .recordGameResult({ battleRoyale: {} }, gameData)
        .accounts({
          gameResult: gameResultKeypair.publicKey,
          userProfile: userProfilePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([gameResultKeypair])
        .rpc();

      // Verify the game result
      const gameResult = await program.account.gameResult.fetch(
        gameResultKeypair.publicKey
      );

      expect(gameResult.player.toString()).to.equal(user.publicKey.toString());
      expect(gameResult.won).to.be.false;
      expect(gameResult.eloChange).to.equal(-15);
      expect(gameResult.symbol).to.equal("ETH/USD");
      expect(gameResult.pnl.toString()).to.equal("-8000");
    });
  });

  describe("NFT Rewards", () => {
    it("Claims an NFT reward", async () => {
      const [userProfilePDA] = getUserProfilePDA(user.publicKey);
      const nftClaimKeypair = anchor.web3.Keypair.generate();

      const metadataUri = "https://arweave.net/example-nft-metadata";

      await program.methods
        .claimNftReward({ tierAchievement: {} }, metadataUri)
        .accounts({
          nftClaim: nftClaimKeypair.publicKey,
          userProfile: userProfilePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([nftClaimKeypair])
        .rpc();

      // Verify the NFT claim
      const nftClaim = await program.account.nftClaim.fetch(nftClaimKeypair.publicKey);

      expect(nftClaim.player.toString()).to.equal(user.publicKey.toString());
      expect(nftClaim.metadataUri).to.equal(metadataUri);
      expect(nftClaim.eloAtClaim).to.be.greaterThan(0);
    });

    it("Fails to claim NFT with URI too long", async () => {
      const [userProfilePDA] = getUserProfilePDA(user.publicKey);
      const nftClaimKeypair = anchor.web3.Keypair.generate();

      const longUri = "https://example.com/" + "a".repeat(200);

      try {
        await program.methods
          .claimNftReward({ dailyLogin: {} }, longUri)
          .accounts({
            nftClaim: nftClaimKeypair.publicKey,
            userProfile: userProfilePDA,
            user: user.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([nftClaimKeypair])
          .rpc();

        expect.fail("Should have failed with URI too long");
      } catch (error) {
        expect(error.toString()).to.include("UriTooLong");
      }
    });
  });

  describe("Integration Tests", () => {
    it("Complete game flow: initialize -> play -> record -> check stats", async () => {
      const newPlayer = anchor.web3.Keypair.generate();
      const [playerProfilePDA] = getUserProfilePDA(newPlayer.publicKey);

      // 1. Fund player
      const airdropSig = await provider.connection.requestAirdrop(
        newPlayer.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      // 2. Initialize profile
      await program.methods
        .initializeUser("NewPlayer")
        .accounts({
          userProfile: playerProfilePDA,
          user: newPlayer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([newPlayer])
        .rpc();

      // 3. Play and win a game (update ELO)
      await program.methods
        .updateElo(35, true, { predictBattle: {} })
        .accounts({
          userProfile: playerProfilePDA,
          user: newPlayer.publicKey,
        })
        .signers([newPlayer])
        .rpc();

      // 4. Record the game result
      const gameResultKeypair = anchor.web3.Keypair.generate();
      await program.methods
        .recordGameResult(
          { predictBattle: {} },
          {
            won: true,
            eloChange: 35,
            symbol: "SOL/USD",
            pnl: new anchor.BN(25000),
          }
        )
        .accounts({
          gameResult: gameResultKeypair.publicKey,
          userProfile: playerProfilePDA,
          user: newPlayer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([newPlayer, gameResultKeypair])
        .rpc();

      // 5. Verify final state
      const profile = await program.account.userProfile.fetch(playerProfilePDA);
      expect(profile.elo).to.equal(1035);
      expect(profile.wins).to.equal(1);
      expect(profile.totalGames).to.equal(1);
      expect(profile.highestElo).to.equal(1035);

      const gameResult = await program.account.gameResult.fetch(
        gameResultKeypair.publicKey
      );
      expect(gameResult.won).to.be.true;
      expect(gameResult.finalElo).to.equal(1035);
    });
  });
});
