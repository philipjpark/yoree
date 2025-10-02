interface EmergentMindRequest {
  query: string;
  context?: string;
  maxResults?: number;
  includeMetadata?: boolean;
}

interface EmergentMindResponse {
  results: Array<{
    title: string;
    content: string;
    url: string;
    relevanceScore: number;
    metadata?: {
      source: string;
      publishedDate: string;
      author?: string;
    };
  }>;
  totalResults: number;
  query: string;
  timestamp: string;
}

interface ResearchInsight {
  summary: string;
  keyFindings: string[];
  confidence: number;
  sources: string[];
  recommendations: string[];
}

class EmergentMindService {
  private apiKey: string;
  private baseUrl: string = 'https://api.emergentmind.ai/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.REACT_APP_EMERGENT_MIND_API_KEY || '';
  }

  async searchResearch(query: string, context?: string): Promise<EmergentMindResponse> {
    try {
      const request: EmergentMindRequest = {
        query,
        context,
        maxResults: 10,
        includeMetadata: true
      };

      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Emergent Mind API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Emergent Mind search failed:', error);
      throw new Error('Failed to search research data');
    }
  }

  async generateInsights(query: string, context?: string): Promise<ResearchInsight> {
    try {
      const searchResults = await this.searchResearch(query, context);
      
      // Process results to generate insights
      const insights: ResearchInsight = {
        summary: this.generateSummary(searchResults.results),
        keyFindings: this.extractKeyFindings(searchResults.results),
        confidence: this.calculateConfidence(searchResults.results),
        sources: searchResults.results.map(r => r.url),
        recommendations: this.generateRecommendations(searchResults.results)
      };

      return insights;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw new Error('Failed to generate research insights');
    }
  }

  private generateSummary(results: EmergentMindResponse['results']): string {
    if (results.length === 0) return 'No relevant research found.';
    
    const topResults = results.slice(0, 3);
    const summaries = topResults.map(r => r.content.substring(0, 200) + '...');
    return summaries.join(' ');
  }

  private extractKeyFindings(results: EmergentMindResponse['results']): string[] {
    return results
      .filter(r => r.relevanceScore > 0.7)
      .map(r => r.title)
      .slice(0, 5);
  }

  private calculateConfidence(results: EmergentMindResponse['results']): number {
    if (results.length === 0) return 0;
    const avgRelevance = results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length;
    return Math.min(avgRelevance * 100, 100);
  }

  private generateRecommendations(results: EmergentMindResponse['results']): string[] {
    const recommendations = [
      'Consider the latest market trends and research findings',
      'Monitor key indicators mentioned in recent studies',
      'Evaluate risk factors identified in academic research'
    ];

    if (results.length > 5) {
      recommendations.push('Multiple sources available for deeper analysis');
    }

    return recommendations;
  }

  async getMarketAnalysis(ticker: string): Promise<ResearchInsight> {
    const query = `${ticker} market analysis trading strategy research`;
    return this.generateInsights(query, 'cryptocurrency trading');
  }

  async getTechnicalAnalysis(ticker: string): Promise<ResearchInsight> {
    const query = `${ticker} technical analysis indicators research`;
    return this.generateInsights(query, 'technical analysis trading');
  }

  async getSentimentAnalysis(ticker: string): Promise<ResearchInsight> {
    const query = `${ticker} sentiment analysis market psychology research`;
    return this.generateInsights(query, 'market sentiment trading');
  }
}

export default new EmergentMindService();
export type { EmergentMindRequest, EmergentMindResponse, ResearchInsight };

