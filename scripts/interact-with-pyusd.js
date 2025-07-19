const { ethers } = require("hardhat");

async function main() {
  console.log("💰 PYUSD Interaction Script");
  console.log("==========================\n");

  // Get contract addresses (replace with your deployed addresses)
  const MOCK_PYUSD_ADDRESS = "YOUR_MOCK_PYUSD_ADDRESS"; // Replace after deployment
  const STRATEGY_MANAGER_ADDRESS = "YOUR_STRATEGY_MANAGER_ADDRESS"; // Replace after deployment

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("👤 Connected wallet:", signer.address);

  // Connect to contracts
  const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
  const mockPYUSD = MockPYUSD.attach(MOCK_PYUSD_ADDRESS);

  const StrategyManager = await ethers.getContractFactory("StrategyManager");
  const strategyManager = StrategyManager.attach(STRATEGY_MANAGER_ADDRESS);

  console.log("\n📊 Current PYUSD Balance:", ethers.utils.formatUnits(await mockPYUSD.balanceOf(signer.address), 6));

  // Function to get test tokens
  async function getTestTokens() {
    try {
      console.log("\n🎁 Getting test PYUSD tokens...");
      const tx = await mockPYUSD.getTestTokens();
      await tx.wait();
      console.log("✅ Received 1000 PYUSD test tokens!");
      console.log("💰 New balance:", ethers.utils.formatUnits(await mockPYUSD.balanceOf(signer.address), 6));
    } catch (error) {
      console.log("❌ Error getting test tokens:", error.message);
    }
  }

  // Function to approve PYUSD spending
  async function approvePYUSD(amount) {
    try {
      console.log(`\n✅ Approving ${amount} PYUSD for StrategyManager...`);
      const amountWei = ethers.utils.parseUnits(amount.toString(), 6);
      const tx = await mockPYUSD.approve(STRATEGY_MANAGER_ADDRESS, amountWei);
      await tx.wait();
      console.log("✅ PYUSD approval successful!");
    } catch (error) {
      console.log("❌ Error approving PYUSD:", error.message);
    }
  }

  // Function to create a strategy
  async function createStrategy() {
    try {
      console.log("\n📝 Creating BNB Momentum Strategy...");
      const tx = await strategyManager.createStrategy(
        "BNB Momentum Strategy",
        "AI-powered momentum strategy for BNB using PYUSD",
        "0x0000000000000000000000000000000000000000", // BNB address
        ethers.utils.parseUnits("2.5", 18), // 2.5% stop loss
        ethers.utils.parseUnits("8.0", 18), // 8% take profit
        ethers.utils.parseUnits("100", 18)  // $100 position size
      );
      await tx.wait();
      console.log("✅ Strategy created successfully!");
      console.log("📋 Strategy ID: 1");
    } catch (error) {
      console.log("❌ Error creating strategy:", error.message);
    }
  }

  // Function to open a position
  async function openPosition(strategyId, amount) {
    try {
      console.log(`\n💰 Opening position in strategy ${strategyId} with ${amount} PYUSD...`);
      const amountWei = ethers.utils.parseUnits(amount.toString(), 6);
      const tx = await strategyManager.openPosition(strategyId, amountWei);
      await tx.wait();
      console.log("✅ Position opened successfully!");
    } catch (error) {
      console.log("❌ Error opening position:", error.message);
    }
  }

  // Function to close a position
  async function closePosition(positionIndex) {
    try {
      console.log(`\n🔒 Closing position at index ${positionIndex}...`);
      const tx = await strategyManager.closePosition(positionIndex);
      await tx.wait();
      console.log("✅ Position closed successfully!");
    } catch (error) {
      console.log("❌ Error closing position:", error.message);
    }
  }

  // Function to check user positions
  async function checkPositions() {
    try {
      console.log("\n📊 Checking user positions...");
      const positions = await strategyManager.getUserPositions(signer.address);
      console.log("📋 Number of positions:", positions.length);
      positions.forEach((pos, index) => {
        console.log(`   Position ${index}: Strategy ${pos.strategyId}, Amount: ${ethers.utils.formatUnits(pos.amount, 6)} PYUSD, Open: ${pos.isOpen}`);
      });
    } catch (error) {
      console.log("❌ Error checking positions:", error.message);
    }
  }

  // Function to check user stats
  async function checkStats() {
    try {
      console.log("\n📈 Checking user statistics...");
      const [totalVolume, totalProfit] = await strategyManager.getUserStats(signer.address);
      console.log("💰 Total Volume:", ethers.utils.formatUnits(totalVolume, 6), "PYUSD");
      console.log("📊 Total Profit:", ethers.utils.formatUnits(totalProfit, 6), "PYUSD");
    } catch (error) {
      console.log("❌ Error checking stats:", error.message);
    }
  }

  // Example usage
  console.log("\n🚀 Starting PYUSD interaction demo...");
  
  // Get test tokens first
  await getTestTokens();
  
  // Create a strategy
  await createStrategy();
  
  // Approve PYUSD for strategy manager
  await approvePYUSD(100);
  
  // Open a position
  await openPosition(1, 50);
  
  // Check positions
  await checkPositions();
  
  // Check stats
  await checkStats();
  
  console.log("\n🎉 PYUSD interaction demo complete!");
  console.log("📝 Next: Close positions and record demo video");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 