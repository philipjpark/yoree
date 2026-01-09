// Syuzhet service - uses actual Syuzhet prediction generation
import { SignalThesis } from '../types/signal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';
const SYUZHET_API_URL = process.env.REACT_APP_SYUZHET_API_URL || 'http://localhost:3000';

// Matches Syuzhet's GeneratedPrediction structure
export interface GeneratedPrediction {
  title: string;
  thesis: string;
  timeHorizon: string;
  eventType: 'binary' | 'range' | 'multi';
  suggestedProbability: number; // 0-1
  reasoningBullets: string[];
  parameters: {
    expiryTimestamp: number; // Unix timestamp in seconds
    initialYesPrice: number; // 0-1
    initialLiquidityUsdc: number;
  };
}

export interface ThesisGenerationRequest {
  raw_input?: string;
  corpus_summary?: string;
  user_notes?: string;
  preferences?: {
    timeHorizon?: string;
    riskTolerance?: 'low' | 'medium' | 'high';
    marketSentiment?: string;
    [key: string]: any;
  };
}

export class SyuzhetService {
  private baseUrl: string;
  private syuzhetApiUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.syuzhetApiUrl = SYUZHET_API_URL;
  }

  /**
   * Generate thesis using Syuzhet's prediction generation
   * This can call either Yoree backend (which proxies to Syuzhet) or Syuzhet directly
   */
  async generateThesis(request: ThesisGenerationRequest): Promise<SignalThesis> {
    // Try Yoree backend first (recommended - handles integration)
    try {
      const response = await fetch(`${this.baseUrl}/api/thesis/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_input: request.raw_input || request.corpus_summary || '',
          corpus_summary: request.corpus_summary,
          user_notes: request.user_notes,
          preferences: request.preferences,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        return {
          hypothesis: data.hypothesis,
          probability: data.probability,
          parameters: data.parameters,
          generatedBy: data.generated_by || 'ai',
          rawInput: request.raw_input || request.corpus_summary,
        };
      }
    } catch (error) {
      console.warn('Yoree backend thesis generation failed, trying Syuzhet directly:', error);
    }

    // Fallback to Syuzhet API directly
    try {
      const response = await fetch(`${this.syuzhetApiUrl}/api/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          corpusSummary: request.corpus_summary || request.raw_input || '',
          userNotes: request.user_notes,
          preferences: request.preferences,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const prediction: GeneratedPrediction = data.prediction;
        
        return {
          hypothesis: prediction.thesis,
          probability: prediction.suggestedProbability * 100, // Convert to percentage
          parameters: {
            timeframe: prediction.timeHorizon,
            targetPrice: prediction.parameters.initialYesPrice,
            confidence: prediction.suggestedProbability,
            reasoning: prediction.reasoningBullets.join('; '),
          },
          generatedBy: 'ai',
          rawInput: request.raw_input || request.corpus_summary,
        };
      }
    } catch (error) {
      console.warn('Syuzhet API also failed, using fallback hypothesis:', error);
    }

    // Final fallback: Generate a basic hypothesis from raw input
    return this.generateFallbackThesis(request);
  }

  private generateFallbackThesis(request: ThesisGenerationRequest): SignalThesis {
    const rawInput = request.raw_input || request.corpus_summary || '';
    
    // Extract key information from raw input
    const sentences = rawInput.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPoints = sentences.slice(0, 3).map(s => s.trim());
    
    // Generate a structured hypothesis
    const hypothesis = keyPoints.length > 0
      ? `Based on the provided information: ${keyPoints.join('. ')}. This suggests potential market movement that warrants signal creation.`
      : `Signal hypothesis based on: ${rawInput.substring(0, 200)}${rawInput.length > 200 ? '...' : ''}`;

    return {
      hypothesis,
      probability: 65, // Default confidence
      parameters: {
        timeframe: request.preferences?.timeHorizon || '30 days',
        targetPrice: 0.5,
        confidence: 0.65,
        reasoning: 'Generated from provided input using fallback method. Backend services unavailable.',
      },
      generatedBy: 'ai',
      rawInput,
    };
  }
}

export const syuzhetService = new SyuzhetService();
