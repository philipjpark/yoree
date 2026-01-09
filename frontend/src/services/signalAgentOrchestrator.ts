// Signal Agent Orchestrator - Yoree's 3-Agent Pipeline for Signal Creation
import axios from 'axios';
import { MinamFeed, SignalCreationRequest } from '../types/signal';
import { minamService } from './minamService';
import { syuzhetService } from './syuzhetService';
import { signalService } from './signalService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

export interface SignalAgentOrchestrationRequest {
  rawInput?: string;
  underlyingAsset?: string;
  hypothesis?: string;
  preferences?: {
    signalType?: 'momentum' | 'sentiment' | 'fundamental' | 'macro' | 'technical' | 'social' | 'onchain' | 'volatility';
    riskTolerance?: 'low' | 'medium' | 'high';
    timeHorizon?: string;
    [key: string]: any;
  };
}

export interface AgentStep {
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
  timestamp: string;
}

export interface SignalAgentOrchestrationResponse {
  signal: any;
  agentSteps: AgentStep[];
  dataFeeds: {
    feed1: MinamFeed;
    feed2: MinamFeed;
    reasoning: string;
  };
  hypothesis: {
    original?: string;
    refined: string;
    reasoning: string;
  };
  deployment: {
    signalId: string;
    marketId?: string;
    status: 'created' | 'deployed' | 'error';
  };
  metadata: {
    totalAgents: number;
    totalApiCalls: number;
    duration: number;
    timestamp: string;
  };
}

class SignalAgentOrchestrator {
  private apiKey: string;

