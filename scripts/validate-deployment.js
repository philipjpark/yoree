const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Validating deployment configuration...");
  
  // Check environment variables
  console.log("\n📋 Environment Variables Check:");
  
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in .env file");
    console.log("💡 Add: PRIVATE_KEY=your_wallet_private_key_here");
    process.exit(1);
  } else {
    console.log("✅ PRIVATE_KEY found");
  }
  
  if (!process.env.BSCSCAN_API_KEY) {
    console.warn("⚠️ BSCSCAN_API_KEY not found - contract verification will be skipped");
    console.log("💡 Add: BSCSCAN_API_KEY=your_bscscan_api_key_here");
  } else {
    console.log("✅ BSCSCAN_API_KEY found");
  }
  
  if (!process.env.GOOGLE_CLOUD_API_KEY) {
    console.warn("⚠️ GOOGLE_CLOUD_API_KEY not found - AI agents may not work");
    console.log("💡 Add: GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here");
  } else {
    console.log("✅ GOOGLE_CLOUD_API_KEY found");
  }
  
  // Check wallet configuration
  console.log("\n💰 Wallet Configuration Check:");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "BNB");
  
  if (balance.lt(ethers.parseEther("0.1"))) {
    console.error("❌ Insufficient BNB balance. Need at least 0.1 BNB for deployment.");
    console.log("💡 Get testnet BNB from: https://testnet.binance.org/faucet-smart");
    process.exit(1);
  } else {
    console.log("✅ Sufficient BNB balance for deployment");
  }
  
  // Check network configuration
  console.log("\n🌐 Network Configuration Check:");
  
  const network = await ethers.provider.getNetwork();
  console.log("🔗 Current network:", network.name);
  console.log("🆔 Chain ID:", network.chainId);
  
  if (network.chainId !== 97n) {
    console.warn("⚠️ Not connected to BSC Testnet (Chain ID: 97)");
    console.log("💡 Current Chain ID:", network.chainId);
    console.log("💡 Expected Chain ID: 97 (BSC Testnet)");
  } else {
    console.log("✅ Connected to BSC Testnet");
  }
  
  // Check contract compilation
  console.log("\n📦 Contract Compilation Check:");
  
  try {
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    console.log("✅ MockPYUSD contract compiled successfully");
    
    const StrategyManager = await ethers.getContractFactory("StrategyManager");
    console.log("✅ StrategyManager contract compiled successfully");
  } catch (error) {
    console.error("❌ Contract compilation failed:", error.message);
    process.exit(1);
  }
  
  // Check RPC endpoint connectivity
  console.log("\n🔌 RPC Endpoint Check:");
  
  try {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("✅ RPC endpoint responsive - Latest block:", blockNumber);
  } catch (error) {
    console.error("❌ RPC endpoint not responsive:", error.message);
    console.log("💡 Check your internet connection and RPC endpoint");
    process.exit(1);
  }
  
  // Check gas estimation
  console.log("\n⛽ Gas Estimation Check:");
  
  try {
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    const mockPYUSD = await MockPYUSD.deploy();
    const deployGas = await mockPYUSD.deploymentTransaction().gasLimit;
    
    console.log("📊 Estimated deployment gas for MockPYUSD:", deployGas.toString());
    console.log("💰 Estimated gas cost:", ethers.formatEther(deployGas * 20000000000n), "BNB");
    
    // Clean up
    await mockPYUSD.deploymentTransaction().wait();
  } catch (error) {
    console.error("❌ Gas estimation failed:", error.message);
  }
  
  // Final validation summary
  console.log("\n🎯 Deployment Validation Summary:");
  console.log("=" .repeat(50));
  
  const hasPrivateKey = !!process.env.PRIVATE_KEY;
  const hasBscScanKey = !!process.env.BSCSCAN_API_KEY;
  const hasGoogleKey = !!process.env.GOOGLE_CLOUD_API_KEY;
  const hasSufficientBalance = balance.gte(ethers.parseEther("0.1"));
  const isCorrectNetwork = network.chainId === 97n;
  const contractsCompile = true; // We already checked this
  
  const checks = [
    { name: "Private Key", status: hasPrivateKey },
    { name: "BSCScan API Key", status: hasBscScanKey, warning: true },
    { name: "Google Cloud API Key", status: hasGoogleKey, warning: true },
    { name: "Sufficient BNB Balance", status: hasSufficientBalance },
    { name: "BSC Testnet Network", status: isCorrectNetwork },
    { name: "Contract Compilation", status: contractsCompile }
  ];
  
  const criticalChecks = checks.filter(c => !c.warning);
  const warningChecks = checks.filter(c => c.warning);
  
  const criticalPassed = criticalChecks.every(c => c.status);
  const warnings = warningChecks.filter(c => !c.status);
  
  console.log("🔴 Critical Checks:");
  criticalChecks.forEach(check => {
    console.log(`  ${check.status ? '✅' : '❌'} ${check.name}`);
  });
  
  if (warnings.length > 0) {
    console.log("\n🟡 Warnings:");
    warnings.forEach(check => {
      console.log(`  ⚠️ ${check.name}`);
    });
  }
  
  console.log("\n" + "=" .repeat(50));
  
  if (criticalPassed) {
    console.log("🎉 All critical checks passed! Ready for deployment.");
    console.log("\n📋 Next Steps:");
    console.log("1. Run: npm run deploy");
    console.log("2. Update frontend contract addresses");
    console.log("3. Test the deployment");
  } else {
    console.error("❌ Critical checks failed. Fix issues before deployment.");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  }); 