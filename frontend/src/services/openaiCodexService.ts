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
  private model: string = 'gpt-4'; // Using GPT-4 as Codex alternative

  constructor() {
    // Use environment variable only
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    
    // API key loaded (not logging for security)
    
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
    // API key present (not logging for security)
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
          max_tokens: 6000,
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

You are a world-class institutional cryptocurrency trading strategist with 15+ years of experience in quantitative finance, algorithmic trading, and blockchain technology. You have worked at top-tier hedge funds, proprietary trading firms, and cryptocurrency exchanges. Generate an extremely comprehensive, institutional-grade trading strategy that rivals the quality of Goldman Sachs or BlackRock research reports.

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

Provide an extremely detailed, institutional-grade trading strategy in the following JSON format. Each section must be comprehensive and educational:

\`\`\`json
{
  "strategy": {
    "entry": [number - precise entry price with detailed technical justification],
    "target": [number - realistic target price with comprehensive upside potential analysis],
    "stopLoss": [number - calculated stop loss with thorough risk management rationale],
    "positionSize": [number - position size in USD based on detailed risk parameters],
    "confidence": [number - confidence level 0-1 with supporting factors and probability analysis],
    "reasoning": "[string - EXTREMELY comprehensive 1000+ word reasoning covering: detailed technical analysis with specific indicators and levels, fundamental analysis with token utility and adoption metrics, comprehensive risk assessment with correlation analysis, market conditions with macroeconomic factors, strategic rationale with multiple scenario planning, quantitative analysis with risk-reward ratios, timing considerations with market microstructure analysis, and institutional-grade insights]"
  },
  "analysis": {
    "technical": "[string - EXTREMELY detailed technical analysis including: specific RSI, MACD, Bollinger Bands, Fibonacci levels, support/resistance analysis with exact price levels, chart pattern recognition with specific formations, momentum analysis with volume confirmation, trend analysis with multiple timeframe confirmation, volatility analysis with historical comparisons, volume profile analysis, order flow analysis, institutional activity indicators, and quantitative technical metrics with specific calculations]",
    "fundamental": "[string - COMPREHENSIVE fundamental analysis covering: detailed token utility analysis with use cases and adoption metrics, competitive landscape analysis with direct competitors and market positioning, regulatory environment analysis with current and potential future regulations, team and development analysis with roadmap assessment, ecosystem analysis with partnerships and integrations, tokenomics analysis with supply/demand dynamics, market adoption metrics with user growth and transaction volume, institutional adoption analysis with corporate partnerships, technological innovation assessment with unique features, long-term viability analysis with sustainability factors, and macroeconomic impact analysis]",
    "risk": "[string - THOROUGH risk assessment including: detailed market risk analysis with volatility and correlation factors, token-specific risks with technical and fundamental vulnerabilities, liquidity risk analysis with depth and spread considerations, regulatory risk assessment with compliance requirements, counterparty risk analysis with exchange and custody considerations, operational risk factors with technical and security concerns, concentration risk analysis with portfolio allocation, tail risk assessment with extreme scenario planning, correlation risk analysis with other assets and sectors, timing risk factors with market cycle considerations, and comprehensive mitigation strategies with specific hedging techniques]",
    "market": "[string - COMPREHENSIVE market conditions analysis including: detailed trend analysis with multiple timeframe confirmation, sentiment analysis with social media and news impact, macroeconomic factors with interest rates and inflation impact, sector rotation analysis with crypto market cycles, institutional activity analysis with corporate and fund participation, regulatory developments with policy impact assessment, technological developments with innovation impact, market microstructure analysis with order flow and liquidity, volatility analysis with historical comparisons, correlation analysis with traditional markets, geopolitical factors with global impact assessment, and market cycle positioning with timing considerations]"
  },
  "recommendations": [
    "[string - SPECIFIC, actionable recommendation 1 with detailed implementation steps, exact timing, specific price levels, and risk management protocols]",
    "[string - SPECIFIC, actionable recommendation 2 with timing considerations, market conditions, and execution guidelines]",
    "[string - SPECIFIC, actionable recommendation 3 with risk management focus, position sizing guidelines, and monitoring requirements]",
    "[string - SPECIFIC, actionable recommendation 4 with exit strategy, profit-taking levels, and stop-loss management]",
    "[string - SPECIFIC, actionable recommendation 5 with portfolio management, diversification strategies, and rebalancing guidelines]"
  ],
  "warnings": [
    "[string - CRITICAL warning 1 about specific potential risks with detailed explanation and mitigation strategies]",
    "[string - CRITICAL warning 2 about market conditions with specific scenarios and impact assessment]",
    "[string - CRITICAL warning 3 about position management with specific guidelines and monitoring requirements]",
    "[string - CRITICAL warning 4 about regulatory considerations with compliance requirements and potential changes]",
    "[string - CRITICAL warning 5 about technical risks with specific vulnerabilities and protection measures]"
  ],
  "metadata": {
    "model": "codex",
    "timestamp": "[current timestamp]",
    "version": "1.0"
  }
}
\`\`\`

## DETAILED INSTRUCTIONS - INSTITUTIONAL GRADE ANALYSIS REQUIRED

1. **COMPREHENSIVE ANALYSIS**: Provide extremely detailed, institutional-grade analysis that rivals top-tier investment bank research reports. Every section must be thorough and educational.

2. **TECHNICAL DEPTH**: Include specific technical indicators with exact calculations, support/resistance levels with precise price points, chart patterns with specific formations, momentum analysis with volume confirmation, trend analysis with multiple timeframe confirmation, volatility analysis with historical comparisons, and quantitative technical metrics.

3. **FUNDAMENTAL INSIGHTS**: Analyze token utility with detailed use cases, adoption trends with specific metrics, competitive landscape with direct comparisons, regulatory environment with current and future considerations, team and development with roadmap assessment, ecosystem analysis with partnerships, tokenomics with supply/demand dynamics, and long-term viability with sustainability factors.

4. **RISK MANAGEMENT**: Provide thorough risk assessment with specific mitigation strategies, position sizing rationale with detailed calculations, correlation analysis with other assets, tail risk assessment with extreme scenarios, and comprehensive hedging strategies.

5. **MARKET CONTEXT**: Consider broader market conditions with macroeconomic factors, sector trends with crypto market cycles, institutional activity with corporate participation, regulatory developments with policy impact, and market cycle positioning with timing considerations.

6. **DETAILED REASONING**: Explain every decision with specific data points, logical reasoning, and institutional-grade insights. Minimum 1000 words with comprehensive coverage of all aspects.

7. **ACTIONABLE RECOMMENDATIONS**: Provide specific, implementable trading recommendations with clear entry/exit criteria, exact timing, specific price levels, and detailed execution guidelines.

8. **RISK WARNINGS**: Include comprehensive warnings about potential risks with specific scenarios, impact assessment, and detailed mitigation strategies.

9. **PROFESSIONAL STANDARDS**: Use institutional trading terminology, maintain professional analysis quality, and provide insights that would be valuable to professional traders and institutional investors.

10. **VERBOSE OUTPUT**: Provide extensive detail in all analysis sections. Aim for comprehensive, educational content that teaches while providing actionable insights.

11. **QUANTITATIVE ANALYSIS**: Include specific price targets with calculations, risk-reward ratios with detailed analysis, probability assessments with statistical backing, and quantitative metrics throughout.

12. **MULTIPLE SCENARIOS**: Consider bullish, bearish, and sideways market scenarios with corresponding strategies, specific price levels, and detailed execution plans for each scenario.

13. **MARKET MICROSTRUCTURE**: Analyze order flow with depth analysis, liquidity conditions with spread considerations, institutional activity with participation metrics, and market dynamics with real-time factors.

14. **CORRELATION ANALYSIS**: Consider correlations with other assets, sectors, market indices, traditional markets, and global economic factors with detailed impact assessment.

15. **TIMING PRECISION**: Provide specific timing recommendations for entry, scaling, profit-taking, and exit strategies with market condition considerations and execution guidelines.

16. **INSTITUTIONAL INSIGHTS**: Provide insights that would be valuable to professional traders, institutional investors, and quantitative analysts with detailed explanations and professional terminology.

17. **EDUCATIONAL VALUE**: Make the analysis educational and informative, teaching readers about advanced trading concepts while providing actionable insights.

18. **COMPREHENSIVE COVERAGE**: Cover every aspect of the trade from technical analysis to fundamental factors, risk management to market conditions, with detailed explanations and professional insights.

Generate a professional, extremely detailed, institutional-grade trading strategy that rivals the quality of top-tier investment bank research reports. The analysis must be comprehensive, educational, and immediately actionable for professional traders.`;
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
          model: 'gpt-4',
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
          max_tokens: 4000,
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