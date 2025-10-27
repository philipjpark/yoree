import axios from 'axios';

export interface RiskAgentRequest {
  token: string;
  investmentAmount: number;
  walletBalance: number;
  riskLevel: 'low' | 'moderate' | 'high';
  marketData?: {
    price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    volume_24h: number;
  };
  sentimentData?: any;
  technicalData?: any;
}

export interface RiskAgentResponse {
  strategy: {
    entry: number;
    target: number;
    stopLoss: number;
    positionSize: number;
    confidence: number;
    reasoning: string;
  };
  analysis: {
    technical: string;
    fundamental: string;
    risk: string;
    market: string;
  };
  recommendations: string[];
  warnings: string[];
  riskMetrics: {
    valueAtRisk: number;
    expectedShortfall: number;
    maximumDrawdown: number;
    sharpeRatio: number;
    sortinoRatio: number;
  };
  riskFactors: {
    marketRisk: {
      volatility: number;
      correlation: number;
      systemicRisk: number;
    };
    liquidityRisk: {
      bidAskSpread: number;
      marketDepth: number;
      slippageRisk: number;
    };
    operationalRisk: {
      exchangeRisk: number;
      custodyRisk: number;
      regulatoryRisk: number;
    };
    concentrationRisk: {
      portfolioConcentration: number;
      sectorConcentration: number;
      geographicConcentration: number;
    };
  };
  detailedAnalysis: string;
}

class RiskAgentService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.error('❌ OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY in .env file');
      throw new Error('OpenAI API key is required');
    }
  }

  async analyzeRisk(request: RiskAgentRequest): Promise<RiskAgentResponse> {
    console.log('🛡️ Risk Agent: Starting comprehensive risk analysis...');

    const prompt = `# STRATEGY GENERATOR AGENT

You are a specialized AI agent that combines risk management with strategy generation. Your role is to create a complete trading strategy for ${request.token} by synthesizing sentiment and technical analysis with comprehensive risk management.

## TRADING PARAMETERS
- **Token**: ${request.token}
- **Investment Amount**: $${request.investmentAmount}
- **Wallet Balance**: $${request.walletBalance}
- **Risk Level**: ${request.riskLevel}

## MARKET DATA
${request.marketData ? `
- **Current Price**: $${request.marketData.price}
- **24h Change**: ${request.marketData.price_change_percentage_24h}%
- **Market Cap**: $${(request.marketData.market_cap / 1000000000).toFixed(2)}B
- **24h Volume**: $${(request.marketData.volume_24h / 1000000).toFixed(2)}M
` : 'Market data not available'}

## PREVIOUS AGENT ANALYSIS
${request.sentimentData ? `Sentiment Analysis: ${JSON.stringify(request.sentimentData, null, 2)}` : 'No sentiment data available'}
${request.technicalData ? `Technical Analysis: ${JSON.stringify(request.technicalData, null, 2)}` : 'No technical data available'}

## YOUR TASK
Generate a complete trading strategy by:

1. **Synthesizing Analysis**: Combine sentiment and technical analysis
2. **Risk Management**: Calculate optimal position sizing and risk parameters
3. **Strategy Creation**: Generate specific entry, target, and stop-loss levels
4. **Comprehensive Analysis**: Provide technical, fundamental, risk, and market analysis
5. **Actionable Recommendations**: Create specific trading recommendations
6. **Risk Warnings**: Include critical risk warnings

## REQUIRED OUTPUT FORMAT
Return ONLY valid JSON in this exact format:

\`\`\`json
{
  "strategy": {
    "entry": number,
    "target": number,
    "stopLoss": number,
    "positionSize": number,
    "confidence": 0.0 to 1.0,
    "reasoning": "comprehensive 200+ word strategy reasoning"
  },
  "analysis": {
    "technical": "synthesized technical analysis",
    "fundamental": "fundamental analysis based on token utility and adoption",
    "risk": "comprehensive risk assessment",
    "market": "market conditions and sentiment analysis"
  },
  "recommendations": [
    "specific recommendation 1",
    "specific recommendation 2",
    "specific recommendation 3"
  ],
  "warnings": [
    "critical warning 1",
    "critical warning 2",
    "critical warning 3"
  ],
  "riskMetrics": {
    "valueAtRisk": number,
    "expectedShortfall": number,
    "maximumDrawdown": number,
    "sharpeRatio": number,
    "sortinoRatio": number
  },
  "riskFactors": {
    "marketRisk": {
      "volatility": 0 to 100,
      "correlation": -1 to 1,
      "systemicRisk": 0 to 100
    },
    "liquidityRisk": {
      "bidAskSpread": 0 to 100,
      "marketDepth": 0 to 100,
      "slippageRisk": 0 to 100
    },
    "operationalRisk": {
      "exchangeRisk": 0 to 100,
      "custodyRisk": 0 to 100,
      "regulatoryRisk": 0 to 100
    },
    "concentrationRisk": {
      "portfolioConcentration": 0 to 100,
      "sectorConcentration": 0 to 100,
      "geographicConcentration": 0 to 100
    }
  },
  "detailedAnalysis": "comprehensive 200+ word analysis"
}
\`\`\`

## ANALYSIS REQUIREMENTS
- Synthesize sentiment and technical analysis into coherent strategy
- Calculate realistic risk metrics and position sizing
- Provide specific, actionable entry/exit levels
- Include comprehensive analysis of all aspects
- Create specific trading recommendations
- Include critical risk warnings
- Base analysis on current market conditions and provided data

Generate a complete, actionable trading strategy that synthesizes all previous analyses.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a specialized cryptocurrency risk management AI agent. Always respond with valid JSON only.'
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
      console.log('🔍 Risk Agent Raw Response:', generatedText);
      
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
        console.log('✅ Risk Agent: Analysis completed');
        return parsed as RiskAgentResponse;
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ JSON Text:', jsonText);
        
        // Create a fallback response if parsing fails
        const fallbackResponse: RiskAgentResponse = {
          strategy: {
            entry: 0,
            target: 0,
            stopLoss: 0,
            positionSize: 1000,
            confidence: 0.5,
            reasoning: 'Strategy generation failed to parse properly. Using fallback data.'
          },
          analysis: {
            technical: 'Strategy generation failed to parse properly. Using fallback data.',
            fundamental: 'Strategy generation failed to parse properly. Using fallback data.',
            risk: 'Strategy generation failed to parse properly. Using fallback data.',
            market: 'Strategy generation failed to parse properly. Using fallback data.'
          },
          recommendations: ['Strategy generation failed - using fallback'],
          warnings: ['Strategy generation failed - using fallback'],
          riskMetrics: { valueAtRisk: 100, expectedShortfall: 150, maximumDrawdown: 200, sharpeRatio: 1.0, sortinoRatio: 1.2 },
          riskFactors: {
            marketRisk: { volatility: 50, correlation: 0.5, systemicRisk: 50 },
            liquidityRisk: { bidAskSpread: 50, marketDepth: 50, slippageRisk: 50 },
            operationalRisk: { exchangeRisk: 50, custodyRisk: 50, regulatoryRisk: 50 },
            concentrationRisk: { portfolioConcentration: 50, sectorConcentration: 50, geographicConcentration: 50 }
          },
          detailedAnalysis: 'Strategy generation failed to parse properly. Using fallback data.'
        };
        
        console.log('⚠️ Using fallback risk analysis response');
        return fallbackResponse;
      }
    } catch (error: any) {
      console.error('❌ Risk Agent Error:', error);
      throw new Error(`Risk analysis failed: ${error.message}`);
    }
  }
}

export default new RiskAgentService();
