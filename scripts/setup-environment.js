const fs = require('fs');
const path = require('path');

console.log("🔧 Setting up YOREE deployment environment...");

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log("\n📝 Creating .env file...");
  
  const envContent = `# YOREE Deployment Environment Variables
# Copy this file and fill in your actual values

# Wallet private key for deployment (REQUIRED)
PRIVATE_KEY=your_wallet_private_key_here

# BSCScan API key for contract verification (RECOMMENDED)
BSCSCAN_API_KEY=your_bscscan_api_key_here

# Google Cloud API key for AI agents (OPTIONAL)
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here

# Network configuration
NETWORK=bscTestnet
`;

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file created");
  console.log("⚠️  IMPORTANT: Update .env with your actual values before deployment");
} else {
  console.log("✅ .env file already exists");
}

// Check if agent_config.toml exists
const agentConfigPath = path.join(__dirname, '..', 'config', 'agent_config.toml');
const agentConfigExamplePath = path.join(__dirname, '..', 'config', 'agent_config.example.toml');

if (!fs.existsSync(agentConfigPath)) {
  console.log("\n📝 Creating agent_config.toml...");
  
  if (fs.existsSync(agentConfigExamplePath)) {
    const exampleContent = fs.readFileSync(agentConfigExamplePath, 'utf8');
    fs.writeFileSync(agentConfigPath, exampleContent);
    console.log("✅ agent_config.toml created from example");
    console.log("⚠️  IMPORTANT: Update config/agent_config.toml with your actual values");
  } else {
    console.log("❌ agent_config.example.toml not found");
  }
} else {
  console.log("✅ agent_config.toml already exists");
}

// Check if contracts are compiled
const contractsPath = path.join(__dirname, '..', 'frontend', 'src', 'contracts');
if (!fs.existsSync(contractsPath)) {
  console.log("\n📦 Creating contracts directory...");
  fs.mkdirSync(contractsPath, { recursive: true });
  console.log("✅ contracts directory created");
}

// Check if StrategyManager.json exists
const strategyManagerPath = path.join(contractsPath, 'StrategyManager.json');
if (!fs.existsSync(strategyManagerPath)) {
  console.log("\n⚠️  StrategyManager.json not found in frontend/src/contracts/");
  console.log("💡 This file will be generated when you compile contracts");
  console.log("💡 Run: npx hardhat compile");
}

// Create deployment checklist
const checklistPath = path.join(__dirname, '..', 'DEPLOYMENT_CHECKLIST.md');
if (!fs.existsSync(checklistPath)) {
  console.log("\n📋 Creating deployment checklist...");
  
  const checklistContent = `# 🚀 YOREE BNB Chain Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] `.env` file created with your private key
- [ ] `BSCSCAN_API_KEY` added to .env (optional but recommended)
- [ ] `GOOGLE_CLOUD_API_KEY` added to .env (optional)
- [ ] `config/agent_config.toml` configured

### 2. Wallet Setup
- [ ] Wallet has sufficient BNB for gas fees (minimum 0.1 BNB)
- [ ] Wallet is connected to BSC Testnet (Chain ID: 97)
- [ ] Private key is securely stored in .env file

### 3. Network Configuration
- [ ] Hardhat configured for BSC testnet
- [ ] RPC endpoint accessible
- [ ] Network connection stable

### 4. Contract Preparation
- [ ] Contracts compile successfully
- [ ] All dependencies installed
- [ ] Frontend dependencies updated

## 🔧 Deployment Commands

### Step 1: Validate Environment
\`\`\`bash
npm run validate
\`\`\`

### Step 2: Test Core Functions
\`\`\`bash
npm run test-core
\`\`\`

### Step 3: Deploy Contracts
\`\`\`bash
npm run deploy
\`\`\`

### Step 4: Update Frontend
- Update contract addresses in \`frontend/src/services/bnbService.ts\`
- Test frontend integration

## 📋 Post-Deployment Checklist

- [ ] Contracts deployed successfully
- [ ] Contract addresses saved
- [ ] Frontend updated with new addresses
- [ ] Basic functionality tested
- [ ] AI agents working (if configured)
- [ ] Error handling verified

## 🆘 Troubleshooting

### Common Issues:
1. **Insufficient BNB**: Get testnet BNB from faucet
2. **Network Issues**: Ensure connected to BSC Testnet
3. **Compilation Errors**: Check Solidity version compatibility
4. **Deployment Failures**: Verify private key and network

### Support:
- Check console logs for detailed error messages
- Verify all environment variables are set
- Ensure wallet has sufficient balance
- Confirm network connection

## 🎯 Success Criteria

✅ Contracts deployed to BSC Testnet  
✅ Frontend connects to deployed contracts  
✅ Basic strategy creation works  
✅ Position management functions  
✅ Error handling works properly  
✅ Ready for mainnet deployment  

---

**Last Updated**: ${new Date().toISOString()}
**Version**: 1.0.0
`;

  fs.writeFileSync(checklistPath, checklistContent);
  console.log("✅ DEPLOYMENT_CHECKLIST.md created");
}

// Final setup summary
console.log("\n🎯 Environment Setup Complete!");
console.log("=" .repeat(50));
console.log("📋 Next Steps:");
console.log("1. Update .env with your actual values");
console.log("2. Update config/agent_config.toml if needed");
console.log("3. Run: npm run validate");
console.log("4. Run: npm run test-core");
console.log("5. Run: npm run deploy");
console.log("\n📖 See DEPLOYMENT_CHECKLIST.md for detailed instructions");

// Check for critical issues
console.log("\n🔍 Critical Checks:");
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const hasPrivateKey = envContent.includes('your_wallet_private_key_here');
const hasBscScanKey = envContent.includes('your_bscscan_api_key_here');

if (hasPrivateKey) {
  console.log("❌ PRIVATE_KEY still has placeholder value");
  console.log("💡 Update .env with your actual private key");
} else {
  console.log("✅ PRIVATE_KEY configured");
}

if (hasBscScanKey) {
  console.log("⚠️  BSCSCAN_API_KEY still has placeholder value");
  console.log("💡 Update .env with your actual BSCScan API key");
} else {
  console.log("✅ BSCSCAN_API_KEY configured");
}

console.log("\n🚀 Ready to proceed with deployment!"); 