import axios from 'axios';
import sentimentAgentService, { SentimentAgentRequest, SentimentAgentResponse } from './sentimentAgentService';
import technicalAgentService, { TechnicalAgentRequest, TechnicalAgentResponse } from './technicalAgentService';
import riskAgentService, { RiskAgentRequest, RiskAgentResponse } from './riskAgentService';
import openaiCodexService, { CodexStrategyRequest, CodexStrategyResponse } from '../openaiCodexService';

export interface AgentOrchestratorRequest {
  token: string;
  timeframe: string;
  riskLevel: 'low' | 'moderate' | 'high';
  investmentAmount: number;
  walletBalance: number;
  marketData?: {
    price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    volume_24h: number;
  };
}

export interface AgentOrchestratorResponse {
  strategy: {
    entry: number;
    target: number;
    stopLoss: number;
    positionSize: number;
    confidence: number;
    reasoning: string;
  };
  analysis: {
    technical: string;
    fundamental: string;
    risk: string;
    market: string;
  };
  recommendations: string[];
  warnings: string[];
  agentOutputs: {
    sentiment: SentimentAgentResponse;
    technical: TechnicalAgentResponse;
    risk: RiskAgentResponse;
  };
  metadata: {
    model: 'multi-agent-orchestrator';
    timestamp: string;
    version: '1.0';
    totalApiCalls: number;
  };
}

