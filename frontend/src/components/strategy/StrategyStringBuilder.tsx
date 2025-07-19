import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  SwapHoriz as SwapIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { TraditionalStrategy } from '../../services/traditionalFinanceStrategies';
import { SolanaToken } from '../../services/solanaTokensService';

interface StrategyStringBuilderProps {
  selectedToken: SolanaToken | null;
  selectedStrategy: TraditionalStrategy | null;
  sentimentAnalysis: any;
  pdfSummary: string | null;
  parameters: any;
  riskManagement: any;
  instantSwap: any;
  customModifications: string;
  modelType: 'gemini' | 'gpt' | 'claude';
  skippedSteps: Set<number>;
}

const StrategyStringBuilder: React.FC<StrategyStringBuilderProps> = ({
  selectedToken,
  selectedStrategy,
  sentimentAnalysis,
  pdfSummary,
  parameters,
  riskManagement,
  instantSwap,
  customModifications,
  modelType,
  skippedSteps
}) => {
  const isStepSkipped = (stepIndex: number) => skippedSteps.has(stepIndex);

  const buildStrategyString = () => {
    let strategyString = '';

    // Header based on model type
    switch (modelType) {
      case 'gemini':
        strategyString += `[CRYPTO TRADING STRATEGY GENERATION - GEMINI OPTIMIZED]

You are an expert crypto trading strategist with deep knowledge of traditional finance, technical analysis, and Solana ecosystem dynamics. Generate a comprehensive, actionable trading strategy based on the following inputs:

`;
        break;
      case 'gpt':
        strategyString += `# Crypto Trading Strategy Generation

You are a professional crypto trading advisor. Create a detailed trading strategy based on the provided information.

## Strategy Context
`;
        break;
      case 'claude':
        strategyString += `# Crypto Trading Strategy Analysis

As an expert crypto trading strategist, I need you to analyze the following inputs and generate a comprehensive trading strategy.

## Input Analysis
`;
        break;
    }

    // Token Information (Step 0)
    if (!isStepSkipped(0) && selectedToken) {
      strategyString += `
## 1. ASSET SELECTION
Token: ${selectedToken.name} (${selectedToken.symbol})
Address: ${selectedToken.address}
Category: ${selectedToken.category}
Description: ${selectedToken.description}
Market Cap: ${selectedToken.marketCap ? `$${(selectedToken.marketCap / 1e6).toFixed(2)}M` : 'N/A'}
Price: ${selectedToken.price ? `$${selectedToken.price}` : 'N/A'}
Volume (24h): ${selectedToken.volume24h ? `$${(selectedToken.volume24h / 1e6).toFixed(2)}M` : 'N/A'}
`;
    }

    // Traditional Strategy Foundation (Step 1)
    if (!isStepSkipped(1) && selectedStrategy) {
      strategyString += `
## 2. TRADITIONAL FINANCE STRATEGY FOUNDATION
Strategy: ${selectedStrategy.name}
Category: ${selectedStrategy.category}
Traditional Asset: ${selectedStrategy.traditionalAsset}
Crypto Adaptation: ${selectedStrategy.cryptoAdaptation}
Academic Basis: ${selectedStrategy.academicBasis}
Complexity: ${selectedStrategy.complexity}
Volatility: ${selectedStrategy.volatility}

Key Indicators: ${selectedStrategy.keyIndicators.join(', ')}

Entry Rules:
${selectedStrategy.entryRules.map(rule => `- ${rule}`).join('\n')}

Exit Rules:
${selectedStrategy.exitRules.map(rule => `- ${rule}`).join('\n')}

Risk Management:
- Stop Loss: ${selectedStrategy.riskManagement.stopLoss}
- Take Profit: ${selectedStrategy.riskManagement.takeProfit}
- Position Sizing: ${selectedStrategy.riskManagement.positionSizing}
- Max Drawdown: ${selectedStrategy.riskManagement.maxDrawdown}

Advantages: ${selectedStrategy.advantages.join(', ')}
Disadvantages: ${selectedStrategy.disadvantages.join(', ')}

Academic Papers:
${selectedStrategy.papers.map(paper => `- ${paper}`).join('\n')}
`;
    }

    // Sentiment Analysis (Step 2)
    if (!isStepSkipped(2) && sentimentAnalysis) {
      strategyString += `
## 3. MARKET SENTIMENT ANALYSIS
Overall Sentiment: ${sentimentAnalysis.overallSentiment}
Sentiment Score: ${(sentimentAnalysis.sentimentScore * 100).toFixed(1)}%
Confidence: ${(sentimentAnalysis.confidence * 100).toFixed(1)}%

Trading Signal: ${sentimentAnalysis.tradingSignals.signal.toUpperCase()} (${sentimentAnalysis.tradingSignals.strength.toFixed(0)}% strength)
Reasoning: ${sentimentAnalysis.tradingSignals.reasoning}

Key Insights:
${sentimentAnalysis.keyInsights.map((insight: string) => `- ${insight}`).join('\n')}

Risk Factors:
${sentimentAnalysis.riskFactors.map((risk: string) => `- ${risk}`).join('\n')}

Opportunities:
${sentimentAnalysis.opportunities.map((opp: string) => `- ${opp}`).join('\n')}
`;

      // LLM Analysis if available
      if (sentimentAnalysis.llmAnalysis) {
        strategyString += `
AI-Enhanced Sentiment Analysis:
${sentimentAnalysis.llmAnalysis.quantifiedSentiment}

Keyword Impact Analysis:
${sentimentAnalysis.llmAnalysis.keywordAnalysis}

Confidence Assessment:
${sentimentAnalysis.llmAnalysis.confidenceExplanation}

Market Context:
${sentimentAnalysis.llmAnalysis.marketContext}
`;
      }
    }

    // PDF Research Summary (Step 3)
    if (!isStepSkipped(3) && pdfSummary) {
      strategyString += `
## 4. RESEARCH INTEGRATION
Document Analysis Summary:
${pdfSummary}

This research-based insight will be incorporated into the trading strategy development, leveraging academic findings and quantitative methodologies for enhanced decision-making.
`;
    }

    // Strategy Parameters (Step 4)
    if (!isStepSkipped(4) && parameters) {
      strategyString += `
## 5. STRATEGY PARAMETERS
Strategy Type: ${parameters.strategyType}
Breakout Condition: ${parameters.breakoutCondition}
Percentage Increase: ${parameters.percentageIncrease}%
Timeframe: ${parameters.timeframe}
Volume Condition: ${parameters.volumeCondition}
`;
    }

    // Risk Management (Step 5)
    if (!isStepSkipped(5) && riskManagement) {
      strategyString += `
## 6. RISK MANAGEMENT
Stop Loss: ${riskManagement.stopLoss}%
Take Profit: ${riskManagement.takeProfit}%
Position Size: ${riskManagement.positionSize}%
`;
    }

    // Instant Swap Settings (Step 6)
    if (!isStepSkipped(6) && instantSwap) {
      strategyString += `
## 7. INSTANT SWAP SETTINGS
Enabled: ${instantSwap.enabled ? 'Yes' : 'No'}
Stablecoin: ${instantSwap.stablecoin}
Minimum Profit Threshold: ${instantSwap.minProfitThreshold}%
Auto-Compound: ${instantSwap.autoCompound ? 'Yes' : 'No'}
`;
    }

    // Custom Modifications
    if (customModifications) {
      strategyString += `
## 8. CUSTOM MODIFICATIONS
${customModifications}
`;
    }

    // Model-specific instructions
    switch (modelType) {
      case 'gemini':
        strategyString += `
## INSTRUCTION FOR GEMINI
Based on the above comprehensive inputs, generate a detailed crypto trading strategy that:

1. **Strategy Overview**: Provide a clear, concise explanation of the recommended approach
2. **Technical Implementation**: Specific indicators, entry/exit rules, and execution guidelines
3. **Risk Management**: Detailed position sizing, stop-loss, and take-profit recommendations
4. **Market Context**: How current sentiment and research findings influence the strategy
5. **Adaptation Notes**: How traditional finance principles are adapted for crypto markets
6. **Implementation Tips**: Practical advice for executing the strategy
7. **Performance Expectations**: Realistic expectations for returns and drawdown
8. **Monitoring & Adjustment**: How to monitor and adjust the strategy

Format your response in a conversational but professional tone, as if you're a helpful trading mentor. Use emojis sparingly for readability. Focus on actionable advice that can be implemented immediately.

Keep the response engaging, practical, and educational.`;
        break;
      case 'gpt':
        strategyString += `
## Instructions for GPT
Please analyze the provided information and create a comprehensive trading strategy that includes:

1. Strategy overview and rationale
2. Technical analysis framework
3. Entry and exit criteria
4. Risk management guidelines
5. Implementation steps
6. Performance monitoring

Provide actionable, specific recommendations based on the data provided.`;
        break;
      case 'claude':
        strategyString += `
## Instructions for Claude
Based on the comprehensive analysis above, please provide:

1. A detailed strategy breakdown
2. Risk assessment and mitigation
3. Implementation guidelines
4. Performance monitoring framework
5. Adaptation recommendations

Focus on practical, evidence-based recommendations that leverage both traditional finance principles and crypto-specific dynamics.`;
        break;
    }

    return strategyString;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(buildStrategyString());
  };

  const getModelColor = () => {
    switch (modelType) {
      case 'gemini': return '#4285f4';
      case 'gpt': return '#10a37f';
      case 'claude': return '#d97706';
      default: return '#666';
    }
  };

  const getModelIcon = () => {
    switch (modelType) {
      case 'gemini': return '🤖';
      case 'gpt': return '🧠';
      case 'claude': return '🎯';
      default: return '⚙️';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CodeIcon color="primary" />
            <Typography variant="h6">
              Strategy String Builder
            </Typography>
            <Chip
              label={`${modelType.toUpperCase()} Optimized`}
              size="small"
              sx={{ 
                backgroundColor: getModelColor(),
                color: 'white',
                fontWeight: 'bold'
              }}
              icon={<span>{getModelIcon()}</span>}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={copyToClipboard} size="small">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Progress Indicators */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Strategy Components:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedToken && (
              <Chip
                icon={<TrendingUpIcon />}
                label="Token Selected"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            {selectedStrategy && (
              <Chip
                icon={<ScienceIcon />}
                label="Traditional Strategy"
                color="primary"
                size="small"
                variant="outlined"
              />
            )}
            {sentimentAnalysis && (
              <Chip
                icon={<PsychologyIcon />}
                label="Sentiment Analysis"
                color="secondary"
                size="small"
                variant="outlined"
              />
            )}
            {pdfSummary && (
              <Chip
                icon={<ScienceIcon />}
                label="Research Summary"
                color="info"
                size="small"
                variant="outlined"
              />
            )}
            {parameters && (
              <Chip
                icon={<SettingsIcon />}
                label="Parameters Set"
                color="warning"
                size="small"
                variant="outlined"
              />
            )}
            {riskManagement && (
              <Chip
                icon={<SecurityIcon />}
                label="Risk Management"
                color="error"
                size="small"
                variant="outlined"
              />
            )}
            {instantSwap && (
              <Chip
                icon={<SwapIcon />}
                label="Swap Settings"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            {customModifications && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Custom Modifications"
                color="default"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Strategy String Display */}
        <Paper
          sx={{
            p: 3,
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: 2,
            maxHeight: 600,
            overflow: 'auto'
          }}
        >
          <Box
            component="pre"
            sx={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: '#2d3748'
            }}
          >
            {buildStrategyString()}
          </Box>
        </Paper>

        {/* Instructions */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Model Optimization:</strong> This string is optimized for {modelType.toUpperCase()} with appropriate formatting, 
            context structure, and instruction style. The concatenated string builds progressively as you complete each step 
            and will be sent to the LLM for strategy generation.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default StrategyStringBuilder; 