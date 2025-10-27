import axios from 'axios';

export interface TechnicalAgentRequest {
  token: string;
  marketData?: {
    price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    volume_24h: number;
  };
}

export interface TechnicalAgentResponse {
  overallTrend: 'bullish' | 'bearish' | 'sideways';
  trendStrength: number; // 0 to 100
  confidence: number; // 0 to 1
  technicalIndicators: {
    rsi: {
      value: number;
      signal: 'overbought' | 'oversold' | 'neutral';
      strength: number;
    };
    macd: {
      macd: number;
      signal: number;
      histogram: number;
      trend: 'bullish' | 'bearish' | 'neutral';
    };
    movingAverages: {
      sma20: number;
      sma50: number;
      sma200: number;
      goldenCross: boolean;
      deathCross: boolean;
    };
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
      position: 'above' | 'below' | 'between';
      squeeze: boolean;
    };
    fibonacci: {
      retracement23: number;
      retracement38: number;
      retracement50: number;
      retracement61: number;
      currentLevel: string;
    };
  };
  supportResistance: {
    support: number[];
    resistance: number[];
    keyLevels: number[];
    strength: number;
  };
  chartPatterns: {
    pattern: string;
    reliability: number;
    target: number;
    stopLoss: number;
  }[];
  volumeAnalysis: {
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
    volumePriceConfirmation: boolean;
    accumulationDistribution: number;
  };
  momentumIndicators: {
    stoch: number;
    williamsR: number;
    cci: number;
    overallMomentum: 'strong' | 'weak' | 'neutral';
  };
  volatilityAnalysis: {
    atr: number;
    volatility: 'high' | 'medium' | 'low';
    volatilityTrend: 'increasing' | 'decreasing' | 'stable';
  };
  tradingSignals: {
    entry: number;
    target: number;
    stopLoss: number;
    signal: 'buy' | 'sell' | 'hold';
    strength: number;
    reasoning: string;
  };
  detailedAnalysis: string;
}

