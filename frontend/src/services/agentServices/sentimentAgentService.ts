import axios from 'axios';

export interface SentimentAgentRequest {
  token: string;
  marketData?: {
    price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    volume_24h: number;
  };
}

export interface SentimentAgentResponse {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // -1 to 1
  confidence: number; // 0 to 1
  keyFactors: string[];
  socialMediaSentiment: {
    twitter: number;
    reddit: number;
    telegram: number;
    discord: number;
  };
  newsSentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  marketPsychology: {
    fearGreedIndex: number;
    fomoLevel: number;
    panicLevel: number;
  };
  tradingSignals: {
    signal: 'buy' | 'sell' | 'hold';
    strength: number;
    reasoning: string;
  };
  riskFactors: string[];
  opportunities: string[];
  detailedAnalysis: string;
}

class SentimentAgentService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    // Don't throw on construction - lazy load the API key
  }

  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    }
    
    if (!this.apiKey) {
      console.error('❌ OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY in your Netlify environment variables.');
      throw new Error('OpenAI API key is required. Please configure REACT_APP_OPENAI_API_KEY in your Netlify environment variables.');
    }
    
    return this.apiKey;
  }

  async analyzeSentiment(request: SentimentAgentRequest): Promise<SentimentAgentResponse> {
    console.log('🔍 Sentiment Agent: Starting comprehensive sentiment analysis...');

    const prompt = `# MARKET SENTIMENT ANALYSIS AGENT

You are a specialized AI agent focused exclusively on cryptocurrency market sentiment analysis. Your role is to analyze social media sentiment, news impact, and market psychology for ${request.token}.

## MARKET DATA
${request.marketData ? `
- **Current Price**: $${request.marketData.price}
- **24h Change**: ${request.marketData.price_change_percentage_24h}%
- **Market Cap**: $${(request.marketData.market_cap / 1000000000).toFixed(2)}B
- **24h Volume**: $${(request.marketData.volume_24h / 1000000).toFixed(2)}M
` : 'Market data not available'}

## YOUR TASK
Analyze the current market sentiment for ${request.token} across multiple dimensions:

1. **Social Media Sentiment**: Twitter, Reddit, Telegram, Discord discussions
2. **News Sentiment**: Recent news articles, press releases, announcements
3. **Market Psychology**: Fear & Greed Index, FOMO levels, panic indicators
4. **Trading Signals**: Buy/Sell/Hold recommendations with strength indicators
5. **Risk Factors**: Potential negative sentiment drivers
6. **Opportunities**: Positive sentiment catalysts

## REQUIRED OUTPUT FORMAT
Return ONLY valid JSON in this exact format:

\`\`\`json
{
  "overallSentiment": "bullish|bearish|neutral",
  "sentimentScore": -1.0 to 1.0,
  "confidence": 0.0 to 1.0,
  "keyFactors": ["factor1", "factor2", "factor3"],
  "socialMediaSentiment": {
    "twitter": -1.0 to 1.0,
    "reddit": -1.0 to 1.0,
    "telegram": -1.0 to 1.0,
    "discord": -1.0 to 1.0
  },
  "newsSentiment": {
    "positive": 0.0 to 1.0,
    "negative": 0.0 to 1.0,
    "neutral": 0.0 to 1.0
  },
  "marketPsychology": {
    "fearGreedIndex": 0 to 100,
    "fomoLevel": 0 to 100,
    "panicLevel": 0 to 100
  },
  "tradingSignals": {
    "signal": "buy|sell|hold",
    "strength": 0 to 100,
    "reasoning": "detailed explanation"
  },
  "riskFactors": ["risk1", "risk2", "risk3"],
  "opportunities": ["opp1", "opp2", "opp3"],
  "detailedAnalysis": "comprehensive 300+ word analysis of current sentiment landscape"
}
\`\`\`

## ANALYSIS REQUIREMENTS
- Base analysis on current market conditions and recent developments
- Consider both technical and fundamental sentiment drivers
- Analyze sentiment across different timeframes (24h, 7d, 30d trends)
- Include institutional vs retail sentiment differences
- Consider regulatory and macroeconomic sentiment impacts
- Provide specific, actionable insights for trading decisions

Generate a comprehensive sentiment analysis that will be used by other AI agents to build a complete trading strategy.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a specialized cryptocurrency sentiment analysis AI agent. Always respond with valid JSON only.'
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
            'Authorization': `Bearer ${this.getApiKey()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedText = response.data.choices[0].message.content.trim();
      console.log('🔍 Sentiment Agent Raw Response:', generatedText);
      
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
        console.log('✅ Sentiment Agent: Analysis completed');
        return parsed as SentimentAgentResponse;
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ JSON Text:', jsonText);
        
        // Create a fallback response if parsing fails
        const fallbackResponse: SentimentAgentResponse = {
          overallSentiment: 'neutral',
          sentimentScore: 0,
          confidence: 0.5,
          keyFactors: ['Analysis failed - using fallback'],
          socialMediaSentiment: { twitter: 0, reddit: 0, telegram: 0, discord: 0 },
          newsSentiment: { positive: 0.33, negative: 0.33, neutral: 0.34 },
          marketPsychology: { fearGreedIndex: 50, fomoLevel: 50, panicLevel: 50 },
          tradingSignals: { signal: 'hold', strength: 50, reasoning: 'Analysis failed - using fallback' },
          riskFactors: ['Analysis failed - using fallback'],
          opportunities: ['Analysis failed - using fallback'],
          detailedAnalysis: 'Sentiment analysis failed to parse properly. Using fallback data.'
        };
        
        console.log('⚠️ Using fallback sentiment analysis response');
        return fallbackResponse;
      }
    } catch (error: any) {
      console.error('❌ Sentiment Agent Error:', error);
      throw new Error(`Sentiment analysis failed: ${error.message}`);
    }
  }
}

export default new SentimentAgentService();
