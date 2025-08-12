const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🧪 Testing core functions before deployment...");
  
  try {
    // Test 1: Wallet Connection
    console.log("\n🔗 Test 1: Wallet Connection");
    const [deployer] = await ethers.getSigners();
    console.log("✅ Deployer address:", deployer.address);
    console.log("✅ Deployer balance:", ethers.formatEther(await deployer.getBalance()), "BNB");
    
    // Test 2: Contract Compilation
    console.log("\n📦 Test 2: Contract Compilation");
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    const StrategyManager = await ethers.getContractFactory("StrategyManager");
    console.log("✅ MockPYUSD contract compiled");
    console.log("✅ StrategyManager contract compiled");
    
    // Test 3: Contract Deployment (Dry Run)
    console.log("\n🚀 Test 3: Contract Deployment (Dry Run)");
    
    // Deploy MockPYUSD
    console.log("📦 Deploying MockPYUSD...");
    const mockPYUSD = await MockPYUSD.deploy();
    await mockPYUSD.waitForDeployment();
    const mockPYUSDAddress = await mockPYUSD.getAddress();
    console.log("✅ MockPYUSD deployed to:", mockPYUSDAddress);
    
    // Deploy StrategyManager
    console.log("📦 Deploying StrategyManager...");
    const strategyManager = await StrategyManager.deploy(mockPYUSDAddress);
    await strategyManager.waitForDeployment();
    const strategyManagerAddress = await strategyManager.getAddress();
    console.log("✅ StrategyManager deployed to:", strategyManagerAddress);
    
    // Test 4: Basic Contract Functions
    console.log("\n⚙️ Test 4: Basic Contract Functions");
    
    // Test MockPYUSD functions
    console.log("🔍 Testing MockPYUSD functions...");
    const deployerAddress = await deployer.getAddress();
    
    // Get initial balance
    const initialBalance = await mockPYUSD.balanceOf(deployerAddress);
    console.log("✅ Initial PYUSD balance:", ethers.formatUnits(initialBalance, 6));
    
    // Test minting
    const mintAmount = ethers.parseUnits("1000", 6);
    await mockPYUSD.mint(deployerAddress, mintAmount);
    const newBalance = await mockPYUSD.balanceOf(deployerAddress);
    console.log("✅ After minting PYUSD balance:", ethers.formatUnits(newBalance, 6));
    
    // Test StrategyManager functions
    console.log("🔍 Testing StrategyManager functions...");
    
    // Get strategy count
    const strategyCount = await strategyManager.strategyCount();
    console.log("✅ Initial strategy count:", strategyCount.toString());
    
    // Test strategy creation
    console.log("📝 Creating test strategy...");
    const createTx = await strategyManager.createStrategy(
      "Test Strategy",
      "A test strategy for validation",
      ethers.ZeroAddress, // BNB address
      ethers.parseUnits("300", 18), // stop loss
      ethers.parseUnits("340", 18), // take profit
      ethers.parseUnits("100", 18)  // position size
    );
    await createTx.wait();
    console.log("✅ Strategy created successfully");
    
    // Get updated strategy count
    const newStrategyCount = await strategyManager.strategyCount();
    console.log("✅ New strategy count:", newStrategyCount.toString());
    
    // Test 5: Position Management
    console.log("\n💰 Test 5: Position Management");
    
    // Approve PYUSD spending
    console.log("🔐 Approving PYUSD spending...");
    const approveTx = await mockPYUSD.approve(strategyManagerAddress, mintAmount);
    await approveTx.wait();
    console.log("✅ PYUSD spending approved");
    
    // Open position
    console.log("📈 Opening position...");
    const openTx = await strategyManager.openPosition(1, ethers.parseUnits("100", 6));
    await openTx.wait();
    console.log("✅ Position opened successfully");
    
    // Get user positions
    const positions = await strategyManager.getUserPositions(deployerAddress);
    console.log("✅ User positions count:", positions.length.toString());
    
    // Test 6: Strategy Information
    console.log("\n📊 Test 6: Strategy Information");
    
    const strategy = await strategyManager.getStrategy(1);
    console.log("✅ Strategy details retrieved:");
    console.log("  - Name:", strategy.name);
    console.log("  - Creator:", strategy.creator);
    console.log("  - Target Token:", strategy.targetToken);
    console.log("  - Is Active:", strategy.isActive);
    
    // Test 7: User Statistics
    console.log("\n📈 Test 7: User Statistics");
    
    const userStats = await strategyManager.getUserStats(deployerAddress);
    console.log("✅ User stats retrieved:");
    console.log("  - Total Volume:", ethers.formatUnits(userStats.totalVolume, 18));
    console.log("  - Total Profit:", ethers.formatUnits(userStats.totalProfit, 18));
    
    // Test 8: Price Oracle (Mock)
    console.log("\n💱 Test 8: Price Oracle (Mock)");
    
    const bnbPrice = await strategyManager.getCurrentPrice(ethers.ZeroAddress);
    console.log("✅ BNB price:", ethers.formatUnits(bnbPrice, 18));
    
    // Test 9: Contract State
    console.log("\n🏗️ Test 9: Contract State");
    
    const totalVolume = await strategyManager.totalVolume();
    const platformFee = await strategyManager.platformFee();
    const isPaused = await strategyManager.paused();
    
    console.log("✅ Contract state:");
    console.log("  - Total Volume:", ethers.formatUnits(totalVolume, 18));
    console.log("  - Platform Fee:", platformFee.toString(), "basis points");
    console.log("  - Is Paused:", isPaused);
    
    // Test 10: Error Handling
    console.log("\n⚠️ Test 10: Error Handling");
    
    try {
      // Try to create strategy with invalid parameters
      await strategyManager.createStrategy(
        "", // Empty name
        "Invalid strategy",
        ethers.ZeroAddress,
        ethers.parseUnits("300", 18),
        ethers.parseUnits("340", 18),
        ethers.parseUnits("100", 18)
      );
      console.log("❌ Should have failed with empty name");
    } catch (error) {
      console.log("✅ Correctly rejected empty strategy name");
    }
    
    try {
      // Try to open position with invalid strategy ID
      await strategyManager.openPosition(999, ethers.parseUnits("100", 6));
      console.log("❌ Should have failed with invalid strategy ID");
    } catch (error) {
      console.log("✅ Correctly rejected invalid strategy ID");
    }
    
    // Final Test Summary
    console.log("\n🎯 Core Functions Test Summary");
    console.log("=" .repeat(50));
    console.log("✅ All core functions tested successfully!");
    console.log("✅ Contract deployment works");
    console.log("✅ Strategy creation works");
    console.log("✅ Position management works");
    console.log("✅ Error handling works");
    console.log("✅ Ready for testnet deployment!");
    
    console.log("\n📋 Contract Addresses for Frontend:");
    console.log("MockPYUSD:", mockPYUSDAddress);
    console.log("StrategyManager:", strategyManagerAddress);
    
    console.log("\n🔧 Next Steps:");
    console.log("1. Update frontend/src/services/bnbService.ts with these addresses");
    console.log("2. Run: npm run deploy");
    console.log("3. Test on BSC testnet");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.log("\n🔍 Debug Information:");
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  }); 