import React, { useState } from 'react';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AddCircle as AddCircleIcon,
  AutoAwesome as AIIcon,
  AutoAwesome as SparkleIcon,
  ShowChart as ChartIcon,
  DataObject as DataIcon,
  Psychology as BrainIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  FlashOn as FlashIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { signalService, syuzhetService } from '../../services';
import { signalAgentOrchestrator, SignalAgentOrchestrationRequest } from '../../services/signalAgentOrchestrator';
import { Signal, SignalCreationRequest, MinamFeed, SignalCreator } from '../../types/signal';
import DataFeedSelector from './DataFeedSelector';
import AgentIdentifier from './AgentIdentifier';
import SignalSuccessScreen from './SignalSuccessScreen';
import OrnateAgentProgress from './OrnateAgentProgress';
import AvatarCreator, { AvatarData } from './AvatarCreator';

const steps = ['Input Hypothesis', 'Select Data Feeds', 'Review & Create'];

interface SignalTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'Technical' | 'Fundamental' | 'Sentiment' | 'Macro';
}

const signalTemplates: SignalTemplate[] = [
  {
    id: 'momentum',
    name: 'Momentum Signal',
    description: 'Track price momentum and trend strength across multiple timeframes',
    icon: <TrendingUpIcon />,
    color: '#00FF88',
    category: 'Technical'
  },
  {
    id: 'sentiment',
    name: 'Sentiment Signal',
    description: 'Analyze market sentiment from social media and news sources',
    icon: <BrainIcon />,
    color: '#00D4FF',
    category: 'Sentiment'
  },
  {
    id: 'fundamental',
    name: 'Fundamental Signal',
    description: 'Evaluate on-chain metrics and fundamental indicators',
    icon: <DataIcon />,
    color: '#667eea',
    category: 'Fundamental'
  },
  {
    id: 'macro',
    name: 'Macro Signal',
    description: 'Capture broader market trends and regime changes',
    icon: <ChartIcon />,
    color: '#764ba2',
    category: 'Macro'
  }
];

