/**
 * Greed Signal Pipeline Service
 * 
 * Orchestrates the complete flow:
 *   Social Intelligence → AI Processing → Signal Generation → Asset Discovery → Strategy Generation → Trade Execution
 * 
 * Input End (Left Side):
 *   - Your Socials: Plug-and-play social media connections (TG, TikTok, X, etc.)
 *   - Your AI: Modular AI layer (GPT-4o, custom models, Greed proprietary prompts)
 *   - Data Ingestion: Automatic corpus building from social graph
 * 
 * Output End (Right Side):
 *   - Your Brokerages: Plug-and-play connections (Robinhood, Binance, DraftKings, etc.)
 *   - Trade Execution: Direct execution or partner redirects
 *   - Asset Routing: Greed directs users to the right platform per asset class
 * 
 * Greed in the Middle:
 *   - Orchestrates both ends
 *   - Signal generation (input → processing)
 *   - Asset discovery and routing (processing → output)
 *   - Seamless flow from social context to trade execution
 *   - Unlink private wallet for on-chain privacy (Monad Testnet)
 */

import axios from 'axios';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

// ============================================================
// Types
// ============================================================

export type SocialPlatform = 'telegram' | 'tiktok' | 'x' | 'discord' | 'reddit' | 'youtube' | 'google-trends' | 'substack' | 'medium' | 'whatsapp' | 'kakao' | 'other';
export type AIModel = 'gpt-4o' | 'gemma-3-4b' | 'ysm-proprietary' | 'custom';
export type BrokerageId = 
  | 'unlink-private'
  | 'binance'
  | 'coinbase'
  | 'robinhood'
  | 'draftkings'
  | 'polymarket'
  | 'kalshi'
  | 'alpaca'
  | 'interactive-brokers'
  | 'webull'
  | 'dydx';

export interface SocialConnection {
  platform: SocialPlatform;
  displayName: string;
  icon: string;
  isConnected: boolean;
  username?: string;
  lastSync?: string;
  dataPoints?: number;
  color: string;
  url: string;
}

export interface AIModelConfig {
  modelId: AIModel;
  displayName: string;
  provider: string;
  isActive: boolean;
  description: string;
  capabilities: string[];
  apiUrl: string;
  color: string;
}

export interface BrokerageConnection {
  id: BrokerageId;
  displayName: string;
  icon: string;
  isConnected: boolean;
  supportedAssets: string[];
  connectionUrl: string;
  accountId?: string;
  category: 'crypto' | 'stocks' | 'predictions' | 'sports' | 'defi' | 'private';
  color: string;
  description: string;
}

export interface PipelineSignal {
  id: string;
  source: SocialPlatform;
  rawContent: string;
  processedBy: AIModel;
  hypothesis: string;
  confidence: number;
  discoveredAssets: DiscoveredAsset[];
  routedTo: BrokerageId[];
  timestamp: string;
  status: 'ingested' | 'processing' | 'ai_analyzing' | 'signal_generated' | 'assets_discovered' | 'strategy_generated' | 'routed' | 'executed';
  // New fields for richer pipeline output
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  aiReasoning?: string;
  strategies?: AssetStrategy[];
  pipelineSteps?: PipelineStep[];
  llmExecution?: 'llm' | 'fallback';
  webEvidence?: WebEvidenceItem[];
  webCorroborationMeta?: {
    tickers: string[];
    nimbleCallsUsed: number;
    cacheHits: number;
    webDiscoveredCount?: number;
  };
}

export interface WebDiscoveredAssetInput {
  symbol: string;
  name: string;
  asset_class: string;
  source_url: string;
  via?: string;
}

export interface WebEvidenceItem {
  source_type: string;
  title: string;
  url: string;
  snippet: string;
  fetched_at: string;
  via: string;
}

export interface ProcessSignalOptions {
  webCorroborationBlock?: string;
  webEvidence?: WebEvidenceItem[];
  webCorroborationMeta?: PipelineSignal['webCorroborationMeta'];
  webDiscoveredAssets?: WebDiscoveredAssetInput[];
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  description: string;
  startedAt?: string;
  completedAt?: string;
  result?: string;
}

export interface DiscoveredAsset {
  symbol: string;
  name: string;
  assetClass: string;
  platform: string;
  platformName: string;
  platformUrl: string;
  confidence: number;
  action?: string; // 'long' | 'short' | 'hold' | 'hedge'
  reasoning?: string;
  livePrice?: number;
  change24h?: number;
  change24hPercent?: number;
  priceCurrency?: string;
  marketSource?: string;
  marketFetchedAt?: string;
}

export interface AssetStrategy {
  assetSymbol: string;
  assetClass: string;
  action: string;
  entry: string;
  exit: string;
  risk: string;
  timeHorizon: string;
  platform: string;
  platformUrl: string;
}

export interface PipelineStats {
  totalSignalsProcessed: number;
  activeConnections: number;
  socialPlatformsConnected: number;
  brokeragesConnected: number;
  aiModelsActive: number;
  assetsDiscovered: number;
  tradesExecuted: number;
}

// ============================================================
// Open Source Data APIs
// ============================================================

export const DATA_APIS = {
  crypto: {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3',
    docs: 'https://docs.coingecko.com/reference/introduction',
    free: true,
    description: 'Free crypto prices, market cap, volume for 10,000+ coins',
  },
  stocks: {
    name: 'Alpha Vantage',
    url: 'https://www.alphavantage.co/query',
    docs: 'https://www.alphavantage.co/documentation/',
    free: true,
    description: 'Free stock, forex, and crypto data with 25 requests/day',
  },
  news: {
    name: 'NewsAPI',
    url: 'https://newsapi.org/v2',
    docs: 'https://newsapi.org/docs',
    free: true,
    description: 'Headlines and articles from 150,000+ sources',
  },
  social: {
    name: 'Reddit (Public)',
    url: 'https://www.reddit.com/.json',
    docs: 'https://www.reddit.com/dev/api/',
    free: true,
    description: 'Public subreddit posts and comments for sentiment',
  },
  onchain: {
    name: 'Monad RPC',
    url: 'https://testnet-rpc.monad.xyz',
    docs: 'https://docs.monad.xyz/reference/json-rpc',
    free: true,
    description: 'On-chain data, balances, transactions on Monad',
  },
  googleTrends: {
    name: 'Google Trends',
    url: 'https://trends.google.com/trends/api/explore',
    docs: 'https://trends.google.com/trends/',
    free: true,
    description: 'Search interest data & trending topics over time',
  },
  substack: {
    name: 'Substack',
    url: 'https://substack.com',
    docs: 'https://substack.com',
    free: true,
    description: 'Newsletter insights from finance & macro writers',
  },
  medium: {
    name: 'Medium',
    url: 'https://medium.com',
    docs: 'https://medium.com',
    free: true,
    description: 'Long-form analysis from independent writers & researchers',
  },
};

// ============================================================
// Platform Links — 1 weblink per asset class/company
// ============================================================

export const PLATFORM_DIRECTORY: Record<string, { name: string; url: string; category: string; description: string }> = {
  // Predictions
  kalshi:       { name: 'Kalshi',              url: 'https://kalshi.com',              category: 'Predictions',    description: 'Event contracts & prediction markets (CFTC-regulated)' },
  polymarket:   { name: 'Polymarket',          url: 'https://polymarket.com',          category: 'Predictions',    description: 'Decentralized prediction market on Polygon' },
  metaculus:    { name: 'Metaculus',            url: 'https://www.metaculus.com',       category: 'Predictions',    description: 'Community forecasting & predictions' },

  // Sports Bets
  draftkings:   { name: 'DraftKings',          url: 'https://www.draftkings.com',      category: 'Sports Bets',    description: 'Daily fantasy sports & sportsbook' },
  fanduel:      { name: 'FanDuel',             url: 'https://www.fanduel.com',         category: 'Sports Bets',    description: 'Sports betting & daily fantasy' },
  betmgm:       { name: 'BetMGM',              url: 'https://www.betmgm.com',          category: 'Sports Bets',    description: 'Online sports betting & casino' },

  // Crypto Exchanges
  binance:      { name: 'Binance',             url: 'https://www.binance.com',         category: 'Crypto',         description: 'Largest crypto exchange by volume' },
  coinbase:     { name: 'Coinbase',            url: 'https://www.coinbase.com',        category: 'Crypto',         description: 'US-regulated crypto exchange' },
  kraken:       { name: 'Kraken',              url: 'https://www.kraken.com',          category: 'Crypto',         description: 'Crypto exchange with futures & staking' },

  // Stock Brokerages
  robinhood:    { name: 'Robinhood',           url: 'https://robinhood.com',           category: 'Stocks',         description: 'Commission-free stocks, options, crypto' },
  alpaca:       { name: 'Alpaca',              url: 'https://alpaca.markets',          category: 'Stocks',         description: 'API-first stock & crypto brokerage (free API)' },
  webull:       { name: 'Webull',              url: 'https://www.webull.com',          category: 'Stocks',         description: 'Commission-free trading with analytics' },
  ibkr:         { name: 'Interactive Brokers',  url: 'https://www.interactivebrokers.com', category: 'Stocks',     description: 'Professional trading across all asset classes' },

  // DeFi / DEXes
  dydx:         { name: 'dYdX',                url: 'https://dydx.exchange',           category: 'DeFi',           description: 'Decentralized perpetual futures exchange' },
  uniswap:      { name: 'Uniswap',            url: 'https://app.uniswap.org',         category: 'DeFi',           description: 'Largest DEX on Ethereum & L2s' },
  aave:         { name: 'Aave',                url: 'https://app.aave.com',            category: 'DeFi',           description: 'Decentralized lending & borrowing' },

  // Privacy / On-chain
  unlink:       { name: 'Unlink',              url: 'https://docs.unlink.xyz',         category: 'Private',        description: 'Private wallets & transactions on Monad' },
  monad:        { name: 'Monad',               url: 'https://docs.monad.xyz',          category: 'L1 Chain',       description: '10,000 TPS EVM-compatible L1 blockchain' },

  // Commodities / Futures
  cme:          { name: 'CME Group',           url: 'https://www.cmegroup.com',        category: 'Futures',        description: 'World\'s largest derivatives exchange' },

  // Forex
  oanda:        { name: 'OANDA',               url: 'https://www.oanda.com',           category: 'Forex',          description: 'Forex trading & currency data' },
};

