import React, { useState } from 'react';
import SOLStrategyBuilder from './SOLStrategyBuilder';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { strategyApi, llmApi } from '../../services/api';
import SentimentAnalysis from './SentimentAnalysis';
import TokenSelector from './TokenSelector';
import TradingViewWidget from './TradingViewWidget';
import BacktestResults from './BacktestResults';
import TraditionalStrategySelector from './TraditionalStrategySelector';
import StrategyStringBuilder from './StrategyStringBuilder';
import PDFUploader from './PDFUploader';
import geminiService from '../../services/geminiService';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  PlayArrow as DeployIcon, 
  ContentCopy as ContentCopyIcon, 
  Code as CodeIcon,
  CurrencyBitcoin as BnbIcon,
  AccountBalance as SolanaIcon
} from '@mui/icons-material';
import strategyService, { StrategyConfig } from '../../services/strategyService';
import { SolanaToken } from '../../services/solanaTokensService';
import { TraditionalStrategy } from '../../services/traditionalFinanceStrategies';
import bnbService from '../../services/bnbService';
import paypalService from '../../services/paypalService';

interface StrategyParameters {
  coin: string;
  strategyType: string;
  breakoutCondition: string;
  percentageIncrease: number;
  timeframe: string;
  volumeCondition: string;
  riskManagement: {
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
  };
  instantSwap: {
    enabled: boolean;
    stablecoin: string;
    minProfitThreshold: number;
    autoCompound: boolean;
  };
}

interface ProvenStrategy {
  id: string;
  name: string;
  description: string;
  baseParameters: StrategyParameters;
}

const provenStrategies: ProvenStrategy[] = [
  {
    id: 'bnb_breakout_v1',
    name: 'BNB Breakout V1',
    description: 'A proven breakout strategy optimized for BNB\'s volatility patterns. Uses volume confirmation and dynamic stop-loss.',
    baseParameters: {
      coin: 'tBNB',
      strategyType: 'breakout',
      breakoutCondition: 'price_increase',
      percentageIncrease: 3,
      timeframe: '15m',
      volumeCondition: 'above_average',
      riskManagement: {
        stopLoss: 2,
        takeProfit: 6,
        positionSize: 1
      },
      instantSwap: {
        enabled: false,
        stablecoin: 'PYUSD',
        minProfitThreshold: 1.5,
        autoCompound: false
      }
    }
  },
  {
    id: 'bnb_momentum_v1',
    name: 'BNB Momentum V1',
    description: 'Momentum-based strategy that capitalizes on BNB\'s rapid price movements. Uses RSI and MACD for timing.',
    baseParameters: {
      coin: 'tBNB',
      strategyType: 'momentum',
      breakoutCondition: 'price_increase',
      percentageIncrease: 5,
      timeframe: '15m',
      volumeCondition: 'above_average',
      riskManagement: {
        stopLoss: 3,
        takeProfit: 9,
        positionSize: 1
      },
      instantSwap: {
        enabled: false,
        stablecoin: 'PYUSD',
        minProfitThreshold: 1.5,
        autoCompound: false
      }
    }
  }
];

const StrategyBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { connected, wallet } = useWallet();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [llmResponse, setLlmResponse] = useState<any>(null);
  
  // Add PDF research integration state
  const [pdfSummary, setPdfSummary] = useState<string | null>(null);
  const [storedPDF, setStoredPDF] = useState<File | null>(null);
  
  // Add skip functionality state
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  
  // Add traditional strategy state
  const [selectedTraditionalStrategy, setSelectedTraditionalStrategy] = useState<TraditionalStrategy | null>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);
  const [modelType, setModelType] = useState<'gemini' | 'gpt' | 'claude'>('gemini');

  const [parameters, setParameters] = useState<StrategyParameters>({
    coin: 'tBNB',
    strategyType: 'breakout',
    breakoutCondition: 'price_increase',
    percentageIncrease: 3,
    timeframe: '15m',
    volumeCondition: 'above_average',
    riskManagement: {
      stopLoss: 2,
      takeProfit: 6,
      positionSize: 1
    },
    instantSwap: {
      enabled: false,
      stablecoin: 'PYUSD',
      minProfitThreshold: 1.5,
      autoCompound: false
    }
  });
  const [selectedProvenStrategy, setSelectedProvenStrategy] = useState<string>('');
  const [customModifications, setCustomModifications] = useState('');
  const [selectedToken, setSelectedToken] = useState<SolanaToken | null>(null);
  const [useSOLAgents, setUseSOLAgents] = useState(false);

  const steps = [
    'Select Token',
    'Foundational Strategy',
    'Market Sentiment',
    'Research Integration',
    'Define Parameters',
    'Risk Management',
    'Swap for Profit',
    'Strategy String',
    'Generated Strategy'
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSkipStep = (stepIndex: number) => {
    setSkippedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepIndex);
      return newSet;
    });
    handleNext();
  };

  const handleUnskipStep = (stepIndex: number) => {
    setSkippedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepIndex);
      return newSet;
    });
  };

  const isStepSkipped = (stepIndex: number) => skippedSteps.has(stepIndex);

  const handleParameterChange = (field: string, value: any) => {
    if (field === 'coin') {
      // Reset selected proven strategy when coin changes
      setSelectedProvenStrategy('');
      setParameters(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (field === 'instantSwap') {
      // Convert string values back to boolean for instantSwap settings
      const updatedValue = {
        ...parameters.instantSwap,
        ...value,
        enabled: value.enabled === 'true',
        autoCompound: value.autoCompound === 'true'
      };
      setParameters(prev => ({
        ...prev,
        instantSwap: updatedValue
      }));
    } else {
      setParameters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleRiskManagementChange = (field: string, value: number) => {
    setParameters((prev) => ({
      ...prev,
      riskManagement: {
        ...prev.riskManagement,
        [field]: value
      }
    }));
  };

  const handleProvenStrategySelect = (strategyId: string) => {
    const strategy = provenStrategies.find(s => s.id === strategyId);
    if (strategy) {
      setParameters(strategy.baseParameters);
      setSelectedProvenStrategy(strategyId);
    }
  };

  const handleTokenSelect = (token: SolanaToken) => {
    setSelectedToken(token);
    setParameters(prev => ({
      ...prev,
      coin: token.symbol
    }));
  };

  const handlePDFSummaryGenerated = (summary: string) => {
    setPdfSummary(summary);
  };

  const handlePDFStored = (file: File | null) => {
    setStoredPDF(file);
  };

  const handlePDFSkip = () => {
    handleSkipStep(3); // Skip the research integration step
  };

  const generateStrategyString = () => {
    // Build concatenated strategy string based on model type
    let strategyString = '';

    // Header based on model type
    switch (modelType) {
      case 'gemini':
        strategyString += `[CRYPTO TRADING STRATEGY GENERATION]

You are an expert crypto trading strategist with deep knowledge of traditional finance, technical analysis, and Solana ecosystem dynamics. Generate a comprehensive, actionable trading strategy based on the following inputs:

`;
        break;
      case 'gpt':
        strategyString += `[CRYPTO TRADING STRATEGY GENERATION]

You are a professional crypto trading advisor. Create a detailed trading strategy based on the provided information.

## Strategy Context
`;
        break;
      case 'claude':
        strategyString += `[CRYPTO TRADING STRATEGY GENERATION]

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
    if (!isStepSkipped(1) && selectedTraditionalStrategy) {
      strategyString += `
## 2. TRADITIONAL FINANCE STRATEGY FOUNDATION
Strategy: ${selectedTraditionalStrategy.name}
Category: ${selectedTraditionalStrategy.category}
Traditional Asset: ${selectedTraditionalStrategy.traditionalAsset}
Crypto Adaptation: ${selectedTraditionalStrategy.cryptoAdaptation}
Academic Basis: ${selectedTraditionalStrategy.academicBasis}
Complexity: ${selectedTraditionalStrategy.complexity}
Volatility: ${selectedTraditionalStrategy.volatility}

Key Indicators: ${selectedTraditionalStrategy.keyIndicators.join(', ')}

Entry Rules:
${selectedTraditionalStrategy.entryRules.map(rule => `- ${rule}`).join('\n')}

Exit Rules:
${selectedTraditionalStrategy.exitRules.map(rule => `- ${rule}`).join('\n')}

Risk Management:
- Stop Loss: ${selectedTraditionalStrategy.riskManagement.stopLoss}
- Take Profit: ${selectedTraditionalStrategy.riskManagement.takeProfit}
- Position Sizing: ${selectedTraditionalStrategy.riskManagement.positionSizing}
- Max Drawdown: ${selectedTraditionalStrategy.riskManagement.maxDrawdown}

Advantages: ${selectedTraditionalStrategy.advantages.join(', ')}
Disadvantages: ${selectedTraditionalStrategy.disadvantages.join(', ')}

Academic Papers:
${selectedTraditionalStrategy.papers.map(paper => `- ${paper}`).join('\n')}
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
    if (!isStepSkipped(4)) {
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
    if (!isStepSkipped(5)) {
      strategyString += `
## 6. RISK MANAGEMENT
Stop Loss: ${parameters.riskManagement.stopLoss}%
Take Profit: ${parameters.riskManagement.takeProfit}%
Position Size: ${parameters.riskManagement.positionSize}%
`;
    }

    // Instant Swap Settings (Step 6)
    if (!isStepSkipped(6)) {
      strategyString += `
## 7. INSTANT SWAP SETTINGS
Enabled: ${parameters.instantSwap.enabled ? 'Yes' : 'No'}
Stablecoin: ${parameters.instantSwap.stablecoin}
Minimum Profit Threshold: ${parameters.instantSwap.minProfitThreshold}%
Auto-Compound: ${parameters.instantSwap.autoCompound ? 'Yes' : 'No'}
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
## STRATEGY GENERATION INSTRUCTIONS
Based on the above comprehensive inputs, generate a CONCISE, ACTIONABLE crypto trading strategy that is easy to implement immediately.

Your response should be:
- CONCISE and to the point - avoid lengthy explanations
- Actionable and specific - tell the user exactly what to do
- Easy to implement - simple steps anyone can follow
- Based on all the inputs - incorporate token selection, strategy type, sentiment, research, parameters, and risk management
- NO markdown formatting - do not use asterisks (**) or other markdown symbols
- NO numbered sections or bullet points - just plain text

Example format:
"Buy [TOKEN] when [SPECIFIC CONDITION] occurs, using [TIMEFRAME] charts. Set stop loss at [X]% and take profit at [Y]%, with position size of [Z]% of your portfolio."

Keep it simple, direct, and implementable. Focus on the most important actionable insight from all the data provided.`;
        break;
      case 'gpt':
        strategyString += `
## STRATEGY GENERATION INSTRUCTIONS
Please analyze the provided information and create a CONCISE, ACTIONABLE trading strategy.

Your response should be:
- Concise and to the point
- Actionable and specific
- Easy to implement immediately
- Based on all the inputs provided
- No markdown formatting or bullet points

Focus on the most important actionable insight and keep it simple.`;
        break;
      case 'claude':
        strategyString += `
## STRATEGY GENERATION INSTRUCTIONS
Based on the comprehensive analysis above, provide a CONCISE, ACTIONABLE trading strategy.

Your response should be:
- Concise and to the point
- Actionable and specific
- Easy to implement immediately
- Based on all the inputs provided
- No markdown formatting or bullet points

Focus on practical, evidence-based recommendations that can be implemented right away.`;
        break;
    }

    return strategyString;
  };

  const handleGenerateStrategy = async () => {
    setLoading(true);
    setError('');

    try {
      const strategyString = generateStrategyString();
      console.log('🚀 Generating strategy with Gemini service...');
      console.log('Strategy input:', strategyString);
      
      // Use Gemini service directly instead of llmApi
      const response = await geminiService.generateStrategy(strategyString);
      console.log('✅ Strategy generated successfully:', response);
      
      setLlmResponse({ message: response });
      handleNext();
    } catch (err: any) {
      console.error('❌ Strategy generation failed:', err);
      setError(err.message || 'Failed to generate strategy');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    // Check if we should show SOL agents
    const shouldShowSOLAgents = selectedToken?.symbol === 'SOL' || parameters.coin === 'SOL';
    
    // If SOL is selected and we're on strategy generation step, show SOL agents
    if (shouldShowSOLAgents && step === 8) {
      return <SOLStrategyBuilder />;
    }
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a Solana Token
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a token from the Solana ecosystem to build your trading strategy around.
            </Typography>
            
            <TokenSelector onTokenSelect={handleTokenSelect} selectedToken={selectedToken} />
            {selectedToken && (
              <Alert 
                severity="success" 
                sx={{ 
                  mt: 2,
                  backgroundColor: '#f3e5f5',
                  border: '1px solid #9c27b0',
                  '& .MuiAlert-icon': {
                    color: '#9c27b0'
                  },
                  '& .MuiAlert-message': {
                    color: '#4a148c'
                  }
                }}
              >
                <Typography variant="body2">
                  Selected: <strong>{selectedToken.name} ({selectedToken.symbol})</strong> - {selectedToken.description}
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Foundational Strategy
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a traditional strategy to build upon.
            </Typography>
            <TraditionalStrategySelector 
              onStrategySelect={(strategy) => setSelectedTraditionalStrategy(strategy)}
              selectedStrategy={selectedTraditionalStrategy}
              onSkip={() => handleSkipStep(1)}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Market Sentiment Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Analyze market sentiment for {selectedToken?.symbol || 'selected token'} using AI-powered analysis of Discord, social media, news, and technical indicators.
            </Typography>
            
            {/* Skip Option */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleSkipStep(2)}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#f3e5f5',
                    borderColor: '#7b1fa2',
                    color: '#7b1fa2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(156, 39, 176, 0.2)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                startIcon={<span style={{ fontSize: '1.2rem' }}>⏭️</span>}
              >
                Skip this step - No sentiment analysis
              </Button>
            </Box>
            
            {selectedToken ? (
              <SentimentAnalysis asset={selectedToken.symbol} />
            ) : (
              <Alert severity="warning">
                Please select a token first to analyze sentiment.
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Research Integration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload a research document to generate a TL;DR summary for your strategy.
            </Typography>
            
            {/* Skip Option */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleSkipStep(3)}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#f3e5f5',
                    borderColor: '#7b1fa2',
                    color: '#7b1fa2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(156, 39, 176, 0.2)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                startIcon={<span style={{ fontSize: '1.2rem' }}>⏭️</span>}
              >
                Skip this step - No research integration
              </Button>
            </Box>
            
            <PDFUploader 
              onPDFStored={handlePDFStored}
              storedPDF={storedPDF}
              onSkip={handlePDFSkip}
            />
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Define Parameters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure the basic parameters for your trading strategy.
            </Typography>
            
            {/* Skip Option */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleSkipStep(4)}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#f3e5f5',
                    borderColor: '#7b1fa2',
                    color: '#7b1fa2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(156, 39, 176, 0.2)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                startIcon={<span style={{ fontSize: '1.2rem' }}>⏭️</span>}
              >
                Skip this step - Use default parameters
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Strategy Type</InputLabel>
                  <Select
                    value={parameters.strategyType}
                    label="Strategy Type"
                    onChange={(e) => handleParameterChange('strategyType', e.target.value)}
                  >
                    <MenuItem value="breakout">Breakout Strategy</MenuItem>
                    <MenuItem value="trend">Trend Following</MenuItem>
                    <MenuItem value="mean_reversion">Mean Reversion</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Breakout Condition</InputLabel>
                  <Select
                    value={parameters.breakoutCondition}
                    label="Breakout Condition"
                    onChange={(e) => handleParameterChange('breakoutCondition', e.target.value)}
                  >
                    <MenuItem value="price_increase">Price Increase</MenuItem>
                    <MenuItem value="volume_spike">Volume Spike</MenuItem>
                    <MenuItem value="pattern_breakout">Pattern Breakout</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Percentage Increase"
                  type="number"
                  value={parameters.percentageIncrease}
                  onChange={(e) => handleParameterChange('percentageIncrease', Number(e.target.value))}
                  InputProps={{
                    endAdornment: <Typography>%</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timeframe</InputLabel>
                  <Select
                    value={parameters.timeframe}
                    label="Timeframe"
                    onChange={(e) => handleParameterChange('timeframe', e.target.value)}
                  >
                    <MenuItem value="1m">1 Minute</MenuItem>
                    <MenuItem value="5m">5 Minutes</MenuItem>
                    <MenuItem value="15m">15 Minutes</MenuItem>
                    <MenuItem value="1h">1 Hour</MenuItem>
                    <MenuItem value="4h">4 Hours</MenuItem>
                    <MenuItem value="1d">1 Day</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Volume Condition</InputLabel>
                  <Select
                    value={parameters.volumeCondition}
                    label="Volume Condition"
                    onChange={(e) => handleParameterChange('volumeCondition', e.target.value)}
                  >
                    <MenuItem value="above_average">Above Average</MenuItem>
                    <MenuItem value="double_average">Double Average</MenuItem>
                    <MenuItem value="triple_average">Triple Average</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Risk Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure risk management parameters for your strategy.
            </Typography>
            
            {/* Skip Option */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleSkipStep(5)}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#f3e5f5',
                    borderColor: '#7b1fa2',
                    color: '#7b1fa2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(156, 39, 176, 0.2)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                startIcon={<span style={{ fontSize: '1.2rem' }}>⏭️</span>}
              >
                Skip this step - Use default risk management
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Stop Loss"
                  type="number"
                  value={parameters.riskManagement.stopLoss}
                  onChange={(e) => handleRiskManagementChange('stopLoss', Number(e.target.value))}
                  InputProps={{
                    endAdornment: <Typography>%</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Take Profit"
                  type="number"
                  value={parameters.riskManagement.takeProfit}
                  onChange={(e) => handleRiskManagementChange('takeProfit', Number(e.target.value))}
                  InputProps={{
                    endAdornment: <Typography>%</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Position Size"
                  type="number"
                  value={parameters.riskManagement.positionSize}
                  onChange={(e) => handleRiskManagementChange('positionSize', Number(e.target.value))}
                  InputProps={{
                    endAdornment: <Typography>%</Typography>
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 6:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Swap for Profit
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure automatic profit-taking through instant stablecoin swaps.
            </Typography>
            
            {/* Skip Option */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleSkipStep(6)}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#f3e5f5',
                    borderColor: '#7b1fa2',
                    color: '#7b1fa2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(156, 39, 176, 0.2)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                startIcon={<span style={{ fontSize: '1.2rem' }}>⏭️</span>}
              >
                Skip this step - No instant swap settings
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Instant Stablecoin Swap Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Configure automatic profit-taking through instant stablecoin swaps. This feature allows you to
                    automatically convert trading profits to stablecoins for immediate liquidity.
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Enable Instant Swap</InputLabel>
                        <Select<string>
                          value={parameters.instantSwap.enabled ? 'true' : 'false'}
                          label="Enable Instant Swap"
                          onChange={(e) => handleParameterChange('instantSwap', {
                            ...parameters.instantSwap,
                            enabled: e.target.value
                          })}
                        >
                          <MenuItem value="true">Enabled</MenuItem>
                          <MenuItem value="false">Disabled</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {parameters.instantSwap.enabled && (
                      <>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Stablecoin</InputLabel>
                            <Select
                              value={parameters.instantSwap.stablecoin}
                              label="Stablecoin"
                              onChange={(e) => handleParameterChange('instantSwap', {
                                ...parameters.instantSwap,
                                stablecoin: e.target.value
                              })}
                            >
                              <MenuItem value="USDC">USDC</MenuItem>
                              <MenuItem value="PYUSD">PYUSD</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Minimum Profit Threshold"
                            type="number"
                            value={parameters.instantSwap.minProfitThreshold}
                            onChange={(e) => handleParameterChange('instantSwap', {
                              ...parameters.instantSwap,
                              minProfitThreshold: Number(e.target.value)
                            })}
                            InputProps={{
                              endAdornment: <Typography>%</Typography>
                            }}
                            helperText="Minimum profit percentage to trigger swap"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Auto-Compound Profits</InputLabel>
                            <Select<string>
                              value={parameters.instantSwap.autoCompound ? 'true' : 'false'}
                              label="Auto-Compound Profits"
                              onChange={(e) => handleParameterChange('instantSwap', {
                                ...parameters.instantSwap,
                                autoCompound: e.target.value
                              })}
                            >
                              <MenuItem value="true">Enabled</MenuItem>
                              <MenuItem value="false">Disabled</MenuItem>
                            </Select>
                          </FormControl>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            When enabled, stablecoin profits will be automatically reinvested into the strategy
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 7:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Strategy String & Generation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review the concatenated strategy string and generate your comprehensive trading strategy.
            </Typography>
            
            {/* Model Selection */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Select LLM Model
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Model Type</InputLabel>
                  <Select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value as 'gemini' | 'gpt' | 'claude')}
                    label="Model Type"
                  >
                    <MenuItem value="gemini">Gemini (Recommended)</MenuItem>
                    <MenuItem value="gpt">GPT-4</MenuItem>
                    <MenuItem value="claude">Claude</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* Custom Modifications */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Custom Modifications
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add your own modifications or preferences to the strategy. For example:
                  "I want to be more conservative with stop losses" or "I prefer to enter on higher volume"
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={customModifications}
                  onChange={(e) => setCustomModifications(e.target.value)}
                  placeholder="Enter your custom modifications here..."
                  variant="outlined"
                />
              </CardContent>
            </Card>

            <StrategyStringBuilder
              selectedToken={selectedToken}
              selectedStrategy={selectedTraditionalStrategy}
              sentimentAnalysis={sentimentAnalysis}
              pdfSummary={pdfSummary}
              parameters={parameters}
              riskManagement={parameters.riskManagement}
              instantSwap={parameters.instantSwap}
              customModifications={customModifications}
              modelType={modelType}
              skippedSteps={skippedSteps}
            />

            {/* Generate Strategy Section */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Generate Strategy
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click the button below to generate your comprehensive trading strategy using the selected LLM model.
                </Typography>
                
                {pdfSummary && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Research-Driven Strategy:</strong> Your strategy will incorporate insights from the uploaded research document.
                    </Typography>
                  </Alert>
                )}
                
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  onClick={handleGenerateStrategy}
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate Strategy'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/backtest')}
                  disabled={!llmResponse}
                >
                  Proceed to Backtest
                </Button>
              </CardContent>
            </Card>
          </Box>
        );

      case 8:
        return (
          <Box>
            {/* Success Header with Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  mb: 4,
                  p: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                  }}
                />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  🎉 Strategy Generated Successfully!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Your AI-powered {parameters.coin} trading strategy is ready
                </Typography>
              </Box>
            </motion.div>

            {/* Strategy Content with Beautiful Styling */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper
                elevation={6}
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}
              >
                {/* Strategy Header */}
                <Box
                  sx={{
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    p: 3,
                    color: 'white'
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}
                      >
                        🧠
                      </Box>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                       Yoree-Generated Trading Strategy
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {parameters.coin} • {parameters.strategyType} • {parameters.timeframe}
                        {pdfSummary && ' • Research-Driven'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Strategy Content */}
                <Box sx={{ p: 4 }}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      borderRadius: 3,
                      p: 3,
                      border: '2px solid #e3e8f0',
                      '& pre': {
                        margin: 0,
                        padding: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        color: '#2d3748',
                        background: 'transparent'
                      }
                    }}
                  >
                    <pre>{llmResponse?.message}</pre>
                  </Box>
                </Box>
              </Paper>
            </motion.div>

            {/* Action Buttons with Enhanced Styling */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/backtest')}
                  disabled={!llmResponse}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)',
                    }
                  }}
                >
                  🚀 Start Backtesting
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    navigator.clipboard.writeText(llmResponse?.message || '');
                    // You could add a toast notification here
                  }}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      background: 'rgba(102, 126, 234, 0.05)',
                    }
                  }}
                >
                  📋 Copy Strategy
                </Button>

                <Button
                  variant="text"
                  size="large"
                  onClick={() => setActiveStep(0)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    color: '#6b7280',
                    border: '2px solid #d1d5db',
                    '&:hover': {
                      background: 'rgba(107, 114, 128, 0.1)',
                      borderColor: '#9ca3af',
                    }
                  }}
                >
                  🔄 Create New Strategy
                </Button>
              </Box>
            </motion.div>

            {/* Additional Info Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Grid container spacing={3} sx={{ mt: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Risk Level
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      📊
                    </Typography>
                    <Typography variant="body1">
                      {parameters.riskManagement.stopLoss}% Stop Loss
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Target Profit
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      💰
                    </Typography>
                    <Typography variant="body1">
                      {parameters.riskManagement.takeProfit}% Take Profit
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Timeframe
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      ⏰
                    </Typography>
                    <Typography variant="body1">
                      {parameters.timeframe}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>

            {/* Generated Strategy Display */}
            {llmResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Generated Strategy
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<ContentCopyIcon />}
                          onClick={() => {
                            navigator.clipboard.writeText(llmResponse.message || '');
                            // You could add a toast notification here
                          }}
                        >
                          Copy
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CodeIcon />}
                          onClick={() => {
                            // Generate backtest code logic
                            console.log('Generating backtest code...');
                          }}
                          disabled={loading}
                        >
                          Generate Code
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<DeployIcon />}
                          onClick={async () => {
                            if (!connected) {
                              setError('Please connect your wallet to deploy strategy');
                              return;
                            }
                            
                            setLoading(true);
                            try {
                              // Initialize strategy service
                              await strategyService.initializeProgram(wallet);
                              
                              // Convert parameters to strategy config
                              const strategyConfig: StrategyConfig = {
                                asset: parameters.coin,
                                strategyType: parameters.strategyType,
                                timeframe: parameters.timeframe,
                                stopLoss: parameters.riskManagement.stopLoss,
                                takeProfit: parameters.riskManagement.takeProfit,
                                positionSize: parameters.riskManagement.positionSize,
                                volumeCondition: parameters.volumeCondition,
                                breakoutCondition: parameters.breakoutCondition,
                              };
                              
                              // Deploy strategy to Solana
                              const deployedStrategy = await strategyService.deployStrategy(
                                wallet,
                                `YOREE ${parameters.coin} Strategy`,
                                strategyConfig
                              );
                              
                              console.log('Strategy deployed successfully:', deployedStrategy);
                              setError('Strategy deployed to Solana successfully!');
                            } catch (err: any) {
                              console.error('Strategy deployment failed:', err);
                              setError(err.message || 'Failed to deploy strategy to Solana');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading || !connected}
                        >
                          Deploy to Solana
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            Strategy Builder
          </Typography>

          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                mb: 4,
                overflowX: 'auto',
                '& .MuiStepLabel-root': {
                  minWidth: 0,
                },
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  lineHeight: 1.2,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                },
                '& .MuiStepLabel-labelContainer': {
                  padding: { xs: '0 2px', sm: '0 4px' },
                },
                '& .MuiStep-root': {
                  minWidth: 'auto',
                  flex: { xs: '0 0 auto', sm: 1 },
                },
                '& .MuiStepConnector-root': {
                  display: 'none',
                }
              }}
              orientation="horizontal"
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Progress Indicator */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Step {activeStep + 1} of {steps.length}
              </Typography>
              <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${((activeStep + 1) / steps.length) * 100}%`,
                    height: 8,
                    bgcolor: 'primary.main',
                    transition: 'width 0.3s ease-in-out',
                  }}
                />
              </Box>
            </Box>

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              {activeStep < steps.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default StrategyBuilder; 