class AgentOrchestrator {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    // Don't throw on construction - lazy load the API key
  }

  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    }
    
    if (!this.apiKey) {
      console.error('❌ OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY in your Netlify environment variables.');
      throw new Error('OpenAI API key is required. Please configure REACT_APP_OPENAI_API_KEY in your Netlify environment variables.');
    }
    
    return this.apiKey;
  }

  async generateStrategy(request: AgentOrchestratorRequest): Promise<AgentOrchestratorResponse> {
    console.log('🎯 Agent Orchestrator: Starting multi-agent strategy generation...');
    
    let totalApiCalls = 0;
    const agentOutputs: any = {};

    try {
      // Step 1: Sentiment Analysis Agent
      console.log('🔍 Step 1/4: Sentiment Analysis Agent...');
      const sentimentRequest: SentimentAgentRequest = {
        token: request.token,
        marketData: request.marketData
      };
      const sentimentAnalysis = await sentimentAgentService.analyzeSentiment(sentimentRequest);
      agentOutputs.sentiment = sentimentAnalysis;
      totalApiCalls++;

      // Step 2: Technical Analysis Agent
      console.log('📈 Step 2/4: Technical Analysis Agent...');
      const technicalRequest: TechnicalAgentRequest = {
        token: request.token,
        marketData: request.marketData
      };
      const technicalAnalysis = await technicalAgentService.analyzeTechnical(technicalRequest);
      agentOutputs.technical = technicalAnalysis;
      totalApiCalls++;

      // Step 3: Risk Management Agent
      console.log('🛡️ Step 3/4: Risk Management Agent...');
      const riskRequest: RiskAgentRequest = {
        token: request.token,
        investmentAmount: request.investmentAmount,
        walletBalance: request.walletBalance,
        riskLevel: request.riskLevel,
        marketData: request.marketData,
        sentimentData: sentimentAnalysis,
        technicalData: technicalAnalysis
      };
      const riskAnalysis = await riskAgentService.analyzeRisk(riskRequest);
      agentOutputs.risk = riskAnalysis;
      totalApiCalls++;

      // Step 4: Strategy Synthesis Agent (Codex)
      console.log('🧠 Step 4/4: Strategy Synthesis Agent...');
      const synthesisResult = await this.synthesizeStrategy(request, agentOutputs);
      totalApiCalls++;

      console.log(`✅ Multi-Agent Strategy Generation Complete! Total API calls: ${totalApiCalls}`);

      return {
        strategy: synthesisResult.strategy,
        analysis: synthesisResult.analysis,
        recommendations: synthesisResult.recommendations,
        warnings: synthesisResult.warnings,
        agentOutputs: agentOutputs,
        metadata: {
          model: 'multi-agent-orchestrator',
          timestamp: new Date().toISOString(),
          version: '1.0',
          totalApiCalls: totalApiCalls
        }
      };

    } catch (error: any) {
      console.error('❌ Agent Orchestrator Error:', error);
      throw new Error(`Multi-agent strategy generation failed: ${error.message}`);
    }
  }

  private async synthesizeStrategy(request: AgentOrchestratorRequest, agentOutputs: any): Promise<{
    strategy: any;
    analysis: any;
    recommendations: string[];
    warnings: string[];
  }> {
    const prompt = `# STRATEGY SYNTHESIS AGENT

You are the final AI agent responsible for synthesizing all previous agent analyses into a comprehensive trading strategy. You have access to the outputs from three specialized agents:

## AGENT OUTPUTS

### Sentiment Analysis Agent Results:
${JSON.stringify(agentOutputs.sentiment, null, 2)}

### Technical Analysis Agent Results:
${JSON.stringify(agentOutputs.technical, null, 2)}

### Risk Management Agent Results:
${JSON.stringify(agentOutputs.risk, null, 2)}

## TRADING PARAMETERS
- **Token**: ${request.token}
- **Timeframe**: ${request.timeframe}
- **Risk Level**: ${request.riskLevel}
- **Investment Amount**: $${request.investmentAmount}
- **Wallet Balance**: $${request.walletBalance}

## YOUR TASK
Synthesize all agent analyses into a final, comprehensive trading strategy that:

1. **Integrates all analyses** from sentiment, technical, and risk agents
2. **Resolves conflicts** between different agent recommendations
3. **Creates a unified strategy** that balances all factors
4. **Provides specific entry/exit levels** based on all analyses
5. **Includes comprehensive reasoning** explaining the synthesis process

## REQUIRED OUTPUT FORMAT
Return ONLY valid JSON in this exact format:

\`\`\`json
{
  "strategy": {
    "entry": number,
    "target": number,
    "stopLoss": number,
    "positionSize": number,
    "confidence": 0.0 to 1.0,
    "reasoning": "comprehensive 500+ word synthesis reasoning"
  },
  "analysis": {
    "technical": "synthesized technical analysis",
    "fundamental": "synthesized fundamental analysis",
    "risk": "synthesized risk analysis",
    "market": "synthesized market analysis"
  },
  "recommendations": [
    "synthesized recommendation 1",
    "synthesized recommendation 2",
    "synthesized recommendation 3",
    "synthesized recommendation 4",
    "synthesized recommendation 5"
  ],
  "warnings": [
    "synthesized warning 1",
    "synthesized warning 2",
    "synthesized warning 3",
    "synthesized warning 4",
    "synthesized warning 5"
  ]
}
\`\`\`

## SYNTHESIS REQUIREMENTS
- Integrate sentiment analysis with technical indicators
- Balance risk management recommendations with profit potential
- Resolve any conflicts between agent recommendations
- Provide specific, actionable trading levels
- Include comprehensive reasoning for all decisions
- Consider the relative importance of each agent's findings
- Create a cohesive strategy that leverages all analyses

Generate a comprehensive, synthesized trading strategy that combines all agent analyses into a unified, actionable plan.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a specialized strategy synthesis AI agent. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.getApiKey()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedText = response.data.choices[0].message.content.trim();
      console.log('🔍 Strategy Synthesis Agent Raw Response:', generatedText);
      
      // Try multiple JSON extraction methods
      let jsonText = '';
      
      // Method 1: Look for ```json blocks
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        // Method 2: Look for ``` blocks without json label
        const codeMatch = generatedText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonText = codeMatch[1];
        } else {
          // Method 3: Look for JSON object directly
          const directMatch = generatedText.match(/\{[\s\S]*\}/);
          if (directMatch) {
            jsonText = directMatch[0];
          } else {
            throw new Error('No JSON found in response');
          }
        }
      }
      
      console.log('🔍 Extracted JSON:', jsonText);
      
      try {
        const parsed = JSON.parse(jsonText);
        console.log('✅ Strategy Synthesis Agent: Synthesis completed');
        return parsed;
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ JSON Text:', jsonText);
        
        // Create a fallback response if parsing fails
        const fallbackResponse = {
          strategy: {
            entry: 0,
            target: 0,
            stopLoss: 0,
            positionSize: 1000,
            confidence: 0.5,
            reasoning: 'Strategy synthesis failed to parse properly. Using fallback data.'
          },
          analysis: {
            technical: 'Strategy synthesis failed to parse properly. Using fallback data.',
            fundamental: 'Strategy synthesis failed to parse properly. Using fallback data.',
            risk: 'Strategy synthesis failed to parse properly. Using fallback data.',
            market: 'Strategy synthesis failed to parse properly. Using fallback data.'
          },
          recommendations: ['Strategy synthesis failed - using fallback'],
          warnings: ['Strategy synthesis failed - using fallback']
        };
        
        console.log('⚠️ Using fallback strategy synthesis response');
        return fallbackResponse;
      }
    } catch (error: any) {
      console.error('❌ Strategy Synthesis Agent Error:', error);
      throw new Error(`Strategy synthesis failed: ${error.message}`);
    }
  }
}

export default new AgentOrchestrator();
