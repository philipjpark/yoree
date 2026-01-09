// Minam service - uses actual Minam API structure
import { MinamFeed } from '../types/signal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';
const MINAM_API_URL = process.env.REACT_APP_MINAM_API_URL || 'http://localhost:8787';

// Minam API Product structure (matches backend)
export interface MinamApiProduct {
  id: string;
  name: string;
  pricing: string;
  provider_id: string;
  dataset_id: string;
  model_profile_id: string;
  version: string;
  status: string;
  human_approval_note: string;
}

export interface MinamQueryRequest {
  symbol?: string;
  start?: string; // ISO datetime
  end?: string; // ISO datetime
  limit?: number;
}

export class MinamService {
  private baseUrl: string;
  private minamApiUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.minamApiUrl = MINAM_API_URL;
  }

  /**
   * List available Minam feeds (which are Minam API products)
   * These come from the Yoree backend which queries Minam
   */
  async listFeeds(): Promise<MinamFeed[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/minam/feeds`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Non-JSON response from Minam feeds endpoint, using mock data');
        // Return mock feeds as fallback
        return this.getMockFeeds();
      }
      
      if (!response.ok) {
        console.warn('Failed to fetch Minam feeds, using mock data');
        return this.getMockFeeds();
      }

      return response.json();
    } catch (error: any) {
      console.warn('Error fetching Minam feeds, using mock data:', error);
      return this.getMockFeeds();
    }
  }

  private getMockFeeds(): MinamFeed[] {
    return [
      {
        id: 'feed-1',
        name: 'ETH Price Feed',
        type: 'price',
        description: 'Real-time Ethereum price data',
        provider: 'CoinGecko',
        dataFormat: 'json',
        updateFrequency: 'realtime',
        isActive: true,
      },
      {
        id: 'feed-2',
        name: 'ETH Sentiment Feed',
        type: 'sentiment',
        description: 'Social media sentiment for Ethereum',
        provider: 'Twitter API',
        dataFormat: 'json',
        updateFrequency: 'minute',
        isActive: true,
      },
      {
        id: 'feed-3',
        name: 'ETH On-Chain Metrics',
        type: 'onchain_metrics',
        description: 'On-chain analytics for Ethereum',
        provider: 'Etherscan',
        dataFormat: 'json',
        updateFrequency: 'hourly',
        isActive: true,
      },
      {
        id: 'feed-4',
        name: 'ETH Volume Feed',
        type: 'volume',
        description: 'Trading volume data for Ethereum',
        provider: 'Binance',
        dataFormat: 'json',
        updateFrequency: 'realtime',
        isActive: true,
      },
      {
        id: 'feed-5',
        name: 'ETH Technical Indicators',
        type: 'technical_indicators',
        description: 'Technical analysis indicators for ETH',
        provider: 'TradingView',
        dataFormat: 'json',
        updateFrequency: 'minute',
        isActive: true,
      },
    ];
  }

  /**
   * Get a specific feed by ID
   */
  async getFeed(feedId: string): Promise<MinamFeed> {
    const response = await fetch(`${this.baseUrl}/api/minam/feeds/${feedId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch feed');
    }

    return response.json();
  }

  /**
   * Query Minam API directly for data
   * This is how signals get their data from Minam APIs
   */
  async queryApi(apiId: string, query: MinamQueryRequest): Promise<any[]> {
    const response = await fetch(`${this.minamApiUrl}/v1/data/${apiId}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`Failed to query Minam API: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get feed data (latest data point)
   */
  async getFeedData(feedId: string): Promise<any> {
    // Query through Yoree backend which handles Minam API calls
    const response = await fetch(`${this.baseUrl}/api/minam/feeds/${feedId}/data`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch feed data');
    }

    return response.json();
  }

  /**
   * List Minam APIs directly (for admin/debugging)
   */
  async listApis(): Promise<MinamApiProduct[]> {
    const response = await fetch(`${this.minamApiUrl}/api/apis`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Minam APIs');
    }

    return response.json();
  }
}

export const minamService = new MinamService();