// ============================================================
// Default Configurations
// ============================================================

const DEFAULT_SOCIAL_CONNECTIONS: SocialConnection[] = [
  { platform: 'x',              displayName: 'X (Twitter)',     icon: '𝕏',  isConnected: false, color: '#000000', url: 'https://x.com' },
  { platform: 'reddit',         displayName: 'Reddit',          icon: '🔴', isConnected: false, color: '#FF4500', url: 'https://reddit.com' },
  { platform: 'telegram',       displayName: 'Telegram',        icon: '✈️', isConnected: false, color: '#0088cc', url: 'https://telegram.org' },
  { platform: 'whatsapp',       displayName: 'WhatsApp',        icon: '💬', isConnected: false, color: '#25D366', url: 'https://web.whatsapp.com' },
  { platform: 'kakao',          displayName: 'Kakao',           icon: '💬', isConnected: false, color: '#FEE500', url: 'https://www.kakaocorp.com' },
  { platform: 'tiktok',         displayName: 'TikTok',          icon: '🎵', isConnected: false, color: '#ff0050', url: 'https://tiktok.com' },
  { platform: 'discord',        displayName: 'Discord',         icon: '💬', isConnected: false, color: '#5865F2', url: 'https://discord.com' },
  { platform: 'youtube',        displayName: 'YouTube',         icon: '▶️', isConnected: false, color: '#FF0000', url: 'https://youtube.com' },
  { platform: 'google-trends',  displayName: 'Google Trends',   icon: '📈', isConnected: false, color: '#4285F4', url: 'https://trends.google.com' },
  { platform: 'substack',       displayName: 'Substack',        icon: '📰', isConnected: false, color: '#FF6719', url: 'https://substack.com' },
  { platform: 'medium',         displayName: 'Medium',          icon: '✍️',  isConnected: false, color: '#00AB6C', url: 'https://medium.com' },
  { platform: 'other',          displayName: 'Others',          icon: '🔗', isConnected: false, color: '#6b7280', url: '' },
];

const DEFAULT_AI_MODELS: AIModelConfig[] = [
  {
    modelId: 'ysm-proprietary',
    displayName: 'Greed Signal Engine',
    provider: 'Yoree',
    isActive: true,
    description: 'Proprietary prompts for signal intelligence',
    capabilities: ['signal_scoring', 'quality_assessment', 'market_correlation', 'asset_routing'],
    apiUrl: 'https://api.yoree.io',
    color: '#6366f1',
  },
  {
    modelId: 'gpt-4o',
    displayName: 'GPT-4o',
    provider: 'OpenAI',
    isActive: true,
    description: 'Reasoning, thesis gen, and risk assessment',
    capabilities: ['thesis_generation', 'sentiment_analysis', 'asset_discovery', 'risk_assessment'],
    apiUrl: 'https://api.openai.com/v1',
    color: '#10a37f',
  },
  {
    modelId: 'gemma-3-4b',
    displayName: 'Gemma 3-4B',
    provider: 'Google',
    isActive: false,
    description: 'Technical analysis and strategy gen',
    capabilities: ['strategy_generation', 'technical_analysis'],
    apiUrl: 'https://generativelanguage.googleapis.com',
    color: '#4285F4',
  },
  {
    modelId: 'custom',
    displayName: 'Custom Model',
    provider: 'User',
    isActive: false,
    description: 'Bring your own model via API endpoint',
    capabilities: ['custom'],
    apiUrl: '',
    color: '#94A3B8',
  },
];

const DEFAULT_BROKERAGES: BrokerageConnection[] = [
  {
    id: 'unlink-private',
    displayName: 'Unlink Private',
    icon: '🔒',
    isConnected: false,
    supportedAssets: ['MON', 'Crypto'],
    connectionUrl: 'https://docs.unlink.xyz',
    category: 'private',
    color: '#6366f1',
    description: 'Private transactions on Monad via zero-knowledge proofs',
  },
  {
    id: 'binance',
    displayName: 'Binance',
    icon: '🟡',
    isConnected: false,
    supportedAssets: ['Crypto', 'Futures'],
    connectionUrl: 'https://www.binance.com',
    category: 'crypto',
    color: '#F0B90B',
    description: 'Largest crypto exchange by volume',
  },
  {
    id: 'coinbase',
    displayName: 'Coinbase',
    icon: '🔵',
    isConnected: false,
    supportedAssets: ['Crypto'],
    connectionUrl: 'https://www.coinbase.com',
    category: 'crypto',
    color: '#0052FF',
    description: 'US-regulated crypto exchange',
  },
  {
    id: 'robinhood',
    displayName: 'Robinhood',
    icon: '🪶',
    isConnected: false,
    supportedAssets: ['Stocks', 'ETFs', 'Crypto', 'Options'],
    connectionUrl: 'https://robinhood.com',
    category: 'stocks',
    color: '#00C805',
    description: 'Commission-free stocks, options, crypto',
  },
  {
    id: 'alpaca',
    displayName: 'Alpaca',
    icon: '🦙',
    isConnected: false,
    supportedAssets: ['Stocks', 'Crypto'],
    connectionUrl: 'https://alpaca.markets',
    category: 'stocks',
    color: '#FCD535',
    description: 'API-first brokerage with free trading API',
  },
  {
    id: 'kalshi',
    displayName: 'Kalshi',
    icon: '🎯',
    isConnected: false,
    supportedAssets: ['Predictions', 'Events'],
    connectionUrl: 'https://kalshi.com',
    category: 'predictions',
    color: '#5046e5',
    description: 'CFTC-regulated event contracts & predictions',
  },
  {
    id: 'draftkings',
    displayName: 'DraftKings',
    icon: '👑',
    isConnected: false,
    supportedAssets: ['Sports Bets', 'DFS'],
    connectionUrl: 'https://www.draftkings.com',
    category: 'sports',
    color: '#53d337',
    description: 'Daily fantasy sports & sportsbook',
  },
  {
    id: 'polymarket',
    displayName: 'Polymarket',
    icon: '📊',
    isConnected: false,
    supportedAssets: ['Predictions'],
    connectionUrl: 'https://polymarket.com',
    category: 'predictions',
    color: '#2563eb',
    description: 'Decentralized prediction market on Polygon',
  },
  {
    id: 'dydx',
    displayName: 'dYdX',
    icon: '📈',
    isConnected: false,
    supportedAssets: ['Perpetuals', 'Futures'],
    connectionUrl: 'https://dydx.exchange',
    category: 'defi',
    color: '#6966FF',
    description: 'Decentralized perpetual futures exchange',
  },
  {
    id: 'interactive-brokers',
    displayName: 'Interactive Brokers',
    icon: '🏛️',
    isConnected: false,
    supportedAssets: ['Stocks', 'Options', 'Futures', 'Forex', 'Bonds'],
    connectionUrl: 'https://www.interactivebrokers.com',
    category: 'stocks',
    color: '#D81B3C',
    description: 'Professional multi-asset trading platform',
  },
  {
    id: 'webull',
    displayName: 'Webull',
    icon: '🐂',
    isConnected: false,
    supportedAssets: ['Stocks', 'Options', 'Crypto'],
    connectionUrl: 'https://www.webull.com',
    category: 'stocks',
    color: '#FF5722',
    description: 'Advanced analytics & commission-free trading',
  },
];

// Asset-to-platform routing map
const ASSET_ROUTING: Record<string, { assets: string[]; platforms: BrokerageId[]; platformUrls: Record<string, string> }> = {
  crypto: {
    assets: ['BTC', 'ETH', 'SOL', 'MON', 'AVAX', 'MATIC', 'DOT', 'LINK'],
    platforms: ['binance', 'coinbase', 'robinhood', 'unlink-private'],
    platformUrls: {
      binance: 'https://www.binance.com/en/trade',
      coinbase: 'https://www.coinbase.com/price',
      robinhood: 'https://robinhood.com/crypto',
      'unlink-private': 'https://docs.unlink.xyz',
    },
  },
  stocks: {
    assets: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'XOM', 'CVX', 'AVAV', 'KTOS', 'JOBY', 'EH'],
    platforms: ['robinhood', 'alpaca', 'webull', 'interactive-brokers'],
    platformUrls: {
      robinhood: 'https://robinhood.com/stocks',
      alpaca: 'https://app.alpaca.markets',
      webull: 'https://www.webull.com/quote',
      'interactive-brokers': 'https://www.interactivebrokers.com',
    },
  },
  predictions: {
    assets: ['Election', 'Fed Rate', 'GDP', 'CPI', 'Weather', 'Geopolitics'],
    platforms: ['kalshi', 'polymarket'],
    platformUrls: {
      kalshi: 'https://kalshi.com/markets',
      polymarket: 'https://polymarket.com',
    },
  },
  sports: {
    assets: ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Tennis', 'MMA'],
    platforms: ['draftkings'],
    platformUrls: {
      draftkings: 'https://www.draftkings.com/lobby',
    },
  },
  defi: {
    assets: ['UNI', 'AAVE', 'MKR', 'COMP', 'SNX', 'CRV', 'YFI'],
    platforms: ['dydx', 'binance', 'unlink-private'],
    platformUrls: {
      dydx: 'https://dydx.exchange',
      binance: 'https://www.binance.com/en/trade',
      'unlink-private': 'https://docs.unlink.xyz',
    },
  },
  futures: {
    assets: ['WTI Crude', 'Gold', 'Silver', 'Nat Gas', 'Corn', 'Wheat'],
    platforms: ['interactive-brokers', 'alpaca'],
    platformUrls: {
      'interactive-brokers': 'https://www.interactivebrokers.com',
      alpaca: 'https://alpaca.markets',
    },
  },
};

// ============================================================
// Pipeline Service
// ============================================================

class PipelineService {
  private socialConnections: SocialConnection[];
  private aiModels: AIModelConfig[];
  private brokerages: BrokerageConnection[];
  private signals: PipelineSignal[];
  private stats: PipelineStats;
  private apiKey: string;
  private onStepUpdate?: (signal: PipelineSignal) => void;

