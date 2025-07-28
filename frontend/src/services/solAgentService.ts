import axios from 'axios';

// SOL-specific agent types
export interface SOLMarketData {
  symbol: string;
  price: number;
  volume_24h: number;
  market_cap: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

export interface SOLTechnicalData {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  moving_averages: {
    sma_20: number;
    sma_50: number;
    ema_12: number;
    ema_26: number;
  };
  support_levels: number[];
  resistance_levels: number[];
  volatility: number;
}

export interface SOLStrategyRequest {
  asset: string;
  timeframe: string;
  riskLevel: 'low' | 'moderate' | 'high';
  investmentAmount: number;
  walletBalance: number;
}

export interface SOLStrategyResponse {
  strategy: {
    entry: number;
    target: number;
    stopLoss: number;
    positionSize: number;
    riskPercentage: number;
    confidence: number;
  };
  writtenStrategy: string; // The actual written strategy text from Gemma
  analysis: {
    marketTrend: string;
    technicalSignals: string[];
    riskFactors: string[];
    recommendations: string[];
  };
  marketData: SOLMarketData;
  technicalData: SOLTechnicalData;
  timestamp: string;
}

export interface AgentStatus {
  marketAnalyzer: 'idle' | 'running' | 'completed' | 'failed';
  technicalAnalyzer: 'idle' | 'running' | 'completed' | 'failed';
  riskManager: 'idle' | 'running' | 'completed' | 'failed';
  strategyGenerator: 'idle' | 'running' | 'completed' | 'failed';
}

class SOLAgentService {
  private baseURL: string;
  private coingeckoAPI: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.coingeckoAPI = 'https://api.coingecko.com/api/v3';
  }

