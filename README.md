# 🍚 YOREE - AI-Powered DeFi Strategy Platform

## 🏆 NYC AI Tinkerers Agentic AI App Hackathon with Google Cloud Run GPUs - Featured Finalist
## 🥈 2025 Permissionless IV Hackathon – 2nd Place Winner
## 🎤 Live Demo Selectee to BNB Chain Community - July 2025

Yoree is a comprehensive DeFi strategy platform that combines artificial intelligence with blockchain technology to provide users the power to: 
1. Abstract the core components of building a trading strategy through dropdowns, tl:drs, and visuals. 
2. Access an easy UI that pipelines substrings that concatenate into a system prompt and is fed into an agentic auditing framework that is preprocessed for trading crypto.
3. Allows users to craft, personify, testnet, succeed, market, and then sell their strategies for capital and/or YOREE tokens.

> <span style="color:gray;"><i>Originally built as <b>Bibim</b> – now evolved into <b>Yoree</b> with major updates.</i></span>

## 📱 Connect With Us

**🐦 X (Twitter):** [@bibim_official](https://x.com/bibim_official) *(formerly known as Bibim)*

## 🌟 Components

### 🤖 AI Agents Powered by Google Cloud & Gemma 3-4B
- **Market Analyzer Agent**: Fetches real-time market data from CoinGecko API for live price, volume, and market cap information
- **Technical Analyzer Agent**: Analyzes technical indicators (RSI, MACD, moving averages, support/resistance levels) and market patterns
- **Risk Manager Agent**: Calculates token-specific risk factors, position sizing, and risk management based on volatility and market conditions
- **Strategy Generator Agent**: Uses Google's Gemma 3-4B model to create comprehensive trading strategies with entry, target, and stop-loss prices

### 🤖 AI-Powered Trading Strategies
- **Strategy Builder**: Create custom trading strategies using AI-driven insights
- **Strategy Marketplace**: Discover and deploy pre-built strategies from the community
- **Backtesting Engine**: Test strategies against historical data before deployment
- **Live Analytics**: Monitor strategy performance with live metrics
- **Real-time Agent Status**: Visual indicators showing AI agent progress and status
- **Strategy Personification**: Give your strategies unique personalities and visual identities

### 💰 Stablecoin Integration (coming soon)
- **Stablecoin Swap Interface**: Seamlessly swap between stablecoins and native tokens
- **Stablecoin Payments**: Use stablecoins for all strategy fees and transactions
- **Cross-border Transactions**: Enable international trading with minimal fees
- **Loyalty Programs**: Earn rewards in stablecoins for platform participation

### 📊 Portfolio Management
- **Multi-Asset Tracking**: Monitor holdings across different tokens
- **Performance Analytics**: Detailed P&L tracking and performance metrics
- **Risk Management**: Built-in stop-loss and take-profit mechanisms
- **Vault Management**: Secure storage and management of digital assets
- **Real-time Balance Updates**: Live portfolio value calculations

### 🔗 Blockchain Integration
- **High Throughput**: Leverage fast and low-cost transactions
- **Smart Contract Security**: Audited contracts with comprehensive safety features
- **Gas Optimization**: Efficient transaction processing with minimal costs
- **Cross-chain Compatibility**: Future support for multiple blockchain networks
- **Wallet Integration**: Support for MetaMask, WalletConnect, and Trust Wallet

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet
- Testnet tokens for gas fees
- Google Cloud SDK (for AI agents)
- Docker (for deployment)
- Rust toolchain (for local development)
- Testnet SOL for gas fees

### Google Cloud Setup (Required for AI Agents)
```bash
# 1. Install Google Cloud SDK (if not already installed)
curl https://sdk.cloud.google.com | bash

# 2. Authenticate and set project
gcloud auth login
export PROJECT_ID="sage-now-466417-n6"
gcloud config set project $PROJECT_ID
gcloud config set run/region europe-west1

# 3. Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com aiplatform.googleapis.com

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/philipjpark/yoree.git
   cd yoree
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend
   npm install
   ```

3. **Set up environment variables and configuration**
   ```bash
   # Create .env file in the root directory
   echo "GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here" > .env
   
   # Copy and configure the agent configuration
   cp config/agent_config.example.toml config/agent_config.toml
   # Edit config/agent_config.toml and replace:
   # - "your-project-id-here" with your actual Google Cloud project ID
   # - "your-google-cloud-api-key-here" with your actual Google Cloud API key
   
   # Both .env and config/agent_config.toml are in .gitignore to keep your keys secure
   ```

4. **Test AI Agent Integration**
   ```bash
   # Test the complete agent system
   node scripts/test-sol-agents.js
   ```

5. **Start the application**
   ```bash
   cd frontend
   npm start
   ```

## 🏗️ Architecture

### Smart Contracts
- **StrategyManager**: Core contract for strategy creation and management
- **MockStablecoin**: Testnet stablecoin implementation for development
- **VaultManager**: Secure asset storage and management

### AI Agent System
- **Market Analyzer**: CoinGecko API integration for live market data
- **Technical Analyzer**: Technical indicator calculation and pattern recognition
- **Risk Manager**: Volatility-based risk assessment and position sizing
- **Strategy Generator**: Gemma 3-4B integration for AI-powered strategy creation

### Frontend (React + TypeScript)
- **Modern UI**: Professional interface with Material-UI components
- **Strategy Builder**: Visual interface for creating AI-powered trading strategies
- **Agent Dashboard**: Real-time monitoring of AI agent status and progress
- **Live Market Data**: Real-time price feeds and market information
- **Wallet Integration**: Wallet connection and management

### Backend (Rust)
- **High Performance**: Rust backend for optimal performance and security
- **Blockchain Integration**: Direct interaction with blockchain networks
- **AI Services**: Advanced trading strategy generation and analysis
- **Database Management**: PostgreSQL for data persistence (coming soon)
- **REST API**: Comprehensive API endpoints for frontend integration

### Smart Contracts (Solana)
- **StrategyManager**: Core contract for strategy creation and management
- **VaultManager**: Secure asset storage and management
- **Performance Tracking**: Strategy performance monitoring and analytics

### Key Technologies
- **React**: Frontend framework with TypeScript
- **Material-UI**: Component library for beautiful UI
- **Google Cloud Run**: AI model deployment and hosting
- **Gemma 3-4B**: Google's advanced language model for strategy generation
- **CoinGecko API**: Real-time cryptocurrency market data
- **Solana**: High-performance blockchain for DeFi applications
- **Axios**: HTTP client for API communication

## 📱 User Interface

### Dashboard
- Portfolio overview with real-time metrics
- Recent transactions and activity feed
- Quick access to key features
- Wallet connection and balance display
- Performance charts and analytics

### Strategy Builder
- Visual strategy creation interface
- AI-powered parameter suggestions
- Risk assessment and optimization
- Strategy validation and testing
- Strategy personification and customization

### Token Swap
- Intuitive token swapping interface
- Real-time exchange rates
- Transaction history and tracking
- Slippage protection and settings
- Balance monitoring and updates

### Analytics
- Comprehensive performance metrics
- Historical data visualization
- Strategy comparison tools
- Risk analysis and reporting
- Real-time market data

## 🔧 Development

### Project Structure
```
yoree/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   └── strategy/       # Strategy builder components
│   │   ├── services/           # API services
│   │   └── pages/              # Application pages
├── contracts/                  # Smart contracts
├── scripts/                    # Deployment and utility scripts
└── docs/                       # Documentation
```

### Key Technologies
- **Solidity**: Smart contract development
- **Hardhat**: Development and deployment framework
- **React**: Frontend framework
- **TypeScript**: Type-safe development
- **Material-UI**: Component library
- **Ethers.js**: Web3 integration
- **Rust**: High-performance backend
- **PostgreSQL**: Database management
- **Axum**: Web framework for Rust

### Available Scripts
```bash
# Test the complete agent system
node scripts/test-sol-agents.js

# Deploy contracts
npm run deploy

# Generate transactions
npm run generate-tx

# Check wallet balance
npm run check-balance

# Build for production
npm run build
```

### Testing
```bash
# Run smart contract tests
npx hardhat test

# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
cargo test
```

## 🔒 Security

### Smart Contract Security
- Comprehensive testing suite
- OpenZeppelin security libraries
- Reentrancy protection
- Access control mechanisms
- Emergency pause functionality

### Frontend Security
- Input validation and sanitization
- Secure wallet integration
- HTTPS enforcement
- XSS protection
- CSRF protection

### Backend Security
- Memory safety with Rust
- Input validation and sanitization
- Secure API endpoints
- Rate limiting and request validation
- Environment-based configuration

## 📈 Roadmap

### Phase 1: Core Platform (Current)
- ✅ Basic strategy creation and management
- ✅ Stablecoin integration and swapping
- ✅ Portfolio tracking and analytics
- ✅ Blockchain deployment
- ✅ Rust backend implementation
- ✅ Professional UI/UX design

### Phase 2: Advanced Features (Q4 2025)
- 🔄 Advanced AI strategy generation
- 🔄 Cross-chain strategy deployment
- 🔄 Social trading features
- 🔄 Mobile application
- 🔄 Strategy marketplace with monetization
- 🔄 Institutional features and APIs
- 🔄 Advanced risk management tools
- 🔄 Multi-language support

### Phase 3: Enterprise Solutions (Q1 2026)
- 🔄 White-label solutions
- 🔄 Enterprise-grade security
- 🔄 Advanced analytics and reporting
- 🔄 Integration with traditional finance
- 🔄 Global expansion and compliance

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Quality
- Follow TypeScript and Rust best practices
- Ensure comprehensive test coverage
- Maintain code documentation
- Follow security guidelines

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**YOREE - An AI-Powered DeFi Strategy Platform where stock traders can start cooking crypto.** 🥄

## 🧾 Additional Info

🍚 [YOREE Slides.pdf](./frontend/public/slides/Yoree%20Slides.pdf)

🎥 [YOREE Demo Video](https://youtu.be/iaypenjVwiQ)

