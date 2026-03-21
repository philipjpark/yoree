// Signal service for Greed
import { Signal, SignalCreationRequest, SignalMarket, SignalPerformanceHistory } from '../types/signal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';

export class SignalService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async createSignal(request: SignalCreationRequest): Promise<Signal> {
    try {
      const response = await fetch(`${this.baseUrl}/api/signals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned ${response.status}: ${response.statusText}. Make sure the backend is running at ${this.baseUrl}`);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(error.error || 'Failed to create signal');
      }

      const data = await response.json();
      return data.signal || data;
    } catch (error: any) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Cannot connect to backend at ${this.baseUrl}. Please ensure the backend server is running.`);
      }
      throw error;
    }
  }

  async listSignals(): Promise<Signal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/signals`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Backend not available, get signals from localStorage and combine with mock
        return this.getSignalsFromStorage();
      }

      if (!response.ok) {
        // Backend error, get signals from localStorage and combine with mock
        return this.getSignalsFromStorage();
      }

      const backendSignals = await response.json();
      // Merge with localStorage signals
      const storageSignals = this.getSignalsFromStorage();
      const allSignals = [...backendSignals, ...storageSignals];
      // Remove duplicates by ID
      const uniqueSignals = Array.from(
        new Map(allSignals.map(signal => [signal.id, signal])).values()
      );
      return uniqueSignals;
    } catch (error: any) {
      // Backend not available, get signals from localStorage and combine with mock
      return this.getSignalsFromStorage();
    }
  }

  private getSignalsFromStorage(): Signal[] {
    try {
      // Get signals from portfolio storage
      const portfolioSignals = JSON.parse(localStorage.getItem('yoree_portfolio_signals') || '[]');
      const storageSignals = portfolioSignals
        .map((item: any) => item.signal)
        .filter((signal: Signal) => signal && signal.status === 'active');

      // Get signals from active signals storage (if exists)
      const activeSignals = JSON.parse(localStorage.getItem('yoree_active_signals') || '[]');
      const allStorageSignals = [...storageSignals, ...activeSignals];

      // Remove duplicates by ID
      const uniqueStorageSignals = Array.from(
        new Map(allStorageSignals.map((signal: Signal) => [signal.id, signal])).values()
      );

      // Combine with mock signals if we have any storage signals, otherwise return mock
      if (uniqueStorageSignals.length > 0) {
        const mockSignals = this.getMockSignals();
        const allSignals = [...uniqueStorageSignals, ...mockSignals];
        // Remove duplicates
        return Array.from(
          new Map(allSignals.map(signal => [signal.id, signal])).values()
        );
      }

      return this.getMockSignals();
    } catch (error) {
      console.warn('Error reading signals from storage:', error);
      return this.getMockSignals();
    }
  }

  private getMockSignals(): Signal[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'signal-1',
        underlyingAsset: 'Venezuela Oil Maduro',
        hypothesis: 'Venezuelan oil production will increase significantly in 2026 due to policy changes and international relations shifts.',
        dataBindings: [],
        score: {
          accuracy: 75,
          performance: 68,
          consensus: 72,
          composite: 72,
          lastUpdated: now,
        },
        quality: 72,
        creator: { type: 'human', id: 'user-1', name: 'Trader', isAgentAnnounced: false },
        instances: [],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'signal-2',
        underlyingAsset: 'ETH Adoption',
        hypothesis: 'Ethereum will see increased institutional adoption leading to price appreciation.',
        dataBindings: [],
        score: {
          accuracy: 82,
          performance: 75,
          consensus: 80,
          composite: 79,
          lastUpdated: now,
        },
        quality: 79,
        creator: { type: 'agent', id: 'agent-1', name: 'AI Agent', isAgentAnnounced: true },
        instances: [],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  async getSignal(signalId: string): Promise<Signal> {
    const response = await fetch(`${this.baseUrl}/api/signals/${signalId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch signal');
    }

    return response.json();
  }

  async updateSignalScore(
    signalId: string,
    accuracy: number,
    performance: number,
    consensus: number
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/signals/${signalId}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accuracy,
        performance,
        consensus,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update signal score');
    }
  }

  async getSignalPerformance(signalId: string): Promise<SignalPerformanceHistory[]> {
    const response = await fetch(`${this.baseUrl}/api/signals/${signalId}/performance`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch performance history');
    }

    return response.json();
  }

  async getSignalMarket(signalId: string): Promise<SignalMarket> {
    try {
      const response = await fetch(`${this.baseUrl}/api/signals/${signalId}/market`);
      
      if (!response.ok) {
        // Backend error, return mock market data
        console.warn('Backend not available, using mock market data');
        return this.getMockMarketData(signalId);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Backend not available, return mock market data
        console.warn('Backend not available, using mock market data');
        return this.getMockMarketData(signalId);
      }

      return response.json();
    } catch (error: any) {
      // Backend not available, return mock market data
      console.warn('Backend not available, using mock market data');
      return this.getMockMarketData(signalId);
    }
  }

  private getMockMarketData(signalId: string): SignalMarket {
    return {
      signalId,
      pricingModel: 'bonding_curve',
      currentPrice: 0.15 + Math.random() * 0.1,
      totalVolume: Math.random() * 100000,
      buyVolume: Math.random() * 50000,
      sellVolume: Math.random() * 50000,
      totalShares: 1000000,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Attempts to fetch a follower/following-derived social corpus for X, then lets
   * the pipeline generate hypothesis/assets from that corpus.
   * Backend endpoint is optional; frontend gracefully falls back when unavailable.
   */
  async getXGraphCorpus(handle: string): Promise<{ corpus: string; sourceCount: number } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/social/x/corpus?handle=${encodeURIComponent(handle)}`);
      if (!response.ok) return null;
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;

      const data = await response.json();
      if (!data?.corpus || typeof data.corpus !== 'string') return null;

      return {
        corpus: data.corpus,
        sourceCount: Number(data.sourceCount || 0),
      };
    } catch {
      return null;
    }
  }

  async getRedditPublicCorpus(): Promise<{ corpus: string; sourceCount: number } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/social/reddit/corpus`);
      if (!response.ok) return null;
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;

      const data = await response.json();
      if (!data?.corpus || typeof data.corpus !== 'string') return null;

      return {
        corpus: data.corpus,
        sourceCount: Number(data.sourceCount || 0),
      };
    } catch {
      return null;
    }
  }
}

export const signalService = new SignalService();