  constructor() {
    this.socialConnections = [...DEFAULT_SOCIAL_CONNECTIONS];
    this.aiModels = [...DEFAULT_AI_MODELS];
    this.brokerages = [...DEFAULT_BROKERAGES];
    this.signals = [];
    this.apiKey = this.resolveOpenAIKey();
    this.stats = {
      totalSignalsProcessed: 0,
      activeConnections: 0,
      socialPlatformsConnected: 0,
      brokeragesConnected: 0,
      aiModelsActive: 2,
      assetsDiscovered: 0,
      tradesExecuted: 0,
    };
  }

  private resolveOpenAIKey(): string {
    // 1) Build-time env key
    if (OPENAI_API_KEY && OPENAI_API_KEY.trim().length > 0) return OPENAI_API_KEY.trim();
    // 2) Runtime overrides for hosted demos
    try {
      const lsKey = typeof window !== 'undefined' ? window.localStorage.getItem('yoree_api_key') : null;
      if (lsKey && lsKey.trim().length > 0) return lsKey.trim();
      const winKey = (typeof window !== 'undefined' ? (window as any).__OPENAI_API_KEY__ : '') || '';
      if (typeof winKey === 'string' && winKey.trim().length > 0) return winKey.trim();
    } catch {
      // ignore runtime key resolution errors and fallback to empty
    }
    return '';
  }

  /**
   * Set a callback for real-time pipeline step updates
   */
  setStepUpdateCallback(cb: (signal: PipelineSignal) => void) {
    this.onStepUpdate = cb;
  }

  clearStepUpdateCallback() {
    this.onStepUpdate = undefined;
  }

  // ============================================================
  // Social Connections (Input End)
  // ============================================================

  getSocialConnections(): SocialConnection[] {
    return [...this.socialConnections];
  }

  connectSocial(platform: SocialPlatform, username: string): SocialConnection {
    const connection = this.socialConnections.find(c => c.platform === platform);
    if (!connection) throw new Error(`Unknown platform: ${platform}`);

    connection.isConnected = true;
    connection.username = username;
    connection.lastSync = new Date().toISOString();
    connection.dataPoints = Math.floor(Math.random() * 500) + 50;

    this.stats.socialPlatformsConnected = this.socialConnections.filter(c => c.isConnected).length;
    this.updateActiveConnections();

    return { ...connection };
  }

  disconnectSocial(platform: SocialPlatform): void {
    const connection = this.socialConnections.find(c => c.platform === platform);
    if (connection) {
      connection.isConnected = false;
      connection.username = undefined;
      connection.lastSync = undefined;
      connection.dataPoints = undefined;
    }
    this.stats.socialPlatformsConnected = this.socialConnections.filter(c => c.isConnected).length;
    this.updateActiveConnections();
  }

  /**
   * Connect an "Other" source with manual info provided by the user.
   * Updates the 'other' entry's URL and displayName.
   */
  connectOtherSource(name: string, url: string): SocialConnection {
    let otherConn = this.socialConnections.find(c => c.platform === 'other');
    if (!otherConn) {
      otherConn = { platform: 'other', displayName: 'Others', icon: '🔗', isConnected: false, color: '#6b7280', url: '' };
      this.socialConnections.push(otherConn);
    }
    otherConn.isConnected = true;
    otherConn.displayName = name || 'Custom Source';
    otherConn.url = url || '';
    otherConn.username = name;
    otherConn.lastSync = new Date().toISOString();
    otherConn.dataPoints = 1;
    this.stats.socialPlatformsConnected = this.socialConnections.filter(c => c.isConnected).length;
    this.updateActiveConnections();
    return { ...otherConn };
  }

  // ============================================================
  // AI Models (Processing Layer)
  // ============================================================

  getAIModels(): AIModelConfig[] {
    return [...this.aiModels];
  }

  toggleAIModel(modelId: AIModel, active: boolean): void {
    const model = this.aiModels.find(m => m.modelId === modelId);
    if (model) {
      model.isActive = active;
      this.stats.aiModelsActive = this.aiModels.filter(m => m.isActive).length;
    }
  }

  // ============================================================
  // Brokerage Connections (Output End)
  // ============================================================

  getBrokerages(): BrokerageConnection[] {
    return [...this.brokerages];
  }

  connectBrokerage(id: BrokerageId): BrokerageConnection {
    const brokerage = this.brokerages.find(b => b.id === id);
    if (!brokerage) throw new Error(`Unknown brokerage: ${id}`);

    brokerage.isConnected = true;
    brokerage.accountId = `acc-${Date.now()}`;

    this.stats.brokeragesConnected = this.brokerages.filter(b => b.isConnected).length;
    this.updateActiveConnections();

    return { ...brokerage };
  }

  disconnectBrokerage(id: BrokerageId): void {
    const brokerage = this.brokerages.find(b => b.id === id);
    if (brokerage) {
      brokerage.isConnected = false;
      brokerage.accountId = undefined;
    }
    this.stats.brokeragesConnected = this.brokerages.filter(b => b.isConnected).length;
    this.updateActiveConnections();
  }

  markUnlinkConnected(isConnected: boolean): void {
    const unlink = this.brokerages.find(b => b.id === 'unlink-private');
    if (unlink) {
      unlink.isConnected = isConnected;
      this.stats.brokeragesConnected = this.brokerages.filter(b => b.isConnected).length;
      this.updateActiveConnections();
    }
  }

  // ============================================================
  // Platform Directory
  // ============================================================

  getPlatformDirectory() {
    return PLATFORM_DIRECTORY;
  }

  getDataAPIs() {
    return DATA_APIS;
  }

  getAssetRouting() {
    return ASSET_ROUTING;
  }

  /**
   * Given an asset symbol, find which platforms can trade it
   * and return direct weblinks
   */
  routeAssetToplatforms(assetSymbol: string): DiscoveredAsset[] {
    const results: DiscoveredAsset[] = [];
    const symbolUpper = assetSymbol.toUpperCase();

    for (const [category, routing] of Object.entries(ASSET_ROUTING)) {
      const matchedAsset = routing.assets.find(a => 
        symbolUpper.includes(a.toUpperCase()) || a.toUpperCase().includes(symbolUpper)
      );
      if (matchedAsset) {
        for (const platformId of routing.platforms) {
          const brokerage = this.brokerages.find(b => b.id === platformId);
          if (brokerage) {
            results.push({
              symbol: matchedAsset,
              name: matchedAsset,
              assetClass: category,
              platform: platformId,
              platformName: brokerage.displayName,
              platformUrl: routing.platformUrls[platformId] || brokerage.connectionUrl,
              confidence: brokerage.isConnected ? 95 : 70,
            });
          }
        }
      }
    }

    return results;
  }

  // ============================================================
  // Pipeline Orchestration (with OpenAI)
  // ============================================================

  async processSignal(
    source: SocialPlatform,
    rawContent: string,
    preferredAI: AIModel = 'gpt-4o',
    options?: ProcessSignalOptions
  ): Promise<PipelineSignal> {
    const hasWeb = Boolean(options?.webCorroborationBlock?.trim());
    const enrichedContent = hasWeb
      ? `${rawContent}\n\n${options!.webCorroborationBlock!.trim()}`
      : rawContent;

    const signal: PipelineSignal = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      source,
      rawContent,
      processedBy: preferredAI,
      hypothesis: '',
      confidence: 0,
      discoveredAssets: [],
      routedTo: [],
      timestamp: new Date().toISOString(),
      status: 'ingested',
      llmExecution: 'fallback',
      webEvidence: options?.webEvidence,
      webCorroborationMeta: options?.webCorroborationMeta,
      pipelineSteps: [
        { name: 'Ingestion', status: 'completed', description: 'Signal ingested from social source' },
        {
          name: 'Web Corroboration',
          status: hasWeb ? 'completed' : 'pending',
          description: hasWeb
            ? `SEC + web evidence (${options?.webEvidence?.length ?? 0} sources)`
            : 'Awaiting web corroboration (optional)',
          ...(hasWeb ? { completedAt: new Date().toISOString() } : {}),
        },
        { name: 'AI Analysis', status: 'pending', description: 'Analyzing with AI models...' },
        { name: 'Hypothesis Generation', status: 'pending', description: 'Generating trading hypothesis...' },
        { name: 'Asset Discovery', status: 'pending', description: 'Discovering related assets...' },
        { name: 'Alpha Strategy', status: 'pending', description: 'Building execution strategy from discovered assets...' },
        { name: 'Platform Routing', status: 'pending', description: 'Routing to best platforms...' },
      ],
    };

    this.signals.unshift(signal);
    this.emitUpdate(signal);

    // Step 2: AI Processing (index 1 = Web Corroboration when present)
    const aiStep = 2;
    const hypothesisStep = 3;
    const assetStep = 4;
    const strategyStep = 5;
    const routeStep = 6;

    if (hasWeb) {
      signal.pipelineSteps![1].status = 'completed';
      signal.pipelineSteps![1].completedAt = new Date().toISOString();
    }

    signal.pipelineSteps![aiStep].status = 'running';
    signal.pipelineSteps![aiStep].startedAt = new Date().toISOString();
    signal.status = 'ai_analyzing';
    this.emitUpdate(signal);

