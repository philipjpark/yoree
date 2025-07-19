export interface EmergentMindsPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  summary: string;
  categories: string[];
  publicationDate: string;
  relevanceScore: number;
  source: string;
  url?: string;
  arxivId?: string;
  citations?: number;
  socialEngagement?: {
    twitter?: number;
    reddit?: number;
    hackernews?: number;
    github?: number;
  };
}

export interface EmergentMindsSearchParams {
  query: string;
  category?: string;
  timeframe?: string;
  limit?: number;
  model?: 'gemini-2.5-flash' | 'gpt-4o' | 'gemini-2.5-pro' | 'o3-pro' | 'gpt-4.1-pro' | 'deepseek-r1';
}

export interface EmergentMindsAnalysisResult {
  title: string;
  summary: string;
  key_points: string[];
  relevance_score: number;
  categories: string[];
  detailed_answer?: string;
  quick_answer?: string;
  citations: string[];
  follow_up_questions: string[];
}

export interface EmergentMindsTrendingPaper {
  id: string;
  title: string;
  authors: string[];
  arxivId: string;
  categories: string[];
  publicationDate: string;
  socialEngagement: {
    total: number;
    twitter: number;
    reddit: number;
    hackernews: number;
    github: number;
  };
  summary: string;
}

class EmergentMindsService {
  private baseUrl = 'https://api.emergentmind.com'; // Replace with actual API endpoint
  private apiKey: string | null = null;

  constructor() {
    // In a real implementation, you would get this from environment variables
    this.apiKey = process.env.REACT_APP_EMERGENT_MIND_API_KEY || null;
  }

  // Search for papers using Emergent Mind's AI research assistant
  async searchPapers(params: EmergentMindsSearchParams): Promise<EmergentMindsPaper[]> {
    try {
      // For now, we'll use mock data since we don't have the actual API key
      // In production, this would make a real API call to Emergent Mind
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response based on Emergent Mind's capabilities
      const mockPapers: EmergentMindsPaper[] = [
        {
          id: 'em_1',
          title: 'Deep Learning Approaches to Cryptocurrency Price Prediction',
          authors: ['Dr. Sarah Chen', 'Prof. Michael Rodriguez'],
          abstract: 'This paper explores the application of deep neural networks for predicting cryptocurrency price movements using historical data, sentiment analysis, and on-chain metrics.',
          summary: 'Advanced neural network models show 15-20% improvement in prediction accuracy for major cryptocurrencies when incorporating sentiment analysis and on-chain metrics. The study demonstrates that LSTM networks with attention mechanisms outperform traditional time series models.',
          categories: ['machine-learning', 'cryptocurrency', 'trading-strategies'],
          publicationDate: '2024-01-15',
          relevanceScore: 0.95,
          source: 'emergent_minds',
          url: 'https://arxiv.org/abs/2401.12345',
          arxivId: '2401.12345',
          citations: 45,
          socialEngagement: {
            twitter: 23,
            reddit: 12,
            hackernews: 8,
            github: 5
          }
        },
        {
          id: 'em_2',
          title: 'Behavioral Finance Patterns in DeFi Markets',
          authors: ['Dr. James Wilson', 'Dr. Emily Zhang'],
          abstract: 'Analysis of behavioral patterns in decentralized finance markets reveals distinct psychological biases that can be exploited for trading strategies.',
          summary: 'DeFi markets exhibit stronger momentum effects and herding behavior compared to traditional markets, with 40% higher volatility clustering. The research identifies specific behavioral patterns that can be used to predict market movements.',
          categories: ['behavioral-finance', 'cryptocurrency', 'market-analysis'],
          publicationDate: '2024-01-10',
          relevanceScore: 0.88,
          source: 'emergent_minds',
          url: 'https://arxiv.org/abs/2401.12346',
          arxivId: '2401.12346',
          citations: 32,
          socialEngagement: {
            twitter: 18,
            reddit: 9,
            hackernews: 6,
            github: 3
          }
        },
        {
          id: 'em_3',
          title: 'Risk Management Strategies for High-Frequency Crypto Trading',
          authors: ['Prof. David Kim', 'Dr. Lisa Thompson'],
          abstract: 'Comprehensive analysis of risk management techniques specifically designed for cryptocurrency high-frequency trading environments.',
          summary: 'Dynamic position sizing based on volatility regimes reduces drawdowns by 25% while maintaining similar returns in crypto markets. The study provides quantitative frameworks for risk management in volatile crypto environments.',
          categories: ['risk-management', 'trading-strategies', 'cryptocurrency'],
          publicationDate: '2024-01-05',
          relevanceScore: 0.92,
          source: 'emergent_minds',
          url: 'https://arxiv.org/abs/2401.12347',
          arxivId: '2401.12347',
          citations: 28,
          socialEngagement: {
            twitter: 15,
            reddit: 7,
            hackernews: 4,
            github: 2
          }
        }
      ];

      // Filter papers based on search parameters
      let filteredPapers = mockPapers;

      if (params.query) {
        const query = params.query.toLowerCase();
        filteredPapers = filteredPapers.filter(paper =>
          paper.title.toLowerCase().includes(query) ||
          paper.abstract.toLowerCase().includes(query) ||
          paper.summary.toLowerCase().includes(query) ||
          paper.authors.some(author => author.toLowerCase().includes(query))
        );
      }

      if (params.category && params.category !== 'all') {
        filteredPapers = filteredPapers.filter(paper =>
          paper.categories.includes(params.category!)
        );
      }

      // Sort by relevance score
      filteredPapers.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return filteredPapers;
    } catch (error) {
      console.error('Error searching papers:', error);
      throw new Error('Failed to search papers from Emergent Mind');
    }
  }

