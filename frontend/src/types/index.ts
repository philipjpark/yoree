// Strategy Types
export interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: StrategyParameters;
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: 'active' | 'inactive' | 'testing';
  performance?: StrategyPerformance;
}

export interface StrategyParameters {
  symbol: string;
  timeframe: string;
  entryConditions: string[];
  exitConditions: string[];
  riskManagement: {
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
  };
  customParameters?: Record<string, any>;
}

export interface StrategyPerformance {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalReturn: number;
  monthlyReturns: number[];
}

// Market Data Types
export interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketOverview {
  totalMarketCap: number;
  marketCapChange24h: number;
  volume24h: number;
  dominance: Record<string, number>;
}

// Sentiment Types
export interface SentimentData {
  overall: number;
  news: number;
  social: number;
  sources: {
    twitter: number;
    reddit: number;
    news: number;
  };
  trends: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  portfolio: Portfolio;
  preferences: UserPreferences;
}

export interface Portfolio {
  totalValue: number;
  assets: PortfolioAsset[];
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

export interface PortfolioAsset {
  symbol: string;
  amount: number;
  value: number;
  allocation: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
  defaultStrategy: string;
}

// LLM Types
export interface LLMResponse {
  strategy: Strategy;
  explanation: string;
  confidence: number;
  suggestions: string[];
}

export interface StrategyInsight {
  id: string;
  strategyId: string;
  type: 'optimization' | 'risk' | 'opportunity';
  description: string;
  confidence: number;
  timestamp: string;
  recommendations: string[];
} 