class TechnicalAgentService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.error('❌ OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY in .env file');
      throw new Error('OpenAI API key is required');
    }
  }

  async analyzeTechnical(request: TechnicalAgentRequest): Promise<TechnicalAgentResponse> {
    console.log('📈 Technical Agent: Starting comprehensive technical analysis...');

    const prompt = `# TECHNICAL ANALYSIS AGENT

You are a specialized AI agent focused exclusively on cryptocurrency technical analysis. Your role is to analyze price patterns, technical indicators, and chart formations for ${request.token}.

## MARKET DATA
${request.marketData ? `
- **Current Price**: $${request.marketData.price}
- **24h Change**: ${request.marketData.price_change_percentage_24h}%
- **Market Cap**: $${(request.marketData.market_cap / 1000000000).toFixed(2)}B
- **24h Volume**: $${(request.marketData.volume_24h / 1000000).toFixed(2)}M
` : 'Market data not available'}

## YOUR TASK
Perform comprehensive technical analysis for ${request.token} including:

1. **Trend Analysis**: Overall trend direction and strength
2. **Technical Indicators**: RSI, MACD, Moving Averages, Bollinger Bands, Fibonacci
3. **Support/Resistance**: Key price levels and their strength
4. **Chart Patterns**: Recognition of classic patterns (triangles, flags, head & shoulders, etc.)
5. **Volume Analysis**: Volume trends and price confirmation
6. **Momentum Indicators**: Stochastic, Williams %R, CCI
7. **Volatility Analysis**: ATR and volatility trends
8. **Trading Signals**: Entry, target, and stop-loss levels

## REQUIRED OUTPUT FORMAT
Return ONLY valid JSON in this exact format:

\`\`\`json
{
  "overallTrend": "bullish|bearish|sideways",
  "trendStrength": 0 to 100,
  "confidence": 0.0 to 1.0,
  "technicalIndicators": {
    "rsi": {
      "value": 0 to 100,
      "signal": "overbought|oversold|neutral",
      "strength": 0 to 100
    },
    "macd": {
      "macd": number,
      "signal": number,
      "histogram": number,
      "trend": "bullish|bearish|neutral"
    },
    "movingAverages": {
      "sma20": number,
      "sma50": number,
      "sma200": number,
      "goldenCross": boolean,
      "deathCross": boolean
    },
    "bollingerBands": {
      "upper": number,
      "middle": number,
      "lower": number,
      "position": "above|below|between",
      "squeeze": boolean
    },
    "fibonacci": {
      "retracement23": number,
      "retracement38": number,
      "retracement50": number,
      "retracement61": number,
      "currentLevel": "string"
    }
  },
  "supportResistance": {
    "support": [number, number, number],
    "resistance": [number, number, number],
    "keyLevels": [number, number, number],
    "strength": 0 to 100
  },
  "chartPatterns": [
    {
      "pattern": "string",
      "reliability": 0 to 100,
      "target": number,
      "stopLoss": number
    }
  ],
  "volumeAnalysis": {
    "volumeTrend": "increasing|decreasing|stable",
    "volumePriceConfirmation": boolean,
    "accumulationDistribution": number
  },
  "momentumIndicators": {
    "stoch": 0 to 100,
    "williamsR": -100 to 0,
    "cci": number,
    "overallMomentum": "strong|weak|neutral"
  },
  "volatilityAnalysis": {
    "atr": number,
    "volatility": "high|medium|low",
    "volatilityTrend": "increasing|decreasing|stable"
  },
  "tradingSignals": {
    "entry": number,
    "target": number,
    "stopLoss": number,
    "signal": "buy|sell|hold",
    "strength": 0 to 100,
    "reasoning": "detailed explanation"
  },
  "detailedAnalysis": "comprehensive 300+ word technical analysis"
}
\`\`\`

## ANALYSIS REQUIREMENTS
- Base analysis on current market conditions and price action
- Calculate realistic technical indicator values based on current price
- Identify key support and resistance levels
- Recognize classic chart patterns with reliability scores
- Analyze volume trends and their confirmation of price movements
- Provide specific entry, target, and stop-loss levels
- Consider multiple timeframes (1h, 4h, 1d, 1w)
- Include risk-reward ratio calculations

Generate a comprehensive technical analysis that will be used by other AI agents to build a complete trading strategy.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a specialized cryptocurrency technical analysis AI agent. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedText = response.data.choices[0].message.content.trim();
      console.log('🔍 Technical Agent Raw Response:', generatedText);
      
      // Try multiple JSON extraction methods
      let jsonText = '';
      
      // Method 1: Look for ```json blocks
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        // Method 2: Look for ``` blocks without json label
        const codeMatch = generatedText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonText = codeMatch[1];
        } else {
          // Method 3: Look for JSON object directly
          const directMatch = generatedText.match(/\{[\s\S]*\}/);
          if (directMatch) {
            jsonText = directMatch[0];
          } else {
            throw new Error('No JSON found in response');
          }
        }
      }
      
      console.log('🔍 Extracted JSON:', jsonText);
      
      try {
        const parsed = JSON.parse(jsonText);
        console.log('✅ Technical Agent: Analysis completed');
        return parsed as TechnicalAgentResponse;
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ JSON Text:', jsonText);
        
        // Create a fallback response if parsing fails
        const fallbackResponse: TechnicalAgentResponse = {
          overallTrend: 'sideways',
          trendStrength: 50,
          confidence: 0.5,
          technicalIndicators: {
            rsi: { value: 50, signal: 'neutral', strength: 50 },
            macd: { macd: 0, signal: 0, histogram: 0, trend: 'neutral' },
            movingAverages: { sma20: 0, sma50: 0, sma200: 0, goldenCross: false, deathCross: false },
            bollingerBands: { upper: 0, middle: 0, lower: 0, position: 'between', squeeze: false },
            fibonacci: { retracement23: 0, retracement38: 0, retracement50: 0, retracement61: 0, currentLevel: 'unknown' }
          },
          supportResistance: { support: [0], resistance: [0], keyLevels: [0], strength: 50 },
          chartPatterns: [],
          volumeAnalysis: { volumeTrend: 'stable', volumePriceConfirmation: false, accumulationDistribution: 0 },
          momentumIndicators: { stoch: 50, williamsR: -50, cci: 0, overallMomentum: 'neutral' },
          volatilityAnalysis: { atr: 0, volatility: 'medium', volatilityTrend: 'stable' },
          tradingSignals: { entry: 0, target: 0, stopLoss: 0, signal: 'hold', strength: 50, reasoning: 'Analysis failed - using fallback' },
          detailedAnalysis: 'Technical analysis failed to parse properly. Using fallback data.'
        };
        
        console.log('⚠️ Using fallback technical analysis response');
        return fallbackResponse;
      }
    } catch (error: any) {
      console.error('❌ Technical Agent Error:', error);
      throw new Error(`Technical analysis failed: ${error.message}`);
    }
  }
}

export default new TechnicalAgentService();
