# 🍚 YOREE SIGNAL MARKETS - The Intelligence Exchange

<div align="center">

<img src="./frontend/public/yoree-logo.png" alt="Yoree Logo" width="200" style="border-radius: 12px; margin-bottom: 20px;">

## The Intelligence Exchange

*Where signals are created, evaluated, and traded as first-class assets*

[![Minam](https://img.shields.io/badge/Powered%20by-Minam-blue)](https://github.com/philipjpark/minam)
[![Syuzhet](https://img.shields.io/badge/Powered%20by-Syuzhet-green)](https://github.com/philipjpark/syuzhet)
[![BNB Chain](https://img.shields.io/badge/Blockchain-BNB%20Chain-yellow)](https://www.bnbchain.org)

</div>

## 🏆 Awards & Recognition

- **🏆 NYC AI Tinkerers Agentic AI App Hackathon with Google Cloud Run GPUs** - Featured Finalist
- **🥈 2025 Permissionless IV Hackathon** – 2nd Place Winner
- **🎤 Live Demo Selectee to BNB Chain Community** - July 2025

> <span style="color:gray;"><i>Originally built as <b>Bibim</b> – now evolved into <b>Yoree Signal Markets</b> with major updates.</i></span>

## 📱 Connect With Us

**🐦 X (Twitter):** [@bibim_official](https://x.com/bibim_official) *(formerly known as Bibim)*

---

## 🌟 What is Yoree Signal Markets?

Yoree Signal Markets is an **intelligence exchange** where signals—structured interpretations of data, strategies, and narratives—are created, evaluated, and traded as first-class assets. Unlike prediction markets (which price outcomes) or traditional exchanges (which price assets), Yoree prices **signal quality over time**, based on real performance and feedback.

The system supports both humans and autonomous agents generating intuitions, executing them via strategies, updating them with live data, and allowing markets to continuously evaluate which signals are improving, degrading, or converging.

### Core Concept

A **Signal** is a structured object:
- An underlying asset or domain (e.g., ETH, macro regime, narrative)
- A hypothesis or interpretation (generated or user-defined)
- Data bindings (from Minam)
- Optional strategy or execution logic
- A continuous signal score/index that updates over time

Signals are convertible into tradeable market instruments, creating a living system where intelligence competes and learns via markets.

---

## 🔗 Integrated Components

Yoree Signal Markets seamlessly integrates two powerful open-source projects:

### 📊 [Minam 미남](https://github.com/philipjpark/minam) - The Data Layer

<div align="center">

<img src="./frontend/public/minam-logo.png" alt="Minam Logo" width="120" style="border-radius: 50%; margin: 10px;">

**The OnlyFans for API Creators**

*"Your knowledge is about to pay you handsomely."*

[![Minam Repo](https://img.shields.io/badge/GitHub-Minam-blue)](https://github.com/philipjpark/minam)
[![Minam Demo](https://img.shields.io/badge/Video-Demo-red)](https://youtu.be/BNrB487K8rk)

</div>

**Role in Yoree**: Provides normalized data feeds (market data, sentiment, on-chain metrics, volume, social) that signals consume. Think of this as the **perception layer**.

**Key Features**:
- 🤖 **7 Specialized AI Agents**: Data Validator, Model Profiler, API Architect, Security Auditor, Deployment Engineer, Orchestrator, Performance Monitor
- 📁 **Multi-Format File Support**: Excel, CSV, PDF files with real-time AI analysis
- 🔗 **Database Integration**: Direct connection to Supabase and other databases
- 💰 **Tiered Monetization**: Free, Premium ($29.99), Enterprise ($99.99) pricing
- 🎯 **Dynamic Data Validator**: AI-powered real-time file analysis using OpenAI API
- 🚀 **Rust Backend**: High-performance API service with agentic pipeline
- ⚡ **Next.js Frontend**: Modern UI with James Dean aesthetic

**Tech Stack**: Rust (Axum), Next.js 14, TypeScript, OpenAI GPT-4o/5, Supabase

**Use Cases in Yoree**:
- Real-time price feeds for crypto assets
- Sentiment analysis from social media
- On-chain metrics and analytics
- Volume and liquidity data
- Social signals and trends

---

### 🎯 [Syuzhet](https://github.com/philipjpark/syuzhet) - The Narrative & Market Layer

<div align="center">

<img src="./frontend/public/syuzhet-logo.png" alt="Syuzhet Logo" width="200" style="border-radius: 12px; margin: 10px;">

**Express your intuition, predict the ending, make money along the way**

*A speculative foresight economy where intuition becomes a liquid asset*

[![Syuzhet Repo](https://img.shields.io/badge/GitHub-Syuzhet-green)](https://github.com/philipjpark/syuzhet)
[![Syuzhet Demo](https://img.shields.io/badge/Video-Demo-red)](https://www.youtube.com/watch?v=ZtOLHJhOkx0)

</div>

**Role in Yoree**: Structures raw ideas or intuitions into market-ready signal specifications. Think of this as the **belief formation + market interaction layer**.

**Key Features**:
- 🤖 **AI Thesis Generation**: OpenAI GPT-4o-mini transforms raw input into structured predictions
- 📄 **Multi-Source Input**: Upload PDFs, TXT, MD files or paste text
- 🔗 **URL Research**: Add multiple research URLs for context
- 🌐 **Multi-Chain Support**: BNB Chain (Mainnet/Testnet) and Arc Testnet
- 💼 **Server-Side Wallet**: Rust-based wallet server for seamless transactions
- 🎮 **Demo Mode**: Works without contract deployment for testing
- 📊 **Narrative Updates**: Post updates with new evidence, updating probability over time

**Tech Stack**: Next.js 14, TypeScript, Rust (Axum), Solidity, OpenAI GPT-4o-mini, BNB Chain, Arc Testnet

**Use Cases in Yoree**:
- Generate structured hypotheses from user intuition
- Transform research notes into tradeable signals
- Create prediction markets from narrative inputs
- Update signal quality based on new information

> **Be the Michael Saylor of the Predictions Forecasting Markets.**

---

## 🚀 Key Features

### 🎯 Signal Creation & Management
- **Multi-Step Wizard**: Input hypothesis → Select data feeds → Review & create
- **AI-Powered Generation**: Use Syuzhet to transform raw intuition into structured signals
- **Data Feed Binding**: Bind exactly 2 Minam data feeds to each signal
- **Agent Support**: Both humans and autonomous agents can create signals
- **Signal Versioning**: Immutable instances stored for historical tracking

### 📊 Real-Time Data Integration (Minam)
- **Multiple Feed Types**: Price, sentiment, on-chain metrics, volume, social
- **Normalized Data**: Consistent format across all data sources
- **Real-Time Updates**: Event-driven updates from Minam feeds
- **Feed Selection**: ML-based and user-based feed selection for agents

### 🧠 AI-Powered Analysis (Syuzhet)
- **Thesis Generation**: Transform unstructured input into structured hypotheses
- **Multi-Source Processing**: Handle PDFs, text files, URLs, and direct input
- **Narrative Updates**: Continuously update signal quality based on new evidence
- **Probability Tracking**: Dynamic probability adjustments over time

### 💹 Market Mechanics
- **Signal Trading**: Trade signal quality as first-class assets
- **Bonding Curve Pricing**: Default pricing model (user-configurable)
- **Quality-Based Pricing**: Market prices reflect signal quality evolution
- **Real-Time Scoring**: Continuous signal quality updates
- **Performance Tracking**: Historical performance stored in database

### 📈 Signal Scoring System
- **Composite Scoring**: Weighted combination of:
  - Accuracy metrics
  - Performance metrics
  - Consensus metrics
  - Composite quality score
- **1-Day Profit Focus**: Quality defined as strongest confidence of quick 1-day profit gain
- **Configurable Weights**: User-configurable scoring weights
- **Historical Performance**: Track signal performance over time

---

## 🏗️ Architecture

### System Overview

```
User/Agent Input
    ↓
Syuzhet AI Thesis Generation
    ↓
Minam Data Feed Selection (2 feeds)
    ↓
Signal Creation
    ↓
Market Asset (Tradeable)
    ↓
Continuous Scoring & Updates
    ↓
Market Price Evolution
```

### Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React, TypeScript, Material-UI, Next.js (for Minam/Syuzhet components) |
| **Backend** | Rust (Axum) - High-performance API server |
| **Data Layer** | Minam (Rust/Axum + Next.js) - Data ingestion and normalization |
| **AI Layer** | Syuzhet (Next.js + OpenAI GPT-4o-mini) - Narrative generation |
| **Blockchain** | BNB Chain (Mainnet & Testnet), Arc Testnet - EVM-compatible |
| **Smart Contracts** | Solidity, OpenZeppelin |
| **Database** | PostgreSQL (future), Mock DB (MVP) |
| **AI Models** | OpenAI GPT-4o-mini, Google Gemma 3-4B (for strategy generation) |
| **Real-Time** | WebSockets (recommended for MVP) |

### Project Structure

```
yoree/
├── frontend/                    # React frontend (Yoree Signal Markets)
│   ├── src/
│   │   ├── components/
│   │   │   ├── signals/        # Signal creation and trading components
│   │   │   └── strategy/       # Strategy builder components
│   │   ├── services/           # API services
│   │   │   ├── signalService.ts
│   │   │   ├── minamService.ts
│   │   │   └── syuzhetService.ts
│   │   └── pages/             # Application pages
│   └── public/
│       ├── yoree-logo.png
│       ├── minam-logo.png
│       └── syuzhet-logo.png
├── backend/                    # Rust backend (Axum)
│   ├── src/
│   │   ├── signals.rs         # Core signal service
│   │   ├── minam.rs           # Minam integration
│   │   ├── syuzhet.rs         # Syuzhet integration
│   │   └── main.rs            # API endpoints
│   └── Cargo.toml
├── minam/                      # Minam submodule (data layer)
│   ├── apps/
│   │   ├── api/               # Rust API service
│   │   └── web/               # Next.js frontend
│   └── packages/
│       ├── schemas/           # Shared Zod contracts
│       └── sdk/               # Minam client SDK
├── syuzhet/                    # Syuzhet submodule (narrative layer)
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── contracts/             # Solidity smart contracts
│   ├── lib/                   # Utilities and services
│   └── wallet-server/         # Rust wallet server
├── contracts/                  # Smart contracts
└── docs/                       # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Rust toolchain (for backend and Minam/Syuzhet components)
- PostgreSQL (optional, for future database migration)
- MetaMask or compatible Web3 wallet
- Testnet tokens for gas fees
- Google Cloud SDK (for AI agents)
- Docker (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/philipjpark/yoree.git
   cd yoree
   ```

2. **Initialize submodules** (if using git submodules)
   ```bash
   git submodule update --init --recursive
   ```

3. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Frontend dependencies
   cd frontend
   npm install
   
   # Backend dependencies (Rust)
   cd ../backend
   cargo build
   ```

4. **Set up environment variables**

   Create `.env` files in the appropriate directories:

   **Root `.env`**:
   ```env
   # OpenAI API (for Syuzhet)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Google Cloud (for AI agents)
   GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
   
   # Database (future)
   DATABASE_URL=postgresql://user:password@localhost/yoree
   ```

   **Frontend `.env`**:
   ```env
   REACT_APP_API_URL=http://127.0.0.1:3001
   ```

   **Backend `.env`**:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=postgresql://user:password@localhost/yoree
   ```

5. **Set up Minam** (Data Layer)
   ```bash
   cd minam/apps/web
   cp .env.example .env.local
   # Edit .env.local and add your OpenAI API key
   ```

6. **Set up Syuzhet** (Narrative Layer)
   ```bash
   cd syuzhet
   cp .env.example .env
   # Edit .env and configure:
   # - OPENAI_API_KEY
   # - NEXT_PUBLIC_DEFAULT_CHAIN_ID (97 for BNB Chain Testnet)
   # - Chain-specific RPC URLs and contract addresses
   ```

### Running the Application

1. **Start the backend** (Rust/Axum)
   ```bash
   cd backend
   cargo run
   # API at http://127.0.0.1:3001
   ```

2. **Start Minam API** (optional, if running separately)
   ```bash
   cd minam/apps/api
   cargo run
   # API at http://localhost:8787
   ```

3. **Start Minam Web** (optional, if running separately)
   ```bash
   cd minam/apps/web
   npm run dev
   # UI at http://localhost:3000
   ```

4. **Start Syuzhet** (optional, if running separately)
   ```bash
   cd syuzhet
   npm run dev
   # UI at http://localhost:3000
   ```

5. **Start Yoree Frontend**
   ```bash
   cd frontend
   npm start
   # UI at http://localhost:3000
   ```

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
```

---

## 📊 Components

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

### 📊 Signal Markets (Core Feature)
- **Signal Creation**: Transform intuition into tradeable signal assets
- **Data Feed Integration**: Bind signals to real-time Minam data feeds
- **AI Thesis Generation**: Use Syuzhet to generate structured hypotheses
- **Market Trading**: Trade signal quality as first-class assets
- **Quality Scoring**: Continuous signal quality updates based on performance
- **Historical Tracking**: Track signal performance over time

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
- **Cross-chain Compatibility**: Support for BNB Chain and Arc Testnet
- **Wallet Integration**: Support for MetaMask, WalletConnect, and Trust Wallet

---

## 🛠️ Development

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

# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
cargo test
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

---

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

---

## 📈 Roadmap

### Phase 1: Core Platform (Current)
- ✅ Basic strategy creation and management
- ✅ Signal Markets MVP with Minam and Syuzhet integration
- ✅ Data feed binding and real-time updates
- ✅ AI thesis generation
- ✅ Stablecoin integration and swapping
- ✅ Portfolio tracking and analytics
- ✅ Blockchain deployment
- ✅ Rust backend implementation
- ✅ Professional UI/UX design

### Phase 2: Advanced Features (Q4 2025)
- 🔄 Advanced AI strategy generation
- 🔄 Real-time WebSocket integration for live updates
- 🔄 ML-based feed selection for agents
- 🔄 Advanced scoring engine with automated recalculation
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
- 🔄 On-chain signal markets (full blockchain integration)

---

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

---

## 📚 Additional Resources

### Original Projects
- **[Minam 미남](https://github.com/philipjpark/minam)** - The OnlyFans for API Creators
- **[Syuzhet](https://github.com/philipjpark/syuzhet)** - Narrative prediction markets

### Documentation
- 🍚 [YOREE Slides.pdf](./frontend/public/slides/Yoree%20Slides.pdf)
- 🎥 [YOREE Demo Video](https://youtu.be/iaypenjVwiQ)
- 📖 [Minam Documentation](https://github.com/philipjpark/minam#readme)
- 📖 [Syuzhet Documentation](https://github.com/philipjpark/syuzhet#readme)

### Blockchain Networks
- [BNB Chain Documentation](https://docs.bnbchain.org)
- [BNB Chain Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [Arc Deployment Tutorial](https://docs.arc.network/arc/tutorials/deploy-on-arc)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**YOREE SIGNAL MARKETS - An Intelligence Exchange where stock traders can start cooking crypto.** 🥄

*Powered by [Minam](https://github.com/philipjpark/minam) and [Syuzhet](https://github.com/philipjpark/syuzhet)*

[![BNB Chain](https://img.shields.io/badge/Powered%20by-BNB%20Chain-yellow)](https://www.bnbchain.org)
[![Arc](https://img.shields.io/badge/Powered%20by-Arc-blue)](https://docs.arc.network)

</div>