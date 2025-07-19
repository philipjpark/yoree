const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking wallet balance on BSC Testnet...\n");

  // Get the signer
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  
  console.log("📍 Wallet Address:", address);
  console.log("🌐 Network: BSC Testnet\n");

  try {
    // Get BNB balance (tBNB on testnet)
    const balance = await signer.getBalance();
    const balanceInBNB = ethers.utils.formatEther(balance);
    
    console.log("💰 tBNB Balance:", balanceInBNB, "tBNB");
    console.log("💵 USD Value (approx): $", (parseFloat(balanceInBNB) * 320.45).toFixed(2));
    
    // Check if balance is sufficient for transactions
    if (parseFloat(balanceInBNB) > 0.01) {
      console.log("✅ Sufficient balance for transactions");
    } else {
      console.log("⚠️  Low balance - may need more tBNB for gas fees");
    }

  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 