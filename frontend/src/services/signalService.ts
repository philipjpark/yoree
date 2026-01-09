// Signal service for Yoree Signal Markets
import { Signal, SignalCreationRequest, SignalUpdateRequest, SignalMarket, SignalPerformanceHistory, SignalThesis, MinamFeed, ScoringWeights } from '../types/signal';

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
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned ${response.status}: ${response.statusText}. Make sure the backend is running at ${this.baseUrl}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch signals: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Cannot connect to backend at ${this.baseUrl}. Please ensure the backend server is running.`);
      }
      throw error;
    }
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