    // Use OpenAI if API key available, otherwise fallback
    // Refresh key at runtime in case it is injected after app boot.
    this.apiKey = this.resolveOpenAIKey();
    if (this.apiKey) {
      try {
        const aiResult = await this.callOpenAI(enrichedContent);
        signal.hypothesis = aiResult.hypothesis;
        signal.confidence = aiResult.confidence;
        signal.sentiment = aiResult.sentiment;
        signal.aiReasoning = aiResult.reasoning;
        signal.discoveredAssets = aiResult.assets.map((a: any) => ({
          symbol: a.symbol,
          name: a.name,
          assetClass: a.assetClass,
          platform: a.platform || 'binance',
          platformName: a.platformName || this.getPlatformNameForAsset(a.platform || a.assetClass),
          platformUrl: a.platformUrl || this.getPlatformUrlForAsset(a.symbol, a.assetClass),
          confidence: a.confidence || a.relevanceScore || 80,
          action: a.action || 'long',
          reasoning: a.reasoning || '',
        }));
        signal.strategies = aiResult.strategies || [];
        signal.llmExecution = 'llm';
      } catch (err) {
        const manualOverride = this.extractManualOverride(rawContent);
        if (manualOverride) {
          try {
            const focusedInput = this.buildFocusedManualInput(enrichedContent, manualOverride);
            const retryResult = await this.callOpenAI(focusedInput);
            signal.hypothesis = retryResult.hypothesis;
            signal.confidence = retryResult.confidence;
            signal.sentiment = retryResult.sentiment;
            signal.aiReasoning = retryResult.reasoning;
            signal.discoveredAssets = retryResult.assets.map((a: any) => ({
              symbol: a.symbol,
              name: a.name,
              assetClass: a.assetClass,
              platform: a.platform || 'binance',
              platformName: a.platformName || this.getPlatformNameForAsset(a.platform || a.assetClass),
              platformUrl: a.platformUrl || this.getPlatformUrlForAsset(a.symbol, a.assetClass),
              confidence: a.confidence || a.relevanceScore || 80,
              action: a.action || 'long',
              reasoning: a.reasoning || '',
            }));
            signal.strategies = retryResult.strategies || [];
            signal.llmExecution = 'llm';
          } catch (retryErr) {
            console.warn('Focused manual OpenAI retry failed, falling back to local analysis:', retryErr);
          }
        }

        if (!signal.hypothesis) {
          console.warn('OpenAI call failed, falling back to local analysis:', err);
          const fallbackInput = this.getFallbackAnalysisInput(enrichedContent);
          signal.hypothesis = this.generateLocalHypothesis(fallbackInput);
          signal.confidence = Math.floor(Math.random() * 30) + 70;
          signal.sentiment = this.detectSentiment(fallbackInput);
          signal.discoveredAssets = this.discoverAndRouteAssets(fallbackInput);
          signal.llmExecution = 'fallback';
        }
      }
    } else {
      // Local fallback
      await this.simulateDelay(25);
      const fallbackInput = this.getFallbackAnalysisInput(enrichedContent);
      signal.hypothesis = this.generateLocalHypothesis(fallbackInput);
      signal.confidence = Math.floor(Math.random() * 30) + 70;
      signal.sentiment = this.detectSentiment(fallbackInput);
      signal.discoveredAssets = this.discoverAndRouteAssets(fallbackInput);
      signal.llmExecution = 'fallback';
    }

    signal.pipelineSteps![aiStep].status = 'completed';
    signal.pipelineSteps![aiStep].completedAt = new Date().toISOString();
    signal.status = 'signal_generated';
    this.emitUpdate(signal);

    // Hypothesis step
    signal.pipelineSteps![hypothesisStep].status = 'running';
    signal.pipelineSteps![hypothesisStep].startedAt = new Date().toISOString();
    this.emitUpdate(signal);
    await this.simulateDelay(25);
    signal.pipelineSteps![hypothesisStep].status = 'completed';
    signal.pipelineSteps![hypothesisStep].completedAt = new Date().toISOString();
    signal.pipelineSteps![hypothesisStep].result = signal.hypothesis.slice(0, 80) + '...';
    this.emitUpdate(signal);

    // Asset Discovery + live market quotes
    signal.pipelineSteps![assetStep].status = 'running';
    signal.pipelineSteps![assetStep].startedAt = new Date().toISOString();
    signal.pipelineSteps![assetStep].description = 'Fetching live prices across asset classes…';
    signal.status = 'assets_discovered';
    this.emitUpdate(signal);
    if (options?.webDiscoveredAssets?.length) {
      signal.discoveredAssets = this.mergeWebDiscoveredAssets(
        signal.discoveredAssets,
        options.webDiscoveredAssets
      );
    }
    signal.discoveredAssets = this.mergeDiscoveredAssets(
      signal.discoveredAssets,
      this.discoverAndRouteAssets(enrichedContent)
    );
    signal.discoveredAssets = await this.enrichAssetsLive(signal.discoveredAssets);
    this.emitUpdate(signal);
    await this.simulateDelay(25);
    signal.pipelineSteps![assetStep].status = 'completed';
    signal.pipelineSteps![assetStep].completedAt = new Date().toISOString();
    signal.pipelineSteps![assetStep].result = `${signal.discoveredAssets.length} assets found`;
    this.stats.assetsDiscovered += signal.discoveredAssets.length;
    this.emitUpdate(signal);

    // Strategy generation (between discovery and execution routing)
    signal.pipelineSteps![strategyStep].status = 'running';
    signal.pipelineSteps![strategyStep].startedAt = new Date().toISOString();
    signal.status = 'strategy_generated';
    this.emitUpdate(signal);
    await this.simulateDelay(12.5);
    if (!signal.strategies || signal.strategies.length === 0) {
      signal.strategies = this.generateStrategiesFromAssets(signal.hypothesis, signal.discoveredAssets);
    }
    signal.pipelineSteps![strategyStep].status = 'completed';
    signal.pipelineSteps![strategyStep].completedAt = new Date().toISOString();
    signal.pipelineSteps![strategyStep].result = `${signal.strategies.length} strategy legs generated`;
    this.emitUpdate(signal);

    // Route to connected brokerages
    signal.pipelineSteps![routeStep].status = 'running';
    signal.pipelineSteps![routeStep].startedAt = new Date().toISOString();
    this.emitUpdate(signal);
    await this.simulateDelay(12.5);
    signal.routedTo = [...new Set(signal.discoveredAssets.map(a => a.platform))] as BrokerageId[];
    signal.status = 'routed';
    signal.pipelineSteps![routeStep].status = 'completed';
    signal.pipelineSteps![routeStep].completedAt = new Date().toISOString();
    signal.pipelineSteps![routeStep].result = `Routed to ${signal.routedTo.length} platforms`;
    this.emitUpdate(signal);

