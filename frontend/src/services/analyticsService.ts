import axios from 'axios';

export interface TokenMetrics {
  symbol: string;
  marketCap: number;
  price: number;
  volume24h: number;
  velocity: number;
  concentrationRatio: number;
  paperhandRatio: number;
  timestamp: string;
}

export interface AnalyticsData {
  tokens: TokenMetrics[];
  totalVolume: number;
  averageVelocity: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
}

class AnalyticsService {
  private baseUrl = 'http://localhost:3001/api'; // Mock API endpoint

  // Get real-time token metrics
  async getTokenMetrics(symbol: string): Promise<TokenMetrics> {
    try {
      // Mock data - replace with real API call
      const mockData: TokenMetrics = {
        symbol,
        marketCap: Math.random() * 1000000 + 100000,
        price: Math.random() * 100 + 1,
        volume24h: Math.random() * 500000 + 50000,
        velocity: Math.random() * 10 + 1,
        concentrationRatio: Math.random() * 0.5 + 0.1,
        paperhandRatio: Math.random() * 0.8 + 0.1,
        timestamp: new Date().toISOString()
      };

      return mockData;
    } catch (error) {
      console.error('Error fetching token metrics:', error);
      throw error;
    }
  }

  // Get multiple token metrics
  async getMultipleTokenMetrics(symbols: string[]): Promise<TokenMetrics[]> {
    try {
      const promises = symbols.map(symbol => this.getTokenMetrics(symbol));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching multiple token metrics:', error);
      throw error;
    }
  }

  // Calculate paperhand ratio
  calculatePaperhandRatio(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    
    const shortTermTrades = transactions.filter(tx => 
      tx.holdTime < 24 * 60 * 60 * 1000 // Less than 24 hours
    );
    
    return shortTermTrades.length / transactions.length;
  }

  // Calculate concentration ratio
  calculateConcentrationRatio(holders: any[]): number {
    if (holders.length === 0) return 0;
    
    const totalSupply = holders.reduce((sum, holder) => sum + holder.balance, 0);
    const top10Holders = holders
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);
    
    const top10Supply = top10Holders.reduce((sum, holder) => sum + holder.balance, 0);
    return top10Supply / totalSupply;
  }

  // Calculate token velocity
  calculateVelocity(volume24h: number, marketCap: number): number {
    return volume24h / marketCap;
  }

  // Get market sentiment
  getMarketSentiment(metrics: TokenMetrics[]): 'bullish' | 'bearish' | 'neutral' {
    const avgVelocity = metrics.reduce((sum, m) => sum + m.velocity, 0) / metrics.length;
    const avgPaperhand = metrics.reduce((sum, m) => sum + m.paperhandRatio, 0) / metrics.length;
    
    if (avgVelocity > 5 && avgPaperhand < 0.3) return 'bullish';
    if (avgVelocity < 2 || avgPaperhand > 0.7) return 'bearish';
    return 'neutral';
  }

  // WebSocket connection for real-time updates
  createWebSocketConnection(symbols: string[], onUpdate: (data: TokenMetrics) => void) {
    // Mock WebSocket - replace with real implementation
    const mockWebSocket = {
      send: (data: string) => {
        console.log('WebSocket message sent:', data);
      },
      close: () => {
        console.log('WebSocket connection closed');
      }
    };

    // Simulate real-time updates
    const interval = setInterval(async () => {
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const metrics = await this.getTokenMetrics(randomSymbol);
      onUpdate(metrics);
    }, 5000);

    return {
      ...mockWebSocket,
      close: () => {
        clearInterval(interval);
        mockWebSocket.close();
      }
    };
  }

  // Get analytics dashboard data
  async getAnalyticsDashboard(): Promise<AnalyticsData> {
    try {
      const popularTokens = ['SOL', 'BTC', 'ETH', 'DOGE', 'SHIB'];
      const tokens = await this.getMultipleTokenMetrics(popularTokens);
      
      const totalVolume = tokens.reduce((sum, token) => sum + token.volume24h, 0);
      const averageVelocity = tokens.reduce((sum, token) => sum + token.velocity, 0) / tokens.length;
      const marketSentiment = this.getMarketSentiment(tokens);

      return {
        tokens,
        totalVolume,
        averageVelocity,
        marketSentiment
      };
    } catch (error) {
      console.error('Error fetching analytics dashboard:', error);
      throw error;
    }
  }

  // Export data for external use
  exportData(data: any, format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Simple CSV export
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map((item: any) => Object.values(item).join(',')).join('\n');
      return `${headers}\n${rows}`;
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService; 