  constructor() {
    this.apiKey = OPENAI_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key not found. Some agent features may be limited.');
    }
  }

  /**
   * Orchestrate the 3-agent pipeline for signal creation:
   * 1. Data Feed Selector Agent - Selects optimal data feeds from Minam
   * 2. Hypothesis Generator Agent - Generates/refines signal hypothesis using Syuzhet
   * 3. Signal Deployment Agent - Creates and deploys the signal
   */
  async orchestrateSignalCreation(
    request: SignalAgentOrchestrationRequest
  ): Promise<SignalAgentOrchestrationResponse> {
    const startTime = Date.now();
    const agentSteps: AgentStep[] = [];
    let totalApiCalls = 0;

    try {
      console.log('🤖 Starting Yoree Signal Agent Orchestration...');

      // Step 1: Data Feed Selector Agent
      const feedStep: AgentStep = {
        agentName: 'Data Feed Selector Agent',
        status: 'running',
        timestamp: new Date().toISOString(),
      };
      agentSteps.push(feedStep);

      console.log('📊 Agent 1/3: Data Feed Selector Agent...');
      const feedSelection = await this.selectDataFeeds(request);
      feedStep.status = 'completed';
      feedStep.result = feedSelection;
      totalApiCalls += feedSelection.apiCalls || 1;

      // Step 2: Hypothesis Generator Agent
      const hypothesisStep: AgentStep = {
        agentName: 'Hypothesis Generator Agent',
        status: 'running',
        timestamp: new Date().toISOString(),
      };
      agentSteps.push(hypothesisStep);

      console.log('🧠 Agent 2/3: Hypothesis Generator Agent...');
      const hypothesis = await this.generateHypothesis(request, feedSelection.feeds);
      hypothesisStep.status = 'completed';
      hypothesisStep.result = hypothesis;
      totalApiCalls += hypothesis.apiCalls || 1;

      // Step 3: Signal Deployment Agent
      const deploymentStep: AgentStep = {
        agentName: 'Signal Deployment Agent',
        status: 'running',
        timestamp: new Date().toISOString(),
      };
      agentSteps.push(deploymentStep);

      console.log('🚀 Agent 3/3: Signal Deployment Agent...');
      const deployment = await this.deploySignal(request, feedSelection.feeds, hypothesis);
      deploymentStep.status = 'completed';
      deploymentStep.result = deployment;
      totalApiCalls += 1;

      const duration = Date.now() - startTime;

      console.log(`✅ Signal Agent Orchestration Complete! Duration: ${duration}ms, API Calls: ${totalApiCalls}`);

      return {
        signal: deployment.signal,
        agentSteps,
        dataFeeds: {
          feed1: feedSelection.feeds.feed1,
          feed2: feedSelection.feeds.feed2,
          reasoning: feedSelection.reasoning,
        },
        hypothesis: {
          original: request.hypothesis || request.rawInput,
          refined: hypothesis.hypothesis,
          reasoning: hypothesis.reasoning,
        },
        deployment: {
          signalId: deployment.signalId,
          marketId: deployment.marketId,
          status: 'deployed',
        },
        metadata: {
          totalAgents: 3,
          totalApiCalls,
          duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error('❌ Signal Agent Orchestration Error:', error);
      
      // Mark the current step as error
      const currentStep = agentSteps[agentSteps.length - 1];
      if (currentStep) {
        currentStep.status = 'error';
        currentStep.error = error.message;
      }

      throw new Error(`Signal agent orchestration failed: ${error.message}`);
    }
  }

  /**
   * Agent 1: Data Feed Selector Agent
   * Uses AI to analyze the signal requirements and select optimal data feeds from Minam
   */
  private async selectDataFeeds(
    request: SignalAgentOrchestrationRequest
  ): Promise<{
    feeds: { feed1: MinamFeed; feed2: MinamFeed };
    reasoning: string;
    apiCalls: number;
  }> {
    try {
      // Get all available feeds
      const allFeeds = await minamService.listFeeds();
      const activeFeeds = allFeeds.filter(f => f.isActive);

      if (activeFeeds.length < 2) {
        throw new Error('Not enough active data feeds available. Need at least 2 feeds.');
      }

      // Use AI to select optimal feeds if API key is available
      if (this.apiKey) {
        const feedsList = activeFeeds.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          description: f.description,
          provider: f.provider,
          updateFrequency: f.updateFrequency,
        }));
        
        const prompt = `# DATA FEED SELECTOR AGENT

You are an AI agent specialized in selecting optimal data feeds for trading signals.

## AVAILABLE DATA FEEDS:
${JSON.stringify(feedsList, null, 2)}

## SIGNAL REQUIREMENTS:
- Underlying Asset: ${request.underlyingAsset || 'Not specified'}
- Signal Type: ${request.preferences?.signalType || 'Not specified'}
- Raw Input: ${request.rawInput?.substring(0, 500) || 'Not provided'}
- Hypothesis: ${request.hypothesis?.substring(0, 500) || 'Not provided'}
- Risk Tolerance: ${request.preferences?.riskTolerance || 'Not specified'}

## YOUR TASK:
Select exactly 2 data feeds that would be most complementary and useful for this signal. Consider:
1. Feed type diversity (e.g., price + sentiment, or on-chain + volume)
2. Update frequency alignment with signal time horizon
3. Data quality and provider reliability
4. Complementary nature of the two feeds

Return ONLY valid JSON in this format:
\`\`\`json
{
  "feed1Id": "feed-id-1",
  "feed2Id": "feed-id-2",
  "reasoning": "Detailed explanation of why these feeds were selected and how they complement each other"
}
\`\`\``;

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a specialized data feed selection AI agent. Always respond with valid JSON only.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 1000,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const generatedText = response.data.choices[0].message.content.trim();
        const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || generatedText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const selection = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          const feed1 = activeFeeds.find(f => f.id === selection.feed1Id);
          const feed2 = activeFeeds.find(f => f.id === selection.feed2Id);

          if (feed1 && feed2) {
            return {
              feeds: { feed1, feed2 },
              reasoning: selection.reasoning || 'AI-selected optimal data feeds',
              apiCalls: 1,
            };
          }
        }
      }

      // Fallback: Select feeds based on signal type
      const selectedFeeds = this.selectFeedsByType(activeFeeds, request.preferences?.signalType);
      
      return {
        feeds: selectedFeeds,
        reasoning: `Selected feeds based on signal type: ${request.preferences?.signalType || 'general'}`,
        apiCalls: this.apiKey ? 1 : 0,
      };
    } catch (error: any) {
      console.error('Data Feed Selector Agent Error:', error);
      
      // Fallback to first 2 active feeds
      const allFeeds = await minamService.listFeeds();
      const activeFeeds = allFeeds.filter(f => f.isActive);
      
      if (activeFeeds.length < 2) {
        throw new Error('Failed to select data feeds: Not enough active feeds available');
      }

      return {
        feeds: {
          feed1: activeFeeds[0],
          feed2: activeFeeds[1],
        },
        reasoning: 'Fallback: Selected first two available feeds',
        apiCalls: 0,
      };
    }
  }

  private selectFeedsByType(
    feeds: MinamFeed[],
    signalType?: string
  ): { feed1: MinamFeed; feed2: MinamFeed } {
    const typeMap: Record<string, string[]> = {
      momentum: ['price', 'volume', 'technical_indicators'],
      sentiment: ['sentiment', 'social', 'news'],
      fundamental: ['onchain_metrics', 'price'],
      macro: ['price', 'volume', 'onchain_metrics'],
      technical: ['technical_indicators', 'price', 'volume'],
      social: ['social', 'sentiment'],
      onchain: ['onchain_metrics'],
      volatility: ['price', 'volume', 'technical_indicators'],
    };

    const preferredTypes = signalType ? typeMap[signalType] || [] : [];
    
    const feed1 = feeds.find(f => preferredTypes.includes(f.type)) || feeds[0];
    const feed2 = feeds.find(f => f.id !== feed1.id && (
      preferredTypes.includes(f.type) || f.type !== feed1.type
    )) || feeds[1];

    return { feed1, feed2 };
  }

  /**
   * Agent 2: Hypothesis Generator Agent
   * Uses Syuzhet to generate or refine the signal hypothesis
   */
  private async generateHypothesis(
    request: SignalAgentOrchestrationRequest,
    feeds: { feed1: MinamFeed; feed2: MinamFeed }
  ): Promise<{
    hypothesis: string;
    reasoning: string;
    apiCalls: number;
  }> {
    try {
      // If raw input provided, use Syuzhet to generate hypothesis
      if (request.rawInput) {
        const thesis = await syuzhetService.generateThesis({
          raw_input: request.rawInput,
          preferences: {
            timeHorizon: request.preferences?.timeHorizon,
            riskTolerance: request.preferences?.riskTolerance,
            marketSentiment: `Using data feeds: ${feeds.feed1.name} and ${feeds.feed2.name}`,
          },
        });

        return {
          hypothesis: thesis.hypothesis,
          reasoning: `Generated hypothesis using ${thesis.generatedBy === 'ai' ? 'Syuzhet AI' : 'fallback'} analysis. Confidence: ${thesis.probability}%. ${thesis.parameters?.reasoning || ''}`,
          apiCalls: 1,
        };
      }

      // If hypothesis provided, refine it with AI
      if (request.hypothesis && this.apiKey) {
        const prompt = `# HYPOTHESIS REFINEMENT AGENT

You are an AI agent specialized in refining trading signal hypotheses.

## ORIGINAL HYPOTHESIS:
${request.hypothesis}

## DATA FEEDS AVAILABLE:
- Feed 1: ${feeds.feed1.name} (${feeds.feed1.type}) - ${feeds.feed1.description}
- Feed 2: ${feeds.feed2.name} (${feeds.feed2.type}) - ${feeds.feed2.description}

## SIGNAL CONTEXT:
- Underlying Asset: ${request.underlyingAsset || 'Not specified'}
- Signal Type: ${request.preferences?.signalType || 'Not specified'}

## YOUR TASK:
Refine the hypothesis to be more specific, actionable, and aligned with the available data feeds. Make it:
1. More precise and testable
2. Aligned with the data feed capabilities
3. Include specific timeframes and conditions
4. More actionable for signal scoring

Return ONLY the refined hypothesis as a single, clear statement (no JSON, just text).`;

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a specialized hypothesis refinement AI agent. Return only the refined hypothesis text.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const refinedHypothesis = response.data.choices[0].message.content.trim();

        return {
          hypothesis: refinedHypothesis,
          reasoning: 'Refined hypothesis using AI analysis to align with selected data feeds',
          apiCalls: 1,
        };
      }

      // Fallback: Use provided hypothesis or generate basic one
      return {
        hypothesis: request.hypothesis || `${request.underlyingAsset || 'Asset'} will show price movement based on ${feeds.feed1.type} and ${feeds.feed2.type} data`,
        reasoning: 'Used provided hypothesis or generated basic hypothesis',
        apiCalls: 0,
      };
    } catch (error: any) {
      console.error('Hypothesis Generator Agent Error:', error);
      throw new Error(`Failed to generate hypothesis: ${error.message}`);
    }
  }

  /**
   * Agent 3: Signal Deployment Agent
   * Creates and deploys the signal to the market
   */
  private async deploySignal(
    request: SignalAgentOrchestrationRequest,
    feeds: { feed1: MinamFeed; feed2: MinamFeed },
    hypothesis: { hypothesis: string; reasoning: string }
  ): Promise<{
    signal: any;
    signalId: string;
    marketId?: string;
  }> {
    try {
      const signalRequest: SignalCreationRequest = {
        underlyingAsset: request.underlyingAsset || 'UNKNOWN',
        hypothesis: hypothesis.hypothesis,
        rawInput: request.rawInput,
        feed1Id: feeds.feed1.id,
        feed2Id: feeds.feed2.id,
        creator: {
          type: 'agent',
          id: 'yoree-agent-orchestrator',
          name: 'Yoree Agent Orchestrator',
          isAgentAnnounced: true,
        },
      };

      const signal = await signalService.createSignal(signalRequest);

      // Get market data if available
      let marketId;
      try {
        const market = await signalService.getSignalMarket(signal.id);
        marketId = market.signalId;
      } catch (e) {
        console.warn('Market data not yet available for signal');
      }

      return {
        signal,
        signalId: signal.id,
        marketId,
      };
    } catch (error: any) {
      console.warn('Backend unavailable, creating mock signal:', error.message);
      // Fallback: Create a mock signal when backend is unavailable
      return this.createMockSignal(request, feeds, hypothesis);
    }
  }

  /**
   * Create a mock signal when backend is unavailable
   */
  private createMockSignal(
    request: SignalAgentOrchestrationRequest,
    feeds: { feed1: MinamFeed; feed2: MinamFeed },
    hypothesis: { hypothesis: string; reasoning: string }
  ): {
    signal: any;
    signalId: string;
    marketId?: string;
  } {
    const signalId = `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const mockSignal = {
      id: signalId,
      underlyingAsset: request.underlyingAsset || 'UNKNOWN',
      hypothesis: hypothesis.hypothesis,
      dataBindings: [
        {
          feedId: feeds.feed1.id,
          feedName: feeds.feed1.name,
          feedType: feeds.feed1.type,
          bindingConfig: {
            normalization: 'standard',
            weight: 0.5,
          },
        },
        {
          feedId: feeds.feed2.id,
          feedName: feeds.feed2.name,
          feedType: feeds.feed2.type,
          bindingConfig: {
            normalization: 'standard',
            weight: 0.5,
          },
        },
      ],
      score: {
        accuracy: 75,
        performance: 80,
        consensus: 70,
        composite: 75,
        lastUpdated: now,
      },
      quality: 75,
      creator: {
        type: 'agent' as const,
        id: 'yoree-agent-orchestrator',
        name: 'Yoree Agent Orchestrator',
        isAgentAnnounced: true,
      },
      instances: [],
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    };

    return {
      signal: mockSignal,
      signalId: signalId,
      marketId: undefined, // Market will be created when backend is available
    };
  }
}

export const signalAgentOrchestrator = new SignalAgentOrchestrator();