    this.stats.totalSignalsProcessed++;
    return signal;
  }

  private async enrichAssetsLive(assets: DiscoveredAsset[]): Promise<DiscoveredAsset[]> {
    try {
      const { enrichAssetsWithLiveQuotes } = await import('./assetMarketService');
      return enrichAssetsWithLiveQuotes(assets);
    } catch {
      return assets;
    }
  }

  private emitUpdate(signal: PipelineSignal) {
    if (this.onStepUpdate) {
      this.onStepUpdate({ ...signal });
    }
  }

  generateStrategiesFromAssets(hypothesis: string, assets: DiscoveredAsset[]): AssetStrategy[] {
    if (!assets.length) return [];
    const sentiment = this.detectSentiment(hypothesis);

    return assets.slice(0, 8).map((asset) => {
      const action = asset.action || (sentiment === 'bearish' ? 'short' : sentiment === 'bullish' ? 'long' : 'hold');
      const isShort = action === 'short';
      const isHold = action === 'hold';
      const intradayClasses = ['Crypto', 'DeFi', 'Forex', 'Futures'];
      const horizon = intradayClasses.includes(asset.assetClass) ? '1-2 days' : '2-3 days';
      const trigger = isShort
        ? 'Entry trigger: rejection at resistance after a weak retest'
        : isHold
          ? 'Entry trigger: wait for breakout or pullback confirmation'
          : 'Entry trigger: buy pullbacks into support during trend continuation';
      const confirmation = isShort
        ? 'Technical confirmation: lower-high structure + weakening RSI/MACD'
        : isHold
          ? 'Technical confirmation: volume expansion + clean directional break'
          : 'Technical confirmation: higher-low structure + bullish momentum continuation';
      const limitPlan = isShort
        ? 'Sell-limit ladder: 30% at entry zone, 35% at +0.75 ATR, 35% at +1.25 ATR'
        : isHold
          ? 'Buy-limit ladder (optional): 25/35/40% around support to reduce slippage'
          : 'Buy-limit ladder: 30% near support, 35% at -0.75 ATR pullback, 35% at -1.25 ATR pullback';
      const stopLoss = isShort ? 'Hard stop above recent swing high / invalidation level' : 'Hard stop below recent swing low / invalidation level';
      const takeProfit = isHold
        ? 'Take profit: 35% at first resistance, 35% at second resistance, trail final 30% by structure'
        : 'Take profit: 33% at 1R, 33% at 2R, trail final 34% using 20EMA / prior swing';
      const exposure = isHold
        ? 'Exposure: starter size only (0.5%-1.0% account risk)'
        : 'Exposure: 1.0%-2.0% account risk max, scaled in over 2-3 tranches';

      return {
        assetSymbol: asset.symbol,
        assetClass: asset.assetClass,
        action,
        entry: `${trigger}. ${confirmation}. ${limitPlan}.`,
        exit: takeProfit,
        risk: `${exposure}. ${stopLoss}. Technicals: 20EMA/50EMA trend, RSI regime, volume confirmation, and support/resistance map.`,
        timeHorizon: asset.assetClass === 'Predictions' || asset.assetClass === 'Sports Bets' ? '1-3 days' : horizon,
        platform: asset.platformName || asset.platform,
        platformUrl: asset.platformUrl,
      };
    });
  }

  /**
   * Call OpenAI API for real signal analysis + asset discovery
   */
  private async callOpenAI(rawContent: string): Promise<{
    hypothesis: string;
    confidence: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    reasoning: string;
    assets: any[];
    strategies: AssetStrategy[];
  }> {
    const platformList = Object.entries(PLATFORM_DIRECTORY)
      .map(([key, p]) => `${p.name} (${p.category}) → ${p.url}`)
      .join('\n');

    const normalizedInput = rawContent.slice(0, 15000);
    const manualOverride = this.extractManualOverride(rawContent);
    const corpusLines = this.extractCorpusLines(normalizedInput);
    const candidates = this.extractMarketCandidates(corpusLines);
    const candidateSummary = this.candidateSummary(candidates);
    const nonMajorInCorpus = candidates.filter(c => !this.isMajorSymbol(c.symbol)).length;
    const vetting = this.buildCorpusVetting(corpusLines);
    const prompt = `# GREED SIGNAL PIPELINE ANALYSIS

You are Greed's signal analysis engine. Analyze the following social intelligence corpus (often noisy, multilingual, and meme-heavy) and generate:
1. A trading hypothesis
2. Discovered assets across ALL asset classes with the EXACT platform to trade them
3. Actionable strategies
4. Evidence snippets copied from the corpus that support the thesis

## BALANCED REASONING POLICY
- Use corpus as the primary grounding source (quoted evidence is mandatory).
- Use LLM market reasoning as secondary synthesis (structure, risk framing, scenario building).
- Blend both: do not output purely corpus quotes without analysis, and do not output pure priors without corpus support.
- If corpus is sparse/noisy, still provide a best-effort thesis with explicit uncertainty.
- Be specific: include concrete triggers, invalidation levels/conditions, and a short execution plan.

## INPUT SOCIAL CORPUS (verbatim)
===CORPUS_START===
${normalizedInput}
===CORPUS_END===

## MANUAL USER OVERRIDE (highest priority if present)
${manualOverride || 'none'}

## EXTRACTED CANDIDATES (pre-LLM)
${candidateSummary}

## CORPUS VETTING FINDINGS
${vetting.summary}

## AVAILABLE PLATFORMS:
${platformList}

## YOUR TASK:
Analyze the signal and return ONLY valid JSON:

\`\`\`json
{
  "hypothesis": "Clear, actionable trading hypothesis (2-3 sentences)",
  "confidence": 85,
  "sentiment": "bullish",
  "reasoning": "Brief explanation of why this is the analysis",
  "evidence": [
    "Exact quote from corpus line 1",
    "Exact quote from corpus line 2",
    "Exact quote from corpus line 3"
  ],
  "assets": [
    {
      "symbol": "ETH",
      "name": "Ethereum",
      "assetClass": "Crypto",
      "platform": "binance",
      "platformName": "Binance",
      "platformUrl": "https://www.binance.com/en/trade/ETH_USDT",
      "confidence": 90,
      "action": "long",
      "reasoning": "Why this asset is relevant"
    }
  ],
  "strategies": [
    {
      "assetSymbol": "ETH",
      "assetClass": "Crypto",
      "action": "Long",
      "entry": "Buy at current levels",
      "exit": "Take profit at +15%",
      "risk": "Stop loss at -5%",
      "timeHorizon": "1-3 days",
      "platform": "Binance",
      "platformUrl": "https://www.binance.com/en/trade/ETH_USDT"
    }
  ]
}
\`\`\`

IMPORTANT:
- Discover assets across crypto, stocks, predictions, sports, DeFi, futures, forex as applicable
- Each asset MUST have a real platform name and URL from the available platforms list
- Include 3-8 relevant assets
- Include at least 2 different asset classes when supported by corpus; include 3+ classes when evidence exists
- Be specific about which exchange/platform to use for each asset
- confidence is 0-100
- sentiment is "bullish", "bearish", or "neutral"
- evidence must contain 2-5 exact snippets from inside CORPUS_START/CORPUS_END
- do not invent evidence
- NEVER say "no live corpus" or "lack of live corpus"
- Even if signal quality is weak, still output a tradable watchlist with best-effort confidence and clear risk caveats
- Prioritize explicit symbols/tickers/token addresses and market catalysts found in corpus
- In reasoning, target ~60-75% corpus-grounded observations and ~25-40% LLM synthesis (market structure, execution framing, risk context)
- reasoning must follow this structure exactly:
  1) Setup:
  2) Catalysts:
  3) Trigger to act:
  4) Invalidation:
  5) Execution (1-3 days):
- If MANUAL USER OVERRIDE is present, prioritize it for asset selection and execution while still grounding evidence in corpus lines when available.
${nonMajorInCorpus > 0 ? `- Corpus contains non-major candidates; include at least ${Math.min(2, nonMajorInCorpus)} non-major assets in output.` : ''}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are the Greed Signal Market AI engine. You analyze social signals and discover tradeable assets across all asset classes (crypto, stocks, predictions, sports, DeFi, futures, forex). Always respond with valid JSON only. Balance corpus-grounded evidence with model synthesis: corpus is primary evidence, LLM reasoning is secondary structure and risk framing.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data.choices?.[0]?.message?.content?.trim?.() || '';
    let parsed: any = null;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch {
        parsed = null;
      }
    }

    // Retry once with a strict JSON-repair prompt when first parse fails.
    if (!parsed) {
      const repaired = await this.repairJsonWithLLM(text);
      if (repaired) parsed = repaired;
    }

    if (parsed) {
      const parsedAssets = this.enforceAssetCoverage(parsed.assets || [], candidates);
      const vettedAssets = await this.vetAssetsWithLLM(normalizedInput, parsedAssets, candidates);
      const vettedEvidence = this.enforceVettedEvidence(parsed.evidence, vetting, corpusLines);
      const baseReasoning = typeof parsed.reasoning === 'string'
        ? parsed.reasoning
        : (parsed.reasoning ? this.safeStringify(parsed.reasoning) : '');
      const vettedReasoning = this.enhanceReasoningSpecificity(baseReasoning, corpusLines, vetting);
      return {
        hypothesis: parsed.hypothesis || 'Signal analyzed successfully.',
        confidence: parsed.confidence || 75,
        sentiment: parsed.sentiment || 'neutral',
        reasoning: this.withEvidence(`${vettedReasoning}\n\nVetting:\n${vetting.summary}`, vettedEvidence, corpusLines),
        assets: vettedAssets,
        strategies: (parsed.strategies || []).map((s: any) => ({
          ...s,
          timeHorizon: this.normalizeToShortDays(String(s?.timeHorizon || '1-3 days')),
        })),
      };
    }

    throw new Error('Failed to parse OpenAI response');
  }

  private async repairJsonWithLLM(raw: string): Promise<any | null> {
    if (!this.apiKey || !raw?.trim()) return null;
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Convert the following content into valid JSON only. Do not add commentary. Preserve keys and values where possible.',
            },
            {
              role: 'user',
              content: raw.slice(0, 12000),
            },
          ],
          temperature: 0,
          max_tokens: 1800,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const text = response.data.choices?.[0]?.message?.content?.trim?.() || '';
      const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      return JSON.parse(match[1] || match[0]);
    } catch {
      return null;
    }
  }

  private getPlatformNameForAsset(platformOrClass: string): string {
    const brokerage = this.brokerages.find(b => b.id === platformOrClass);
    if (brokerage) return brokerage.displayName;
    const dir = PLATFORM_DIRECTORY[platformOrClass];
    if (dir) return dir.name;
    return platformOrClass;
  }

  private getPlatformUrlForAsset(symbol: string, assetClass: string): string {
    const classLower = assetClass.toLowerCase();
    const routing = ASSET_ROUTING[classLower];
    if (routing) {
      const firstPlatform = routing.platforms[0];
      return routing.platformUrls[firstPlatform] || '';
    }
    return '';
  }

  private detectSentiment(rawContent: string): 'bullish' | 'bearish' | 'neutral' {
    const lower = rawContent.toLowerCase();
    const bullish = ['bullish', 'moon', 'pump', 'buy', 'long', 'breakout', 'surge', 'undervalued', 'rally'].some(k => lower.includes(k));
    const bearish = ['bearish', 'dump', 'sell', 'short', 'crash', 'dip', 'decline', 'overvalued'].some(k => lower.includes(k));
    if (bullish && !bearish) return 'bullish';
    if (bearish && !bullish) return 'bearish';
    return 'neutral';
  }

  private generateLocalHypothesis(rawContent: string): string {
    const keywords = rawContent.toLowerCase().split(/\s+/);
    const hasBullish = keywords.some(k => ['bullish', 'moon', 'pump', 'buy', 'long', 'breakout', 'surge'].includes(k));
    const hasBearish = keywords.some(k => ['bearish', 'dump', 'sell', 'short', 'crash', 'dip', 'decline'].includes(k));
    const hasSports = keywords.some(k => ['nfl', 'nba', 'mlb', 'bet', 'game', 'match', 'score', 'odds'].includes(k));
    const hasPrediction = keywords.some(k => ['election', 'predict', 'forecast', 'fed', 'rate', 'gdp', 'will'].includes(k));

    if (hasSports) return `Sports signal: "${rawContent.slice(0, 80)}..." — Analyzing odds, historical performance, and social sentiment for optimal bet placement.`;
    if (hasPrediction) return `Prediction signal: "${rawContent.slice(0, 80)}..." — Event probability assessment with multi-source validation.`;
    if (hasBullish) return `Bullish signal: "${rawContent.slice(0, 80)}..." — Momentum + social consensus suggest upside potential.`;
    if (hasBearish) return `Bearish signal: "${rawContent.slice(0, 80)}..." — Risk-off sentiment emerging across multiple channels.`;
    return `Neutral signal: "${rawContent.slice(0, 80)}..." — Requires further validation. Routing to discovery for asset matching.`;
  }

  private getFallbackAnalysisInput(rawContent: string): string {
    const manualOverride = this.extractManualOverride(rawContent);
    if (manualOverride) return manualOverride;
    const corpusOnly = this.extractCorpusLines(rawContent)
      .filter((l) => !/^corpus_source:/i.test(l))
      .join('\n');
    return corpusOnly.trim().length ? corpusOnly : rawContent;
  }

  private extractManualOverride(rawContent: string): string | null {
    const match = rawContent.match(/MANUAL SIGNAL CONTEXT \(user override\):\s*([\s\S]*)$/i);
    if (!match) return null;
    const cleaned = match[1]
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 4)
      .join(' ');
    return cleaned.length ? cleaned : null;
  }

  private buildFocusedManualInput(rawContent: string, manualOverride: string): string {
    const compactCorpus = this.extractCorpusLines(rawContent).slice(0, 120).join('\n');
    return [
      `MANUAL SIGNAL CONTEXT (user override): ${manualOverride}`,
      '',
      'CORPUS_SOURCE: focused_manual_retry',
      '',
      compactCorpus,
    ].join('\n');
  }

  private withEvidence(reasoning: string, evidence: unknown, corpusLines: string[]): string {
    const badEvidencePattern = /you are a trading-oriented signal engine|selected social inputs|proceed by extracting|no live corpus/i;
    const evidenceList = Array.isArray(evidence)
      ? evidence
          .filter((e): e is string => typeof e === 'string' && e.trim().length > 0)
          .filter((e) => !badEvidencePattern.test(e))
          .filter((e) => corpusLines.some((line) => line.includes(e) || e.includes(line.slice(0, Math.min(40, line.length)))))
          .slice(0, 4)
      : [];
    if (evidenceList.length) {
      return `${reasoning}\n\nEvidence:\n- ${evidenceList.join('\n- ')}`;
    }

    // Fallback evidence: first non-empty corpus lines.
    const fallback = corpusLines
      .filter((l) => !badEvidencePattern.test(l))
      .slice(0, 3);
    if (!fallback.length) return reasoning;
    return `${reasoning}\n\nEvidence:\n- ${fallback.join('\n- ')}`;
  }

  private enhanceReasoningSpecificity(
    reasoningInput: unknown,
    corpusLines: string[],
    vetting: { btcTargets: string[]; aiNarrativeLines: string[] }
  ): string {
    try {
      const reasoning = typeof reasoningInput === 'string'
        ? reasoningInput
        : (reasoningInput ? this.safeStringify(reasoningInput) : '');
      const lower = (reasoning || '').toString().toLowerCase();
    const hasStructuredSections =
      lower.includes('setup:') &&
      lower.includes('catalysts:') &&
      lower.includes('trigger to act:') &&
      lower.includes('invalidation:') &&
      lower.includes('execution (1-3 days):');
    if (hasStructuredSections) return reasoning;

    const priceTargets = [...new Set(
      corpusLines
        .flatMap((line) => [...line.matchAll(/\$?(BTC|ETH|SOL|BNB)\s*([0-9]{2,3}k)\b/gi)].map((m) => `${m[1].toUpperCase()} ${m[2].toLowerCase()}`))
        .slice(0, 4)
    )];
    const addresses = [...new Set(
      corpusLines.flatMap((line) => [...line.matchAll(/0x[a-fA-F0-9]{8,40}/g)].map((m) => m[0]))
    )].slice(0, 2);

    const catalysts = [
      vetting.btcTargets.length ? `BTC target chatter: ${vetting.btcTargets.join(', ')}` : null,
      vetting.aiNarrativeLines.length ? 'AI narrative momentum inside Binance/BSC threads' : null,
      addresses.length ? `On-chain token/address mentions: ${addresses.join(', ')}` : null,
    ].filter(Boolean) as string[];

    const trigger = priceTargets.length
      ? `Act only if momentum confirms around ${priceTargets.join(' / ')} with sustained mention velocity.`
      : 'Act only after repeated symbol/address mentions appear across multiple authors.';

    const invalidation = 'Stand down if mentions collapse, scam/risk flags dominate, or price rejects key breakout levels intraday.';
    const execution = 'Scale in 2-3 tranches, use tight risk limits, and realize partial profits into momentum spikes.';

    return [
      'Setup:',
      reasoning || 'Corpus shows tradable momentum pockets with mixed quality and high variance.',
      '',
      'Catalysts:',
      `- ${catalysts.length ? catalysts.join('\n- ') : 'No dominant catalyst cluster; treat as lower-conviction watchlist.'}`,
      '',
      'Trigger to act:',
      trigger,
      '',
      'Invalidation:',
      invalidation,
      '',
      'Execution (1-3 days):',
      execution,
    ].join('\n');
    } catch {
      // If anything goes wrong, return a minimal safe structure rather than throwing.
      return 'Setup: Corpus-derived signal requires further validation.\n\nCatalysts:\n- Sparse or noisy evidence detected\n\nTrigger to act:\n- Confirm with repeated mentions across multiple authors\n\nInvalidation:\n- Rejection at key levels or collapse in mention velocity\n\nExecution (1-3 days):\n- Small sizing, staged entries, tight stops';
    }
  }

  private safeStringify(obj: unknown): string {
    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  }

  private normalizeToShortDays(timeHorizon: string): string {
    const lower = timeHorizon.toLowerCase();
    if (lower.includes('week')) return '2-3 days';
    if (lower.includes('month')) return '2-3 days';
    return /day/.test(lower) ? timeHorizon : '1-3 days';
  }

  private async vetAssetsWithLLM(
    rawCorpus: string,
    assets: any[],
    candidates: Array<{ symbol: string; mentions: number; uniqueAuthors: number; riskFlags: number; score: number }>
  ): Promise<any[]> {
    if (!assets?.length || !this.apiKey) return assets;
    try {
      const platformList = Object.entries(PLATFORM_DIRECTORY)
        .map(([key, p]) => `${key}: ${p.name} (${p.category}) -> ${p.url}`)
        .join('\n');

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a strict trading asset vetter. Validate assets from social corpus. Keep only candidates that are plausible and map each to a concrete place to buy/trade. Return valid JSON only.',
            },
            {
              role: 'user',
              content:
`Validate and normalize this asset list.

Rules:
- Keep assets that are either:
  1) explicitly present in corpus ($TICKER, token name, or contract address), OR
  2) major market assets (BTC/ETH/SOL/BNB) used as context.
