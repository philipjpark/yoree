const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying YOREE Strategy Manager to BSC...");

  // Deploy MockPYUSD first
  console.log("\n📦 Deploying MockPYUSD token...");
  const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
  const mockPYUSD = await MockPYUSD.deploy();
  await mockPYUSD.deployed();
  
  console.log("✅ MockPYUSD deployed to:", mockPYUSD.address);
  
  // Deploy StrategyManager with MockPYUSD address
  console.log("\n🏗️ Deploying StrategyManager...");
  const StrategyManager = await ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.deploy(mockPYUSD.address);
  
  await strategyManager.deployed();
  
  console.log("✅ StrategyManager deployed to:", strategyManager.address);
  console.log("\n📋 Contract details:");
  console.log("   - Network: BSC Testnet");
  console.log("   - MockPYUSD: ", mockPYUSD.address);
  console.log("   - StrategyManager: ", strategyManager.address);
  console.log("   - Owner: ", await strategyManager.owner());
  
  // Verify contracts on BSCScan
  console.log("\n🔍 Verifying contracts on BSCScan...");
  try {
    await hre.run("verify:verify", {
      address: mockPYUSD.address,
      constructorArguments: [],
    });
    console.log("✅ MockPYUSD verified on BSCScan");
  } catch (error) {
    console.log("⚠️  MockPYUSD verification failed:", error.message);
  }
  
  try {
    await hre.run("verify:verify", {
      address: strategyManager.address,
      constructorArguments: [mockPYUSD.address],
    });
    console.log("✅ StrategyManager verified on BSCScan");
  } catch (error) {
    console.log("⚠️  StrategyManager verification failed:", error.message);
  }
  
  console.log("\n🎉 Deployment complete!");
  console.log("📝 Next steps:");
  console.log("   1. Update frontend with contract addresses:");
  console.log("      - PYUSD: ", mockPYUSD.address);
  console.log("      - StrategyManager: ", strategyManager.address);
  console.log("   2. Get test PYUSD tokens using getTestTokens()");
  console.log("   3. Test contract functions");
  console.log("   4. Record demo video with real transactions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 