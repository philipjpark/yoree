export interface TraditionalStrategy {
  id: string;
  name: string;
  category: 'Momentum' | 'Mean Reversion' | 'Arbitrage' | 'Trend Following' | 'Volatility' | 'Pairs Trading' | 'Statistical Arbitrage';
  description: string;
  traditionalAsset: string;
  cryptoAdaptation: string;
  keyIndicators: string[];
  entryRules: string[];
  exitRules: string[];
  riskManagement: {
    stopLoss: string;
    takeProfit: string;
    positionSizing: string;
    maxDrawdown: string;
  };
  advantages: string[];
  disadvantages: string[];
  timeframes: string[];
  volatility: 'Low' | 'Medium' | 'High';
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  academicBasis: string;
  papers: string[];
}

class TraditionalFinanceStrategiesService {
  private strategies: TraditionalStrategy[] = [
    {
      id: 'momentum_breakout',
      name: 'Momentum Breakout Strategy',
      category: 'Momentum',
      description: 'A momentum-based strategy that identifies and trades breakouts from established price ranges.',
      traditionalAsset: 'Equities, Forex',
      cryptoAdaptation: 'Adapted for crypto\'s 24/7 trading and higher volatility with shorter timeframes',
      keyIndicators: ['RSI', 'MACD', 'Volume', 'Bollinger Bands', 'Moving Averages'],
      entryRules: [
        'Price breaks above resistance level with volume confirmation',
        'RSI above 50 indicating momentum',
        'MACD shows bullish crossover',
        'Volume 20% above average'
      ],
      exitRules: [
        'Price falls below support level',
        'RSI drops below 40',
        'MACD bearish crossover',
        'Volume dries up'
      ],
      riskManagement: {
        stopLoss: '2-3% below entry point',
        takeProfit: '6-9% above entry (2:1 to 3:1 risk-reward)',
        positionSizing: '2-3% of portfolio per trade',
        maxDrawdown: '15% maximum'
      },
      advantages: [
        'Captures strong trending moves',
        'Clear entry/exit signals',
        'Works well in trending markets',
        'High win rate potential'
      ],
      disadvantages: [
        'Can miss sideways markets',
        'False breakouts common',
        'Requires strict discipline',
        'High transaction costs in choppy markets'
      ],
      timeframes: ['15m', '1h', '4h', '1d'],
      volatility: 'Medium',
      complexity: 'Intermediate',
      academicBasis: 'Based on Jegadeesh and Titman (1993) momentum effect research',
      papers: [
        'Jegadeesh, N., & Titman, S. (1993). Returns to buying winners and selling losers: Implications for stock market efficiency.',
        'Chan, L. K., Jegadeesh, N., & Lakonishok, J. (1996). Momentum strategies.'
      ]
    },
    {
      id: 'mean_reversion_rsi',
      name: 'Mean Reversion RSI Strategy',
      category: 'Mean Reversion',
      description: 'A mean reversion strategy using RSI to identify overbought/oversold conditions.',
      traditionalAsset: 'Bonds, Commodities',
      cryptoAdaptation: 'Modified for crypto\'s higher volatility with adjusted RSI levels',
      keyIndicators: ['RSI', 'Bollinger Bands', 'Stochastic', 'Williams %R'],
      entryRules: [
        'RSI below 30 (oversold) for long positions',
        'RSI above 70 (overbought) for short positions',
        'Price near Bollinger Band extremes',
        'Volume confirmation of reversal'
      ],
      exitRules: [
        'RSI returns to neutral zone (40-60)',
        'Price reaches opposite Bollinger Band',
        'Trend continuation signal'
      ],
      riskManagement: {
        stopLoss: '1-2% beyond extreme levels',
        takeProfit: '3-4% toward mean',
        positionSizing: '1-2% of portfolio per trade',
        maxDrawdown: '10% maximum'
      },
      advantages: [
        'Works well in ranging markets',
        'Clear risk-reward ratios',
        'Lower transaction costs',
        'Based on statistical principles'
      ],
      disadvantages: [
        'Can fail in strong trends',
        'Requires patience',
        'May miss major moves',
        'Timing is critical'
      ],
      timeframes: ['1h', '4h', '1d'],
      volatility: 'Low',
      complexity: 'Beginner',
      academicBasis: 'Based on DeBondt and Thaler (1985) mean reversion research',
      papers: [
        'DeBondt, W. F., & Thaler, R. (1985). Does the stock market overreact?',
        'Fama, E. F., & French, K. R. (1988). Permanent and temporary components of stock prices.'
      ]
    },
    {
      id: 'trend_following_ma',
      name: 'Trend Following Moving Average Strategy',
      category: 'Trend Following',
      description: 'A systematic trend-following strategy using multiple moving averages.',
      traditionalAsset: 'Futures, Commodities',
      cryptoAdaptation: 'Optimized for crypto\'s faster-moving trends with shorter MAs',
      keyIndicators: ['EMA 20', 'EMA 50', 'EMA 200', 'ADX', 'Volume'],
      entryRules: [
        'Price above all moving averages for long',
        'Price below all moving averages for short',
        'ADX above 25 indicating strong trend',
        'Volume confirms trend direction'
      ],
      exitRules: [
        'Price crosses below/above key moving average',
        'ADX drops below 20',
        'Volume divergence',
        'Trend exhaustion signals'
      ],
      riskManagement: {
        stopLoss: '3-5% below/above key MA',
        takeProfit: '8-15% in trend direction',
        positionSizing: '3-5% of portfolio per trade',
        maxDrawdown: '20% maximum'
      },
      advantages: [
        'Captures major trends',
        'Reduces false signals',
        'Works across all timeframes',
        'Systematic approach'
      ],
      disadvantages: [
        'Lags in entry/exit',
        'Can give back profits in reversals',
        'Requires trending market',
        'Higher drawdowns'
      ],
      timeframes: ['4h', '1d', '1w'],
      volatility: 'High',
      complexity: 'Intermediate',
      academicBasis: 'Based on Moskowitz, Ooi, and Pedersen (2012) trend-following research',
      papers: [
        'Moskowitz, T. J., Ooi, Y. H., & Pedersen, L. H. (2012). Time series momentum.',
        'Hurst, B., Ooi, Y. H., & Pedersen, L. H. (2017). A century of evidence on trend-following investing.'
      ]
    },
    {
      id: 'volatility_breakout',
      name: 'Volatility Breakout Strategy',
      category: 'Volatility',
      description: 'A strategy that trades breakouts from low volatility periods.',
      traditionalAsset: 'Options, VIX',
      cryptoAdaptation: 'Adapted for crypto using realized volatility and implied volatility proxies',
      keyIndicators: ['Bollinger Bands', 'ATR', 'Volatility Ratio', 'Volume'],
      entryRules: [
        'Bollinger Bands contract (low volatility)',
        'ATR at recent lows',
        'Volume below average',
        'Price breaks above/below bands with volume'
      ],
      exitRules: [
        'Volatility returns to normal levels',
        'Price reaches target based on volatility expansion',
        'Volume dries up',
        'Trend reversal signals'
      ],
      riskManagement: {
        stopLoss: '2-3% from entry',
        takeProfit: 'Volatility expansion target',
        positionSizing: '2-3% of portfolio per trade',
        maxDrawdown: '12% maximum'
      },
      advantages: [
        'Captures explosive moves',
        'Clear setup identification',
        'High reward potential',
        'Works in all market conditions'
      ],
      disadvantages: [
        'False breakouts common',
        'Requires patience',
        'Can miss trending moves',
        'Timing critical'
      ],
      timeframes: ['1h', '4h', '1d'],
      volatility: 'Medium',
      complexity: 'Advanced',
      academicBasis: 'Based on Bollinger (2001) volatility research',
      papers: [
        'Bollinger, J. (2001). Bollinger on Bollinger Bands.',
        'Engle, R. F. (1982). Autoregressive conditional heteroscedasticity with estimates of the variance of United Kingdom inflation.'
      ]
    },
    {
      id: 'pairs_trading',
      name: 'Pairs Trading Strategy',
      category: 'Pairs Trading',
      description: 'A market-neutral strategy that trades the spread between correlated assets.',
      traditionalAsset: 'Equities, ETFs',
      cryptoAdaptation: 'Adapted for crypto pairs with high correlation (e.g., BTC/ETH)',
      keyIndicators: ['Correlation Coefficient', 'Z-Score', 'Cointegration', 'Spread'],
      entryRules: [
        'Identify highly correlated crypto pairs',
        'Z-score of spread > 2 (short the outperformer)',
        'Z-score of spread < -2 (long the underperformer)',
        'Cointegration relationship stable'
      ],
      exitRules: [
        'Z-score returns to zero',
        'Correlation breaks down',
        'Spread reaches historical mean',
        'Market regime change'
      ],
      riskManagement: {
        stopLoss: '2 standard deviations from mean',
        takeProfit: 'Return to mean',
        positionSizing: 'Equal dollar amounts in both positions',
        maxDrawdown: '8% maximum'
      },
      advantages: [
        'Market neutral',
        'Reduces directional risk',
        'Works in all market conditions',
        'Statistical edge'
      ],
      disadvantages: [
        'Requires sophisticated analysis',
        'Correlation can break down',
        'Transaction costs high',
        'Complex execution'
      ],
      timeframes: ['4h', '1d'],
      volatility: 'Low',
      complexity: 'Advanced',
      academicBasis: 'Based on Gatev, Goetzmann, and Rouwenhorst (2006) pairs trading research',
      papers: [
        'Gatev, E., Goetzmann, W. N., & Rouwenhorst, K. G. (2006). Pairs trading: Performance of a relative-value arbitrage rule.',
        'Elliott, R. J., Van Der Hoek, J., & Malcolm, W. P. (2005). Pairs trading.'
      ]
    },
    {
      id: 'statistical_arbitrage',
      name: 'Statistical Arbitrage Strategy',
      category: 'Statistical Arbitrage',
      description: 'A quantitative strategy that exploits short-term price inefficiencies.',
      traditionalAsset: 'Equities, Futures',
      cryptoAdaptation: 'Adapted for crypto using high-frequency data and market microstructure',
      keyIndicators: ['Mean Reversion', 'Momentum', 'Volatility', 'Volume'],
      entryRules: [
        'Price deviation from statistical model',
        'Mean reversion signal',
        'Volume anomaly',
        'Market microstructure inefficiency'
      ],
      exitRules: [
        'Price returns to model prediction',
        'Signal reversal',
        'Time-based exit',
        'Risk limit reached'
      ],
      riskManagement: {
        stopLoss: '1-2% from entry',
        takeProfit: 'Model-based target',
        positionSizing: 'Small positions, high frequency',
        maxDrawdown: '5% maximum'
      },
      advantages: [
        'High Sharpe ratio potential',
        'Market neutral',
        'Diversified across many trades',
        'Systematic approach'
      ],
      disadvantages: [
        'Requires sophisticated infrastructure',
        'High transaction costs',
        'Competitive advantage erodes',
        'Complex risk management'
      ],
      timeframes: ['1m', '5m', '15m'],
      volatility: 'Low',
      complexity: 'Advanced',
      academicBasis: 'Based on Avellaneda and Lee (2010) statistical arbitrage research',
      papers: [
        'Avellaneda, M., & Lee, J. H. (2010). Statistical arbitrage in high frequency trading.',
        'Mitchell, M., & Pulvino, T. (2001). Characteristics of risk and return in risk arbitrage.'
      ]
    }
  ];

