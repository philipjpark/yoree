const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Getting PYUSD Test Tokens...");
  
  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log("Connected wallet:", signer.address);
  
  // PYUSD contract addresses
  const PYUSD_TESTNET = "0x0000000000000000000000000000000000000000"; // Replace with deployed address
  const PYUSD_MAINNET = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";
  
  // Check if we're on testnet or mainnet
  const network = await ethers.provider.getNetwork();
  const isTestnet = network.chainId === 97; // BSC Testnet
  
  if (isTestnet) {
    console.log("📍 Connected to BSC Testnet");
    
    if (PYUSD_TESTNET === "0x0000000000000000000000000000000000000000") {
      console.log("❌ PYUSD testnet contract not deployed yet");
      console.log("💡 Deploy MockPYUSD contract first:");
      console.log("   npx hardhat run scripts/deploy-mock-pyusd.js --network bscTestnet");
      return;
    }
    
    // Get PYUSD tokens (if faucet available)
    try {
      const pyusdContract = new ethers.Contract(
        PYUSD_TESTNET,
        ["function mint(address to, uint256 amount) external"],
        signer
      );
      
      const amount = ethers.utils.parseUnits("1000", 6); // 1000 PYUSD
      const tx = await pyusdContract.mint(signer.address, amount);
      await tx.wait();
      
      console.log("✅ Successfully minted 1000 PYUSD test tokens");
      console.log("Transaction hash:", tx.hash);
      
    } catch (error) {
      console.log("❌ Failed to mint PYUSD tokens:", error.message);
      console.log("💡 You may need to deploy the MockPYUSD contract first");
    }
    
  } else {
    console.log("📍 Connected to BSC Mainnet");
    console.log("💡 On mainnet, you can buy PYUSD from exchanges or get it from PayPal");
    console.log("   PYUSD Contract:", PYUSD_MAINNET);
  }
  
  // Check current balances
  const bnbBalance = await ethers.provider.getBalance(signer.address);
  console.log("💰 BNB Balance:", ethers.utils.formatEther(bnbBalance));
  
  if (isTestnet && PYUSD_TESTNET !== "0x0000000000000000000000000000000000000000") {
    try {
      const pyusdContract = new ethers.Contract(
        PYUSD_TESTNET,
        ["function balanceOf(address) view returns (uint256)"],
        ethers.provider
      );
      
      const pyusdBalance = await pyusdContract.balanceOf(signer.address);
      console.log("💰 PYUSD Balance:", ethers.utils.formatUnits(pyusdBalance, 6));
    } catch (error) {
      console.log("❌ Could not check PYUSD balance:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 