interface ResearchApiRequest {
  query: string;
  filters?: {
    dateRange?: {
      start: string;
      end: string;
    };
    sources?: string[];
    categories?: string[];
  };
  limit?: number;
}

interface ResearchApiResponse {
  articles: Array<{
    id: string;
    title: string;
    abstract: string;
    content: string;
    authors: string[];
    publishedDate: string;
    source: string;
    url: string;
    tags: string[];
    relevanceScore: number;
    impactScore: number;
  }>;
  totalCount: number;
  query: string;
  timestamp: string;
}

interface ResearchSummary {
  overview: string;
  keyInsights: string[];
  methodology: string[];
  riskFactors: string[];
  opportunities: string[];
  confidence: number;
  sources: string[];
}

class ResearchApiService {
  private apiKey: string;
  private baseUrl: string = 'https://api.researchapi.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.REACT_APP_RESEARCH_API_KEY || '';
  }

  async searchAcademicPapers(query: string, filters?: ResearchApiRequest['filters']): Promise<ResearchApiResponse> {
    try {
      const request: ResearchApiRequest = {
        query,
        filters,
        limit: 20
      };

      const response = await fetch(`${this.baseUrl}/papers/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Research API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Research API search failed:', error);
      throw new Error('Failed to search academic papers');
    }
  }

  async generateResearchSummary(query: string, filters?: ResearchApiRequest['filters']): Promise<ResearchSummary> {
    try {
      const searchResults = await this.searchAcademicPapers(query, filters);
      
      const summary: ResearchSummary = {
        overview: this.generateOverview(searchResults.articles),
        keyInsights: this.extractKeyInsights(searchResults.articles),
        methodology: this.extractMethodology(searchResults.articles),
        riskFactors: this.extractRiskFactors(searchResults.articles),
        opportunities: this.extractOpportunities(searchResults.articles),
        confidence: this.calculateConfidence(searchResults.articles),
        sources: searchResults.articles.map(a => a.source)
      };

      return summary;
    } catch (error) {
      console.error('Failed to generate research summary:', error);
      throw new Error('Failed to generate research summary');
    }
  }

  private generateOverview(articles: ResearchApiResponse['articles']): string {
    if (articles.length === 0) return 'No relevant research papers found.';
    
    const topArticles = articles
      .filter(a => a.relevanceScore > 0.8)
      .slice(0, 3);
    
    const abstracts = topArticles.map(a => a.abstract.substring(0, 300) + '...');
    return abstracts.join(' ');
  }

  private extractKeyInsights(articles: ResearchApiResponse['articles']): string[] {
    return articles
      .filter(a => a.impactScore > 0.7)
      .map(a => a.title)
      .slice(0, 8);
  }

  private extractMethodology(articles: ResearchApiResponse['articles']): string[] {
    const methodologies = [
      'Quantitative analysis',
      'Statistical modeling',
      'Machine learning approaches',
      'Time series analysis',
      'Risk assessment models'
    ];

    // Add specific methodologies based on article tags
    const tagMethodologies = articles
      .flatMap(a => a.tags)
      .filter(tag => tag.toLowerCase().includes('method') || tag.toLowerCase().includes('analysis'))
      .slice(0, 3);

    return [...methodologies, ...tagMethodologies].slice(0, 5);
  }

  private extractRiskFactors(articles: ResearchApiResponse['articles']): string[] {
    const commonRisks = [
      'Market volatility',
      'Liquidity constraints',
      'Regulatory changes',
      'Technology risks',
      'Model uncertainty'
    ];

    return commonRisks;
  }

  private extractOpportunities(articles: ResearchApiResponse['articles']): string[] {
    const opportunities = [
      'Emerging market trends',
      'New trading strategies',
      'Improved risk management',
      'Enhanced performance metrics',
      'Innovative approaches'
    ];

    return opportunities;
  }

  private calculateConfidence(articles: ResearchApiResponse['articles']): number {
    if (articles.length === 0) return 0;
    
    const avgRelevance = articles.reduce((sum, a) => sum + a.relevanceScore, 0) / articles.length;
    const avgImpact = articles.reduce((sum, a) => sum + a.impactScore, 0) / articles.length;
    
    return Math.min((avgRelevance + avgImpact) * 50, 100);
  }

  async getCryptoResearch(ticker: string): Promise<ResearchSummary> {
    const query = `${ticker} cryptocurrency blockchain trading strategy`;
    return this.generateResearchSummary(query, {
      categories: ['finance', 'cryptocurrency', 'trading'],
      dateRange: {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    });
  }

  async getTechnicalAnalysisResearch(ticker: string): Promise<ResearchSummary> {
    const query = `${ticker} technical analysis indicators trading algorithms`;
    return this.generateResearchSummary(query, {
      categories: ['finance', 'mathematics', 'computer science'],
      dateRange: {
        start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    });
  }

  async getRiskManagementResearch(): Promise<ResearchSummary> {
    const query = 'cryptocurrency risk management portfolio optimization';
    return this.generateResearchSummary(query, {
      categories: ['finance', 'risk management', 'portfolio theory'],
      dateRange: {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    });
  }
}

export default new ResearchApiService();
export type { ResearchApiRequest, ResearchApiResponse, ResearchSummary };

