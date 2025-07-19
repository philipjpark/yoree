export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  summary: string;
  url: string;
  tags: string[];
  categories?: string[];
  publicationDate?: string;
  relevanceScore: number;
  addedAt: Date;
  source: 'emergent_minds' | 'manual' | 'arxiv' | 'other';
  isBookmarked?: boolean;
}

export interface ResearchCorpus {
  id: string;
  name: string;
  description: string;
  papers: ResearchPaper[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergentMindsResponse {
  title: string;
  summary: string;
  key_points: string[];
  methodology: string;
  results: string;
  implications: string;
  url: string;
}

class ResearchService {
  private corpus: ResearchCorpus[] = [];
  private papers: ResearchPaper[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  // Emergent Minds Integration
  async fetchFromEmergentMinds(url: string): Promise<EmergentMindsResponse> {
    try {
      // Mock implementation - replace with actual Emergent Minds API
      console.log('Fetching from Emergent Minds:', url);
      
      // Simulate API call to Emergent Minds
      const response = await fetch(`/api/emergent-minds/summarize?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Emergent Minds');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from Emergent Minds:', error);
      
      // Fallback mock data
      return {
        title: 'Research Paper Analysis',
        summary: 'This is a mock summary from Emergent Minds. Replace with actual API integration.',
        key_points: [
          'Key finding 1: Market volatility patterns',
          'Key finding 2: Risk management strategies',
          'Key finding 3: Performance optimization techniques'
        ],
        methodology: 'Quantitative analysis using historical data',
        results: 'Significant improvements in trading performance',
        implications: 'Potential for enhanced strategy development',
        url: url
      };
    }
  }

  // Add paper from Emergent Minds
  async addPaperFromEmergentMinds(url: string, tags: string[] = []): Promise<ResearchPaper> {
    const emergentData = await this.fetchFromEmergentMinds(url);
    
    const paper: ResearchPaper = {
      id: `paper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: emergentData.title,
      authors: ['Research Team'], // Would be extracted from paper
      abstract: emergentData.summary,
      summary: emergentData.summary,
      url: url,
      tags: [...tags, 'emergent_minds'],
      relevanceScore: 0.8,
      addedAt: new Date(),
      source: 'emergent_minds'
    };

    this.papers.push(paper);
    this.saveToLocalStorage();
    return paper;
  }

  // Manual paper addition
  addPaperManually(paper: Omit<ResearchPaper, 'id' | 'addedAt'>): ResearchPaper {
    const newPaper: ResearchPaper = {
      ...paper,
      id: `paper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date()
    };

    this.papers.push(newPaper);
    this.saveToLocalStorage();
    return newPaper;
  }

  // Corpus management
  createCorpus(name: string, description: string, tags: string[] = []): ResearchCorpus {
    const corpus: ResearchCorpus = {
      id: `corpus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      papers: [],
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.corpus.push(corpus);
    this.saveToLocalStorage();
    return corpus;
  }

  addPaperToCorpus(corpusId: string, paperId: string): boolean {
    const corpus = this.corpus.find(c => c.id === corpusId);
    const paper = this.papers.find(p => p.id === paperId);
    
    if (corpus && paper) {
      if (!corpus.papers.find(p => p.id === paperId)) {
        corpus.papers.push(paper);
        corpus.updatedAt = new Date();
        this.saveToLocalStorage();
        return true;
      }
    }
    return false;
  }

  removePaperFromCorpus(corpusId: string, paperId: string): boolean {
    const corpus = this.corpus.find(c => c.id === corpusId);
    if (corpus) {
      const initialLength = corpus.papers.length;
      corpus.papers = corpus.papers.filter(p => p.id !== paperId);
      if (corpus.papers.length !== initialLength) {
        corpus.updatedAt = new Date();
        this.saveToLocalStorage();
        return true;
      }
    }
    return false;
  }

  // Search and filter
  searchPapers(query: string): ResearchPaper[] {
    const lowerQuery = query.toLowerCase();
    return this.papers.filter(paper => 
      paper.title.toLowerCase().includes(lowerQuery) ||
      paper.abstract.toLowerCase().includes(lowerQuery) ||
      paper.summary.toLowerCase().includes(lowerQuery) ||
      paper.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getPapersByTags(tags: string[]): ResearchPaper[] {
    return this.papers.filter(paper => 
      tags.some(tag => paper.tags.includes(tag))
    );
  }

  // Generate strategy prompt from corpus
  generateStrategyPrompt(corpusId: string, strategyParams: any): string {
    const corpus = this.corpus.find(c => c.id === corpusId);
    if (!corpus || corpus.papers.length === 0) {
      return this.generateBasicStrategyPrompt(strategyParams);
    }

    const researchContext = corpus.papers.map(paper => `
[RESEARCH PAPER: ${paper.title}]
Authors: ${paper.authors.join(', ')}
Summary: ${paper.summary}
Key Insights: ${paper.tags.join(', ')}
`).join('\n');

    return `
[RESEARCH-DRIVEN STRATEGY GENERATION]

[RESEARCH CORPUS: ${corpus.name}]
${corpus.description}

[RESEARCH CONTEXT]
${researchContext}

[STRATEGY PARAMETERS]
Asset: ${strategyParams.coin}
Strategy Type: ${strategyParams.strategyType}
Timeframe: ${strategyParams.timeframe}
Risk Management: Stop Loss ${strategyParams.riskManagement.stopLoss}%, Take Profit ${strategyParams.riskManagement.takeProfit}%
Position Size: ${strategyParams.riskManagement.positionSize}%

[INSTRUCTION]
Based on the research corpus above, generate a comprehensive trading strategy that:
1. Incorporates insights from the research papers
2. Applies the specified strategy parameters
3. Provides evidence-based reasoning for each decision
4. Includes risk management based on research findings
5. Suggests optimal entry/exit conditions
6. Explains how the research supports the strategy approach

Please provide a detailed, research-backed trading strategy ready for deployment.
`;
  }

  private generateBasicStrategyPrompt(strategyParams: any): string {
    return `
[STRATEGY CONFIGURATION]
Asset: ${strategyParams.coin}
Strategy Type: ${strategyParams.strategyType}
Timeframe: ${strategyParams.timeframe}
Risk Management: Stop Loss ${strategyParams.riskManagement.stopLoss}%, Take Profit ${strategyParams.riskManagement.takeProfit}%
Position Size: ${strategyParams.riskManagement.positionSize}%

[INSTRUCTION]
Generate a comprehensive trading strategy based on the parameters above.
`;
  }

  // Data persistence
  private saveToLocalStorage() {
    try {
              localStorage.setItem('yoree_research_papers', JSON.stringify(this.papers));
        localStorage.setItem('yoree_research_corpus', JSON.stringify(this.corpus));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
              const papersData = localStorage.getItem('yoree_research_papers');
        const corpusData = localStorage.getItem('yoree_research_corpus');
      
      if (papersData) {
        this.papers = JSON.parse(papersData).map((p: any) => ({
          ...p,
          addedAt: new Date(p.addedAt)
        }));
      }
      
      if (corpusData) {
        this.corpus = JSON.parse(corpusData).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          papers: c.papers.map((p: any) => ({
            ...p,
            addedAt: new Date(p.addedAt)
          }))
        }));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  // Getters
  getAllPapers(): ResearchPaper[] {
    return [...this.papers];
  }

  getAllCorpus(): ResearchCorpus[] {
    return [...this.corpus];
  }

  getCorpusById(id: string): ResearchCorpus | undefined {
    return this.corpus.find(c => c.id === id);
  }

  getPaperById(id: string): ResearchPaper | undefined {
    return this.papers.find(p => p.id === id);
  }

  // Delete operations
  deletePaper(paperId: string): boolean {
    const initialLength = this.papers.length;
    this.papers = this.papers.filter(p => p.id !== paperId);
    
    // Remove from all corpus
    this.corpus.forEach(corpus => {
      corpus.papers = corpus.papers.filter(p => p.id !== paperId);
    });
    
    if (this.papers.length !== initialLength) {
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  deleteCorpus(corpusId: string): boolean {
    const initialLength = this.corpus.length;
    this.corpus = this.corpus.filter(c => c.id !== corpusId);
    
    if (this.corpus.length !== initialLength) {
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }
}

export const researchService = new ResearchService();
export default researchService; 