- For each retained asset include:
  - symbol
  - name
  - assetClass
  - platformName
  - platformUrl
  - confidence (0-100)
  - action
  - reasoning (brief)
  - buyVenueNote (short where/how to buy)
- If platform/url is missing, choose best fit from available platforms.
- Return 3-8 assets if possible.

AVAILABLE PLATFORMS:
${platformList}

CORPUS:
${rawCorpus.slice(0, 9000)}

ASSETS_TO_VET:
${JSON.stringify(assets).slice(0, 8000)}

Return JSON:
{
  "assets": [...]
}`,
            },
          ],
          temperature: 0.2,
          max_tokens: 1400,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const text = response.data.choices?.[0]?.message?.content?.trim?.() || '';
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return assets;
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      const vetted = Array.isArray(parsed?.assets) ? parsed.assets : [];
      if (!vetted.length) return assets;
      return this.normalizeVettedAssets(this.enforceAssetCoverage(vetted, candidates), candidates).slice(0, 10);
    } catch {
      return this.normalizeVettedAssets(this.enforceAssetCoverage(assets, candidates), candidates).slice(0, 10);
    }
  }

  private normalizeVettedAssets(
    assets: any[],
    candidates: Array<{ symbol: string; mentions: number; uniqueAuthors: number; riskFlags: number; score: number }> = []
  ): any[] {
    const candidateBySymbol = new Map(candidates.map((c) => [c.symbol.toUpperCase(), c]));
    return assets.map((a) => {
      const symbol = String(a?.symbol || '').toUpperCase();
      const fallbackClass = ['AAPL', 'TSLA', 'NVDA', 'COIN', 'XOM', 'CRCL'].includes(symbol) ? 'Stocks' : 'Crypto';
      const platformKey = this.findPlatformKeyByName(String(a?.platformName || '')) || (fallbackClass === 'Stocks' ? 'robinhood' : 'binance');
      const dir = PLATFORM_DIRECTORY[platformKey];
      const c = candidateBySymbol.get(symbol);
      const metrics = c
        ? ` corpusScore=${c.score}, mentions=${c.mentions}, authors=${c.uniqueAuthors}, riskFlags=${c.riskFlags}.`
        : '';
      return {
        symbol,
        name: a?.name || symbol,
        assetClass: a?.assetClass || fallbackClass,
        platform: platformKey,
        platformName: a?.platformName || dir?.name || 'Binance',
        platformUrl: a?.platformUrl || dir?.url || 'https://www.binance.com/en/trade',
        confidence: Number(a?.confidence || 70),
        action: a?.action || 'watch',
        reasoning: `${a?.reasoning || 'Vetted candidate from corpus.'}${a?.buyVenueNote ? ` ${a.buyVenueNote}` : ''}${metrics}`,
      };
    });
  }

  private findPlatformKeyByName(platformName: string): string | null {
    const target = platformName.toLowerCase().trim();
    if (!target) return null;
    for (const [key, p] of Object.entries(PLATFORM_DIRECTORY)) {
      if (p.name.toLowerCase() === target) return key;
    }
    return null;
  }

  private extractCorpusLines(rawContent: string): string[] {
    return rawContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .filter((l) => !/you are a trading-oriented signal engine|social corpus|tradable theme clusters|filtered tradable lines/i.test(l));
  }

  private isMajorSymbol(symbol: string): boolean {
    return ['BTC', 'ETH', 'BNB', 'SOL'].includes(symbol.toUpperCase());
  }

  private extractMarketCandidates(lines: string[]): Array<{ symbol: string; mentions: number; uniqueAuthors: number; riskFlags: number; score: number }> {
    const map = new Map<string, { mentions: number; authors: Set<string>; riskFlags: number }>();
    const nameToSymbol: Record<string, string> = {
      bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', bnb: 'BNB', usdc: 'USDC', usdt: 'USDT',
      circle: 'CRCL', coinbase: 'COIN', monad: 'MON',
    };

    for (const line of lines) {
      const authorMatch = line.match(/^@([A-Za-z0-9_]+)/);
      const author = authorMatch?.[1] || 'unknown';
      const risk = /scam|rug|stolen|hacked|be safe/i.test(line) ? 1 : 0;

      const symbols = new Set<string>();
      for (const m of line.matchAll(/\$([A-Z]{2,12})\b/g)) symbols.add(m[1].toUpperCase());
      for (const m of line.matchAll(/\b(BTC|ETH|SOL|BNB|CRCL|USDC|USDT|MON|AVAX|LINK|AAPL|TSLA|NVDA|COIN|XOM)\b/gi)) symbols.add(m[1].toUpperCase());
      for (const [name, sym] of Object.entries(nameToSymbol)) if (new RegExp(`\\b${name}\\b`, 'i').test(line)) symbols.add(sym);
      for (const m of line.matchAll(/0x[a-fA-F0-9]{8,40}/g)) symbols.add(`ADDR_${m[0].slice(2, 8).toUpperCase()}`);

      for (const symbol of symbols) {
        if (!map.has(symbol)) map.set(symbol, { mentions: 0, authors: new Set<string>(), riskFlags: 0 });
        const entry = map.get(symbol)!;
        entry.mentions += 1;
        entry.authors.add(author);
        entry.riskFlags += risk;
      }
    }

    return [...map.entries()]
      .map(([symbol, v]) => {
        const novelty = this.isMajorSymbol(symbol) ? 0 : 1.5;
        const score = v.mentions * 1.8 + v.authors.size * 1.2 + novelty - v.riskFlags * 0.8;
        return { symbol, mentions: v.mentions, uniqueAuthors: v.authors.size, riskFlags: v.riskFlags, score: Number(score.toFixed(2)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

  private candidateSummary(candidates: Array<{ symbol: string; mentions: number; uniqueAuthors: number; riskFlags: number; score: number }>): string {
    if (!candidates.length) return 'No extracted candidates.';
    return candidates
      .slice(0, 12)
      .map((c) => `${c.symbol} | score=${c.score} | mentions=${c.mentions} | uniqueAuthors=${c.uniqueAuthors} | riskFlags=${c.riskFlags}`)
      .join('\n');
  }

  private enforceAssetCoverage(assets: any[], candidates: Array<{ symbol: string; score: number }>): any[] {
    const out = Array.isArray(assets) ? [...assets] : [];
    const existing = new Set(out.map((a) => String(a?.symbol || '').toUpperCase()));
    const nonMajorCandidates = candidates.filter(c => !this.isMajorSymbol(c.symbol) && !c.symbol.startsWith('ADDR_'));

    const hasNonMajor = out.some((a) => !this.isMajorSymbol(String(a?.symbol || '').toUpperCase()));
    if (!hasNonMajor && nonMajorCandidates.length) {
      for (const c of nonMajorCandidates.slice(0, 2)) {
        const symbol = c.symbol.toUpperCase();
        if (existing.has(symbol)) continue;
        out.push({
          symbol,
          name: symbol,
          assetClass: ['AAPL', 'TSLA', 'NVDA', 'COIN', 'XOM', 'CRCL'].includes(symbol) ? 'Stocks' : 'Crypto',
          platform: ['AAPL', 'TSLA', 'NVDA', 'COIN', 'XOM', 'CRCL'].includes(symbol) ? 'robinhood' : 'binance',
          platformName: ['AAPL', 'TSLA', 'NVDA', 'COIN', 'XOM', 'CRCL'].includes(symbol) ? 'Robinhood' : 'Binance',
          platformUrl: ['AAPL', 'TSLA', 'NVDA', 'COIN', 'XOM', 'CRCL'].includes(symbol) ? 'https://robinhood.com/stocks' : 'https://www.binance.com/en/trade',
          confidence: 70,
          action: 'watch',
          reasoning: 'Promoted from social mention concentration and novelty scoring.',
        });
        existing.add(symbol);
      }
    }

    // Enforce class diversity when possible (avoid all assets collapsing into one class).
    const classCount = new Map<string, number>();
    for (const a of out) {
      const cls = String(a?.assetClass || this.classForSymbol(String(a?.symbol || '')) || 'Crypto');
      classCount.set(cls, (classCount.get(cls) || 0) + 1);
      if (!a.assetClass) a.assetClass = cls;
    }

    if (classCount.size < 2) {
      const seedByClass: Array<{ symbol: string; assetClass: string; platform: string; platformName: string; platformUrl: string }> = [
        { symbol: 'CRCL', assetClass: 'Stocks', platform: 'robinhood', platformName: 'Robinhood', platformUrl: 'https://robinhood.com/stocks' },
        { symbol: 'Event', assetClass: 'Predictions', platform: 'kalshi', platformName: 'Kalshi', platformUrl: 'https://kalshi.com/markets' },
      ];
      for (const seed of seedByClass) {
        if (existing.has(seed.symbol.toUpperCase())) continue;
        out.push({
          ...seed,
          name: seed.symbol,
          confidence: 62,
          action: 'watch',
          reasoning: 'Added for class diversification to reduce concentration risk.',
        });
        existing.add(seed.symbol.toUpperCase());
        classCount.set(seed.assetClass, (classCount.get(seed.assetClass) || 0) + 1);
        if (classCount.size >= 2) break;
      }
    }

    return out.slice(0, 10);
  }

  private classForSymbol(symbol: string): string | null {
    const s = symbol.toUpperCase();
    if (['BTC', 'ETH', 'SOL', 'BNB', 'MON', 'AVAX', 'LINK', 'USDC', 'USDT'].includes(s)) return 'Crypto';
    if (['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'XOM', 'CVX', 'COIN', 'CRCL', 'AVAV', 'KTOS', 'JOBY', 'EH'].includes(s)) return 'Stocks';
    if (s === 'EVENT') return 'Predictions';
    return null;
  }

  private buildCorpusVetting(lines: string[]): {
    summary: string;
    btcTargets: string[];
    aiNarrativeLines: string[];
  } {
    const btcTargets: string[] = [];
    const aiNarrativeLines: string[] = [];

    for (const line of lines) {
      if (/\$BTC\s*35k/i.test(line)) btcTargets.push('$BTC 35k');
      if (/\$BTC\s*50k/i.test(line)) btcTargets.push('$BTC 50k');
      if (/(ai|binance).*?(叙事|narrative|bsc|生态)/i.test(line) || /ai/i.test(line) && /(token|narrative|binance|bsc)/i.test(line)) {
        aiNarrativeLines.push(line);
      }
    }

    const uniqTargets = [...new Set(btcTargets)];
    const summaryParts = [
      `BTC targets detected: ${uniqTargets.length ? uniqTargets.join(', ') : 'none'}`,
      `AI narrative lines detected: ${aiNarrativeLines.length}`,
    ];
    if (aiNarrativeLines.length) {
      summaryParts.push(`AI sample: ${aiNarrativeLines[0]}`);
    }
    return {
      summary: summaryParts.join('\n'),
      btcTargets: uniqTargets,
      aiNarrativeLines: aiNarrativeLines.slice(0, 3),
    };
  }

  private enforceVettedEvidence(evidence: unknown, vetting: { btcTargets: string[]; aiNarrativeLines: string[] }, corpusLines: string[]): string[] {
    const out: string[] = Array.isArray(evidence)
      ? evidence.filter((e): e is string => typeof e === 'string' && e.trim().length > 0).slice(0, 5)
      : [];

    for (const t of vetting.btcTargets) {
      if (!out.some((e) => e.includes(t))) out.push(t);
    }
    for (const line of vetting.aiNarrativeLines) {
      if (!out.some((e) => e.includes(line.slice(0, 20)))) out.push(line);
    }

    // Keep only lines that exist in corpus or vetted synthetic target markers.
    return out
      .filter((e) => vetting.btcTargets.includes(e) || corpusLines.some((l) => l.includes(e) || e.includes(l.slice(0, Math.min(40, l.length)))))
      .slice(0, 5);
  }

  /** Union LLM assets with keyword/corpus routing (keeps higher-confidence entry per symbol). */
  private mergeDiscoveredAssets(existing: DiscoveredAsset[], extra: DiscoveredAsset[]): DiscoveredAsset[] {
    const bestBySymbol = new Map<string, DiscoveredAsset>();
    for (const a of existing) {
      bestBySymbol.set(a.symbol.toUpperCase(), a);
    }
    for (const a of extra) {
      const key = a.symbol.toUpperCase();
      const prev = bestBySymbol.get(key);
      if (!prev || (a.confidence || 0) > (prev.confidence || 0)) {
        bestBySymbol.set(key, a);
      }
    }
    return [...bestBySymbol.values()];
  }

  private mergeWebDiscoveredAssets(
    existing: DiscoveredAsset[],
    webAssets: WebDiscoveredAssetInput[]
  ): DiscoveredAsset[] {
    const bestBySymbol = new Map<string, DiscoveredAsset>();
    for (const a of existing) {
      bestBySymbol.set(a.symbol.toUpperCase(), a);
    }

    for (const w of webAssets) {
      const symbol = (w.symbol || '').toUpperCase();
      if (!symbol || bestBySymbol.has(symbol)) continue;

      const routed = this.routeAssetToplatforms(symbol);
      if (routed.length) {
        const top = [...routed].sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
        bestBySymbol.set(symbol, {
          ...top,
          name: w.name || top.name,
          reasoning: `Surfaced via Nimble/web search (${w.via || 'web'}).`,
        });
        continue;
      }

      const assetClass =
        w.asset_class === 'stocks'
          ? 'Stocks'
          : w.asset_class === 'predictions'
          ? 'Predictions'
          : 'Crypto';
      const platform =
        assetClass === 'Stocks' ? 'robinhood' : assetClass === 'Predictions' ? 'polymarket' : 'binance';
      const brokerage = this.brokerages.find((b) => b.id === platform);

      bestBySymbol.set(symbol, {
        symbol,
        name: w.name || symbol,
        assetClass,
        platform,
        platformName: brokerage?.displayName || (assetClass === 'Stocks' ? 'Robinhood' : 'Binance'),
        platformUrl: w.source_url || this.getPlatformUrlForAsset(symbol, assetClass),
        confidence: 78,
        action: 'watch',
        reasoning: `Non-mainstream candidate from Nimble deep search (${w.via || 'web'}).`,
      });
    }

    return [...bestBySymbol.values()];
  }

  private discoverAndRouteAssets(rawContent: string): DiscoveredAsset[] {
    const content = rawContent.toLowerCase();
    const discovered: DiscoveredAsset[] = [];

    // Crypto keywords → Binance/Coinbase/Unlink
    const cryptoPatterns: Record<string, string> = {
      'btc|bitcoin': 'BTC', 'eth|ethereum': 'ETH', 'sol|solana|solusdt': 'SOL',
      'bnb|\\bbsc\\b': 'BNB', 'usdc': 'USDC', 'usdt|tether': 'USDT',
      'mon|monad': 'MON', 'avax|avalanche': 'AVAX', 'link|chainlink': 'LINK',
    };
    for (const [pattern, symbol] of Object.entries(cryptoPatterns)) {
      if (new RegExp(pattern).test(content)) {
        discovered.push(...this.routeAssetToplatforms(symbol));
      }
    }

    // Stock keywords → Robinhood/Alpaca/Webull
    const stockPatterns: Record<string, string> = {
      'aapl|apple': 'AAPL', 'tsla|tesla': 'TSLA', 'nvda|nvidia': 'NVDA',
      'msft|microsoft': 'MSFT', 'googl|google|alphabet': 'GOOGL',
      'crcl|circle internet|\\bcircle\\b.*usdc': 'CRCL', 'coin|coinbase': 'COIN',
      'oil|crude|petroleum|xom|exxon': 'XOM',
      'drone|uav|unmanned|aerovironment|avav': 'AVAV',
      'kratos|ktos|defense drone': 'KTOS',
      'evtol|joby': 'JOBY',
      'ehang|eh': 'EH',
    };
    for (const [pattern, symbol] of Object.entries(stockPatterns)) {
      if (new RegExp(pattern).test(content)) {
        discovered.push(...this.routeAssetToplatforms(symbol));
      }
    }

    // Prediction keywords → Kalshi/Polymarket
    if (/election|predict|forecast|fed\s*rate|gdp|cpi|will\s+\w+\s+(win|happen|pass)/.test(content)) {
      discovered.push(
        { symbol: 'Event', name: 'Event Contract', assetClass: 'Predictions', platform: 'kalshi', platformName: 'Kalshi', platformUrl: 'https://kalshi.com/markets', confidence: 85 },
        { symbol: 'Event', name: 'Prediction Market', assetClass: 'Predictions', platform: 'polymarket', platformName: 'Polymarket', platformUrl: 'https://polymarket.com', confidence: 80 },
      );
    }

    // Sports keywords → DraftKings
    if (/nfl|nba|mlb|nhl|soccer|game|bet|odds|score|match|fantasy/.test(content)) {
      discovered.push(
        { symbol: 'Sports', name: 'Sportsbook', assetClass: 'Sports Bets', platform: 'draftkings', platformName: 'DraftKings', platformUrl: 'https://www.draftkings.com/lobby', confidence: 90 },
      );
    }

    // DeFi keywords → dYdX/Unlink
    if (/defi|swap|lend|borrow|yield|aave|uni|liquidity/.test(content)) {
      discovered.push(
        { symbol: 'DeFi', name: 'Perp Futures', assetClass: 'DeFi', platform: 'dydx', platformName: 'dYdX', platformUrl: 'https://dydx.exchange', confidence: 85 },
      );
    }

    // Include MON only when corpus/query explicitly references Monad/privacy context.
    if (/(monad|mon\b|unlink|privacy|shield)/i.test(content) && !discovered.some(a => a.symbol === 'MON')) {
      discovered.push({
        symbol: 'MON',
        name: 'Monad',
        assetClass: 'Crypto',
        platform: 'unlink-private',
        platformName: 'Unlink Private',
        platformUrl: 'https://docs.unlink.xyz',
        confidence: 75,
      });
    }

    // Deduplicate by symbol and keep the highest-confidence route (avoid AVAV repeated across platforms).
    const bestBySymbol = new Map<string, DiscoveredAsset>();
    for (const asset of discovered) {
      const key = asset.symbol.toUpperCase();
      const existing = bestBySymbol.get(key);
      if (!existing || (asset.confidence || 0) > (existing.confidence || 0)) {
        bestBySymbol.set(key, asset);
      }
    }
    return [...bestBySymbol.values()];
  }

  // ============================================================
  // Signal Creation → Save to Portfolio / Markets
  // ============================================================

  /**
   * Convert a pipeline signal into a proper Signal object and save it
   * to localStorage so it shows up in Portfolio and Markets.
   */
  /**
   * Persist pipeline output as a real Greed signal (backend + local portfolio).
   */
  async persistPipelineSignal(
    pipelineSignal: PipelineSignal,
    meta?: { xHandle?: string; xSourceCount?: number }
  ): Promise<{ id: string; savedToBackend: boolean }> {
    const local = this.createSignalFromPipeline(pipelineSignal, meta);

    let savedToBackend = false;
    try {
      const { signalService } = await import('./signalService');
      const primary = pipelineSignal.discoveredAssets[0]?.symbol || 'MULTI';
      const backendSignal = await signalService.createSignal({
        underlyingAsset: primary,
        hypothesis: pipelineSignal.hypothesis,
        rawInput: pipelineSignal.rawContent.slice(0, 8000),
        feed1Id: 'pipeline-x-social',
        feed2Id: 'pipeline-web-corroboration',
        creator: {
          type: 'agent',
          id: 'greed-pipeline',
          name: 'Greed Pipeline',
          isAgentAnnounced: true,
        },
        scoringWeights: {
          accuracy: 0.25,
          performance: 0.35,
          consensus: 0.2,
          composite: 0.2,
        },
      });
      if (backendSignal?.id) {
        local.id = backendSignal.id;
        savedToBackend = true;
      }
    } catch (e) {
      console.warn('Backend signal save failed; kept local copy:', e);
    }

    return { id: local.id, savedToBackend };
  }

  createSignalFromPipeline(
    pipelineSignal: PipelineSignal,
    meta?: { xHandle?: string; xSourceCount?: number }
  ): any {
    const now = new Date().toISOString();
    const signalId = `signal-pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Determine underlying asset from discovered assets
    const primaryAsset = pipelineSignal.discoveredAssets[0]?.symbol || 'MULTI';

    const signal = {
      id: signalId,
      underlyingAsset: primaryAsset,
      hypothesis: pipelineSignal.hypothesis,
      dataBindings: [
        {
          feedId: 'pipeline-social',
          feedName: `${pipelineSignal.source.toUpperCase()} Social Feed`,
          feedType: 'social' as const,
          bindingConfig: { normalization: 'standard', weight: 0.5 },
        },
        {
          feedId: 'pipeline-ai',
          feedName: `${pipelineSignal.processedBy} AI Analysis`,
          feedType: 'sentiment' as const,
          bindingConfig: { normalization: 'standard', weight: 0.5 },
        },
      ],
      score: {
        accuracy: pipelineSignal.confidence,
        performance: Math.floor(pipelineSignal.confidence * 0.9),
        consensus: Math.floor(pipelineSignal.confidence * 0.85),
        composite: pipelineSignal.confidence,
        lastUpdated: now,
      },
      quality: pipelineSignal.confidence,
      creator: {
        type: 'agent' as const,
        id: 'ysm-pipeline',
        name: 'Greed Pipeline',
        isAgentAnnounced: true,
      },
      instances: [],
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
      assetBranches: this.buildAssetBranches(pipelineSignal.discoveredAssets),
      metadata: {
        source: pipelineSignal.source,
        rawContent: pipelineSignal.rawContent,
        sentiment: pipelineSignal.sentiment,
        aiReasoning: pipelineSignal.aiReasoning,
        strategies: pipelineSignal.strategies,
        discoveredAssets: pipelineSignal.discoveredAssets,
        webEvidence: pipelineSignal.webEvidence,
        webCorroborationMeta: pipelineSignal.webCorroborationMeta,
        llmExecution: pipelineSignal.llmExecution,
        xHandle: meta?.xHandle,
        xSourceCount: meta?.xSourceCount,
      },
      validationSources: (pipelineSignal.webEvidence || []).map((ev, i) => ({
        id: `web-${i}-${Date.now()}`,
        type: ev.source_type === 'sec_edgar' ? 'news' : 'twitter',
        name: ev.title,
        description: ev.snippet.slice(0, 200),
        url: ev.url,
        data: {
          sentiment: pipelineSignal.sentiment,
          score: pipelineSignal.confidence,
          lastUpdate: ev.fetched_at,
        },
        isConnected: true,
      })),
    };

    // Save to localStorage - Portfolio
    try {
      const portfolioSignals = JSON.parse(localStorage.getItem('yoree_portfolio_signals') || '[]');
      portfolioSignals.push({
        signal,
        addedAt: now,
        source: 'pipeline',
      });
      localStorage.setItem('yoree_portfolio_signals', JSON.stringify(portfolioSignals));

      // Save to active signals for Markets page
      const activeSignals = JSON.parse(localStorage.getItem('yoree_active_signals') || '[]');
      activeSignals.push(signal);
      localStorage.setItem('yoree_active_signals', JSON.stringify(activeSignals));

      // Dispatch event so other pages can refresh
      window.dispatchEvent(new Event('signalCreated'));
    } catch (e) {
      console.warn('Failed to save pipeline signal:', e);
    }

    return signal;
  }

  private buildAssetBranches(assets: DiscoveredAsset[]): any {
    const branches: any = {
      crypto: [],
      stocks: [],
      futures: [],
      forex: [],
      predictions: [],
      etfs: [],
      bonds: [],
      commodities: [],
    };

    assets.forEach((asset) => {
      const classMap: Record<string, string> = {
        'Crypto': 'crypto',
        'crypto': 'crypto',
        'Stocks': 'stocks',
        'stocks': 'stocks',
        'Predictions': 'predictions',
        'predictions': 'predictions',
        'Sports Bets': 'predictions',
        'sports': 'predictions',
        'DeFi': 'crypto',
        'defi': 'crypto',
        'Futures': 'futures',
        'futures': 'futures',
        'Forex': 'forex',
        'forex': 'forex',
      };
      const branchKey = classMap[asset.assetClass] || 'crypto';
      if (branches[branchKey]) {
        branches[branchKey].push({
          id: `asset-${asset.symbol}-${Date.now()}`,
          symbol: asset.symbol,
          name: asset.name,
          assetClass: branchKey,
          exchange: asset.platformName || asset.platform,
          currentPrice: 0,
          priceChange24h: 0,
          volume24h: 0,
          relevanceScore: asset.confidence,
          connectionStatus: 'available' as const,
        });
      }
    });

    return branches;
  }

  // ============================================================
  // Stats & State
  // ============================================================

  getStats(): PipelineStats {
    return { ...this.stats };
  }

  getRecentSignals(limit: number = 10): PipelineSignal[] {
    return this.signals.slice(0, limit);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private updateActiveConnections(): void {
    this.stats.activeConnections =
      this.stats.socialPlatformsConnected + this.stats.brokeragesConnected;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const pipelineService = new PipelineService();
export default pipelineService;