  // Get trending papers from Emergent Mind
  async getTrendingPapers(category?: string, timeframe?: string): Promise<EmergentMindsTrendingPaper[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockTrendingPapers: EmergentMindsTrendingPaper[] = [
        {
          id: 'trend_1',
          title: 'The Diffusion Duality: Understanding Pixel-Space Reasoning in VLMs',
          authors: ['Weinan Zhang'],
          arxivId: '2506.12494',
          categories: ['computer-vision', 'large-language-models', 'diffusion-models'],
          publicationDate: '2024-06-12',
          socialEngagement: {
            total: 156,
            twitter: 89,
            reddit: 34,
            hackernews: 23,
            github: 10
          },
          summary: 'This paper introduces a novel framework for understanding how Vision-Language Models process pixel-space information and make reasoning decisions.'
        },
        {
          id: 'trend_2',
          title: 'Text-to-LoRA: Instant Transformer Adaptation',
          authors: ['Loick Chambon'],
          arxivId: '2506.05285',
          categories: ['large-language-models', 'adaptation', 'efficiency'],
          publicationDate: '2024-06-10',
          socialEngagement: {
            total: 134,
            twitter: 67,
            reddit: 28,
            hackernews: 19,
            github: 20
          },
          summary: 'A new approach for instant adaptation of transformer models using LoRA techniques, significantly reducing adaptation time.'
        }
      ];

      return mockTrendingPapers;
    } catch (error) {
      console.error('Error fetching trending papers:', error);
      throw new Error('Failed to fetch trending papers from Emergent Mind');
    }
  }

  // Analyze a specific paper using Emergent Mind's AI
  async analyzePaper(arxivId: string, model: string = 'gemini-2.5-flash'): Promise<EmergentMindsAnalysisResult> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis result
      return {
        title: 'Analysis of Cryptocurrency Trading Strategies',
        summary: 'This paper presents a comprehensive analysis of various cryptocurrency trading strategies, focusing on machine learning approaches and risk management techniques.',
        key_points: [
          'Advanced machine learning models show significant improvements in prediction accuracy',
          'Behavioral patterns in crypto markets differ from traditional markets',
          'Risk management strategies need to be adapted for crypto volatility',
          'Technical analysis effectiveness varies by market conditions',
          'On-chain metrics provide valuable market insights'
        ],
        relevance_score: 0.89,
        categories: ['cryptocurrency', 'trading-strategies', 'machine-learning'],
        detailed_answer: 'Based on the research paper analysis, this study demonstrates that combining multiple data sources including price data, sentiment analysis, and on-chain metrics can significantly improve trading strategy performance. The authors found that LSTM networks with attention mechanisms outperformed traditional time series models by 15-20% in prediction accuracy.',
        quick_answer: 'Machine learning models with sentiment and on-chain data improve crypto trading accuracy by 15-20%.',
        citations: [
          'https://arxiv.org/abs/2401.12345',
          'https://arxiv.org/abs/2401.12346'
        ],
        follow_up_questions: [
          'How do different sentiment sources affect prediction accuracy?',
          'What are the optimal hyperparameters for the LSTM models?',
          'How does this approach compare to traditional technical analysis?'
        ]
      };
    } catch (error) {
      console.error('Error analyzing paper:', error);
      throw new Error('Failed to analyze paper with Emergent Mind');
    }
  }

  // Search for papers by topic/question
  async searchByQuestion(question: string, model: string = 'gemini-2.5-flash'): Promise<EmergentMindsAnalysisResult> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        title: `Research on: ${question}`,
        summary: `Synthesized research findings related to "${question}" based on recent computer science papers.`,
        key_points: [
          'Recent advances in the field show promising results',
          'Multiple approaches have been explored with varying success',
          'Further research is needed in specific areas',
          'Practical applications are emerging',
          'Performance metrics indicate significant improvements'
        ],
        relevance_score: 0.85,
        categories: ['research-synthesis', 'ai-ml', 'computer-science'],
        detailed_answer: `Based on the latest research papers, ${question} has been addressed through various innovative approaches. The synthesis of multiple studies reveals that...`,
        quick_answer: `Recent research shows significant progress in addressing ${question} through novel methodologies.`,
        citations: [
          'https://arxiv.org/abs/2401.12345',
          'https://arxiv.org/abs/2401.12346',
          'https://arxiv.org/abs/2401.12347'
        ],
        follow_up_questions: [
          'What are the limitations of current approaches?',
          'How do these findings apply to real-world scenarios?',
          'What are the next research directions?'
        ]
      };
    } catch (error) {
      console.error('Error searching by question:', error);
      throw new Error('Failed to search by question with Emergent Mind');
    }
  }

  // Get social media discussions about a paper
  async getSocialDiscussions(arxivId: string): Promise<any> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        twitter: [
          { text: 'Interesting paper on crypto trading strategies!', author: '@crypto_researcher', likes: 45 },
          { text: 'The ML approach here is quite innovative', author: '@ai_enthusiast', likes: 23 }
        ],
        reddit: [
          { title: 'New research on cryptocurrency prediction', subreddit: 'r/MachineLearning', upvotes: 156 },
          { title: 'Thoughts on this trading strategy paper?', subreddit: 'r/CryptoCurrency', upvotes: 89 }
        ],
        hackernews: [
          { title: 'Deep Learning for Crypto Price Prediction', points: 67, comments: 23 }
        ]
      };
    } catch (error) {
      console.error('Error fetching social discussions:', error);
      throw new Error('Failed to fetch social discussions');
    }
  }
}

const emergentMindsService = new EmergentMindsService();
export default emergentMindsService; 