const SignalCreationWizard: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [underlyingAsset, setUnderlyingAsset] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [useAIGeneration, setUseAIGeneration] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<SignalTemplate | null>(null);
  const [selectedFeed1, setSelectedFeed1] = useState<MinamFeed | null>(null);
  const [selectedFeed2, setSelectedFeed2] = useState<MinamFeed | null>(null);
  const [creator, setCreator] = useState<SignalCreator>({
    type: 'human',
    id: 'user-1',
    name: 'User',
    isAgentAnnounced: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdSignal, setCreatedSignal] = useState<Signal | null>(null);
  const [useAgenticOrchestration, setUseAgenticOrchestration] = useState(false);
  const [agentProgress, setAgentProgress] = useState<any>(null);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);

  const handleNext = async () => {
    // If using agentic orchestration, trigger it directly from step 0
    if (useAgenticOrchestration && activeStep === 0) {
      return handleAgenticOrchestration();
    }

    if (activeStep === 0) {
      // Generate thesis if using AI
      if (useAIGeneration && rawInput) {
        setLoading(true);
        setError(null);
        try {
          const thesis = await syuzhetService.generateThesis({ raw_input: rawInput });
          setHypothesis(thesis.hypothesis);
          setActiveStep(1);
        } catch (err: any) {
          setError(err.message || 'Failed to generate thesis');
          return;
        } finally {
          setLoading(false);
        }
      } else if (hypothesis && underlyingAsset) {
        setActiveStep(1);
      } else {
        setError('Please provide either raw input for AI generation or a hypothesis');
        return;
      }
    } else if (activeStep === 1) {
      if (selectedFeed1 && selectedFeed2) {
        setActiveStep(2);
      } else {
        setError('Please select exactly 2 data feeds');
        return;
      }
    } else {
      handleCreateSignal();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError(null);
  };

  const handleAgenticOrchestration = async () => {
    if (!underlyingAsset && !rawInput) {
      setError('Please provide either an underlying asset or raw input for agentic orchestration');
      return;
    }

    setLoading(true);
    setError(null);
    setAgentProgress({
      currentStep: 0,
      totalSteps: 3,
      steps: [],
    });

    try {
      const request: SignalAgentOrchestrationRequest = {
        rawInput: rawInput || undefined,
        underlyingAsset: underlyingAsset || undefined,
        hypothesis: hypothesis || undefined,
        preferences: {
          signalType: selectedTemplate?.id as any,
          riskTolerance: 'medium',
        },
      };

      const result = await signalAgentOrchestrator.orchestrateSignalCreation(request);

      // Update UI with agent-selected feeds and hypothesis
      setSelectedFeed1(result.dataFeeds.feed1);
      setSelectedFeed2(result.dataFeeds.feed2);
      setHypothesis(result.hypothesis.refined);
      setUnderlyingAsset(result.signal.underlyingAsset);

      setAgentProgress({
        currentStep: 3,
        totalSteps: 3,
        steps: result.agentSteps,
        result,
      });

      setCreatedSignal(result.signal);
      setSuccess(true);
      
      // Automatically add to portfolio and active signals list (localStorage for now)
      try {
        // Add to portfolio
        const portfolioSignals = JSON.parse(localStorage.getItem('yoree_portfolio_signals') || '[]');
        portfolioSignals.push({
          signal: result.signal,
          addedAt: new Date().toISOString(),
        });
        localStorage.setItem('yoree_portfolio_signals', JSON.stringify(portfolioSignals));

        // Add to active signals list for markets page
        const activeSignals = JSON.parse(localStorage.getItem('yoree_active_signals') || '[]');
        // Check if signal already exists
        const existingIndex = activeSignals.findIndex((s: Signal) => s.id === result.signal.id);
        if (existingIndex >= 0) {
          activeSignals[existingIndex] = result.signal; // Update existing
        } else {
          activeSignals.push(result.signal); // Add new
        }
        localStorage.setItem('yoree_active_signals', JSON.stringify(activeSignals));
      } catch (e) {
        console.warn('Failed to save to portfolio:', e);
      }
    } catch (err: any) {
      setError(err.message || 'Agentic orchestration failed');
      setAgentProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSignal = async () => {
    // If using agentic orchestration, use the 3-agent pipeline
    if (useAgenticOrchestration) {
      return handleAgenticOrchestration();
    }

    // Manual creation flow
    if (!underlyingAsset || !hypothesis || !selectedFeed1 || !selectedFeed2) {
      setError('Please complete all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: SignalCreationRequest = {
        underlyingAsset,
        hypothesis,
        rawInput: useAIGeneration ? rawInput : undefined,
        feed1Id: selectedFeed1.id,
        feed2Id: selectedFeed2.id,
        creator,
      };

      const signal = await signalService.createSignal(request);
      setCreatedSignal(signal);
      setSuccess(true);
      
      // Automatically add to portfolio and active signals list (localStorage for now)
      try {
        // Add to portfolio
        const portfolioSignals = JSON.parse(localStorage.getItem('yoree_portfolio_signals') || '[]');
        portfolioSignals.push({
          signal: signal,
          addedAt: new Date().toISOString(),
        });
        localStorage.setItem('yoree_portfolio_signals', JSON.stringify(portfolioSignals));

        // Add to active signals list for markets page
        const activeSignals = JSON.parse(localStorage.getItem('yoree_active_signals') || '[]');
        // Check if signal already exists
        const existingIndex = activeSignals.findIndex((s: Signal) => s.id === signal.id);
        if (existingIndex >= 0) {
          activeSignals[existingIndex] = signal; // Update existing
        } else {
          activeSignals.push(signal); // Add new
        }
        localStorage.setItem('yoree_active_signals', JSON.stringify(activeSignals));
        
        // Dispatch event to notify markets page to refresh
        window.dispatchEvent(new Event('signalCreated'));
      } catch (e) {
        console.warn('Failed to save to portfolio:', e);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create signal');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setUnderlyingAsset('');
    setRawInput('');
    setHypothesis('');
    setSelectedTemplate(null);
    setSelectedFeed1(null);
    setSelectedFeed2(null);
    setError(null);
    setSuccess(false);
    setCreatedSignal(null);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AddCircleIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              </motion.div>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 2 }}>
                🚀 Create Your Signal
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Transform your intuition into a tradeable signal asset
              </Typography>
            </Box>

            {/* Signal Type Templates */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 2 }}>
                Choose Signal Type (Optional)
              </Typography>
              <Grid container spacing={2}>
                {signalTemplates.map((template) => (
                  <Grid item xs={12} sm={6} md={3} key={template.id}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        onClick={() => setSelectedTemplate(template)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: '16px',
                          background: selectedTemplate?.id === template.id
                            ? `linear-gradient(135deg, ${template.color}20 0%, ${template.color}10 100%)`
                            : theme.palette.mode === 'dark'
                            ? 'rgba(26, 31, 58, 0.6)'
                            : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: selectedTemplate?.id === template.id
                            ? `2px solid ${template.color}`
                            : `1px solid ${theme.palette.divider}`,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: `0 8px 24px ${template.color}30`,
                            transform: 'translateY(-4px)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: `linear-gradient(90deg, ${template.color} 0%, ${template.color}80 100%)`,
                            opacity: selectedTemplate?.id === template.id ? 1 : 0.3,
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                mr: 2,
                                background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}80 100%)`,
                                color: 'white'
                              }}
                            >
                              {template.icon}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                                {template.name}
                              </Typography>
                              <Chip
                                label={template.category}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  backgroundColor: `${template.color}20`,
                                  color: template.color,
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                            {selectedTemplate?.id === template.id && (
                              <CheckIcon sx={{ color: template.color }} />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}>
                            {template.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Input Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 2 }}>
                Signal Details
              </Typography>
              <TextField
                fullWidth
                label="Underlying Asset"
                placeholder="e.g., ETH, BTC, macro regime, narrative"
                value={underlyingAsset}
                onChange={(e) => setUnderlyingAsset(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
                required
              />

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useAIGeneration}
                      onChange={(e) => setUseAIGeneration(e.target.checked)}
                      sx={{
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AIIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Use AI to generate hypothesis from input
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useAgenticOrchestration}
                      onChange={(e) => setUseAgenticOrchestration(e.target.checked)}
                      sx={{
                        color: theme.palette.success.main,
                        '&.Mui-checked': {
                          color: theme.palette.success.main,
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FlashIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        🤖 Use Agentic Orchestration (3-Agent Pipeline)
                      </Typography>
                    </Box>
                  }
                />
                {useAgenticOrchestration && (
                  <Alert severity="info" sx={{ mt: 1, borderRadius: '12px' }}>
                    <Typography variant="body2">
                      <strong>Agentic Orchestration:</strong> Three specialized AI agents will automatically:
                      <br />• <strong>Agent 1:</strong> Select optimal data feeds from Minam
                      <br />• <strong>Agent 2:</strong> Generate/refine hypothesis using Syuzhet
                      <br />• <strong>Agent 3:</strong> Deploy and create the signal
                    </Typography>
                  </Alert>
                )}
              </Box>

              {useAIGeneration ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Raw Input"
                    placeholder="Enter your intuition, research notes, URLs, or upload files..."
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                    helperText={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <AIIcon sx={{ fontSize: 16, color: theme.palette.secondary.main }} />
                        <Typography variant="caption">
                          AI will analyze your input and generate a structured hypothesis automatically
                        </Typography>
                      </Box>
                    }
                  />
                  {hypothesis && (
                    <Alert severity="success" sx={{ borderRadius: '12px', mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Generated Hypothesis:
                      </Typography>
                      <Typography variant="body2">
                        {hypothesis}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              ) : (
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Hypothesis"
                  placeholder="Enter your hypothesis or interpretation..."
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                  required
                />
              )}

              <Box sx={{ mb: 3 }}>
                <AgentIdentifier
                  creator={creator}
                  onChange={setCreator}
                />
                {creator.type === 'agent' && (
                  <Button
                    variant="outlined"
                    startIcon={<SparkleIcon />}
                    onClick={() => setShowAvatarCreator(true)}
                    sx={{
                      mt: 2,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Create Agent Avatar
                  </Button>
                )}
              </Box>
              
              {showAvatarCreator && (
                <Box sx={{ mb: 3 }}>
                  <AvatarCreator
                    onSave={(data: AvatarData) => {
                      setAvatarData(data);
                      setShowAvatarCreator(false);
                    }}
                    initialAvatar={avatarData || undefined}
                  />
                </Box>
              )}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <DataIcon sx={{ fontSize: 60, color: theme.palette.secondary.main, mb: 2 }} />
              </motion.div>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 2 }}>
                📊 Select Data Feeds
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Choose two real-time data feeds to power your signal
              </Typography>
            </Box>
            <DataFeedSelector
              selectedFeed1={selectedFeed1}
              selectedFeed2={selectedFeed2}
              onFeed1Change={setSelectedFeed1}
              onFeed2Change={setSelectedFeed2}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CheckIcon sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
              </motion.div>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 2 }}>
                ✅ Review & Create Signal
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Review your signal details before deploying to the market
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(26, 31, 58, 0.6)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 2 }}>
                    Signal Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Underlying Asset
                    </Typography>
                    <Chip label={underlyingAsset} color="primary" sx={{ fontWeight: 600 }} />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Hypothesis
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, lineHeight: 1.6 }}>
                      {hypothesis}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Creator
                    </Typography>
                    <Chip
                      icon={creator.type === 'agent' ? <BrainIcon /> : <AddCircleIcon />}
                      label={creator.type === 'agent' ? `Agent: ${creator.name || creator.id}` : `Human: ${creator.name || 'User'}`}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(26, 31, 58, 0.6)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', mb: 2 }}>
                    Data Feeds
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Feed 1
                    </Typography>
                    <Chip
                      label={selectedFeed1?.name || 'Not selected'}
                      color="secondary"
                      sx={{ fontWeight: 600 }}
                    />
                    {selectedFeed1 && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: theme.palette.text.secondary }}>
                        {selectedFeed1.type} • {selectedFeed1.provider}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Feed 2
                    </Typography>
                    <Chip
                      label={selectedFeed2?.name || 'Not selected'}
                      color="secondary"
                      sx={{ fontWeight: 600 }}
                    />
                    {selectedFeed2 && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: theme.palette.text.secondary }}>
                        {selectedFeed2.type} • {selectedFeed2.provider}
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Asset Branch Preview */}
            <Box sx={{ mt: 4 }}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(26, 31, 58, 0.6)'
                    : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ChartIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    Asset Discovery Preview
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Once your signal is created, Yoree will automatically discover related assets across all asset classes:
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { name: 'Crypto', icon: '₿', color: '#F7931A', count: underlyingAsset.toLowerCase().includes('eth') || underlyingAsset.toLowerCase().includes('crypto') ? 3 : 1 },
                    { name: 'Stocks', icon: '📈', color: '#00C853', count: underlyingAsset.toLowerCase().includes('oil') || underlyingAsset.toLowerCase().includes('venezuela') ? 2 : 0 },
                    { name: 'Futures', icon: '📊', color: '#2196F3', count: underlyingAsset.toLowerCase().includes('oil') ? 1 : 0 },
                    { name: 'Forex', icon: '💱', color: '#9C27B0', count: 0 },
                    { name: 'Predictions', icon: '🔮', color: '#FF9800', count: underlyingAsset.toLowerCase().includes('oil') || underlyingAsset.toLowerCase().includes('venezuela') ? 1 : 0 },
                    { name: 'ETFs', icon: '📦', color: '#00BCD4', count: underlyingAsset.toLowerCase().includes('oil') ? 1 : 0 },
                    { name: 'Bonds', icon: '💵', color: '#4CAF50', count: 0 },
                    { name: 'Commodities', icon: '⚡', color: '#FF5722', count: underlyingAsset.toLowerCase().includes('oil') ? 1 : 0 },
                  ].map((assetClass) => (
                    <Grid item xs={6} sm={4} md={3} key={assetClass.name}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          background: assetClass.count > 0
                            ? `${assetClass.color}20`
                            : theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${assetClass.count > 0 ? assetClass.color : theme.palette.divider}`,
                          textAlign: 'center',
                          opacity: assetClass.count > 0 ? 1 : 0.5,
                        }}
                      >
                        <Typography variant="h5" sx={{ mb: 0.5 }}>
                          {assetClass.icon}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                          {assetClass.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {assetClass.count > 0 ? `${assetClass.count} asset${assetClass.count !== 1 ? 's' : ''}` : 'Auto-discover'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                  <Typography variant="body2">
                    <strong>How it works:</strong> Yoree analyzes your signal and automatically discovers related assets across crypto, stocks, futures, forex, predictions, ETFs, bonds, and commodities. Connect your exchange accounts to trade these assets directly from the platform.
                  </Typography>
                </Alert>
              </Card>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Show success screen if signal was created
  if (success && createdSignal) {
    return (
      <SignalSuccessScreen
        signal={createdSignal}
        onTokenize={() => {
          // Handle tokenization - will create component for this
          console.log('Tokenize signal:', createdSignal.id);
        }}
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: theme.palette.mode === 'dark'
              ? 'rgba(26, 31, 58, 0.8)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              '& .MuiStepLabel-root': {
                '& .MuiStepLabel-label': {
                  color: theme.palette.text.secondary,
                  '&.Mui-active': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  },
                  '&.Mui-completed': {
                    color: theme.palette.success.main,
                  }
                }
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}

                {agentProgress && (
                  <OrnateAgentProgress
                    steps={agentProgress.steps || []}
                    currentStep={agentProgress.currentStep || 0}
                    totalSteps={agentProgress.totalSteps || 3}
                  />
                )}


          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleCreateSignal}
                  disabled={loading || success}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FlashIcon />}
                  endIcon={!loading && !success ? <ArrowForwardIcon /> : null}
                  sx={{
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #667eea 100%)',
                    }
                  }}
                >
                  {loading ? 'Creating...' : success ? 'Created!' : 'Create Signal'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                  sx={{
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #667eea 100%)',
                    }
                  }}
                >
                  {loading 
                    ? 'Processing...' 
                    : useAgenticOrchestration && activeStep === 0
                    ? '🤖 Start Agentic Orchestration'
                    : 'Next'}
                </Button>
              )}
            </Box>
          </Box>

          {success && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Create Another Signal
              </Button>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
};

export default SignalCreationWizard;
