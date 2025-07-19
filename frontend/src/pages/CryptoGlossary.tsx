import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  InputAdornment,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { Search, TrendingUp, Shield, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

interface CryptoTerm {
  id: number;
  crypto: string;
  traditional: string;
  cryptoDefinition: string;
  traditionalDefinition: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  examples?: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CryptoGlossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tabValue, setTabValue] = useState(0);

  const cryptoTerms: CryptoTerm[] = [
    {
      id: 1,
      crypto: "HODL",
      traditional: "Buy and Hold",
      cryptoDefinition: "A crypto slang term meaning to hold onto your cryptocurrency for the long term, regardless of market volatility. Originally a misspelling of 'hold'.",
      traditionalDefinition: "An investment strategy where investors buy securities and hold them for a long period, typically years, regardless of market fluctuations.",
      category: "Strategy",
      difficulty: "Beginner",
      examples: ["Holding Bitcoin through market crashes", "Long-term investment in blue-chip stocks"]
    },
    {
      id: 2,
      crypto: "DeFi",
      traditional: "Traditional Finance (TradFi)",
      cryptoDefinition: "Decentralized Finance - financial services built on blockchain technology that operate without traditional intermediaries like banks.",
      traditionalDefinition: "The conventional financial system involving banks, brokers, and other centralized institutions that facilitate financial transactions.",
      category: "Finance",
      difficulty: "Intermediate",
      examples: ["Uniswap, Compound, Aave", "Banks, Stock Exchanges, Insurance Companies"]
    },
    {
      id: 3,
      crypto: "Whale",
      traditional: "Institutional Investor",
      cryptoDefinition: "An individual or entity that holds a large amount of cryptocurrency, capable of influencing market prices with their trades.",
      traditionalDefinition: "Large financial institutions, pension funds, or high-net-worth individuals who can move markets with their trading activity.",
      category: "Market Participants",
      difficulty: "Beginner",
      examples: ["Someone holding 1000+ Bitcoin", "Pension funds, hedge funds, sovereign wealth funds"]
    },
    {
      id: 4,
      crypto: "Smart Contract",
      traditional: "Legal Contract",
      cryptoDefinition: "Self-executing contracts with terms directly written into code, automatically enforcing agreements without intermediaries.",
      traditionalDefinition: "Written agreements between parties that require legal enforcement through courts and legal systems.",
      category: "Technology",
      difficulty: "Intermediate",
      examples: ["Ethereum smart contracts for DeFi", "Real estate contracts, employment agreements"]
    },
    {
      id: 5,
      crypto: "Staking",
      traditional: "Dividend Investing",
      cryptoDefinition: "Locking up cryptocurrency to support network operations and earn rewards, similar to earning interest.",
      traditionalDefinition: "Investing in dividend-paying stocks to receive regular income payments from company profits.",
      category: "Yield Generation",
      difficulty: "Beginner",
      examples: ["Staking ETH 2.0 for 4-6% APY", "Dividend stocks like Coca-Cola, Microsoft"]
    },
    {
      id: 6,
      crypto: "Liquidity Pool",
      traditional: "Market Maker",
      cryptoDefinition: "A collection of funds locked in a smart contract to facilitate trading and provide liquidity for decentralized exchanges.",
      traditionalDefinition: "Financial firms that provide liquidity to markets by continuously buying and selling securities.",
      category: "Trading",
      difficulty: "Intermediate",
      examples: ["Uniswap ETH/USDC pool", "Goldman Sachs market making desk"]
    },
    {
      id: 7,
      crypto: "Gas Fees",
      traditional: "Transaction Fees",
      cryptoDefinition: "Fees paid to miners/validators to process transactions on blockchain networks, varying with network congestion.",
      traditionalDefinition: "Fees charged by brokers, exchanges, or financial institutions for executing trades or transactions.",
      category: "Costs",
      difficulty: "Beginner",
      examples: ["Ethereum gas fees for swaps", "Stock trading commissions, wire transfer fees"]
    },
    {
      id: 8,
      crypto: "Yield Farming",
      traditional: "Carry Trade",
      cryptoDefinition: "Strategy of moving crypto between different DeFi protocols to maximize returns through various incentive programs.",
      traditionalDefinition: "Borrowing in low-interest currencies to invest in higher-yielding assets or currencies.",
      category: "Strategy",
      difficulty: "Advanced",
      examples: ["Moving between Compound, Aave, Curve", "Borrowing JPY to buy AUD bonds"]
    },
    {
      id: 9,
      crypto: "NFT",
      traditional: "Certificate of Authenticity",
      cryptoDefinition: "Non-Fungible Token - unique digital assets that represent ownership of specific items, art, or collectibles on blockchain.",
      traditionalDefinition: "Physical or digital certificates that verify the authenticity and ownership of valuable items.",
      category: "Assets",
      difficulty: "Beginner",
      examples: ["Bored Ape Yacht Club, CryptoPunks", "Art certificates, sports memorabilia authentication"]
    },
    {
      id: 10,
      crypto: "DAO",
      traditional: "Corporation/Board of Directors",
      cryptoDefinition: "Decentralized Autonomous Organization - organization governed by smart contracts and token holders rather than traditional management.",
      traditionalDefinition: "Traditional corporate structure with board of directors, executives, and shareholders making decisions.",
      category: "Governance",
      difficulty: "Advanced",
      examples: ["MakerDAO, Compound governance", "Apple Inc., Microsoft Corp."]
    },
    {
      id: 11,
      crypto: "Impermanent Loss",
      traditional: "Opportunity Cost",
      cryptoDefinition: "Temporary loss experienced by liquidity providers when token prices diverge from when they were deposited.",
      traditionalDefinition: "The cost of choosing one investment over another, representing potential gains missed.",
      category: "Risk",
      difficulty: "Advanced",
      examples: ["LP tokens losing value vs holding", "Choosing bonds over stocks in bull market"]
    },
    {
      id: 12,
      crypto: "Flash Loan",
      traditional: "Margin Trading",
      cryptoDefinition: "Uncollateralized loan that must be borrowed and repaid within the same blockchain transaction.",
      traditionalDefinition: "Borrowing money from a broker to purchase securities, using existing holdings as collateral.",
      category: "Lending",
      difficulty: "Advanced",
      examples: ["Aave flash loans for arbitrage", "Buying stocks on margin with 2:1 leverage"]
    },
    {
      id: 13,
      crypto: "Slippage",
      traditional: "Market Impact",
      cryptoDefinition: "The difference between expected price and actual execution price due to market movement during trade execution.",
      traditionalDefinition: "The effect a large trade has on the market price of a security when executed.",
      category: "Trading",
      difficulty: "Intermediate",
      examples: ["DEX trades moving token prices", "Large institutional orders affecting stock prices"]
    },
    {
      id: 14,
      crypto: "Rugpull",
      traditional: "Ponzi Scheme/Fraud",
      cryptoDefinition: "Scam where developers abandon a project and steal investors' funds, often by removing liquidity.",
      traditionalDefinition: "Fraudulent investment schemes that pay returns to earlier investors using new investors' money.",
      category: "Risk",
      difficulty: "Beginner",
      examples: ["Squid Game token collapse", "Bernie Madoff Ponzi scheme"]
    },
    {
      id: 15,
      crypto: "Airdrop",
      traditional: "Stock Dividend/Bonus Shares",
      cryptoDefinition: "Free distribution of tokens to wallet addresses, often used for marketing or rewarding community members.",
      traditionalDefinition: "Additional shares given to existing shareholders at no cost, usually as a percentage of current holdings.",
      category: "Rewards",
      difficulty: "Beginner",
      examples: ["Uniswap UNI token airdrop", "Apple stock splits, bonus share issues"]
    },
    {
      id: 16,
      crypto: "Minting",
      traditional: "IPO/New Issue",
      cryptoDefinition: "Creating new tokens or NFTs on a blockchain, similar to printing new currency or issuing new securities.",
      traditionalDefinition: "Initial Public Offering where companies issue new shares to the public for the first time.",
      category: "Issuance",
      difficulty: "Beginner",
      examples: ["Minting new NFTs", "Facebook IPO, Tesla going public"]
    },
    {
      id: 17,
      crypto: "Bridge",
      traditional: "Currency Exchange",
      cryptoDefinition: "Protocol that allows transfer of tokens between different blockchain networks.",
      traditionalDefinition: "Service that converts one currency to another, facilitating international transactions.",
      category: "Infrastructure",
      difficulty: "Intermediate",
      examples: ["Ethereum to Polygon bridge", "USD to EUR currency exchange"]
    },
    {
      id: 18,
      crypto: "Validator",
      traditional: "Clearing House",
      cryptoDefinition: "Network participants who verify transactions and maintain blockchain security in Proof-of-Stake networks.",
      traditionalDefinition: "Financial institutions that facilitate settlement of trades and ensure transaction validity.",
      category: "Infrastructure",
      difficulty: "Intermediate",
      examples: ["Ethereum 2.0 validators", "DTCC, LCH clearing houses"]
    },
    {
      id: 19,
      crypto: "Tokenomics",
      traditional: "Capital Structure",
      cryptoDefinition: "The economic model of a cryptocurrency, including supply, distribution, and utility mechanisms.",
      traditionalDefinition: "How a company finances its operations through debt and equity, including dividend policies.",
      category: "Economics",
      difficulty: "Advanced",
      examples: ["Bitcoin's 21M supply cap", "Company debt-to-equity ratios"]
    },
    {
      id: 20,
      crypto: "Sandwich Attack",
      traditional: "Front Running",
      cryptoDefinition: "MEV strategy where attackers place transactions before and after a target transaction to profit from price movements.",
      traditionalDefinition: "Illegal practice where brokers execute trades for themselves before executing client orders.",
      category: "Risk",
      difficulty: "Advanced",
      examples: ["MEV bots on Ethereum", "Broker front-running client orders"]
    },
    {
      id: 21,
      crypto: "FOMO",
      traditional: "Market Euphoria",
      cryptoDefinition: "Fear Of Missing Out - emotional trading driven by seeing others profit, leading to impulsive buying at high prices.",
      traditionalDefinition: "Market condition where investors become overly optimistic and buy assets at inflated prices due to herd mentality.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["Buying crypto during bull runs", "Dot-com bubble, housing bubble buying"]
    },
    {
      id: 22,
      crypto: "FUD",
      traditional: "Market Panic/Bear Sentiment",
      cryptoDefinition: "Fear, Uncertainty, and Doubt - negative sentiment spread to cause panic selling and price drops.",
      traditionalDefinition: "Widespread pessimism and fear in markets leading to mass selling and declining prices.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["China crypto ban news", "2008 financial crisis panic selling"]
    },
    {
      id: 23,
      crypto: "Diamond Hands",
      traditional: "Long-term Conviction",
      cryptoDefinition: "Holding onto investments through extreme volatility without selling, showing strong conviction.",
      traditionalDefinition: "Maintaining positions in investments despite market turbulence, based on fundamental belief in value.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["Holding Bitcoin through 80% crashes", "Warren Buffett holding Coca-Cola for decades"]
    },
    {
      id: 24,
      crypto: "Paper Hands",
      traditional: "Weak Hands/Panic Selling",
      cryptoDefinition: "Selling investments quickly at the first sign of trouble or volatility, lacking conviction.",
      traditionalDefinition: "Investors who sell their positions at the first sign of market stress or minor losses.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["Selling crypto after 10% drop", "Selling stocks during market corrections"]
    },
    {
      id: 25,
      crypto: "To the Moon",
      traditional: "Bull Market Rally",
      cryptoDefinition: "Expression indicating belief that a cryptocurrency's price will rise dramatically.",
      traditionalDefinition: "Strong upward price movement in a security, often driven by positive sentiment and momentum.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["GameStop 'to the moon' rally", "Tesla stock surge in 2020"]
    },
    {
      id: 26,
      crypto: "Altcoin",
      traditional: "Small-Cap Stock",
      cryptoDefinition: "Any cryptocurrency other than Bitcoin, often with smaller market caps and higher volatility.",
      traditionalDefinition: "Stocks of smaller companies with market caps typically under $2 billion, often more volatile than large-caps.",
      category: "Assets",
      difficulty: "Beginner",
      examples: ["Ethereum, Cardano, Solana", "Small biotech, tech startups"]
    },
    {
      id: 27,
      crypto: "Shitcoin",
      traditional: "Penny Stock",
      cryptoDefinition: "Cryptocurrency with little to no value, utility, or legitimate purpose, often used for speculation.",
      traditionalDefinition: "Low-priced stocks of questionable companies, often subject to manipulation and high risk.",
      category: "Assets",
      difficulty: "Beginner",
      examples: ["Meme coins, pump-and-dump tokens", "OTC stocks under $1"]
    },
    {
      id: 28,
      crypto: "Pump and Dump",
      traditional: "Stock Manipulation",
      cryptoDefinition: "Scheme where price is artificially inflated through coordinated buying, then organizers sell causing price crash.",
      traditionalDefinition: "Illegal practice of inflating stock prices through misleading information, then selling at peak.",
      category: "Risk",
      difficulty: "Intermediate",
      examples: ["Coordinated Telegram pump groups", "Boiler room stock schemes"]
    },
    {
      id: 29,
      crypto: "Bagholder",
      traditional: "Underwater Investor",
      cryptoDefinition: "Someone holding cryptocurrency that has significantly decreased in value, unable or unwilling to sell at a loss.",
      traditionalDefinition: "Investor holding securities that have declined substantially below purchase price.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["Holding tokens bought at ATH", "Holding tech stocks from 2000 peak"]
    },
    {
      id: 30,
      crypto: "Rekt",
      traditional: "Margin Call/Liquidation",
      cryptoDefinition: "Slang for 'wrecked' - suffering significant losses, often from leveraged trading or bad investments.",
      traditionalDefinition: "Forced selling of positions due to insufficient margin or significant portfolio losses.",
      category: "Risk",
      difficulty: "Beginner",
      examples: ["Liquidated futures positions", "Forced selling during margin calls"]
    },
    {
      id: 31,
      crypto: "DEX",
      traditional: "Electronic Trading Network",
      cryptoDefinition: "Decentralized Exchange - peer-to-peer trading platform operating without central authority using smart contracts.",
      traditionalDefinition: "Electronic systems that match buy and sell orders automatically without traditional market makers.",
      category: "Infrastructure",
      difficulty: "Intermediate",
      examples: ["Uniswap, SushiSwap, PancakeSwap", "ECNs like Instinet, BATS"]
    },
    {
      id: 32,
      crypto: "CEX",
      traditional: "Traditional Exchange",
      cryptoDefinition: "Centralized Exchange - traditional crypto trading platform operated by a company with central control.",
      traditionalDefinition: "Established exchanges with central authority facilitating trading between buyers and sellers.",
      category: "Infrastructure",
      difficulty: "Beginner",
      examples: ["Coinbase, Binance, Kraken", "NYSE, NASDAQ, LSE"]
    },
    {
      id: 33,
      crypto: "Cold Storage",
      traditional: "Safe Deposit Box",
      cryptoDefinition: "Storing cryptocurrency offline in hardware wallets or paper wallets, disconnected from the internet.",
      traditionalDefinition: "Storing valuable assets in secure, offline locations like bank vaults or safety deposit boxes.",
      category: "Security",
      difficulty: "Intermediate",
      examples: ["Ledger, Trezor hardware wallets", "Bank safety deposit boxes"]
    },
    {
      id: 34,
      crypto: "Hot Wallet",
      traditional: "Checking Account",
      cryptoDefinition: "Cryptocurrency wallet connected to the internet for easy access and transactions, but less secure.",
      traditionalDefinition: "Easily accessible bank account for daily transactions, offering convenience but less security than savings.",
      category: "Security",
      difficulty: "Beginner",
      examples: ["MetaMask, mobile crypto wallets", "Bank checking accounts, PayPal"]
    },
    {
      id: 35,
      crypto: "Private Key",
      traditional: "Account Password/PIN",
      cryptoDefinition: "Secret cryptographic key that proves ownership of cryptocurrency and allows spending from wallet addresses.",
      traditionalDefinition: "Confidential credentials that provide access to financial accounts and authorize transactions.",
      category: "Security",
      difficulty: "Intermediate",
      examples: ["12-24 word seed phrases", "Bank account PINs, passwords"]
    },
    {
      id: 36,
      crypto: "Public Key",
      traditional: "Account Number",
      cryptoDefinition: "Cryptographic address that can be shared publicly to receive cryptocurrency, derived from private key.",
      traditionalDefinition: "Account identifier that can be shared with others to receive payments or transfers.",
      category: "Technology",
      difficulty: "Intermediate",
      examples: ["Bitcoin addresses, Ethereum addresses", "Bank account numbers, IBAN codes"]
    },
    {
      id: 37,
      crypto: "Market Cap",
      traditional: "Market Capitalization",
      cryptoDefinition: "Total value of a cryptocurrency calculated by multiplying current price by circulating supply.",
      traditionalDefinition: "Total value of a company calculated by multiplying stock price by number of outstanding shares.",
      category: "Metrics",
      difficulty: "Beginner",
      examples: ["Bitcoin's $500B+ market cap", "Apple's $3T market cap"]
    },
    {
      id: 38,
      crypto: "Circulating Supply",
      traditional: "Outstanding Shares",
      cryptoDefinition: "Number of cryptocurrency tokens currently available and circulating in the market.",
      traditionalDefinition: "Number of company shares currently held by investors and available for trading.",
      category: "Metrics",
      difficulty: "Beginner",
      examples: ["19.7M Bitcoin in circulation", "Apple's 15.7B outstanding shares"]
    },
    {
      id: 39,
      crypto: "Total Supply",
      traditional: "Authorized Shares",
      cryptoDefinition: "Maximum number of tokens that will ever exist for a cryptocurrency, including locked and future tokens.",
      traditionalDefinition: "Maximum number of shares a company is authorized to issue according to its charter.",
      category: "Metrics",
      difficulty: "Beginner",
      examples: ["Bitcoin's 21M total supply", "Company's authorized share limit"]
    },
    {
      id: 40,
      crypto: "Burning",
      traditional: "Share Buyback",
      cryptoDefinition: "Permanently removing cryptocurrency tokens from circulation to reduce supply and potentially increase value.",
      traditionalDefinition: "Company repurchasing its own shares from the market to reduce outstanding shares and boost price.",
      category: "Economics",
      difficulty: "Intermediate",
      examples: ["Binance BNB quarterly burns", "Apple's $100B+ buyback programs"]
    },
    {
      id: 41,
      crypto: "Halving",
      traditional: "Dividend Cut",
      cryptoDefinition: "Programmed reduction in cryptocurrency mining rewards, typically cutting new supply issuance in half.",
      traditionalDefinition: "Company decision to reduce dividend payments to shareholders, affecting income expectations.",
      category: "Economics",
      difficulty: "Intermediate",
      examples: ["Bitcoin halving every 4 years", "Companies cutting dividends in recessions"]
    },
    {
      id: 42,
      crypto: "Mining",
      traditional: "Market Making",
      cryptoDefinition: "Process of validating transactions and creating new cryptocurrency through computational work.",
      traditionalDefinition: "Providing liquidity to markets by continuously quoting buy and sell prices for securities.",
      category: "Infrastructure",
      difficulty: "Intermediate",
      examples: ["Bitcoin mining with ASICs", "High-frequency trading firms"]
    },
    {
      id: 43,
      crypto: "Hash Rate",
      traditional: "Trading Volume",
      cryptoDefinition: "Measure of computational power securing a blockchain network, indicating network strength and security.",
      traditionalDefinition: "Amount of trading activity in a market, indicating liquidity and investor interest.",
      category: "Metrics",
      difficulty: "Advanced",
      examples: ["Bitcoin's 400+ EH/s hash rate", "NYSE daily trading volume"]
    },
    {
      id: 44,
      crypto: "Fork",
      traditional: "Stock Split/Spin-off",
      cryptoDefinition: "Change to blockchain protocol rules, creating new version or separate cryptocurrency from existing one.",
      traditionalDefinition: "Corporate action that divides existing shares or creates new independent company from parent.",
      category: "Technology",
      difficulty: "Advanced",
      examples: ["Bitcoin Cash fork from Bitcoin", "PayPal spin-off from eBay"]
    },
    {
      id: 45,
      crypto: "Consensus",
      traditional: "Shareholder Vote",
      cryptoDefinition: "Agreement mechanism by which blockchain network participants validate transactions and maintain network state.",
      traditionalDefinition: "Process by which shareholders vote on important company decisions and governance matters.",
      category: "Governance",
      difficulty: "Advanced",
      examples: ["Proof-of-Work, Proof-of-Stake", "Annual shareholder meetings"]
    },
    {
      id: 46,
      crypto: "Layer 2",
      traditional: "Secondary Market",
      cryptoDefinition: "Scaling solution built on top of a base blockchain to improve transaction speed and reduce costs.",
      traditionalDefinition: "Market where previously issued securities are traded between investors, providing liquidity.",
      category: "Infrastructure",
      difficulty: "Advanced",
      examples: ["Polygon, Optimism, Arbitrum", "NYSE, NASDAQ secondary markets"]
    },
    {
      id: 47,
      crypto: "MEV",
      traditional: "Arbitrage",
      cryptoDefinition: "Maximal Extractable Value - profit miners/validators can make by reordering, inserting, or censoring transactions.",
      traditionalDefinition: "Profiting from price differences of the same asset across different markets or time periods.",
      category: "Trading",
      difficulty: "Advanced",
      examples: ["Front-running DEX trades", "Statistical arbitrage in stocks"]
    },
    {
      id: 48,
      crypto: "Ape In",
      traditional: "FOMO Buying",
      cryptoDefinition: "Aggressively buying a cryptocurrency without thorough research, often driven by hype or fear of missing out.",
      traditionalDefinition: "Making impulsive investment decisions based on market momentum or social pressure.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["Buying meme coins on launch", "Buying stocks during market bubbles"]
    },
    {
      id: 49,
      crypto: "Degen",
      traditional: "Speculator",
      cryptoDefinition: "Investor who takes high-risk positions, often in new or speculative cryptocurrencies.",
      traditionalDefinition: "Trader who takes aggressive positions in high-risk assets or derivatives.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["Trading new DeFi tokens", "Penny stock day trading"]
    },
    {
      id: 50,
      crypto: "WAGMI",
      traditional: "Long-term Optimism",
      cryptoDefinition: "We're All Gonna Make It - expression of confidence in the future of cryptocurrency markets.",
      traditionalDefinition: "Belief in long-term market growth and investment success despite short-term volatility.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["Holding through crypto winters", "Staying invested during market crashes"]
    },
    {
      id: 51,
      crypto: "NGMI",
      traditional: "Market Pessimism",
      cryptoDefinition: "Not Gonna Make It - expression of doubt about someone's investment decisions or market timing.",
      traditionalDefinition: "Pessimistic view about market prospects or investment strategy.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["Selling at market bottoms", "Panic selling during corrections"]
    },
    {
      id: 52,
      crypto: "Gas War",
      traditional: "Bidding War",
      cryptoDefinition: "Competition to get transactions processed first by offering higher gas fees during network congestion.",
      traditionalDefinition: "Competitive situation where multiple parties bid against each other for the same asset.",
      category: "Costs",
      difficulty: "Intermediate",
      examples: ["NFT minting gas wars", "Auction bidding wars"]
    },
    {
      id: 53,
      crypto: "Wen Moon",
      traditional: "Price Target",
      cryptoDefinition: "Humorous question asking when a cryptocurrency will reach its price target or significant gains.",
      traditionalDefinition: "Specific price level that an asset is expected to reach within a certain timeframe.",
      category: "Psychology",
      difficulty: "Beginner",
      examples: ["Asking about token price targets", "Analyst price predictions"]
    },
    {
      id: 54,
      crypto: "Ser",
      traditional: "Sir/Madam",
      cryptoDefinition: "Humorous way to address someone in crypto communities, often used sarcastically.",
      traditionalDefinition: "Formal way to address someone in traditional finance or business settings.",
      category: "Culture",
      difficulty: "Beginner",
      examples: ["Crypto Twitter interactions", "Professional business communications"]
    },
    {
      id: 55,
      crypto: "Anon",
      traditional: "Private Investor",
      cryptoDefinition: "Anonymous participant in crypto communities, often using pseudonyms.",
      traditionalDefinition: "Investor who maintains privacy in their investment activities.",
      category: "Culture",
      difficulty: "Beginner",
      examples: ["Crypto Twitter anons", "Private equity investors"]
    },
    {
      id: 56,
      crypto: "Based",
      traditional: "Solid",
      cryptoDefinition: "Term of approval in crypto communities, indicating something is good or reliable.",
      traditionalDefinition: "Description of something that is fundamentally sound or reliable.",
      category: "Culture",
      difficulty: "Beginner",
      examples: ["Based dev team", "Solid investment thesis"]
    },
    {
      id: 57,
      crypto: "Wen",
      traditional: "When",
      cryptoDefinition: "Crypto slang for 'when', often used in questions about project timelines.",
      traditionalDefinition: "Standard English word used in traditional finance for timing questions.",
      category: "Culture",
      difficulty: "Beginner",
      examples: ["Wen token launch?", "When is the IPO?"]
    }
  ];

  const categories = ['All', 'Strategy', 'Finance', 'Market Participants', 'Technology', 'Yield Generation', 'Trading', 'Costs', 'Assets', 'Governance', 'Risk', 'Lending', 'Rewards', 'Issuance', 'Infrastructure', 'Economics'];

  const filteredTerms = useMemo(() => {
    return cryptoTerms.filter(term => {
      const matchesSearch = 
        term.crypto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.traditional.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.cryptoDefinition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.traditionalDefinition.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) => `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.primary.light}10 100%)`,
        py: 4
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
              mb: 2,
              textAlign: 'center'
            }}
          >
            Crypto Trading Glossary for Beginners
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              mb: 4,
              textAlign: 'center'
            }}
          >
            Learn crypto terms with traditional finance comparisons
          </Typography>
        </motion.div>

        {/* Search and Filter Controls */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search crypto or traditional terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => setSelectedCategory(category)}
                    color={selectedCategory === category ? 'primary' : 'default'}
                    variant={selectedCategory === category ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* View Toggle Tabs */}
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="view toggle">
              <Tab label="Side-by-Side Comparison" />
              <Tab label="Accordion View" />
            </Tabs>
          </Box>

          {/* Side-by-Side Comparison View */}
          <CustomTabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {filteredTerms.map((term, index) => (
                <Grid item xs={12} key={term.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <CardContent sx={{ p: 0 }}>
                        <Grid container>
                          {/* Crypto Side */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 3, bgcolor: 'primary.light', color: 'white', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Coins size={24} style={{ marginRight: 8 }} />
                                <Typography variant="h6" fontWeight="bold">
                                  {term.crypto}
                                </Typography>
                                <Chip 
                                  label={term.difficulty}
                                  size="small"
                                  color={getDifficultyColor(term.difficulty) as any}
                                  sx={{ ml: 2 }}
                                />
                              </Box>
                              <Typography 
                                variant="body1" 
                                sx={{ mb: 2, lineHeight: 1.6 }}
                              >
                                {term.cryptoDefinition}
                              </Typography>
                              {term.examples && (
                                <Box>
                                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                                    Examples:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    {term.examples[0]}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>

                          {/* Traditional Side */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 3, bgcolor: 'secondary.light', color: 'white', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUp size={24} style={{ marginRight: 8 }} />
                                <Typography variant="h6" fontWeight="bold">
                                  {term.traditional}
                                </Typography>
                                <Chip 
                                  label={term.category}
                                  size="small"
                                  variant="outlined"
                                  sx={{ ml: 2, borderColor: 'white', color: 'white' }}
                                />
                              </Box>
                              <Typography 
                                variant="body1" 
                                sx={{ mb: 2, lineHeight: 1.6 }}
                              >
                                {term.traditionalDefinition}
                              </Typography>
                              {term.examples && term.examples[1] && (
                                <Box>
                                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                                    Examples:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    {term.examples[1]}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </CustomTabPanel>

          {/* Accordion View */}
          <CustomTabPanel value={tabValue} index={1}>
            <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              {filteredTerms.map((term, index) => (
                <motion.div
                  key={term.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Accordion sx={{ mb: 1, borderRadius: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {term.crypto} ↔ {term.traditional}
                        </Typography>
                        <Chip 
                          label={term.difficulty}
                          size="small"
                          color={getDifficultyColor(term.difficulty) as any}
                          sx={{ mr: 2 }}
                        />
                        <Chip 
                          label={term.category}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
                            <Typography variant="h6" gutterBottom>
                              <Coins size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                              {term.crypto}
                            </Typography>
                            <Typography 
                              variant="body2"
                            >
                              {term.cryptoDefinition}
                            </Typography>
                            {term.examples && (
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                Example: {term.examples[0]}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 1, color: 'white' }}>
                            <Typography variant="h6" gutterBottom>
                              <TrendingUp size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                              {term.traditional}
                            </Typography>
                            <Typography 
                              variant="body2"
                            >
                              {term.traditionalDefinition}
                            </Typography>
                            {term.examples && term.examples[1] && (
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                Example: {term.examples[1]}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </motion.div>
              ))}
            </Box>
          </CustomTabPanel>
        </Paper>

        {/* Stats Footer */}
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Learning Progress
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item>
              <Typography variant="h4" color="success.main">
                {filteredTerms.filter(t => t.difficulty === 'Beginner').length}
              </Typography>
              <Typography variant="body2">Beginner Terms</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h4" color="warning.main">
                {filteredTerms.filter(t => t.difficulty === 'Intermediate').length}
              </Typography>
              <Typography variant="body2">Intermediate Terms</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h4" color="error.main">
                {filteredTerms.filter(t => t.difficulty === 'Advanced').length}
              </Typography>
              <Typography variant="body2">Advanced Terms</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h4" color="primary.main">
                {filteredTerms.length}
              </Typography>
              <Typography variant="body2">Total Showing</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default CryptoGlossary; 