/**
 * Deploy SignalRegistry to Monad Testnet
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-signal-registry.js --network monadTestnet
 * 
 * Prerequisites:
 *   1. Set PRIVATE_KEY in .env (wallet with MON tokens)
 *   2. Get MON from faucet: https://testnet.monad.xyz/
 *   3. Get Unlink tokens from: https://faucet.unlink.xyz/?referrer=luma
 * 
 * After deployment:
 *   Copy the contract address and update:
 *   - frontend/src/services/monadContractService.ts → SIGNAL_REGISTRY_ADDRESS
 */

const hre = require("hardhat");

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Greed Signal Registry - Deploying to Monad Testnet");
  console.log("═══════════════════════════════════════════════════════\n");

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("  Deployer:", deployer.address);
  console.log("  Balance:", hre.ethers.formatEther(balance), "MON");
  console.log("  Network:", hre.network.name);
  console.log("");

  if (balance === 0n) {
    console.error("❌ No MON balance. Get tokens from https://testnet.monad.xyz/");
    process.exit(1);
  }

  // Deploy
  console.log("  Deploying SignalRegistry...");
  const SignalRegistry = await hre.ethers.getContractFactory("SignalRegistry");
  const registry = await SignalRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();

  console.log("");
  console.log("  ✅ SignalRegistry deployed!");
  console.log("  📍 Contract Address:", address);
  console.log("  🔗 Monadscan:", `https://testnet.monadscan.com/address/${address}`);
  console.log("");
  console.log("  ⚡ Next steps:");
  console.log("     1. Copy the contract address above");
  console.log("     2. Update SIGNAL_REGISTRY_ADDRESS in:");
  console.log("        frontend/src/services/monadContractService.ts");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");

  // Verify the deployment by reading stats
  const stats = await registry.getStats();
  console.log("  Verification — totalRegistered:", stats[0].toString());
  console.log("  Verification — nextId:", stats[2].toString());
  console.log("  ✅ Contract verified on-chain");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
