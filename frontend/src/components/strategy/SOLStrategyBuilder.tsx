import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  LinearProgress,
  Divider,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  Security,
  Speed,
  Psychology,
  CheckCircle,
  Warning,
  Info,
  PlayArrow,
  Stop,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import solAgentService, { 
  SOLStrategyRequest, 
  SOLStrategyResponse, 
  SOLMarketData, 
  AgentStatus 
} from '../../services/solAgentService';

interface SOLStrategyBuilderProps {
  onStrategyGenerated?: (strategy: SOLStrategyResponse) => void;
}

const SOLStrategyBuilder: React.FC<SOLStrategyBuilderProps> = ({ onStrategyGenerated }) => {
  // Form state
  const [formData, setFormData] = useState({
    asset: 'SOL',
    timeframe: '1h',
    riskLevel: 'moderate' as 'low' | 'moderate' | 'high',
    investmentAmount: 1000,
    walletBalance: 5000,
  });

  // Agent state
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    marketAnalyzer: 'idle',
    technicalAnalyzer: 'idle',
    riskManager: 'idle',
    strategyGenerator: 'idle',
  });

  // Results state
  const [strategy, setStrategy] = useState<SOLStrategyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveMarketData, setLiveMarketData] = useState<SOLMarketData | null>(null);

  // Live market data updates
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const data = await solAgentService.getSOLMarketData();
        setLiveMarketData(data);
      } catch (error) {
        console.error('Error fetching live market data:', error);
      }
    };

    // Fetch initial data
    fetchLiveData();

    // Update every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const simulateAgentProgress = async () => {
    const agents = ['marketAnalyzer', 'technicalAnalyzer', 'riskManager', 'strategyGenerator'];
    
    for (const agent of agents) {
      setAgentStatus(prev => ({
        ...prev,
        [agent]: 'running'
      }));
      
      // Simulate agent processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      setAgentStatus(prev => ({
        ...prev,
        [agent]: 'completed'
      }));
    }
  };

  const generateStrategy = async () => {
    setIsGenerating(true);
    setError(null);
    setStrategy(null);
    
    // Reset agent status
    setAgentStatus({
      marketAnalyzer: 'idle',
      technicalAnalyzer: 'idle',
      riskManager: 'idle',
      strategyGenerator: 'idle',
    });

    try {
      // Start agent simulation
      simulateAgentProgress();
      
      // Generate strategy with agents
      const request: SOLStrategyRequest = {
        asset: formData.asset,
        timeframe: formData.timeframe,
        riskLevel: formData.riskLevel,
        investmentAmount: formData.investmentAmount,
        walletBalance: formData.walletBalance,
      };

      const result = await solAgentService.generateSOLStrategy(request);
      setStrategy(result);
      
      if (onStrategyGenerated) {
        onStrategyGenerated(result);
      }

    } catch (error) {
      console.error('Error generating strategy:', error);
      setError('Failed to generate strategy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getAgentIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CircularProgress size={16} />;
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Warning color="error" />;
      default:
        return <Info color="disabled" />;
    }
  };

  const getAgentColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 4,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🤖 SOL Strategy Builder
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          AI-powered strategy generation for Solana using live market data
        </Typography>

        {/* Live Market Data */}
        {liveMarketData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 4, background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)', color: 'white' }}>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                        <TrendingUp />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">SOL</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Solana
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="h5" fontWeight="bold">
                      ${liveMarketData.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Current Price
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography 
                      variant="h6" 
                      color={liveMarketData.price_change_percentage_24h >= 0 ? 'success.light' : 'error.light'}
                    >
                      {liveMarketData.price_change_percentage_24h >= 0 ? '+' : ''}
                      {liveMarketData.price_change_percentage_24h.toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      24h Change
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="h6">
                      ${(liveMarketData.volume_24h / 1000000).toFixed(1)}M
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      24h Volume
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Last updated: {new Date(liveMarketData.last_updated).toLocaleTimeString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Grid container spacing={4}>
          {/* Strategy Configuration */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    🎯 Strategy Configuration
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Asset</InputLabel>
                      <Select
                        value={formData.asset}
                        label="Asset"
                        onChange={(e) => handleFormChange('asset', e.target.value)}
                      >
                        <MenuItem value="SOL">SOL - Solana</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Timeframe</InputLabel>
                      <Select
                        value={formData.timeframe}
                        label="Timeframe"
                        onChange={(e) => handleFormChange('timeframe', e.target.value)}
                      >
                        <MenuItem value="5m">5 minutes</MenuItem>
                        <MenuItem value="15m">15 minutes</MenuItem>
                        <MenuItem value="1h">1 hour</MenuItem>
                        <MenuItem value="4h">4 hours</MenuItem>
                        <MenuItem value="1d">1 day</MenuItem>
                      </Select>
                    </FormControl>

                    <Box sx={{ mb: 2 }}>
                      <Typography gutterBottom>Risk Level</Typography>
                      <Slider
                        value={formData.riskLevel === 'low' ? 1 : formData.riskLevel === 'moderate' ? 2 : 3}
                        onChange={(_, value) => {
                          const riskLevel = value === 1 ? 'low' : value === 2 ? 'moderate' : 'high';
                          handleFormChange('riskLevel', riskLevel);
                        }}
                        min={1}
                        max={3}
                        step={1}
                        marks={[
                          { value: 1, label: 'Low' },
                          { value: 2, label: 'Moderate' },
                          { value: 3, label: 'High' },
                        ]}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      label="Investment Amount ($)"
                      type="number"
                      value={formData.investmentAmount}
                      onChange={(e) => handleFormChange('investmentAmount', parseFloat(e.target.value) || 0)}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Wallet Balance ($)"
                      type="number"
                      value={formData.walletBalance}
                      onChange={(e) => handleFormChange('walletBalance', parseFloat(e.target.value) || 0)}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={generateStrategy}
                    disabled={isGenerating}
                    startIcon={isGenerating ? <CircularProgress size={20} /> : <PlayArrow />}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      borderRadius: '12px',
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      }
                    }}
                  >
                    {isGenerating ? 'Generating Strategy...' : 'Generate SOL Strategy'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Agent Status */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    🤖 AI Agent Status
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    {Object.entries(agentStatus).map(([agent, status]) => (
                      <Box key={agent} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getAgentIcon(status)}
                          <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                            {agent.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Agent
                          </Typography>
                          <Chip
                            label={status}
                            size="small"
                            color={getAgentColor(status) as any}
                            variant="outlined"
                          />
                        </Box>
                        {status === 'running' && (
                          <LinearProgress sx={{ height: 4, borderRadius: 2 }} />
                        )}
                      </Box>
                    ))}
                  </Box>

                  {isGenerating && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      AI agents are analyzing live SOL market data and generating your strategy...
                    </Alert>
                  )}

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Strategy Results */}
        <AnimatePresence>
          {strategy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    🎯 Generated SOL Strategy
                  </Typography>
                  
                  <Grid container spacing={4}>
                    {/* Strategy Parameters */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        📊 Strategy Parameters
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Entry Price:</Typography>
                          <Typography fontWeight="bold">${strategy.strategy.entry.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Target Price:</Typography>
                          <Typography fontWeight="bold" color="success.light">
                            ${strategy.strategy.target.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Stop Loss:</Typography>
                          <Typography fontWeight="bold" color="error.light">
                            ${strategy.strategy.stopLoss.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Position Size:</Typography>
                          <Typography fontWeight="bold">${strategy.strategy.positionSize.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Risk Percentage:</Typography>
                          <Typography fontWeight="bold">{strategy.strategy.riskPercentage}%</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Confidence:</Typography>
                          <Typography fontWeight="bold">{strategy.strategy.confidence}%</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Market Analysis */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        📈 Market Analysis
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={strategy.analysis.marketTrend} 
                          color={strategy.analysis.marketTrend === 'Bullish' ? 'success' : 'error'}
                          sx={{ mb: 1 }}
                        />
                      </Box>
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Technical Signals:</strong>
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {strategy.analysis.technicalSignals.map((signal, index) => (
                          <Chip 
                            key={index} 
                            label={signal} 
                            size="small" 
                            variant="outlined" 
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Recommendations:</strong>
                      </Typography>
                      <Box>
                        {strategy.analysis.recommendations.map((rec, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                            • {rec}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<Refresh />}
                      onClick={generateStrategy}
                      sx={{ mr: 2 }}
                    >
                      Regenerate Strategy
                    </Button>
                    <Button
                      variant="contained"
                      color="inherit"
                      startIcon={<CheckCircle />}
                      sx={{ 
                        background: 'rgba(255,255,255,0.2)',
                        '&:hover': { background: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      Save Strategy
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  );
};

export default SOLStrategyBuilder; 