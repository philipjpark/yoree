// Signal service for Yoree Signal Markets
import { Signal, SignalCreationRequest, SignalUpdateRequest, SignalMarket, SignalPerformanceHistory, SignalThesis, MinamFeed, ScoringWeights } from '../types/signal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';

export class SignalService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async createSignal(request: SignalCreationRequest): Promise<Signal> {
    const response = await fetch(`${this.baseUrl}/api/signals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create signal');
    }

    const data = await response.json();
    return data.signal;
  }

  async listSignals(): Promise<Signal[]> {
    const response = await fetch(`${this.baseUrl}/api/signals`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch signals');
    }

    return response.json();
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
    const response = await fetch(`${this.baseUrl}/api/signals/${signalId}/market`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }

    return response.json();
  }
}

export const signalService = new SignalService();
