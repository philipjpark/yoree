// Signal Types for Greed

export interface Signal {
  id: string;
  underlyingAsset: string; // e.g., "ETH", "macro regime", "narrative"
  hypothesis: string; // Generated or user-defined
  dataBindings: SignalDataBinding[]; // Exactly 2 Minam feeds
  strategy?: StrategyLogic; // Optional Yoree strategy
  score: SignalIndex; // Composite score
  quality: number; // 1-day profit gain confidence (0-100)
  creator: SignalCreator;
  instances: SignalInstance[]; // Version history
  status: 'active' | 'deprecated' | 'archived';
  createdAt: string;
  updatedAt: string;
  assetBranches?: AssetBranches; // Cross-asset class discovery
  validationSources?: ValidationSource[]; // Validation/invalidation sources
}

export interface SignalDataBinding {
  feedId: string;
  feedName: string;
  feedType: MinamFeedType;
  bindingConfig: {
    normalization: string;
    weight: number; // Weight in scoring (0-1)
  };
  lastUpdate?: string;
  currentValue?: any;
}

export type MinamFeedType = 
  | 'price' 
  | 'sentiment' 
  | 'onchain_metrics' 
  | 'volume' 
  | 'social' 
  | 'news' 
  | 'technical_indicators'
  | 'other';

export interface MinamFeed {
  id: string;
  name: string;
  type: MinamFeedType;
  description: string;
  provider: string; // Minam provider name
  dataFormat: string;
  updateFrequency: 'realtime' | 'minute' | 'hourly' | 'daily';
  isActive: boolean;
}

export interface StrategyLogic {
  id?: string;
  name?: string;
  entryConditions?: string[];
  exitConditions?: string[];
  riskManagement?: {
    stopLoss?: number;
    takeProfit?: number;
    positionSize?: number;
  };
}

export interface SignalIndex {
  accuracy: number; // Historical prediction accuracy (0-100)
  performance: number; // Actual profit/loss performance (0-100)
  consensus: number; // Market consensus (trading volume/activity) (0-100)
  composite: number; // Weighted combination (0-100)
  lastUpdated: string;
}

export interface SignalCreator {
  type: 'human' | 'agent';
  id: string;
  name?: string;
  isAgentAnnounced: boolean; // For agents, must be true
}

export interface SignalInstance {
  id: string;
  signalId: string;
  versionNumber: number;
  scoreSnapshot: SignalIndex;
  qualitySnapshot: number;
  dataSnapshot: {
    feed1Value: any;
    feed2Value: any;
  };
  createdAt: string;
}

export interface SignalPerformanceHistory {
  signalId: string;
  timestamp: string;
  score: SignalIndex;
  quality: number;
  accuracy: number;
  performance: number;
  consensus: number;
  feed1Value: any;
  feed2Value: any;
}

export interface SignalMarket {
  signalId: string;
  pricingModel: 'bonding_curve' | 'orderbook' | 'amm';
  currentPrice: number;
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  totalShares: number;
  createdAt: string;
}

export interface SignalTrade {
  id: string;
  signalId: string;
  traderId: string;
  tradeType: 'buy' | 'sell';
  price: number;
  amount: number; // Number of shares
  timestamp: string;
}

export interface SignalThesis {
  hypothesis: string;
  probability: number; // Initial probability (0-100)
  parameters: {
    timeframe?: string;
    targetPrice?: number;
    confidence?: number;
    reasoning?: string;
  };
  generatedBy: 'ai' | 'human';
  rawInput?: string; // Original user input
}

export interface ScoringWeights {
  accuracy: number; // Default: 0.25
  performance: number; // Default: 0.35
  consensus: number; // Default: 0.20
  composite: number; // Default: 0.20
}

export interface SignalCreationRequest {
  underlyingAsset: string;
  hypothesis?: string; // Optional if using AI generation
  rawInput?: string; // Text, files, URLs for AI processing
  feed1Id: string;
  feed2Id: string;
  creator: SignalCreator;
  strategy?: StrategyLogic;
  scoringWeights?: ScoringWeights;
}

export interface SignalUpdateRequest {
  hypothesis?: string;
  feed1Id?: string;
  feed2Id?: string;
  strategy?: StrategyLogic;
  scoringWeights?: ScoringWeights;
}

// Asset Branch Types - Cross-Asset Class Discovery
export type AssetClass = 'crypto' | 'stocks' | 'futures' | 'forex' | 'predictions' | 'etfs' | 'bonds' | 'commodities';

export interface RelatedAsset {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  exchange: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  relevanceScore: number; // How relevant to the signal (0-100)
  connectionStatus: 'available' | 'connected' | 'not_available';
  exchangeAccountId?: string; // If user has connected account
}

export interface AssetBranches {
  crypto: RelatedAsset[];
  stocks: RelatedAsset[];
  futures: RelatedAsset[];
  forex: RelatedAsset[];
  predictions: RelatedAsset[];
  etfs: RelatedAsset[];
  bonds: RelatedAsset[];
  commodities: RelatedAsset[];
}

export interface ExchangeConnection {
  exchangeId: string;
  exchangeName: string;
  assetClasses: AssetClass[];
  connectionStatus: 'not_connected' | 'connecting' | 'connected' | 'error';
  accountId?: string;
  lastSync?: string;
  apiKey?: string; // Encrypted
}

// Validation Source Types
export type ValidationSourceType = 
  | 'google_trends' 
  | 'twitter' 
  | 'reddit' 
  | 'youtube' 
  | 'discord' 
  | 'telegram' 
  | 'news' 
  | 'onchain' 
  | 'opec' 
  | 'eia' 
  | 'bloomberg' 
  | 'reuters';

export interface ValidationSource {
  id: string;
  type: ValidationSourceType;
  name: string;
  description: string;
  url?: string;
  data?: {
    sentiment?: 'bullish' | 'bearish' | 'neutral';
    score?: number; // 0-100
    trend?: 'up' | 'down' | 'stable';
    volume?: number;
    lastUpdate?: string;
  };
  isConnected: boolean;
}
