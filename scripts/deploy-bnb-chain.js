const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting BNB Chain deployment...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Check if we have enough BNB for deployment
  const balance = await deployer.getBalance();
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.error("❌ Insufficient BNB balance. Need at least 0.1 BNB for deployment.");
    console.log("💡 Get testnet BNB from: https://testnet.binance.org/faucet-smart");
    return;
  }

  try {
    // Deploy MockPYUSD first
    console.log("\n📦 Deploying MockPYUSD...");
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    const mockPYUSD = await MockPYUSD.deploy();
    await mockPYUSD.deployed();
    console.log("✅ MockPYUSD deployed to:", mockPYUSD.address);

    // Deploy StrategyManager
    console.log("\n📦 Deploying StrategyManager...");
    const StrategyManager = await ethers.getContractFactory("StrategyManager");
    const strategyManager = await StrategyManager.deploy(mockPYUSD.address);
    await strategyManager.deployed();
    console.log("✅ StrategyManager deployed to:", strategyManager.address);

    // Verify contracts on BSCScan
    console.log("\n🔍 Verifying contracts on BSCScan...");
    
    if (process.env.BSCSCAN_API_KEY) {
      try {
        await hre.run("verify:verify", {
          address: mockPYUSD.address,
          constructorArguments: [],
        });
        console.log("✅ MockPYUSD verified on BSCScan");
      } catch (error) {
        console.log("⚠️ MockPYUSD verification failed:", error.message);
      }

      try {
        await hre.run("verify:verify", {
          address: strategyManager.address,
          constructorArguments: [mockPYUSD.address],
        });
        console.log("✅ StrategyManager verified on BSCScan");
      } catch (error) {
        console.log("⚠️ StrategyManager verification failed:", error.message);
      }
    } else {
      console.log("⚠️ BSCSCAN_API_KEY not set. Skipping verification.");
    }

    // Print deployment summary
    console.log("\n🎉 Deployment Complete!");
    console.log("=" .repeat(50));
    console.log("📋 Contract Addresses:");
    console.log("MockPYUSD:", mockPYUSD.address);
    console.log("StrategyManager:", strategyManager.address);
    console.log("=" .repeat(50));
    
    console.log("\n🔧 Next Steps:");
    console.log("1. Update frontend/src/services/bnbService.ts with these addresses");
    console.log("2. Test the contracts on BSC Testnet");
    console.log("3. Get test PYUSD tokens using getTestTokens() function");
    console.log("4. Test strategy creation and position management");
    
    console.log("\n📝 Frontend Configuration Update:");
    console.log(`const STRATEGY_MANAGER_ADDRESS = {
  testnet: '${strategyManager.address}',
  mainnet: '${strategyManager.address}'
};

const MOCK_PYUSD_ADDRESS = '${mockPYUSD.address}';`);

    // Save addresses to file
    const fs = require('fs');
    const deploymentInfo = {
      network: 'BSC Testnet',
      deployer: deployer.address,
      contracts: {
        MockPYUSD: mockPYUSD.address,
        StrategyManager: strategyManager.address
      },
      timestamp: new Date().toISOString(),
      bscscan: {
        testnet: `https://testnet.bscscan.com/address/${strategyManager.address}`,
        mainnet: `https://bscscan.com/address/${strategyManager.address}`
      }
    };

    fs.writeFileSync(
      'deployment-bnb-chain.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\n💾 Deployment info saved to deployment-bnb-chain.json");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 