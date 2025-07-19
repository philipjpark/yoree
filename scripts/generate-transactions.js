const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Generating Required Transactions for BSC Testnet");
  console.log("==================================================\n");

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("👤 Connected wallet:", signer.address);

  // Contract addresses (update these after deployment)
  const MOCK_PYUSD_ADDRESS = "YOUR_MOCK_PYUSD_ADDRESS"; // Replace after deployment
  const STRATEGY_MANAGER_ADDRESS = "YOUR_STRATEGY_MANAGER_ADDRESS"; // Replace after deployment

  console.log("📋 Contract addresses:");
  console.log("   - MockPYUSD:", MOCK_PYUSD_ADDRESS);
  console.log("   - StrategyManager:", STRATEGY_MANAGER_ADDRESS);
  console.log("");

  // Connect to contracts
  const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
  const mockPYUSD = MockPYUSD.attach(MOCK_PYUSD_ADDRESS);

  const StrategyManager = await ethers.getContractFactory("StrategyManager");
  const strategyManager = StrategyManager.attach(STRATEGY_MANAGER_ADDRESS);

  try {
    // Transaction 1: Get PYUSD test tokens
    console.log("📝 Transaction 1: Getting PYUSD test tokens...");
    const tx1 = await mockPYUSD.getTestTokens();
    const receipt1 = await tx1.wait();
    console.log("✅ Transaction 1 successful!");
    console.log("   Hash:", receipt1.transactionHash);
    console.log("   Block:", receipt1.blockNumber);
    console.log("   Gas used:", receipt1.gasUsed.toString());
    console.log("");

    // Wait a bit between transactions
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Transaction 2: Create a strategy
    console.log("📝 Transaction 2: Creating BNB Momentum Strategy...");
    const tx2 = await strategyManager.createStrategy(
      "BNB Momentum Strategy",
      "AI-powered momentum strategy for BNB using PYUSD payments",
      "0x0000000000000000000000000000000000000000", // BNB address
      ethers.utils.parseUnits("2.5", 18), // 2.5% stop loss
      ethers.utils.parseUnits("8.0", 18), // 8% take profit
      ethers.utils.parseUnits("100", 18)  // $100 position size
    );
    const receipt2 = await tx2.wait();
    console.log("✅ Transaction 2 successful!");
    console.log("   Hash:", receipt2.transactionHash);
    console.log("   Block:", receipt2.blockNumber);
    console.log("   Gas used:", receipt2.gasUsed.toString());
    console.log("");

    // Wait a bit between transactions
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Transaction 3: Approve PYUSD spending
    console.log("📝 Transaction 3: Approving PYUSD for StrategyManager...");
    const tx3 = await mockPYUSD.approve(
      STRATEGY_MANAGER_ADDRESS,
      ethers.utils.parseUnits("100", 6) // 100 PYUSD
    );
    const receipt3 = await tx3.wait();
    console.log("✅ Transaction 3 successful!");
    console.log("   Hash:", receipt3.transactionHash);
    console.log("   Block:", receipt3.blockNumber);
    console.log("   Gas used:", receipt3.gasUsed.toString());
    console.log("");

    // Transaction 4: Open a position
    console.log("📝 Transaction 4: Opening position with PYUSD...");
    const tx4 = await strategyManager.openPosition(
      1, // Strategy ID
      ethers.utils.parseUnits("50", 6) // 50 PYUSD
    );
    const receipt4 = await tx4.wait();
    console.log("✅ Transaction 4 successful!");
    console.log("   Hash:", receipt4.transactionHash);
    console.log("   Block:", receipt4.blockNumber);
    console.log("   Gas used:", receipt4.gasUsed.toString());
    console.log("");

    console.log("🎉 All transactions completed successfully!");
    console.log("📊 Summary:");
    console.log("   - Total transactions: 4");
    console.log("   - All transactions successful");
    console.log("   - Contract interactions verified");
    console.log("");
    console.log("🔍 Verify on BSCScan Testnet:");
    console.log("   https://testnet.bscscan.com/address/" + STRATEGY_MANAGER_ADDRESS);
    console.log("");
    console.log("📝 Next steps:");
    console.log("   1. Record demo video showing these transactions");
    console.log("   2. Update submission with contract addresses");
    console.log("   3. Prepare presentation with transaction hashes");

  } catch (error) {
    console.error("❌ Error generating transactions:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 