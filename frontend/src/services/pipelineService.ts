/**
 * YSM Signal Pipeline Service
 * 
 * Orchestrates the complete flow:
 *   Social Intelligence → AI Processing → Signal Generation → Asset Discovery → Trade Execution
 * 
 * Input End (Left Side):
 *   - Your Socials: Plug-and-play social media connections (TG, TikTok, X, etc.)
 *   - Your AI: Modular AI layer (GPT-4o, custom models, YSM proprietary prompts)
 *   - Data Ingestion: Automatic corpus building from social graph
 * 
 * Output End (Right Side):
 *   - Your Brokerages: Plug-and-play connections (Robinhood, Binance, DraftKings, etc.)
 *   - Trade Execution: Direct execution or partner redirects
 *   - Asset Routing: YSM directs users to the right platform per asset class
 * 
 * YSM in the Middle:
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

export type SocialPlatform = 'telegram' | 'tiktok' | 'x' | 'discord' | 'reddit' | 'youtube' | 'google-trends' | 'substack' | 'medium' | 'other';
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
  status: 'ingested' | 'processing' | 'ai_analyzing' | 'signal_generated' | 'assets_discovered' | 'routed' | 'executed';
  // New fields for richer pipeline output
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  aiReasoning?: string;
  strategies?: AssetStrategy[];
  pipelineSteps?: PipelineStep[];
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
  { platform: 'telegram',       displayName: 'Telegram',        icon: '✈️', isConnected: false, color: '#0088cc', url: 'https://telegram.org' },
  { platform: 'tiktok',         displayName: 'TikTok',          icon: '🎵', isConnected: false, color: '#ff0050', url: 'https://tiktok.com' },
  { platform: 'discord',        displayName: 'Discord',         icon: '💬', isConnected: false, color: '#5865F2', url: 'https://discord.com' },
  { platform: 'reddit',         displayName: 'Reddit',          icon: '🔴', isConnected: false, color: '#FF4500', url: 'https://reddit.com' },
  { platform: 'youtube',        displayName: 'YouTube',         icon: '▶️', isConnected: false, color: '#FF0000', url: 'https://youtube.com' },
  { platform: 'google-trends',  displayName: 'Google Trends',   icon: '📈', isConnected: false, color: '#4285F4', url: 'https://trends.google.com' },
  { platform: 'substack',       displayName: 'Substack',        icon: '📰', isConnected: false, color: '#FF6719', url: 'https://substack.com' },
  { platform: 'medium',         displayName: 'Medium',          icon: '✍️',  isConnected: false, color: '#00AB6C', url: 'https://medium.com' },
  { platform: 'other',          displayName: 'Others',          icon: '🔗', isConnected: false, color: '#6b7280', url: '' },
];

const DEFAULT_AI_MODELS: AIModelConfig[] = [
  {
    modelId: 'ysm-proprietary',
    displayName: 'YSM Signal Engine',
    provider: 'Yoree',
    isActive: true,
    description: 'Proprietary prompts for signal intelligence & market correlation',
    capabilities: ['signal_scoring', 'quality_assessment', 'market_correlation', 'asset_routing'],
    apiUrl: 'https://api.yoree.io',
    color: '#6366f1',
  },
  {
    modelId: 'gpt-4o',
    displayName: 'GPT-4o',
    provider: 'OpenAI',
    isActive: true,
    description: 'State-of-the-art reasoning, thesis generation, and risk assessment',
    capabilities: ['thesis_generation', 'sentiment_analysis', 'asset_discovery', 'risk_assessment'],
    apiUrl: 'https://api.openai.com/v1',
    color: '#10a37f',
  },
  {
    modelId: 'gemma-3-4b',
    displayName: 'Gemma 3-4B',
    provider: 'Google',
    isActive: false,
    description: 'Fast, lightweight technical analysis and strategy generation',
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
    assets: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'XOM', 'CVX'],
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
    this.apiKey = OPENAI_API_KEY;
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
    preferredAI: AIModel = 'gpt-4o'
  ): Promise<PipelineSignal> {
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
      pipelineSteps: [
        { name: 'Ingestion', status: 'completed', description: 'Signal ingested from social source' },
        { name: 'AI Analysis', status: 'pending', description: 'Analyzing with AI models...' },
        { name: 'Hypothesis Generation', status: 'pending', description: 'Generating trading hypothesis...' },
        { name: 'Asset Discovery', status: 'pending', description: 'Discovering related assets...' },
        { name: 'Platform Routing', status: 'pending', description: 'Routing to best platforms...' },
      ],
    };

    this.signals.unshift(signal);
    this.emitUpdate(signal);

    // Step 1: AI Processing
    signal.pipelineSteps![1].status = 'running';
    signal.pipelineSteps![1].startedAt = new Date().toISOString();
    signal.status = 'ai_analyzing';
    this.emitUpdate(signal);

    // Use OpenAI if API key available, otherwise fallback
    if (this.apiKey) {
      try {
        const aiResult = await this.callOpenAI(rawContent);
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
      } catch (err) {
        console.warn('OpenAI call failed, falling back to local analysis:', err);
        signal.hypothesis = this.generateLocalHypothesis(rawContent);
        signal.confidence = Math.floor(Math.random() * 30) + 70;
        signal.sentiment = this.detectSentiment(rawContent);
        signal.discoveredAssets = this.discoverAndRouteAssets(rawContent);
      }
    } else {
      // Local fallback
      await this.simulateDelay(500);
      signal.hypothesis = this.generateLocalHypothesis(rawContent);
      signal.confidence = Math.floor(Math.random() * 30) + 70;
      signal.sentiment = this.detectSentiment(rawContent);
      signal.discoveredAssets = this.discoverAndRouteAssets(rawContent);
    }

    signal.pipelineSteps![1].status = 'completed';
    signal.pipelineSteps![1].completedAt = new Date().toISOString();
    signal.status = 'signal_generated';
    this.emitUpdate(signal);

    // Step 2: Mark hypothesis step
    signal.pipelineSteps![2].status = 'running';
    signal.pipelineSteps![2].startedAt = new Date().toISOString();
    this.emitUpdate(signal);
    await this.simulateDelay(300);
    signal.pipelineSteps![2].status = 'completed';
    signal.pipelineSteps![2].completedAt = new Date().toISOString();
    signal.pipelineSteps![2].result = signal.hypothesis.slice(0, 80) + '...';
    this.emitUpdate(signal);

    // Step 3: Asset Discovery (already done above, just animate)
    signal.pipelineSteps![3].status = 'running';
    signal.pipelineSteps![3].startedAt = new Date().toISOString();
    signal.status = 'assets_discovered';
    this.emitUpdate(signal);
    await this.simulateDelay(400);
    signal.pipelineSteps![3].status = 'completed';
    signal.pipelineSteps![3].completedAt = new Date().toISOString();
    signal.pipelineSteps![3].result = `${signal.discoveredAssets.length} assets found`;
    this.stats.assetsDiscovered += signal.discoveredAssets.length;
    this.emitUpdate(signal);

    // Step 4: Route to connected brokerages
    signal.pipelineSteps![4].status = 'running';
    signal.pipelineSteps![4].startedAt = new Date().toISOString();
    this.emitUpdate(signal);
    await this.simulateDelay(200);
    signal.routedTo = [...new Set(signal.discoveredAssets.map(a => a.platform))] as BrokerageId[];
    signal.status = 'routed';
    signal.pipelineSteps![4].status = 'completed';
    signal.pipelineSteps![4].completedAt = new Date().toISOString();
    signal.pipelineSteps![4].result = `Routed to ${signal.routedTo.length} platforms`;
    this.emitUpdate(signal);

    this.stats.totalSignalsProcessed++;
    return signal;
  }

  private emitUpdate(signal: PipelineSignal) {
    if (this.onStepUpdate) {
      this.onStepUpdate({ ...signal });
    }
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

    const prompt = `# YSM SIGNAL PIPELINE ANALYSIS

You are Yoree's signal analysis engine. Analyze the following social intelligence and generate:
1. A trading hypothesis
2. Discovered assets across ALL asset classes with the EXACT platform to trade them
3. Actionable strategies

## INPUT SIGNAL:
"${rawContent}"

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
      "timeHorizon": "1-2 weeks",
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
- Be specific about which exchange/platform to use for each asset
- confidence is 0-100
- sentiment is "bullish", "bearish", or "neutral"`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are the Yoree Signal Market AI engine. You analyze social signals and discover tradeable assets across all asset classes (crypto, stocks, predictions, sports, DeFi, futures, forex). Always respond with valid JSON only.',
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

    const text = response.data.choices[0].message.content.trim();
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return {
        hypothesis: parsed.hypothesis || 'Signal analyzed successfully.',
        confidence: parsed.confidence || 75,
        sentiment: parsed.sentiment || 'neutral',
        reasoning: parsed.reasoning || '',
        assets: parsed.assets || [],
        strategies: parsed.strategies || [],
      };
    }

    throw new Error('Failed to parse OpenAI response');
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

  private discoverAndRouteAssets(rawContent: string): DiscoveredAsset[] {
    const content = rawContent.toLowerCase();
    const discovered: DiscoveredAsset[] = [];

    // Crypto keywords → Binance/Coinbase/Unlink
    const cryptoPatterns: Record<string, string> = {
      'btc|bitcoin': 'BTC', 'eth|ethereum': 'ETH', 'sol|solana': 'SOL',
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
      'oil|crude|petroleum|xom|exxon': 'XOM',
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

    // Always include MON on Monad
    if (!discovered.some(a => a.symbol === 'MON')) {
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

    // Deduplicate
    const seen = new Set<string>();
    return discovered.filter(a => {
      const key = `${a.symbol}-${a.platform}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ============================================================
  // Signal Creation → Save to Portfolio / Markets
  // ============================================================

  /**
   * Convert a pipeline signal into a proper Signal object and save it
   * to localStorage so it shows up in Portfolio and Markets.
   */
  createSignalFromPipeline(pipelineSignal: PipelineSignal): any {
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
        name: 'YSM Pipeline',
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
      },
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
