import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { StrategyProgram } from "../target/types/strategy_program";

describe("strategy-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.StrategyProgram as Program<StrategyProgram>;
  
  let strategyKeypair: Keypair;
  let authority: Keypair;

  beforeEach(async () => {
    strategyKeypair = Keypair.generate();
    authority = Keypair.generate();
    
    // Airdrop SOL to authority
    const signature = await provider.connection.requestAirdrop(
      authority.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
  });

  describe("Initialize Strategy", () => {
    it("Should initialize a new strategy", async () => {
      const strategyName = "Test Strategy";
      const strategyConfig = {
        asset: "SOL",
        strategyType: "breakout",
        timeframe: "15m",
        stopLoss: new anchor.BN(200), // 2%
        takeProfit: new anchor.BN(600), // 6%
        positionSize: new anchor.BN(1000), // 10%
        volumeCondition: "above_average",
        breakoutCondition: "price_increase",
      };

      // Find PDA for strategy
      const [strategyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("strategy"), authority.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeStrategy(strategyName, strategyConfig)
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Fetch the strategy account
      const strategyAccount = await program.account.strategy.fetch(strategyPda);

      expect(strategyAccount.authority.toString()).to.equal(authority.publicKey.toString());
      expect(strategyAccount.strategyName).to.equal(strategyName);
      expect(strategyAccount.config.asset).to.equal(strategyConfig.asset);
      expect(strategyAccount.config.strategyType).to.equal(strategyConfig.strategyType);
      expect(strategyAccount.isActive).to.be.false;
      expect(strategyAccount.totalTrades.toNumber()).to.equal(0);
      expect(strategyAccount.totalPnl.toNumber()).to.equal(0);
    });

    it("Should fail if unauthorized user tries to initialize", async () => {
      const unauthorizedUser = Keypair.generate();
      
      // Airdrop SOL to unauthorized user
      const signature = await provider.connection.requestAirdrop(
        unauthorizedUser.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(signature);

      const strategyName = "Test Strategy";
      const strategyConfig = {
        asset: "SOL",
        strategyType: "breakout",
        timeframe: "15m",
        stopLoss: new anchor.BN(200),
        takeProfit: new anchor.BN(600),
        positionSize: new anchor.BN(1000),
        volumeCondition: "above_average",
        breakoutCondition: "price_increase",
      };

      const [strategyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("strategy"), authority.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .initializeStrategy(strategyName, strategyConfig)
          .accounts({
            strategy: strategyPda,
            authority: unauthorizedUser.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([unauthorizedUser])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
      }
    });
  });

  describe("Activate Strategy", () => {
    let strategyPda: PublicKey;

    beforeEach(async () => {
      // Initialize a strategy first
      const strategyName = "Test Strategy";
      const strategyConfig = {
        asset: "SOL",
        strategyType: "breakout",
        timeframe: "15m",
        stopLoss: new anchor.BN(200),
        takeProfit: new anchor.BN(600),
        positionSize: new anchor.BN(1000),
        volumeCondition: "above_average",
        breakoutCondition: "price_increase",
      };

      [strategyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("strategy"), authority.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeStrategy(strategyName, strategyConfig)
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
    });

    it("Should activate a strategy", async () => {
      await program.methods
        .activateStrategy()
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const strategyAccount = await program.account.strategy.fetch(strategyPda);
      expect(strategyAccount.isActive).to.be.true;
    });

    it("Should fail if unauthorized user tries to activate", async () => {
      const unauthorizedUser = Keypair.generate();
      
      // Airdrop SOL to unauthorized user
      const signature = await provider.connection.requestAirdrop(
        unauthorizedUser.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(signature);

      try {
        await program.methods
          .activateStrategy()
          .accounts({
            strategy: strategyPda,
            authority: unauthorizedUser.publicKey,
          })
          .signers([unauthorizedUser])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
      }
    });
  });

  describe("Deactivate Strategy", () => {
    let strategyPda: PublicKey;

    beforeEach(async () => {
      // Initialize and activate a strategy first
      const strategyName = "Test Strategy";
      const strategyConfig = {
        asset: "SOL",
        strategyType: "breakout",
        timeframe: "15m",
        stopLoss: new anchor.BN(200),
        takeProfit: new anchor.BN(600),
        positionSize: new anchor.BN(1000),
        volumeCondition: "above_average",
        breakoutCondition: "price_increase",
      };

      [strategyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("strategy"), authority.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeStrategy(strategyName, strategyConfig)
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      await program.methods
        .activateStrategy()
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();
    });

    it("Should deactivate a strategy", async () => {
      await program.methods
        .deactivateStrategy()
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const strategyAccount = await program.account.strategy.fetch(strategyPda);
      expect(strategyAccount.isActive).to.be.false;
    });
  });

  describe("Update Strategy Config", () => {
    let strategyPda: PublicKey;

    beforeEach(async () => {
      // Initialize a strategy first
      const strategyName = "Test Strategy";
      const strategyConfig = {
        asset: "SOL",
        strategyType: "breakout",
        timeframe: "15m",
        stopLoss: new anchor.BN(200),
        takeProfit: new anchor.BN(600),
        positionSize: new anchor.BN(1000),
        volumeCondition: "above_average",
        breakoutCondition: "price_increase",
      };

      [strategyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("strategy"), authority.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeStrategy(strategyName, strategyConfig)
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
    });

    it("Should update strategy configuration", async () => {
      const newConfig = {
        asset: "BTC",
        strategyType: "trend",
        timeframe: "1h",
        stopLoss: new anchor.BN(300),
        takeProfit: new anchor.BN(900),
        positionSize: new anchor.BN(1500),
        volumeCondition: "double_average",
        breakoutCondition: "volume_spike",
      };

      await program.methods
        .updateStrategyConfig(newConfig)
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const strategyAccount = await program.account.strategy.fetch(strategyPda);
      expect(strategyAccount.config.asset).to.equal(newConfig.asset);
      expect(strategyAccount.config.strategyType).to.equal(newConfig.strategyType);
      expect(strategyAccount.config.timeframe).to.equal(newConfig.timeframe);
      expect(strategyAccount.config.stopLoss.toNumber()).to.equal(newConfig.stopLoss.toNumber());
      expect(strategyAccount.config.takeProfit.toNumber()).to.equal(newConfig.takeProfit.toNumber());
      expect(strategyAccount.config.positionSize.toNumber()).to.equal(newConfig.positionSize.toNumber());
      expect(strategyAccount.config.volumeCondition).to.equal(newConfig.volumeCondition);
      expect(strategyAccount.config.breakoutCondition).to.equal(newConfig.breakoutCondition);
    });
  });

  describe("Execute Trade", () => {
    let strategyPda: PublicKey;
    let fromTokenAccount: PublicKey;
    let toTokenAccount: PublicKey;

    beforeEach(async () => {
      // Initialize and activate a strategy first
      const strategyName = "Test Strategy";
      const strategyConfig = {
        asset: "SOL",
        strategyType: "breakout",
        timeframe: "15m",
        stopLoss: new anchor.BN(200),
        takeProfit: new anchor.BN(600),
        positionSize: new anchor.BN(1000),
        volumeCondition: "above_average",
        breakoutCondition: "price_increase",
      };

      [strategyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("strategy"), authority.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeStrategy(strategyName, strategyConfig)
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      await program.methods
        .activateStrategy()
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      // Create mock token accounts (simplified for testing)
      fromTokenAccount = Keypair.generate().publicKey;
      toTokenAccount = Keypair.generate().publicKey;
    });

    it("Should execute a buy trade", async () => {
      const tradeType = { buy: {} };
      const amount = new anchor.BN(1000000); // 1 SOL
      const price = new anchor.BN(100000000); // $100

      await program.methods
        .executeTrade(tradeType, amount, price)
        .accounts({
          strategy: strategyPda,
          fromTokenAccount: fromTokenAccount,
          toTokenAccount: toTokenAccount,
          authority: authority.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      const strategyAccount = await program.account.strategy.fetch(strategyPda);
      expect(strategyAccount.totalTrades.toNumber()).to.equal(1);
      expect(strategyAccount.totalPnl.toNumber()).to.equal(-amount.toNumber());
    });

    it("Should execute a sell trade", async () => {
      const tradeType = { sell: {} };
      const amount = new anchor.BN(1000000); // 1 SOL
      const price = new anchor.BN(100000000); // $100

      await program.methods
        .executeTrade(tradeType, amount, price)
        .accounts({
          strategy: strategyPda,
          fromTokenAccount: fromTokenAccount,
          toTokenAccount: toTokenAccount,
          authority: authority.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      const strategyAccount = await program.account.strategy.fetch(strategyPda);
      expect(strategyAccount.totalTrades.toNumber()).to.equal(1);
      expect(strategyAccount.totalPnl.toNumber()).to.equal(amount.toNumber());
    });

    it("Should fail if strategy is not active", async () => {
      // Deactivate the strategy first
      await program.methods
        .deactivateStrategy()
        .accounts({
          strategy: strategyPda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const tradeType = { buy: {} };
      const amount = new anchor.BN(1000000);
      const price = new anchor.BN(100000000);

      try {
        await program.methods
          .executeTrade(tradeType, amount, price)
          .accounts({
            strategy: strategyPda,
            fromTokenAccount: fromTokenAccount,
            toTokenAccount: toTokenAccount,
            authority: authority.publicKey,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          })
          .signers([authority])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
      }
    });
  });
}); 