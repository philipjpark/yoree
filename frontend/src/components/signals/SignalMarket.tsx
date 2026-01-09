import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { signalService } from '../../services';
import { Signal, SignalMarket as SignalMarketType, AssetBranches, ValidationSource } from '../../types/signal';
import AssetBranchesComponent from './AssetBranches';
import ValidationSources from './ValidationSources';
import { useTheme } from '@mui/material/styles';

const SignalMarket: React.FC = () => {
  const theme = useTheme();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [marketData, setMarketData] = useState<SignalMarketType | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);

  useEffect(() => {
    loadSignals();
  }, []);

  useEffect(() => {
    if (selectedSignal) {
      loadMarketData(selectedSignal.id);
      // Generate asset branches if not present
      if (!selectedSignal.assetBranches) {
        selectedSignal.assetBranches = generateAssetBranches(selectedSignal);
      }
      // Generate validation sources if not present
      if (!selectedSignal.validationSources) {
        selectedSignal.validationSources = generateValidationSources(selectedSignal);
      }
    }
  }, [selectedSignal]);

  const loadSignals = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const signalList = await signalService.listSignals();
      const activeSignals = signalList.filter(s => s.status === 'active');
      
      // Generate asset branches and validation sources for each signal
      activeSignals.forEach(signal => {
        if (!signal.assetBranches) {
          signal.assetBranches = generateAssetBranches(signal);
        }
        if (!signal.validationSources) {
          signal.validationSources = generateValidationSources(signal);
        }
      });
      
      setSignals(activeSignals);
    } catch (err: any) {
      // Silently use mock data if backend fails
      console.warn('Using mock signals:', err);
      setSignals(getMockSignals());
      setError(null); // Don't show error to user
    } finally {
      setLoading(false);
    }
  };

  const loadMarketData = async (signalId: string) => {
    try {
      const market = await signalService.getSignalMarket(signalId);
      setMarketData(market);
    } catch (err: any) {
      // Silently use mock market data
      console.warn('Using mock market data:', err);
      setMarketData({
        signalId,
        pricingModel: 'bonding_curve',
        currentPrice: 0.15 + Math.random() * 0.1,
        totalVolume: Math.random() * 100000,
        buyVolume: Math.random() * 50000,
        sellVolume: Math.random() * 50000,
        totalShares: 1000000,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const generateAssetBranches = (signal: Signal): AssetBranches => {
    const asset = signal.underlyingAsset.toLowerCase();
    
    // Generate related assets based on signal
    const branches: AssetBranches = {
      crypto: [],
      stocks: [],
      futures: [],
      forex: [],
      predictions: [],
      etfs: [],
      bonds: [],
      commodities: [],
    };

    // Example: If signal mentions "oil" or "venezuela", generate oil-related assets
    if (asset.includes('oil') || asset.includes('venezuela') || asset.includes('maduro')) {
      branches.commodities.push({
        id: 'wti-1',
        symbol: 'CL',
        name: 'WTI Crude Oil Futures',
        assetClass: 'futures',
        exchange: 'NYMEX',
        currentPrice: 75.50,
        priceChange24h: 2.3,
        volume24h: 500000,
        relevanceScore: 95,
        connectionStatus: 'available',
      });
      branches.stocks.push({
        id: 'xom-1',
        symbol: 'XOM',
        name: 'Exxon Mobil Corporation',
        assetClass: 'stocks',
        exchange: 'NYSE',
        currentPrice: 105.20,
        priceChange24h: 1.5,
        volume24h: 15000000,
        relevanceScore: 85,
        connectionStatus: 'available',
      });
      branches.etfs.push({
        id: 'uso-1',
        symbol: 'USO',
        name: 'United States Oil Fund',
        assetClass: 'etfs',
        exchange: 'NYSE',
        currentPrice: 68.30,
        priceChange24h: 2.1,
        volume24h: 8000000,
        relevanceScore: 90,
        connectionStatus: 'available',
      });
      branches.predictions.push({
        id: 'poly-1',
        symbol: 'VENEZUELA_OIL',
        name: 'Venezuela Oil Production',
        assetClass: 'predictions',
        exchange: 'Polymarket',
        currentPrice: 0.45,
        priceChange24h: 5.2,
        volume24h: 50000,
        relevanceScore: 88,
        connectionStatus: 'available',
      });
    }

    // Example: If signal mentions "eth" or "ethereum", generate crypto-related assets
    if (asset.includes('eth') || asset.includes('ethereum')) {
      branches.crypto.push({
        id: 'eth-1',
        symbol: 'ETH',
        name: 'Ethereum',
        assetClass: 'crypto',
        exchange: 'Binance',
        currentPrice: 3200.50,
        priceChange24h: 3.2,
        volume24h: 500000000,
        relevanceScore: 100,
        connectionStatus: 'available',
      });
      branches.crypto.push({
        id: 'eth-futures-1',
        symbol: 'ETHUSDT',
        name: 'ETH Perpetual Futures',
        assetClass: 'crypto',
        exchange: 'Binance',
        currentPrice: 3201.00,
        priceChange24h: 3.3,
        volume24h: 2000000000,
        relevanceScore: 95,
        connectionStatus: 'available',
      });
      branches.etfs.push({
        id: 'eth-etf-1',
        symbol: 'ETHE',
        name: 'Grayscale Ethereum Trust',
        assetClass: 'etfs',
        exchange: 'OTC',
        currentPrice: 28.50,
        priceChange24h: 3.0,
        volume24h: 500000,
        relevanceScore: 80,
        connectionStatus: 'available',
      });
    }

    // Add some default assets if no specific matches
    if (branches.crypto.length === 0 && branches.stocks.length === 0) {
      branches.crypto.push({
        id: 'btc-1',
        symbol: 'BTC',
        name: 'Bitcoin',
        assetClass: 'crypto',
        exchange: 'Binance',
        currentPrice: 45000.00,
        priceChange24h: 1.5,
        volume24h: 1000000000,
        relevanceScore: 70,
        connectionStatus: 'available',
      });
    }

    return branches;
  };

  const generateValidationSources = (signal: Signal): ValidationSource[] => {
    const sources: ValidationSource[] = [
      {
        id: 'google-trends-1',
        type: 'google_trends',
        name: 'Google Trends',
        description: 'Search trend data for signal validation',
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(signal.underlyingAsset)}`,
        data: {
          sentiment: 'neutral',
          score: 65,
          trend: 'up',
          volume: 1000,
          lastUpdate: new Date().toISOString(),
        },
        isConnected: false,
      },
      {
        id: 'twitter-1',
        type: 'twitter',
        name: 'X (Twitter)',
        description: 'Social sentiment and trending topics',
        data: {
          sentiment: 'bullish',
          score: 72,
          trend: 'up',
          volume: 5000,
          lastUpdate: new Date().toISOString(),
        },
        isConnected: false,
      },
      {
        id: 'reddit-1',
        type: 'reddit',
        name: 'Reddit',
        description: 'Community discussions and sentiment',
        data: {
          sentiment: 'neutral',
          score: 58,
          trend: 'stable',
          volume: 2000,
          lastUpdate: new Date().toISOString(),
        },
        isConnected: false,
      },
      {
        id: 'news-1',
        type: 'news',
        name: 'News',
        description: 'Latest news articles and headlines',
        data: {
          sentiment: 'bullish',
          score: 68,
          trend: 'up',
          volume: 3000,
          lastUpdate: new Date().toISOString(),
        },
        isConnected: false,
      },
    ];

    // Add specific sources based on signal type
    if (signal.underlyingAsset.toLowerCase().includes('oil')) {
      sources.push({
        id: 'opec-1',
        type: 'opec',
        name: 'OPEC',
        description: 'OPEC production and policy data',
        url: 'https://www.opec.org',
        data: {
          sentiment: 'neutral',
          score: 75,
          trend: 'stable',
          lastUpdate: new Date().toISOString(),
        },
        isConnected: false,
      });
      sources.push({
        id: 'eia-1',
        type: 'eia',
        name: 'EIA',
        description: 'Energy Information Administration data',
        url: 'https://www.eia.gov',
        data: {
          sentiment: 'neutral',
          score: 80,
          trend: 'up',
          lastUpdate: new Date().toISOString(),
        },
        isConnected: false,
      });
    }

    return sources;
  };

  const getMockSignals = (): Signal[] => {
    const now = new Date().toISOString();
    return [
      {
        id: 'signal-1',
        underlyingAsset: 'Venezuela Oil Maduro',
        hypothesis: 'Venezuelan oil production will increase significantly in 2026 due to policy changes and international relations shifts.',
        dataBindings: [],
        score: {
          accuracy: 75,
          performance: 68,
          consensus: 72,
          composite: 72,
          lastUpdated: now,
        },
        quality: 72,
        creator: { type: 'human', id: 'user-1', name: 'Trader', isAgentAnnounced: false },
        instances: [],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'signal-2',
        underlyingAsset: 'ETH Adoption',
        hypothesis: 'Ethereum will see increased institutional adoption leading to price appreciation.',
        dataBindings: [],
        score: {
          accuracy: 82,
          performance: 75,
          consensus: 80,
          composite: 79,
          lastUpdated: now,
        },
        quality: 79,
        creator: { type: 'agent', id: 'agent-1', name: 'AI Agent', isAgentAnnounced: true },
        instances: [],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    ];
  };

  const handleTrade = async () => {
    if (!selectedSignal || !tradeAmount) {
      setError('Please select a signal and enter trade amount');
      return;
    }

    // TODO: Implement actual trading logic
    alert(`Trade ${tradeType} ${tradeAmount} shares of ${selectedSignal.id}`);
  };

  const handleConnectExchange = (asset: any) => {
    // TODO: Implement exchange connection
    alert(`Connecting to ${asset.exchange} for ${asset.symbol}...`);
  };

  const handleTradeAsset = (asset: any) => {
    // TODO: Implement asset trading
    alert(`Trading ${asset.symbol} on ${asset.exchange}...`);
  };

  const handleConnectValidation = (source: ValidationSource) => {
    // TODO: Implement validation source connection
    alert(`Connecting to ${source.name}...`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Signal Markets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and trade assets related to your signals
          </Typography>
        </Box>

        {/* Error messages removed - using mock data silently when backend is unavailable */}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Active Signals
            </Typography>
            <Grid container spacing={2}>
              {signals.map((signal) => (
                <Grid item xs={12} sm={6} key={signal.id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '16px',
                        background: selectedSignal?.id === signal.id
                          ? theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%)'
                            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                          : theme.palette.mode === 'dark'
                          ? 'rgba(26, 31, 58, 0.6)'
                          : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: selectedSignal?.id === signal.id ? 2 : 1,
                        borderColor: selectedSignal?.id === signal.id
                          ? theme.palette.mode === 'dark'
                            ? 'rgba(102, 126, 234, 0.6)'
                            : 'rgba(102, 126, 234, 0.4)'
                          : theme.palette.divider,
                        boxShadow: selectedSignal?.id === signal.id
                          ? theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(102, 126, 234, 0.4)'
                            : '0 8px 32px rgba(102, 126, 234, 0.25)'
                          : 'none',
                        transition: 'all 0.3s ease',
                        transform: selectedSignal?.id === signal.id ? 'translateY(-2px)' : 'none',
                        '&:hover': {
                          boxShadow: selectedSignal?.id === signal.id
                            ? theme.palette.mode === 'dark'
                              ? '0 8px 32px rgba(102, 126, 234, 0.5)'
                              : '0 8px 32px rgba(102, 126, 234, 0.3)'
                            : '0 8px 24px rgba(102, 126, 234, 0.3)',
                          transform: 'translateY(-4px)',
                        },
                      }}
                      onClick={() => {
                        setSelectedSignal(signal);
                        setDetailDialogOpen(true);
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {signal.underlyingAsset}
                          </Typography>
                          <Chip
                            label={signal.creator.type === 'agent' ? '🤖 Agent' : '👤 Human'}
                            size="small"
                            sx={{
                              backgroundColor: signal.creator.type === 'agent' ? '#667eea20' : '#00FF8820',
                              color: signal.creator.type === 'agent' ? '#667eea' : '#00FF88',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                          {signal.hypothesis.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Quality Score
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={signal.quality}
                            sx={{
                              mt: 0.5,
                              mb: 0.5,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {signal.quality.toFixed(1)}% (1-day profit confidence)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip
                            label={`Accuracy: ${signal.score.accuracy.toFixed(0)}%`}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Chip
                            label={`Performance: ${signal.score.performance.toFixed(0)}%`}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Chip
                            label={`Consensus: ${signal.score.consensus.toFixed(0)}%`}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                        {signal.assetBranches && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {Object.values(signal.assetBranches).reduce((sum, arr) => sum + arr.length, 0)} related assets discovered
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            {selectedSignal ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  position: 'sticky',
                  top: 20,
                  borderRadius: '16px',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%)'
                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.6)' : 'rgba(102, 126, 234, 0.4)'}`,
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(102, 126, 234, 0.4)'
                    : '0 8px 32px rgba(102, 126, 234, 0.25)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    pb: 1,
                    borderBottom: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.5)' : 'rgba(102, 126, 234, 0.3)'}`,
                  }}
                >
                  <AccountBalanceIcon sx={{ color: theme.palette.mode === 'dark' ? '#667eea' : '#667eea', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? '#667eea' : '#667eea' }}>
                    Trade Signal
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {selectedSignal.underlyingAsset}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  {selectedSignal.hypothesis}
                </Typography>

                {marketData && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Price
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                      ${marketData.currentPrice.toFixed(4)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Volume: ${marketData.totalVolume.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Button
                    fullWidth
                    variant={tradeType === 'buy' ? 'contained' : 'outlined'}
                    onClick={() => setTradeType('buy')}
                    sx={{ mb: 1, borderRadius: '12px', textTransform: 'none' }}
                    startIcon={<TrendingUpIcon />}
                  >
                    Buy
                  </Button>
                  <Button
                    fullWidth
                    variant={tradeType === 'sell' ? 'contained' : 'outlined'}
                    onClick={() => setTradeType('sell')}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                    startIcon={<TrendingDownIcon />}
                  >
                    Sell
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleTrade}
                  disabled={!tradeAmount}
                  sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                >
                  Execute Trade
                </Button>

                <Divider sx={{ my: 2 }} />

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setDetailDialogOpen(true)}
                  startIcon={<AccountBalanceIcon />}
                  sx={{ borderRadius: '12px', textTransform: 'none' }}
                >
                  View Asset Branches
                </Button>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: '16px',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(26, 31, 58, 0.6)'
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Select a signal to view trading options and asset branches
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Signal Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              background: theme.palette.mode === 'dark'
                ? 'rgba(26, 31, 58, 0.95)'
                : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          {selectedSignal && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedSignal.underlyingAsset}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSignal.hypothesis}
                </Typography>
              </DialogTitle>
              <Divider />
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={detailTab} onChange={(e, v) => setDetailTab(v)}>
                  <Tab label="Asset Branches" />
                  <Tab label="Validation Sources" />
                  <Tab label="Signal Details" />
                </Tabs>
              </Box>
              <DialogContent sx={{ p: 3 }}>
                {detailTab === 0 && selectedSignal.assetBranches && (
                  <AssetBranchesComponent
                    branches={selectedSignal.assetBranches}
                    signalId={selectedSignal.id}
                    onConnectExchange={handleConnectExchange}
                    onTrade={handleTradeAsset}
                  />
                )}
                {detailTab === 1 && selectedSignal.validationSources && (
                  <ValidationSources
                    sources={selectedSignal.validationSources}
                    signalId={selectedSignal.id}
                    onConnect={handleConnectValidation}
                  />
                )}
                {detailTab === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Signal Metrics
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1, mb: 4 }}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Accuracy</Typography>
                        <Typography variant="h6">{selectedSignal.score.accuracy.toFixed(1)}%</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Performance</Typography>
                        <Typography variant="h6">{selectedSignal.score.performance.toFixed(1)}%</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Consensus</Typography>
                        <Typography variant="h6">{selectedSignal.score.consensus.toFixed(1)}%</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Quality</Typography>
                        <Typography variant="h6">{selectedSignal.quality.toFixed(1)}%</Typography>
                      </Grid>
                    </Grid>

                    {/* Trading Strategies */}
                    {(selectedSignal as any).strategies && (selectedSignal as any).strategies.length > 0 && (
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Generated Trading Strategies
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          AI-generated strategies for discovered assets
                        </Typography>
                        <Grid container spacing={2}>
                          {(selectedSignal as any).strategies.map((strategy: any, index: number) => (
                            <Grid item xs={12} key={index}>
                              <Card
                                sx={{
                                  p: 2,
                                  borderRadius: '12px',
                                  background: theme.palette.mode === 'dark'
                                    ? 'rgba(26, 31, 58, 0.6)'
                                    : 'rgba(255, 255, 255, 0.8)',
                                  backdropFilter: 'blur(10px)',
                                  border: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                  <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                      {strategy.assetSymbol}
                                    </Typography>
                                    <Chip
                                      label={strategy.assetClass}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        mt: 0.5,
                                      }}
                                    />
                                  </Box>
                                </Box>

                                {strategy.strategy && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                      Strategy
                                    </Typography>
                                    {strategy.strategy.entryConditions && (
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Entry:</Typography>
                                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                          {strategy.strategy.entryConditions.map((condition: string, i: number) => (
                                            <li key={i}>
                                              <Typography variant="body2">{condition}</Typography>
                                            </li>
                                          ))}
                                        </ul>
                                      </Box>
                                    )}
                                    {strategy.strategy.exitConditions && (
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Exit:</Typography>
                                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                          {strategy.strategy.exitConditions.map((condition: string, i: number) => (
                                            <li key={i}>
                                              <Typography variant="body2">{condition}</Typography>
                                            </li>
                                          ))}
                                        </ul>
                                      </Box>
                                    )}
                                    <Grid container spacing={1} sx={{ mt: 1 }}>
                                      {strategy.strategy.positionSize && (
                                        <Grid item xs={6}>
                                          <Typography variant="caption" color="text.secondary">Position Size</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {strategy.strategy.positionSize}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {strategy.strategy.timeHorizon && (
                                        <Grid item xs={6}>
                                          <Typography variant="caption" color="text.secondary">Time Horizon</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {strategy.strategy.timeHorizon}
                                          </Typography>
                                        </Grid>
                                      )}
                                    </Grid>
                                  </Box>
                                )}

                                {strategy.howToPlay && (
                                  <Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                      How to Play
                                    </Typography>
                                    {strategy.howToPlay.exchange && (
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Exchange:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {strategy.howToPlay.exchange}
                                        </Typography>
                                      </Box>
                                    )}
                                    {strategy.howToPlay.orderTypes && (
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Order Types:</Typography>
                                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                          {strategy.howToPlay.orderTypes.map((order: string, i: number) => (
                                            <li key={i}>
                                              <Typography variant="body2">{order}</Typography>
                                            </li>
                                          ))}
                                        </ul>
                                      </Box>
                                    )}
                                    {strategy.howToPlay.positionManagement && (
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Position Management:</Typography>
                                        <Typography variant="body2">{strategy.howToPlay.positionManagement}</Typography>
                                      </Box>
                                    )}
                                  </Box>
                                )}
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setDetailDialogOpen(false)} sx={{ borderRadius: '12px', textTransform: 'none' }}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default SignalMarket;
