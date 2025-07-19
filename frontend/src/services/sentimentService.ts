import geminiService from './geminiService';

export interface SentimentSource {
  id: string;
  name: string;
  type: 'discord' | 'twitter' | 'reddit' | 'news' | 'telegram' | 'tradingview';
  url: string;
  weight: number; // Importance weight for sentiment calculation
}

export interface SentimentData {
  source: string;
  timestamp: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  impact: 'high' | 'medium' | 'low';
}

export interface SentimentAnalysis {
  asset: string;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // -1 to 1
  confidence: number;
  sources: {
    discord: SentimentData[];
    social: SentimentData[];
    news: SentimentData[];
    technical: SentimentData[];
  };
  keyInsights: string[];
  tradingSignals: {
    signal: 'buy' | 'sell' | 'hold';
    strength: number; // 0-100
    reasoning: string;
  };
  riskFactors: string[];
  opportunities: string[];
  llmAnalysis?: {
    quantifiedSentiment: string;
    keywordAnalysis: string;
    confidenceExplanation: string;
    marketContext: string;
  };
}

class SentimentService {
  private cryptoNewsSources = [
    { id: 'coindesk', name: 'CoinDesk', url: 'https://www.coindesk.com', weight: 0.8 },
    { id: 'cointelegraph', name: 'Cointelegraph', url: 'https://cointelegraph.com', weight: 0.8 },
    { id: 'decrypt', name: 'Decrypt', url: 'https://decrypt.co', weight: 0.7 },
    { id: 'theblock', name: 'The Block', url: 'https://www.theblock.co', weight: 0.7 },
    { id: 'cryptoslate', name: 'CryptoSlate', url: 'https://cryptoslate.com', weight: 0.6 }
  ];

  private discordChannels = [
    { id: 'cryptosignals', name: 'Crypto Signals', url: 'https://discord.gg/cryptosignals', weight: 0.9 },
    { id: 'tradingview', name: 'TradingView Crypto', url: 'https://discord.gg/tradingview', weight: 0.8 },
    { id: 'binance', name: 'Binance Community', url: 'https://discord.gg/binance', weight: 0.7 },
    { id: 'solana', name: 'Solana Community', url: 'https://discord.gg/solana', weight: 0.8 },
    { id: 'ethereum', name: 'Ethereum Community', url: 'https://discord.gg/ethereum', weight: 0.8 }
  ];

  private telegramChannels = [
    { id: 'whalealert', name: 'Whale Alert', url: 'https://t.me/whale_alert', weight: 0.9 },
    { id: 'cryptosignals', name: 'Crypto Signals', url: 'https://t.me/cryptosignals', weight: 0.8 },
    { id: 'binance_signals', name: 'Binance Signals', url: 'https://t.me/binance_signals', weight: 0.7 }
  ];

  private redditSubreddits = [
    { id: 'cryptocurrency', name: 'r/CryptoCurrency', url: 'https://reddit.com/r/CryptoCurrency', weight: 0.6 },
    { id: 'cryptomarkets', name: 'r/CryptoMarkets', url: 'https://reddit.com/r/CryptoMarkets', weight: 0.7 },
    { id: 'bitcoin', name: 'r/Bitcoin', url: 'https://reddit.com/r/Bitcoin', weight: 0.6 },
    { id: 'ethereum', name: 'r/Ethereum', url: 'https://reddit.com/r/Ethereum', weight: 0.6 },
    { id: 'solana', name: 'r/Solana', url: 'https://reddit.com/r/Solana', weight: 0.7 }
  ];

