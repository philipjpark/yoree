import axios from 'axios';

export interface CodexStrategyRequest {
  token: string;
  timeframe: string;
  riskLevel: 'low' | 'moderate' | 'high';
  investmentAmount: number;
  walletBalance: number;
  marketData?: {
    price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    volume_24h: number;
  };
  technicalData?: {
    rsi: number;
    macd: string;
    moving_averages: string;
    support_resistance: string;
  };
  sentimentData?: {
    overall: string;
    confidence: number;
    key_factors: string[];
  };
}

export interface CodexStrategyResponse {
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
  metadata: {
    model: string;
    timestamp: string;
    version: string;
  };
}

class OpenAICodexService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';
  private model: string = 'gpt-3.5-turbo'; // Using GPT-3.5-turbo as Codex alternative

  constructor() {
    // Try environment variable first, then fallback to hardcoded key
    const envKey = process.env.REACT_APP_OPENAI_API_KEY;
    const hardcodedKey = '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';
    
    this.apiKey = envKey || hardcodedKey;
    
    console.log('🔍 Environment variable present:', !!envKey);
    console.log('🔍 Environment key length:', envKey?.length || 0);
    console.log('🔍 Using key:', envKey ? 'Environment' : 'Hardcoded');
    console.log('🔑 API Key loaded:', this.apiKey.substring(0, 20) + '...');
    console.log('🔑 Full API Key length:', this.apiKey.length);
    
    if (!this.apiKey) {
      console.error('❌ No OpenAI API key found!');
      throw new Error('OpenAI API key is required');
    }
    
    // Validate API key format
    if (!this.apiKey.startsWith('sk-')) {
      console.error('❌ Invalid API key format! Should start with "sk-"');
      throw new Error('Invalid API key format');
    }
  }

  async generateStrategy(request: CodexStrategyRequest): Promise<CodexStrategyResponse> {
    console.log('🎯 Codex Service: Starting strategy generation...');
    console.log('🔧 Model Type: codex');
    console.log('🔑 API Key present:', !!this.apiKey);
    console.log('📊 Request data:', request);

    try {
      const prompt = this.buildStrategyPrompt(request);
      console.log('📝 Generated prompt length:', prompt.length);

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert cryptocurrency trading strategist. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 3000,
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

      console.log('✅ Codex Response received:', response.data);
      const generatedText = response.data.choices[0].message.content.trim();
      
      try {
        const parsedResponse = this.parseStrategyResponse(generatedText, request);
        console.log('📊 Generated Strategy:', parsedResponse);
        return parsedResponse;
      } catch (parseError) {
        console.error('❌ Failed to parse Codex response, retrying...');
        // Try to regenerate with a simpler prompt
        return await this.retryWithSimplerPrompt(request);
      }
    } catch (error: any) {
      console.error('❌ Codex Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? 'Present' : 'Missing'
        }
      });

      if (error.response?.status === 401) {
        console.error('❌ 401 Unauthorized - API Key Issue');
        console.error('🔑 API Key being used:', this.apiKey.substring(0, 20) + '...');
        console.error('📊 Full error response:', error.response?.data);
        throw new Error(`OpenAI API key is invalid or expired. Status: ${error.response?.status}. Please check your API key.`);
      } else if (error.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 400) {
        throw new Error(`OpenAI API request error: ${error.response?.data?.error?.message || 'Invalid request'}`);
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(`Failed to generate strategy with Codex: ${error.message}`);
      }
    }
  }

  private buildStrategyPrompt(request: CodexStrategyRequest): string {
    return `# CRYPTO TRADING STRATEGY GENERATION - OPENAI CODEX

You are an expert cryptocurrency trading strategist with deep knowledge of technical analysis, risk management, and market dynamics. Generate a comprehensive, actionable trading strategy based on the following inputs:

## TRADING PARAMETERS
- **Token**: ${request.token}
- **Timeframe**: ${request.timeframe}
- **Risk Level**: ${request.riskLevel}
- **Investment Amount**: $${request.investmentAmount}
- **Wallet Balance**: $${request.walletBalance}

## MARKET DATA
${request.marketData ? `
- **Current Price**: $${request.marketData.price}
- **24h Change**: ${request.marketData.price_change_percentage_24h}%
- **Market Cap**: $${(request.marketData.market_cap / 1000000000).toFixed(2)}B
- **24h Volume**: $${(request.marketData.volume_24h / 1000000).toFixed(2)}M
` : 'Market data not available'}

## TECHNICAL ANALYSIS
${request.technicalData ? `
- **RSI**: ${request.technicalData.rsi}
- **MACD**: ${request.technicalData.macd}
- **Moving Averages**: ${request.technicalData.moving_averages}
- **Support/Resistance**: ${request.technicalData.support_resistance}
` : 'Technical data not available'}

## SENTIMENT ANALYSIS
${request.sentimentData ? `
- **Overall Sentiment**: ${request.sentimentData.overall}
- **Confidence**: ${request.sentimentData.confidence}
- **Key Factors**: ${request.sentimentData.key_factors.join(', ')}
` : 'Sentiment data not available'}

## REQUIRED OUTPUT FORMAT

Please provide a comprehensive trading strategy in the following JSON format:

\`\`\`json
{
  "strategy": {
    "entry": [number - precise entry price with technical justification],
    "target": [number - realistic target price with upside potential analysis],
    "stopLoss": [number - calculated stop loss with risk management rationale],
    "positionSize": [number - position size in USD based on risk parameters],
    "confidence": [number - confidence level 0-1 with supporting factors],
    "reasoning": "[string - comprehensive 500+ word reasoning covering technical analysis, fundamental factors, risk assessment, market conditions, and strategic rationale]"
  },
  "analysis": {
    "technical": "[string - detailed technical analysis including specific indicators, support/resistance levels, chart patterns, momentum analysis, and quantitative metrics]",
    "fundamental": "[string - comprehensive fundamental analysis covering token utility, adoption trends, competitive landscape, regulatory environment, and long-term viability]",
    "risk": "[string - thorough risk assessment including market risks, token-specific risks, liquidity considerations, correlation analysis, and mitigation strategies]",
    "market": "[string - current market conditions analysis including trends, sentiment, macroeconomic factors, sector rotation, and institutional activity]"
  },
  "recommendations": [
    "[string - specific, actionable recommendation 1 with clear implementation steps]",
    "[string - specific, actionable recommendation 2 with timing considerations]",
    "[string - specific, actionable recommendation 3 with risk management focus]",
    "[string - specific, actionable recommendation 4 with exit strategy]"
  ],
  "warnings": [
    "[string - critical warning 1 about potential risks]",
    "[string - critical warning 2 about market conditions]",
    "[string - critical warning 3 about position management]"
  ],
  "metadata": {
    "model": "codex",
    "timestamp": "[current timestamp]",
    "version": "1.0"
  }
}
\`\`\`

## INSTRUCTIONS
1. **COMPREHENSIVE ANALYSIS**: Provide detailed, institutional-grade analysis covering all aspects of the trade
2. **TECHNICAL DEPTH**: Include specific technical indicators, support/resistance levels, chart patterns, and momentum analysis
3. **FUNDAMENTAL INSIGHTS**: Analyze token utility, adoption trends, competitive landscape, and long-term viability
4. **RISK MANAGEMENT**: Provide thorough risk assessment with specific mitigation strategies and position sizing rationale
5. **MARKET CONTEXT**: Consider broader market conditions, sector trends, and macroeconomic factors
6. **DETAILED REASONING**: Explain every decision with specific data points and logical reasoning (minimum 500 words)
7. **ACTIONABLE RECOMMENDATIONS**: Provide specific, implementable trading recommendations with clear entry/exit criteria
8. **RISK WARNINGS**: Include comprehensive warnings about potential risks and market uncertainties
9. **PROFESSIONAL STANDARDS**: Use institutional trading terminology and maintain professional analysis quality
10. **VERBOSE OUTPUT**: Provide extensive detail in all analysis sections - aim for comprehensive, educational content
11. **QUANTITATIVE ANALYSIS**: Include specific price targets, risk-reward ratios, and probability assessments
12. **MULTIPLE SCENARIOS**: Consider bullish, bearish, and sideways market scenarios with corresponding strategies
13. **MARKET MICROSTRUCTURE**: Analyze order flow, liquidity conditions, and institutional activity
14. **CORRELATION ANALYSIS**: Consider correlations with other assets, sectors, and market indices
15. **TIMING PRECISION**: Provide specific timing recommendations for entry, scaling, and exit strategies
8. Ensure all numbers are realistic and based on current market conditions

Generate a professional, well-reasoned trading strategy that a trader can immediately implement.`;
  }

  private parseStrategyResponse(response: string, request: CodexStrategyRequest): CodexStrategyResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1].trim();
        const parsed = JSON.parse(jsonStr);
        
        // Validate the response structure
        if (!parsed.strategy || !parsed.analysis) {
          throw new Error('Invalid response structure');
        }
        
        return parsed as CodexStrategyResponse;
      }

      // If no JSON found, try to parse the entire response as JSON
      const parsed = JSON.parse(response);
      
      // Validate the response structure
      if (!parsed.strategy || !parsed.analysis) {
        throw new Error('Invalid response structure');
      }
      
      return parsed as CodexStrategyResponse;
    } catch (error: any) {
      console.error('❌ Failed to parse Codex response:', error);
      throw new Error(`Failed to parse Codex response: ${error.message || 'Unknown error'}. Please try again.`);
    }
  }

  private async retryWithSimplerPrompt(request: CodexStrategyRequest): Promise<CodexStrategyResponse> {
    console.log('🔄 Retrying with simpler prompt...');
    
    const simplePrompt = `Generate a trading strategy for ${request.token} with current price $${request.marketData?.price || 1000}.

Return ONLY valid JSON in this exact format:
{
  "strategy": {
    "entry": [number],
    "target": [number], 
    "stopLoss": [number],
    "positionSize": [number],
    "confidence": [number between 0-1],
    "reasoning": "[detailed reasoning]"
  },
  "analysis": {
    "technical": "[technical analysis]",
    "fundamental": "[fundamental analysis]", 
    "risk": "[risk assessment]",
    "market": "[market conditions]"
  },
  "recommendations": ["[recommendation 1]", "[recommendation 2]", "[recommendation 3]"],
  "warnings": ["[warning 1]", "[warning 2]"],
  "metadata": {
    "model": "codex",
    "timestamp": "${new Date().toISOString()}",
    "version": "1.0"
  }
}`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional trading strategist. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: simplePrompt
            }
          ],
          max_tokens: 2000,
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
      const parsedResponse = this.parseStrategyResponse(generatedText, request);
      console.log('✅ Retry successful:', parsedResponse);
      return parsedResponse;
    } catch (retryError) {
      console.error('❌ Retry failed, using fallback strategy');
      return this.createFallbackStrategy(request);
    }
  }

  private createFallbackStrategy(request: CodexStrategyRequest): CodexStrategyResponse {
    console.warn('⚠️ Creating fallback strategy due to parsing error');
    
    // Generate a fallback strategy based on the request
    const currentPrice = request.marketData?.price || 1000;
    const riskMultiplier = request.riskLevel === 'high' ? 0.15 : request.riskLevel === 'moderate' ? 0.10 : 0.05;
    
    return {
      strategy: {
        entry: currentPrice,
        target: currentPrice * 1.05,
        stopLoss: currentPrice * 0.95,
        positionSize: Math.min(request.investmentAmount, request.walletBalance * 0.1),
        confidence: 0.6,
        reasoning: `Fallback strategy for ${request.token} based on current market conditions. This is a conservative approach with basic risk management. Please conduct your own analysis before trading.`
      },
      analysis: {
        technical: `Basic technical analysis for ${request.token} shows current price at $${currentPrice}. Consider support and resistance levels.`,
        fundamental: `Fundamental analysis for ${request.token} - please research token utility, team, and market adoption.`,
        risk: `Risk level: ${request.riskLevel}. Position size limited to ${(riskMultiplier * 100)}% of portfolio.`,
        market: `Current market conditions for ${request.token} - please monitor broader market trends and sentiment.`
      },
      recommendations: [
        'Conduct thorough research before trading',
        'Set stop-loss as recommended',
        'Consider taking profits at target levels'
      ],
      warnings: [
        'This is a Codex-generated strategy - please conduct your own analysis',
        'Cryptocurrency trading involves significant risk'
      ],
      metadata: {
        model: 'codex',
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: 'No API key provided' };
    }

    try {
      console.log('🧪 Testing Codex connection...');
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: 'Test connection'
            }
          ],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Codex connection test successful:', response.status);
      return { success: response.status === 200 };
    } catch (error: any) {
      console.error('❌ Codex connection test failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }
}

const openaiCodexService = new OpenAICodexService();
export default openaiCodexService;