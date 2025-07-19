import axios from 'axios';

// Types for agent communication
export interface AgentMessage {
  agentId: string;
  messageType: 'start' | 'stop' | 'configure' | 'analyze' | 'generate' | 'optimize';
  data?: any;
  parameters?: Record<string, any>;
}

export interface AgentResponse {
  agentId: string;
  responseType: string;
  data: any;
  confidence: number;
  timestamp: string;
  status: 'success' | 'error' | 'processing';
}

export interface AgentConfig {
  agentId: string;
  name: string;
  type: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  description: string;
  confidence: number;
  lastUpdate: string;
  performance: {
    accuracy: number;
    speed: number;
    efficiency: number;
  };
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export interface StrategyRequest {
  assetClass: string;
  strategyType: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  automationLevel: 'manual' | 'semi_automated' | 'fully_automated';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: string;
  liquidityNeeds: 'high' | 'medium' | 'low';
}

export interface MarketAnalysisRequest {
  symbol: string;
  timeframe: string;
  analysisType: 'technical' | 'fundamental' | 'sentiment' | 'hybrid';
  indicators?: string[];
}

export interface RiskAssessmentRequest {
  portfolio: any;
  marketConditions: any;
  riskThreshold: number;
}

export interface PortfolioOptimizationRequest {
  currentPortfolio: any;
  constraints: {
    maxPositionSize: number;
    minDiversification: number;
    maxSectorExposure: number;
  };
  targetReturn?: number;
  riskTolerance: number;
}

class AgentService {
  private baseURL: string;
  private apiKey: string | null;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.apiKey = localStorage.getItem('yoree_api_key');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  // Get all available agents
  async getAgents(): Promise<AgentConfig[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/agents`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw new Error('Failed to fetch agents');
    }
  }

  // Start an agent
  async startAgent(agentId: string, parameters?: Record<string, any>): Promise<AgentResponse> {
    try {
      const message: AgentMessage = {
        agentId,
        messageType: 'start',
        parameters,
      };

      const response = await axios.post(`${this.baseURL}/api/agents/start`, message, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error starting agent:', error);
      throw new Error('Failed to start agent');
    }
  }

  // Stop an agent
  async stopAgent(agentId: string): Promise<AgentResponse> {
    try {
      const message: AgentMessage = {
        agentId,
        messageType: 'stop',
      };

      const response = await axios.post(`${this.baseURL}/api/agents/stop`, message, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error stopping agent:', error);
      throw new Error('Failed to stop agent');
    }
  }

  // Configure an agent
  async configureAgent(agentId: string, config: Record<string, any>): Promise<AgentResponse> {
    try {
      const message: AgentMessage = {
        agentId,
        messageType: 'configure',
        data: config,
      };

      const response = await axios.post(`${this.baseURL}/api/agents/configure`, message, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error configuring agent:', error);
      throw new Error('Failed to configure agent');
    }
  }

  // Generate a trading strategy
  async generateStrategy(request: StrategyRequest): Promise<AgentResponse> {
    try {
      const message: AgentMessage = {
        agentId: 'strategy-generator',
        messageType: 'generate',
        data: request,
      };

      const response = await axios.post(`${this.baseURL}/api/agents/strategy/generate`, message, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error generating strategy:', error);
      throw new Error('Failed to generate strategy');
    }
  }

  // Analyze market
  async analyzeMarket(request: MarketAnalysisRequest): Promise<AgentResponse> {
    try {
      const message: AgentMessage = {
        agentId: 'market-analyzer',
        messageType: 'analyze',
        data: request,
      };

      const response = await axios.post(`${this.baseURL}/api/agents/market/analyze`, message, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw new Error('Failed to analyze market');
    }
  }

  // Assess risk
  async assessRisk(request: RiskAssessmentRequest): Promise<AgentResponse> {
    try {
      const message: AgentMessage = {
        agentId: 'risk-manager',
        messageType: 'analyze',
        data: request,
      };

      const response = await axios.post(`${this.baseURL}/api/agents/risk/assess`, message, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error assessing risk:', error);
      throw new Error('Failed to assess risk');
    }
  }

  // Optimize portfolio
  async optimizePortfolio(request: PortfolioOptimizationRequest): Promise<AgentResponse> {
    try {
      const message: AgentMessage = {
        agentId: 'portfolio-optimizer',
        messageType: 'optimize',
        data: request,
      };

      const response = await axios.post(`${this.baseURL}/api/agents/portfolio/optimize`, message, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error optimizing portfolio:', error);
      throw new Error('Failed to optimize portfolio');
    }
  }

  // Get agent status
  async getAgentStatus(agentId: string): Promise<AgentConfig> {
    try {
      const response = await axios.get(`${this.baseURL}/api/agents/${agentId}/status`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching agent status:', error);
      throw new Error('Failed to fetch agent status');
    }
  }

  // Get agent responses
  async getAgentResponses(agentId?: string, limit: number = 10): Promise<AgentResponse[]> {
    try {
      const params = new URLSearchParams();
      if (agentId) params.append('agentId', agentId);
      params.append('limit', limit.toString());

      const response = await axios.get(`${this.baseURL}/api/agents/responses?${params}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching agent responses:', error);
      throw new Error('Failed to fetch agent responses');
    }
  }

  // Stream agent responses (WebSocket)
  async streamAgentResponses(
    agentId: string,
    onMessage: (response: AgentResponse) => void,
    onError: (error: any) => void
  ): Promise<() => void> {
    try {
      const ws = new WebSocket(`${this.baseURL.replace('http', 'ws')}/api/agents/${agentId}/stream`);
      
      ws.onmessage = (event) => {
        try {
          const response: AgentResponse = JSON.parse(event.data);
          onMessage(response);
        } catch (error) {
          onError(error);
        }
      };

      ws.onerror = (error) => {
        onError(error);
      };

      // Return cleanup function
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Error setting up agent stream:', error);
      throw new Error('Failed to setup agent stream');
    }
  }

  // Get Google Cloud AI Platform status
  async getGoogleCloudStatus(): Promise<{
    projectId: string;
    region: string;
    services: string[];
    models: string[];
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/google-cloud/status`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Google Cloud status:', error);
      throw new Error('Failed to fetch Google Cloud status');
    }
  }

  // Test Google Cloud AI Platform connection
  async testGoogleCloudConnection(): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseURL}/api/google-cloud/test`, {}, {
        headers: this.getHeaders(),
      });
      return response.data.success;
    } catch (error) {
      console.error('Error testing Google Cloud connection:', error);
      return false;
    }
  }

  // Get agent performance metrics
  async getAgentPerformance(agentId: string, timeframe: string = '24h'): Promise<{
    accuracy: number;
    speed: number;
    efficiency: number;
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/agents/${agentId}/performance?timeframe=${timeframe}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      throw new Error('Failed to fetch agent performance');
    }
  }

  // Get system health
  async getSystemHealth(): Promise<{
    agents: {
      total: number;
      running: number;
      idle: number;
      failed: number;
    };
    googleCloud: {
      connected: boolean;
      services: string[];
    };
    performance: {
      averageResponseTime: number;
      successRate: number;
      activeConnections: number;
    };
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/health`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw new Error('Failed to fetch system health');
    }
  }

  // Set API key
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('yoree_api_key', apiKey);
  }

  // Clear API key
  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('yoree_api_key');
  }
}

// Export singleton instance
export const agentService = new AgentService();
export default agentService; 