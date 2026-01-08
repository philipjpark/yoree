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
} from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { signalService } from '../../services';
import { Signal, SignalMarket as SignalMarketType } from '../../types/signal';

const SignalMarket: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [marketData, setMarketData] = useState<SignalMarketType | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    loadSignals();
  }, []);

  useEffect(() => {
    if (selectedSignal) {
      loadMarketData(selectedSignal.id);
    }
  }, [selectedSignal]);

  const loadSignals = async () => {
    try {
      setLoading(true);
      const signalList = await signalService.listSignals();
      setSignals(signalList.filter(s => s.status === 'active'));
    } catch (err: any) {
      setError(err.message || 'Failed to load signals');
    } finally {
      setLoading(false);
    }
  };

  const loadMarketData = async (signalId: string) => {
    try {
      const market = await signalService.getSignalMarket(signalId);
      setMarketData(market);
    } catch (err: any) {
      console.error('Failed to load market data:', err);
    }
  };

  const handleTrade = async () => {
    if (!selectedSignal || !tradeAmount) {
      setError('Please select a signal and enter trade amount');
      return;
    }

    // TODO: Implement actual trading logic
    alert(`Trade ${tradeType} ${tradeAmount} shares of ${selectedSignal.id}`);
  };

  const calculateBondingCurvePrice = (shares: number): number => {
    // Simple bonding curve: price = basePrice * (1 + shares / 1000)
    const basePrice = 0.10;
    return basePrice * (1 + shares / 1000);
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
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Signal Markets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Trade signal quality as first-class assets
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Available Signals
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
                        border: selectedSignal?.id === signal.id ? 2 : 1,
                        borderColor: selectedSignal?.id === signal.id ? 'primary.main' : 'divider',
                      }}
                      onClick={() => setSelectedSignal(signal)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6">
                            {signal.underlyingAsset}
                          </Typography>
                          <Chip
                            label={signal.creator.type === 'agent' ? '🤖 Agent' : '👤 Human'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {signal.hypothesis.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Quality Score
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={signal.quality}
                            sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                            {signal.quality.toFixed(1)}% (1-day profit confidence)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`Accuracy: ${signal.score.accuracy.toFixed(1)}%`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`Performance: ${signal.score.performance.toFixed(1)}%`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                          <Chip
                            label={`Consensus: ${signal.score.consensus.toFixed(1)}%`}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            {selectedSignal ? (
              <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  Trade Signal
                </Typography>
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
                    <Typography variant="h4" sx={{ mb: 1 }}>
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
                    sx={{ mb: 1 }}
                    startIcon={<TrendingUpIcon />}
                  >
                    Buy
                  </Button>
                  <Button
                    fullWidth
                    variant={tradeType === 'sell' ? 'contained' : 'outlined'}
                    onClick={() => setTradeType('sell')}
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
                >
                  Execute Trade
                </Button>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Select a signal to view trading options
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default SignalMarket;
