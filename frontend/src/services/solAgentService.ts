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
  async getSOLMarketData(): Promise<SOLMarketData> {
    try {
      const response = await axios.get(`${this.coingeckoAPI}/simple/price`, {
        params: {
          ids: 'solana',
          vs_currencies: 'usd',
          include_24hr_vol: true,
          include_24hr_change: true,
          include_market_cap: true,
          include_last_updated_at: true,
          include_high_24h: true,
          include_low_24h: true
        }
      });

      const solData = response.data.solana;
      
      return {
        symbol: 'SOL',
        price: solData.usd,
        volume_24h: solData.usd_24h_vol,
        market_cap: solData.usd_market_cap,
        price_change_24h: solData.usd_24h_change,
        price_change_percentage_24h: solData.usd_24h_change,
        high_24h: solData.usd_24h_high,
        low_24h: solData.usd_24h_low,
        last_updated: new Date(solData.last_updated_at * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error fetching SOL market data:', error);
      throw new Error('Failed to fetch SOL market data');
    }
  }

  // Get SOL technical analysis data
  async getSOLTechnicalData(): Promise<SOLTechnicalData> {
    try {
      // For now, we'll simulate technical data
      // In production, this would come from TradingView API or similar
      const marketData = await this.getSOLMarketData();
      
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
      console.error('Error fetching SOL technical data:', error);
      throw new Error('Failed to fetch SOL technical data');
    }
  }

  // Generate SOL strategy using AI agents
  async generateSOLStrategy(request: SOLStrategyRequest): Promise<SOLStrategyResponse> {
    try {
      console.log('🤖 Starting SOL strategy generation with agents...');
      
      // Step 1: Market Analyzer Agent
      console.log('📊 Market Analyzer Agent: Fetching live SOL data...');
      const marketData = await this.getSOLMarketData();
      
      // Step 2: Technical Analyzer Agent
      console.log('📈 Technical Analyzer Agent: Analyzing SOL patterns...');
      const technicalData = await this.getSOLTechnicalData();
      
      // Step 3: Risk Manager Agent
      console.log('🛡️ Risk Manager Agent: Calculating SOL-specific risk...');
      const riskAnalysis = this.analyzeSOLRisk(request, marketData, technicalData);
      
      // Step 4: Strategy Generator Agent (using Gemma)
      console.log('🧠 Strategy Generator Agent: Creating SOL strategy with Gemma...');
      const strategy = await this.generateStrategyWithGemma(request, marketData, technicalData, riskAnalysis);
      
      // Step 5: Compile final response
      const analysis = this.compileAnalysis(marketData, technicalData, riskAnalysis);
      
      return {
        strategy,
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
    try {
      console.log('🧠 Attempting to use Gemma for strategy generation...');
      
      // Create prompt for Gemma
      const prompt = this.createSOLStrategyPrompt(request, marketData, technicalData, riskAnalysis);
      
      // Correct Gemma API endpoint and payload format
      const endpoint = 'https://yoree-gemma-827561407333.europe-west1.run.app/v1beta/models/gemma3:4b:generateContent';
      
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
      const response = await axios.post(endpoint, payload, {
        timeout: 30000, // 30 second timeout for model inference
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'yoree-sol-agent/1.0'
        }
      });
      
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
      return this.parseStrategyFromText(strategyText, marketData, technicalData, riskAnalysis);
      
    } catch (error: any) {
      console.error('⚠️ Gemma API error, using fallback strategy generation:', error?.message || 'Unknown error');
      // Fallback to rule-based strategy
      return this.generateFallbackStrategy(marketData, technicalData, riskAnalysis);
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
- Support Levels: $${technicalData.support_levels.map(s => s.toFixed(2)).join(', ')}
- Resistance Levels: $${technicalData.resistance_levels.map(r => r.toFixed(2)).join(', ')}
- Volatility: ${(technicalData.volatility * 100).toFixed(2)}%

Risk Profile:
- Risk Level: ${request.riskLevel}
- Investment Amount: $${request.investmentAmount}
- Wallet Balance: $${request.walletBalance}
- Risk Factors: ${riskAnalysis.riskFactors.join(', ')}

Generate a SOL trading strategy with specific entry, target, and stop-loss prices. Consider SOL's high volatility and provide conservative risk management.

Format your response as:
Entry: $X.XX
Target: $X.XX  
Stop-loss: $X.XX
Position Size: $X.XX
Risk Percentage: X%
Confidence: X%

Strategy:`;
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