  // Analyze sentiment for a specific asset
  async analyzeSentiment(asset: string): Promise<SentimentAnalysis> {
    try {
      console.log(`🔍 Analyzing sentiment for ${asset}...`);
      
      // Simulate API calls to various sources
      const [discordData, socialData, newsData, technicalData] = await Promise.all([
        this.getDiscordSentiment(asset),
        this.getSocialSentiment(asset),
        this.getNewsSentiment(asset),
        this.getTechnicalSentiment(asset)
      ]);

      // Calculate overall sentiment
      const overallSentiment = this.calculateOverallSentiment({
        discord: discordData,
        social: socialData,
        news: newsData,
        technical: technicalData
      });

      // Generate trading signals
      const tradingSignals = this.generateTradingSignals(overallSentiment, {
        discord: discordData,
        social: socialData,
        news: newsData,
        technical: technicalData
      });

      // Extract key insights
      const keyInsights = this.extractKeyInsights({
        discord: discordData,
        social: socialData,
        news: newsData,
        technical: technicalData
      });

      // Process sentiment through LLM for enhanced analysis
      const llmAnalysis = await this.processSentimentWithLLM(asset, {
        discord: discordData,
        social: socialData,
        news: newsData,
        technical: technicalData
      }, overallSentiment);

      return {
        asset,
        overallSentiment: overallSentiment.sentiment,
        sentimentScore: overallSentiment.score,
        confidence: overallSentiment.confidence,
        sources: {
          discord: discordData,
          social: socialData,
          news: newsData,
          technical: technicalData
        },
        keyInsights,
        tradingSignals,
        riskFactors: this.identifyRiskFactors({
          discord: discordData,
          social: socialData,
          news: newsData,
          technical: technicalData
        }),
        opportunities: this.identifyOpportunities({
          discord: discordData,
          social: socialData,
          news: newsData,
          technical: technicalData
        }),
        llmAnalysis
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  private async getDiscordSentiment(asset: string): Promise<SentimentData[]> {
    // Simulate Discord sentiment analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockDiscordData: SentimentData[] = [
      {
        source: 'Crypto Signals Discord',
        timestamp: new Date().toISOString(),
        content: `${asset} showing strong momentum! Whale accumulation detected. Bullish signals from multiple indicators.`,
        sentiment: 'positive',
        confidence: 0.85,
        keywords: ['momentum', 'whale', 'bullish', 'accumulation'],
        impact: 'high'
      },
      {
        source: 'TradingView Crypto Discord',
        timestamp: new Date().toISOString(),
        content: `${asset} breaking out of key resistance level. Volume increasing significantly.`,
        sentiment: 'positive',
        confidence: 0.78,
        keywords: ['breakout', 'resistance', 'volume'],
        impact: 'medium'
      },
      {
        source: 'Solana Community Discord',
        timestamp: new Date().toISOString(),
        content: `${asset} facing some selling pressure at current levels. Wait for confirmation.`,
        sentiment: 'negative',
        confidence: 0.65,
        keywords: ['selling pressure', 'confirmation'],
        impact: 'medium'
      }
    ];

    return mockDiscordData;
  }

  private async getSocialSentiment(asset: string): Promise<SentimentData[]> {
    // Simulate social media sentiment analysis
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockSocialData: SentimentData[] = [
      {
        source: 'Twitter Crypto Community',
        timestamp: new Date().toISOString(),
        content: `${asset} is the future! Institutional adoption increasing.`,
        sentiment: 'positive',
        confidence: 0.72,
        keywords: ['future', 'institutional', 'adoption'],
        impact: 'medium'
      },
      {
        source: 'Reddit r/CryptoCurrency',
        timestamp: new Date().toISOString(),
        content: `${asset} showing bearish divergence on RSI. Be cautious.`,
        sentiment: 'negative',
        confidence: 0.68,
        keywords: ['bearish', 'divergence', 'RSI'],
        impact: 'medium'
      }
    ];

    return mockSocialData;
  }

  private async getNewsSentiment(asset: string): Promise<SentimentData[]> {
    // Simulate news sentiment analysis
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockNewsData: SentimentData[] = [
      {
        source: 'CoinDesk',
        timestamp: new Date().toISOString(),
        content: `${asset} gains 15% as institutional investors show renewed interest in crypto assets.`,
        sentiment: 'positive',
        confidence: 0.88,
        keywords: ['gains', 'institutional', 'investors', 'interest'],
        impact: 'high'
      },
      {
        source: 'Cointelegraph',
        timestamp: new Date().toISOString(),
        content: `${asset} faces regulatory uncertainty as new guidelines are proposed.`,
        sentiment: 'negative',
        confidence: 0.75,
        keywords: ['regulatory', 'uncertainty', 'guidelines'],
        impact: 'high'
      }
    ];

    return mockNewsData;
  }

  private async getTechnicalSentiment(asset: string): Promise<SentimentData[]> {
    // Simulate technical analysis sentiment
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockTechnicalData: SentimentData[] = [
      {
        source: 'TradingView Analysis',
        timestamp: new Date().toISOString(),
        content: `${asset} bullish flag pattern forming. MACD showing positive crossover.`,
        sentiment: 'positive',
        confidence: 0.82,
        keywords: ['bullish flag', 'MACD', 'crossover'],
        impact: 'high'
      },
      {
        source: 'Technical Indicators',
        timestamp: new Date().toISOString(),
        content: `${asset} RSI approaching overbought territory. Potential pullback expected.`,
        sentiment: 'negative',
        confidence: 0.70,
        keywords: ['RSI', 'overbought', 'pullback'],
        impact: 'medium'
      }
    ];

    return mockTechnicalData;
  }

  private calculateOverallSentiment(sources: any): { sentiment: 'bullish' | 'bearish' | 'neutral', score: number, confidence: number } {
    let positiveCount = 0;
    let negativeCount = 0;
    let totalConfidence = 0;
    let totalWeight = 0;

    // Process all sources
    Object.values(sources).flat().forEach((data: any) => {
      const weight = this.getSourceWeight(data.source);
      totalWeight += weight;
      
      if (data.sentiment === 'positive') {
        positiveCount += weight * data.confidence;
      } else if (data.sentiment === 'negative') {
        negativeCount += weight * data.confidence;
      }
      
      totalConfidence += data.confidence * weight;
    });

    const sentimentScore = (positiveCount - negativeCount) / totalWeight;
    const confidence = totalConfidence / totalWeight;

    let sentiment: 'bullish' | 'bearish' | 'neutral';
    if (sentimentScore > 0.2) {
      sentiment = 'bullish';
    } else if (sentimentScore < -0.2) {
      sentiment = 'bearish';
    } else {
      sentiment = 'neutral';
    }

    return { sentiment, score: sentimentScore, confidence };
  }

  private generateTradingSignals(overallSentiment: any, sources: any): { signal: 'buy' | 'sell' | 'hold', strength: number, reasoning: string } {
    const { sentiment, score, confidence } = overallSentiment;
    
    let signal: 'buy' | 'sell' | 'hold';
    let strength: number;
    let reasoning: string;

    if (sentiment === 'bullish' && confidence > 0.7) {
      signal = 'buy';
      strength = Math.min(100, Math.abs(score) * 100 + confidence * 20);
      reasoning = 'Strong positive sentiment across multiple sources with high confidence';
    } else if (sentiment === 'bearish' && confidence > 0.7) {
      signal = 'sell';
      strength = Math.min(100, Math.abs(score) * 100 + confidence * 20);
      reasoning = 'Strong negative sentiment across multiple sources with high confidence';
    } else {
      signal = 'hold';
      strength = 50;
      reasoning = 'Mixed or unclear sentiment signals. Wait for clearer direction';
    }

    return { signal, strength, reasoning };
  }

  private extractKeyInsights(sources: any): string[] {
    const insights: string[] = [];

    // Extract high-impact insights from all sources
    if (sources.discord) {
      sources.discord.filter((data: SentimentData) => data.impact === 'high').forEach((data: SentimentData) => {
        insights.push(`${data.source}: ${data.content}`);
      });
    }
    if (sources.social) {
      sources.social.filter((data: SentimentData) => data.impact === 'high').forEach((data: SentimentData) => {
        insights.push(`${data.source}: ${data.content}`);
      });
    }
    if (sources.news) {
      sources.news.filter((data: SentimentData) => data.impact === 'high').forEach((data: SentimentData) => {
        insights.push(`${data.source}: ${data.content}`);
      });
    }

    // Add technical insights
    if (sources.technical) {
      sources.technical.forEach((data: SentimentData) => {
        insights.push(`Technical: ${data.content}`);
      });
    }

    return insights.slice(0, 5); // Limit to top 5 insights
  }

  private identifyRiskFactors(sources: any): string[] {
    const risks: string[] = [];

    // Check all sources for negative high-impact data
    if (sources.discord) {
      sources.discord.filter((data: SentimentData) => data.sentiment === 'negative' && data.impact === 'high').forEach((data: SentimentData) => {
        risks.push(`${data.source}: ${data.content}`);
      });
    }
    if (sources.social) {
      sources.social.filter((data: SentimentData) => data.sentiment === 'negative' && data.impact === 'high').forEach((data: SentimentData) => {
        risks.push(`${data.source}: ${data.content}`);
      });
    }
    if (sources.news) {
      sources.news.filter((data: SentimentData) => data.sentiment === 'negative' && data.impact === 'high').forEach((data: SentimentData) => {
        risks.push(`${data.source}: ${data.content}`);
      });
    }

    return risks.slice(0, 3);
  }

  private identifyOpportunities(sources: any): string[] {
    const opportunities: string[] = [];

    // Check all sources for positive high-impact data
    if (sources.discord) {
      sources.discord.filter((data: SentimentData) => data.sentiment === 'positive' && data.impact === 'high').forEach((data: SentimentData) => {
        opportunities.push(`${data.source}: ${data.content}`);
      });
    }
    if (sources.social) {
      sources.social.filter((data: SentimentData) => data.sentiment === 'positive' && data.impact === 'high').forEach((data: SentimentData) => {
        opportunities.push(`${data.source}: ${data.content}`);
      });
    }
    if (sources.news) {
      sources.news.filter((data: SentimentData) => data.sentiment === 'positive' && data.impact === 'high').forEach((data: SentimentData) => {
        opportunities.push(`${data.source}: ${data.content}`);
      });
    }

    return opportunities.slice(0, 3);
  }

  private getSourceWeight(source: string): number {
    // Define weights for different sources
    const weights: { [key: string]: number } = {
      'Crypto Signals Discord': 0.9,
      'TradingView Crypto Discord': 0.8,
      'Solana Community Discord': 0.8,
      'Twitter Crypto Community': 0.6,
      'Reddit r/CryptoCurrency': 0.5,
      'CoinDesk': 0.8,
      'Cointelegraph': 0.8,
      'TradingView Analysis': 0.9,
      'Technical Indicators': 0.8
    };

    return weights[source] || 0.5;
  }

  // Get real-time sentiment updates
  async getRealTimeSentiment(asset: string): Promise<SentimentData[]> {
    // This would connect to real-time feeds
    return this.getDiscordSentiment(asset);
  }

  // Get sentiment trends over time
  async getSentimentTrends(asset: string, timeframe: '1h' | '4h' | '1d' | '1w'): Promise<any> {
    // This would analyze sentiment trends over time
    const currentSentiment = await this.analyzeSentiment(asset);
    
    return {
      asset,
      timeframe,
      trend: currentSentiment.overallSentiment,
      change: Math.random() * 0.2 - 0.1, // Simulated change
      volatility: Math.random() * 0.3 + 0.1 // Simulated volatility
    };
  }

  // Process sentiment data through LLM for enhanced analysis
  private async processSentimentWithLLM(asset: string, sources: any, overallSentiment: any): Promise<any> {
    try {
      // Extract all keywords and content from sources
      const allKeywords = new Set<string>();
      const sourceContent: string[] = [];
      
      Object.values(sources).flat().forEach((data: any) => {
        if (data.keywords) {
          data.keywords.forEach((keyword: string) => allKeywords.add(keyword));
        }
        sourceContent.push(`${data.source}: ${data.content} (${data.sentiment}, confidence: ${data.confidence})`);
      });

      const keywordsList = Array.from(allKeywords).join(', ');
      const sourcesText = sourceContent.join('\n');

      const templatePrompt = `Quantify the sentiment based on the keywords found in the following sources:

ASSET: ${asset}
OVERALL SENTIMENT: ${overallSentiment.sentiment}
SENTIMENT SCORE: ${overallSentiment.score.toFixed(3)}
CONFIDENCE: ${overallSentiment.confidence.toFixed(3)}

KEYWORDS IDENTIFIED: ${keywordsList}

SOURCE DATA:
${sourcesText}

Please provide a structured analysis with the following sections:

1. **Quantified Sentiment Analysis**: Provide a numerical sentiment score (-1 to 1) with detailed reasoning based on the keywords and source content. Explain how specific keywords influenced the sentiment calculation.

2. **Keyword Impact Analysis**: Analyze the most influential keywords and their impact on market sentiment. Which keywords are driving the sentiment and why?

3. **Confidence Assessment**: Explain the confidence level based on source diversity, keyword consistency, and market context. What factors contribute to or reduce confidence?

4. **Market Context**: Provide broader market context for this sentiment. How does this sentiment fit into current market conditions and what does it suggest about potential price movements?

Format your response as JSON with these exact keys:
{
  "quantifiedSentiment": "detailed analysis with numerical score",
  "keywordAnalysis": "keyword impact explanation", 
  "confidenceExplanation": "confidence assessment",
  "marketContext": "market context and price implications"
}

Be specific, quantitative, and actionable in your analysis.`;

      console.log('🔍 Processing sentiment with LLM...');
      const llmResponse = await geminiService.generateStrategy(templatePrompt);
      
      // Try to parse JSON response, fallback to structured text if needed
      try {
        const parsedResponse = JSON.parse(llmResponse);
        return parsedResponse;
      } catch (parseError) {
        // If JSON parsing fails, create structured response from text
        return {
          quantifiedSentiment: llmResponse,
          keywordAnalysis: "LLM analysis completed but response format was unexpected",
          confidenceExplanation: "Analysis confidence based on LLM processing",
          marketContext: "Market context derived from LLM analysis"
        };
      }
    } catch (error) {
      console.error('Error processing sentiment with LLM:', error);
      return {
        quantifiedSentiment: `Fallback analysis: ${overallSentiment.sentiment} sentiment with score ${overallSentiment.score.toFixed(3)}`,
        keywordAnalysis: "LLM processing unavailable - using fallback analysis",
        confidenceExplanation: `Confidence level: ${overallSentiment.confidence.toFixed(3)} based on source analysis`,
        marketContext: "Market context analysis unavailable due to LLM processing error"
      };
    }
  }
}

const sentimentService = new SentimentService();
export default sentimentService; 