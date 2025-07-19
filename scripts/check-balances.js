const { ethers } = require("hardhat");

async function main() {
  console.log("💰 PYUSD Balance Checker");
  console.log("=======================\n");

  const userAddress = "0x0aaa246300e261c6801b8c62397090deb47310ba";
  
  // Real PYUSD contract addresses
  const PYUSD_ETH_MAINNET = "0x6c3ea9036406852006290770BedFcAbA0e23A0e8";
  const PYUSD_BSC_MAINNET = "0x6c3ea9036406852006290770BedFcAbA0e23A0e8";

  console.log("👤 Checking balances for:", userAddress);
  console.log("");

  // Check Ethereum mainnet PYUSD
  try {
    console.log("🔍 Checking Ethereum Mainnet PYUSD...");
    const ethProvider = new ethers.providers.JsonRpcProvider("https://eth.llamarpc.com");
    const pyusdEth = new ethers.Contract(
      PYUSD_ETH_MAINNET,
      ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"],
      ethProvider
    );
    
    const [balance, decimals] = await Promise.all([
      pyusdEth.balanceOf(userAddress),
      pyusdEth.decimals()
    ]);
    
    console.log("✅ Ethereum Mainnet PYUSD:", ethers.utils.formatUnits(balance, decimals));
  } catch (error) {
    console.log("❌ Error checking Ethereum PYUSD:", error.message);
  }

  // Check BSC mainnet PYUSD
  try {
    console.log("\n🔍 Checking BSC Mainnet PYUSD...");
    const bscProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
    const pyusdBsc = new ethers.Contract(
      PYUSD_BSC_MAINNET,
      ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"],
      bscProvider
    );
    
    const [balance, decimals] = await Promise.all([
      pyusdBsc.balanceOf(userAddress),
      pyusdBsc.decimals()
    ]);
    
    console.log("✅ BSC Mainnet PYUSD:", ethers.utils.formatUnits(balance, decimals));
  } catch (error) {
    console.log("❌ Error checking BSC PYUSD:", error.message);
  }

  console.log("\n📝 Next steps:");
  console.log("1. If you have PYUSD on Ethereum mainnet, that's great!");
  console.log("2. For the hackathon, we'll use MockPYUSD on BSC testnet");
  console.log("3. Deploy contracts: npx hardhat run scripts/deploy.js --network bscTestnet");
  console.log("4. Get test tokens: npx hardhat run scripts/interact-with-pyusd.js --network bscTestnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 