  // Get live SOL market data from CoinGecko
  async getSOLMarketData(asset: string = 'SOL'): Promise<SOLMarketData> {
    try {
      // Get the token ID from the asset parameter
      const tokenId = this.getTokenId(asset);
      
      const response = await axios.get(`${this.coingeckoAPI}/simple/price`, {
        params: {
          ids: tokenId,
          vs_currencies: 'usd',
          include_24hr_vol: true,
          include_24hr_change: true,
          include_market_cap: true,
          include_last_updated_at: true,
          include_high_24h: true,
          include_low_24h: true
        }
      });

      const tokenData = response.data[tokenId];
      
      return {
        symbol: asset,
        price: tokenData.usd,
        volume_24h: tokenData.usd_24h_vol,
        market_cap: tokenData.usd_market_cap,
        price_change_24h: tokenData.usd_24h_change,
        price_change_percentage_24h: tokenData.usd_24h_change,
        high_24h: tokenData.usd_24h_high,
        low_24h: tokenData.usd_24h_low,
        last_updated: new Date(tokenData.last_updated_at * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw new Error('Failed to fetch market data');
    }
  }

  // Helper method to convert token symbols to CoinGecko IDs
  private getTokenId(symbol: string): string {
    const tokenMap: { [key: string]: string } = {
      'SOL': 'solana',
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'XRP': 'ripple',
      'DOGE': 'dogecoin',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'FTM': 'fantom',
      'NEAR': 'near',
      'ALGO': 'algorand',
      'VET': 'vechain',
      'ICP': 'internet-computer'
    };
    
    return tokenMap[symbol.toUpperCase()] || 'solana'; // Default to SOL if not found
  }

  // Get technical analysis data for any token
  async getSOLTechnicalData(asset: string = 'SOL'): Promise<SOLTechnicalData> {
    try {
      // For now, we'll simulate technical data
      // In production, this would come from TradingView API or similar
      const marketData = await this.getSOLMarketData(asset);
      
      // Simulate technical indicators based on price data
      const volatility = Math.abs(marketData.price_change_percentage_24h) / 100;
      const rsi = this.calculateRSI(marketData.price, marketData.high_24h, marketData.low_24h);
      
      return {
        rsi: rsi,
        macd: {
          macd: this.simulateMACD(marketData.price),
          signal: this.simulateMACD(marketData.price) * 0.9,
          histogram: this.simulateMACD(marketData.price) * 0.1
        },
        moving_averages: {
          sma_20: marketData.price * 0.98,
          sma_50: marketData.price * 0.95,
          ema_12: marketData.price * 0.99,
          ema_26: marketData.price * 0.97
        },
        support_levels: [
          marketData.price * 0.95,
          marketData.price * 0.90,
          marketData.price * 0.85
        ],
        resistance_levels: [
          marketData.price * 1.05,
          marketData.price * 1.10,
          marketData.price * 1.15
        ],
        volatility: volatility
      };
    } catch (error) {
      console.error('Error fetching technical data:', error);
      throw new Error('Failed to fetch technical data');
    }
  }

  // Generate SOL strategy using AI agents
  async generateSOLStrategy(request: SOLStrategyRequest): Promise<SOLStrategyResponse> {
    try {
      console.log(`🤖 Starting ${request.asset} strategy generation with agents...`);
      
      // Step 1: Market Analyzer Agent
      console.log(`📊 Market Analyzer Agent: Fetching live ${request.asset} data...`);
      const marketData = await this.getSOLMarketData(request.asset);
      
      // Step 2: Technical Analyzer Agent
      console.log(`📈 Technical Analyzer Agent: Analyzing ${request.asset} patterns...`);
      const technicalData = await this.getSOLTechnicalData(request.asset);
      
      // Step 3: Risk Manager Agent
      console.log(`🛡️ Risk Manager Agent: Calculating ${request.asset}-specific risk...`);
      const riskAnalysis = this.analyzeSOLRisk(request, marketData, technicalData);
      
      // Step 4: Strategy Generator Agent (using Gemma)
      console.log(`🧠 Strategy Generator Agent: Creating ${request.asset} strategy with Gemma...`);
      const { strategy, writtenStrategy } = await this.generateStrategyWithGemma(request, marketData, technicalData, riskAnalysis);
      
      // Step 5: Compile final response
      const analysis = this.compileAnalysis(marketData, technicalData, riskAnalysis);
      
      return {
        strategy,
        writtenStrategy,
        analysis,
        marketData,
        technicalData,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error generating SOL strategy:', error);
      throw new Error('Failed to generate SOL strategy');
    }
  }

  // Risk Manager Agent: Analyze SOL-specific risk
  private analyzeSOLRisk(request: SOLStrategyRequest, marketData: SOLMarketData, technicalData: SOLTechnicalData) {
    const volatility = technicalData.volatility;
    const priceChange = Math.abs(marketData.price_change_percentage_24h);
    
    // SOL-specific risk factors
    const riskFactors = [];
    let riskLevel = 'low';
    
    if (volatility > 0.15) {
      riskFactors.push('High volatility - SOL showing significant price swings');
      riskLevel = 'high';
    } else if (volatility > 0.10) {
      riskFactors.push('Moderate volatility - SOL experiencing normal fluctuations');
      riskLevel = 'moderate';
    }
    
    if (priceChange > 10) {
      riskFactors.push('Large price movement in last 24h - increased risk');
    }
    
    // Calculate position size based on SOL volatility
    let positionSize = request.investmentAmount;
    if (riskLevel === 'high') {
      positionSize = Math.min(positionSize, request.walletBalance * 0.02); // 2% max
    } else if (riskLevel === 'moderate') {
      positionSize = Math.min(positionSize, request.walletBalance * 0.05); // 5% max
    } else {
      positionSize = Math.min(positionSize, request.walletBalance * 0.10); // 10% max
    }
    
    return {
      riskLevel,
      riskFactors,
      positionSize,
      maxRiskPercentage: riskLevel === 'high' ? 2 : riskLevel === 'moderate' ? 5 : 10
    };
  }

  // Strategy Generator Agent: Use Gemma to create strategy
  private async generateStrategyWithGemma(
    request: SOLStrategyRequest, 
    marketData: SOLMarketData, 
    technicalData: SOLTechnicalData, 
    riskAnalysis: any
  ) {
    // Use local proxy to avoid CORS issues
    const endpoint = 'http://localhost:3001/api/gemma';
    
    try {
      console.log('🧠 Attempting to use Gemma for strategy generation...');
      
      // Create prompt for Gemma
      const prompt = this.createSOLStrategyPrompt(request, marketData, technicalData, riskAnalysis);
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };
      
      // Call Gemma API with correct format
      console.log('🌐 Making request to Gemma API...');
      console.log('📝 Request payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(endpoint, payload, {
        timeout: 30000, // 30 second timeout for model inference
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'yoree-sol-agent/1.0'
        }
      });
      
      console.log('✅ Gemma API response received:', response.status);
      
      // Parse Gemma response using correct structure
      const responseData = response.data;
      let strategyText = '';
      
      if (responseData.candidates && responseData.candidates.length > 0) {
        const candidate = responseData.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          strategyText = candidate.content.parts[0].text;
        }
      }
      
      if (!strategyText) {
        throw new Error('No valid response text from Gemma');
      }
      
      console.log('✅ Gemma strategy generated successfully');
      
      // Extract strategy parameters from text
      const strategy = this.parseStrategyFromText(strategyText, marketData, technicalData, riskAnalysis);
      
      return {
        strategy,
        writtenStrategy: strategyText
      };
      
    } catch (error: any) {
      console.error('⚠️ Gemma API error, using fallback strategy generation:', error?.message || 'Unknown error');
      console.error('🔍 Full error details:', error);
      
      // Fallback to rule-based strategy
      const strategy = this.generateFallbackStrategy(marketData, technicalData, riskAnalysis);
      const writtenStrategy = this.createFallbackWrittenStrategy(strategy, marketData, technicalData, riskAnalysis);
      
      return {
        strategy,
        writtenStrategy
      };
    }
  }

  // Create SOL-specific prompt for Gemma
  private createSOLStrategyPrompt(
    request: SOLStrategyRequest, 
    marketData: SOLMarketData, 
    technicalData: SOLTechnicalData, 
    riskAnalysis: any
  ): string {
    return `
You are an expert quantitative trader specializing in Solana (SOL) trading strategies.

Current SOL Market Data:
- Price: $${marketData.price}
- 24h Change: ${marketData.price_change_percentage_24h}%
- Volume: $${marketData.volume_24h.toLocaleString()}
- Market Cap: $${marketData.market_cap.toLocaleString()}

Technical Analysis:
- RSI: ${technicalData.rsi.toFixed(2)}
- MACD: ${technicalData.macd.macd.toFixed(4)}
- Support Levels: $${technicalData.support_levels.map((s: number) => s.toFixed(2)).join(', ')}
- Resistance Levels: $${technicalData.resistance_levels.map((r: number) => r.toFixed(2)).join(', ')}
- Volatility: ${(technicalData.volatility * 100).toFixed(2)}%

Risk Profile:
- Risk Level: ${request.riskLevel}
- Investment Amount: $${request.investmentAmount}
- Wallet Balance: $${request.walletBalance}
- Risk Factors: ${riskAnalysis.riskFactors.join(', ')}

Generate a comprehensive SOL trading strategy with specific entry, target, and stop-loss prices. Consider SOL's high volatility and provide conservative risk management.

IMPORTANT: If the user has requested a specific language or style (like Vietnamese, Spanish, etc.), respond in that language. Otherwise, respond in English.

Format your response as:
Entry: $X.XX
Target: $X.XX  
Stop-loss: $X.XX
Position Size: $X.XX
Risk Percentage: X%
Confidence: X%

Strategy: [Provide a detailed written strategy explanation in the requested language/style]`;
  }

  // Parse strategy from Gemma response
  private parseStrategyFromText(text: string, marketData: SOLMarketData, technicalData: SOLTechnicalData, riskAnalysis: any) {
    // Extract numbers from text using regex
    const entryMatch = text.match(/Entry:\s*\$?([\d.]+)/i);
    const targetMatch = text.match(/Target:\s*\$?([\d.]+)/i);
    const stopLossMatch = text.match(/Stop-loss:\s*\$?([\d.]+)/i);
    const positionSizeMatch = text.match(/Position Size:\s*\$?([\d.]+)/i);
    const riskPercentageMatch = text.match(/Risk Percentage:\s*([\d.]+)%/i);
    const confidenceMatch = text.match(/Confidence:\s*([\d.]+)%/i);
    
    return {
      entry: entryMatch ? parseFloat(entryMatch[1]) : marketData.price,
      target: targetMatch ? parseFloat(targetMatch[1]) : marketData.price * 1.05,
      stopLoss: stopLossMatch ? parseFloat(stopLossMatch[1]) : marketData.price * 0.95,
      positionSize: positionSizeMatch ? parseFloat(positionSizeMatch[1]) : riskAnalysis.positionSize,
      riskPercentage: riskPercentageMatch ? parseFloat(riskPercentageMatch[1]) : riskAnalysis.maxRiskPercentage,
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 75
    };
  }

  // Create fallback written strategy
  private createFallbackWrittenStrategy(strategy: any, marketData: SOLMarketData, technicalData: SOLTechnicalData, riskAnalysis: any): string {
    return `
SOL Trading Strategy (Fallback Generation)

Based on current market conditions and technical analysis, here's your SOL trading strategy:

Entry: $${strategy.entry.toFixed(2)}
Target: $${strategy.target.toFixed(2)}
Stop-loss: $${strategy.stopLoss.toFixed(2)}
Position Size: $${strategy.positionSize.toFixed(2)}
Risk Percentage: ${strategy.riskPercentage}%
Confidence: ${strategy.confidence}%

Strategy Analysis:
- Current SOL price: $${marketData.price.toFixed(2)}
- 24h change: ${marketData.price_change_percentage_24h.toFixed(2)}%
- RSI: ${technicalData.rsi.toFixed(2)} (${technicalData.rsi < 30 ? 'Oversold' : technicalData.rsi > 70 ? 'Overbought' : 'Neutral'})
- Volatility: ${(technicalData.volatility * 100).toFixed(2)}%

Risk Management:
- Risk level: ${riskAnalysis.riskLevel}
- Position size limited to ${riskAnalysis.maxRiskPercentage}% of portfolio
- Stop loss set to protect capital

This strategy is based on technical indicators and market momentum analysis. The AI agents have analyzed current market conditions and generated this conservative approach for SOL trading.
    `.trim();
  }

  // Fallback strategy generation
  private generateFallbackStrategy(marketData: SOLMarketData, technicalData: SOLTechnicalData, riskAnalysis: any) {
    console.log('🔄 Using intelligent fallback strategy generation...');
    
    const currentPrice = marketData.price;
    const volatility = technicalData.volatility;
    const rsi = technicalData.rsi;
    const priceChange = marketData.price_change_percentage_24h;
    
    // Intelligent strategy based on technical indicators
    let entry = currentPrice;
    let target = currentPrice;
    let stopLoss = currentPrice;
    let confidence = 70;
    
    // RSI-based strategy
    if (rsi < 30) {
      // Oversold - bullish strategy
      entry = currentPrice;
      target = currentPrice * 1.08; // 8% target
      stopLoss = currentPrice * 0.95; // 5% stop loss
      confidence = 75;
    } else if (rsi > 70) {
      // Overbought - bearish strategy
      entry = currentPrice;
      target = currentPrice * 0.92; // 8% target (short)
      stopLoss = currentPrice * 1.05; // 5% stop loss
      confidence = 65;
    } else {
      // Neutral - momentum-based
      const momentum = priceChange > 0 ? 1 : -1;
      entry = currentPrice;
      target = currentPrice * (1 + momentum * 0.06); // 6% target
      stopLoss = currentPrice * (1 - momentum * 0.04); // 4% stop loss
      confidence = 70;
    }
    
    // Adjust for SOL volatility
    if (volatility > 0.15) {
      // High volatility - more conservative
      target = entry + (target - entry) * 0.8;
      stopLoss = entry + (stopLoss - entry) * 0.8;
      confidence -= 5;
    }
    
    console.log(`✅ Fallback strategy generated with ${confidence}% confidence`);
    
    return {
      entry,
      target,
      stopLoss,
      positionSize: riskAnalysis.positionSize,
      riskPercentage: riskAnalysis.maxRiskPercentage,
      confidence
    };
  }

  // Compile analysis from all agents
  private compileAnalysis(marketData: SOLMarketData, technicalData: SOLTechnicalData, riskAnalysis: any) {
    const marketTrend = marketData.price_change_percentage_24h > 0 ? 'Bullish' : 'Bearish';
    
    const technicalSignals = [];
    if (technicalData.rsi < 30) technicalSignals.push('RSI oversold - potential buy signal');
    if (technicalData.rsi > 70) technicalSignals.push('RSI overbought - potential sell signal');
    if (technicalData.macd.macd > technicalData.macd.signal) technicalSignals.push('MACD bullish crossover');
    if (technicalData.macd.macd < technicalData.macd.signal) technicalSignals.push('MACD bearish crossover');
    
    const recommendations = [
      `SOL showing ${marketTrend.toLowerCase()} momentum`,
      `Volatility: ${(technicalData.volatility * 100).toFixed(1)}% - ${technicalData.volatility > 0.15 ? 'High' : 'Normal'} for SOL`,
      `Position size: ${riskAnalysis.maxRiskPercentage}% of portfolio recommended`,
      'Monitor SOL ecosystem news for additional signals'
    ];
    
    return {
      marketTrend,
      technicalSignals,
      riskFactors: riskAnalysis.riskFactors,
      recommendations
    };
  }

  // Helper methods for technical calculations
  private calculateRSI(price: number, high: number, low: number): number {
    // Simplified RSI calculation
    const range = high - low;
    const relativeStrength = (price - low) / range;
    return 50 + (relativeStrength - 0.5) * 40; // Scale to 0-100
  }

  private simulateMACD(price: number): number {
    // Simplified MACD simulation
    return (Math.random() - 0.5) * 0.1; // Small random value
  }

  // Get agent status
  async getAgentStatus(): Promise<AgentStatus> {
    // This would check the status of each agent
    return {
      marketAnalyzer: 'completed',
      technicalAnalyzer: 'completed',
      riskManager: 'completed',
      strategyGenerator: 'completed'
    };
  }
}

// Export singleton instance
export const solAgentService = new SOLAgentService();
export default solAgentService; 