  // Get all strategies
  async getAllStrategies(): Promise<TraditionalStrategy[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.strategies;
  }

  // Get strategies by category
  async getStrategiesByCategory(category: TraditionalStrategy['category']): Promise<TraditionalStrategy[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.strategies.filter(strategy => strategy.category === category);
  }

  // Get strategies by complexity
  async getStrategiesByComplexity(complexity: TraditionalStrategy['complexity']): Promise<TraditionalStrategy[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.strategies.filter(strategy => strategy.complexity === complexity);
  }

  // Search strategies
  async searchStrategies(query: string): Promise<TraditionalStrategy[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const lowercaseQuery = query.toLowerCase();
    return this.strategies.filter(strategy => 
      strategy.name.toLowerCase().includes(lowercaseQuery) ||
      strategy.description.toLowerCase().includes(lowercaseQuery) ||
      strategy.category.toLowerCase().includes(lowercaseQuery) ||
      strategy.traditionalAsset.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get strategy by ID
  async getStrategyById(id: string): Promise<TraditionalStrategy | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.strategies.find(strategy => strategy.id === id) || null;
  }

  // Get categories
  getCategories(): TraditionalStrategy['category'][] {
    return ['Momentum', 'Mean Reversion', 'Arbitrage', 'Trend Following', 'Volatility', 'Pairs Trading', 'Statistical Arbitrage'];
  }

  // Get complexity levels
  getComplexityLevels(): TraditionalStrategy['complexity'][] {
    return ['Beginner', 'Intermediate', 'Advanced'];
  }
}

const traditionalFinanceStrategiesService = new TraditionalFinanceStrategiesService();
export default traditionalFinanceStrategiesService; 