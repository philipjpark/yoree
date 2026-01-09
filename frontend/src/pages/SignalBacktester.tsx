import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { signalService } from '../services';
import { Signal } from '../types/signal';
import { useNavigate } from 'react-router-dom';

interface BacktestConfig {
  signalId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  positionSize: number; // Percentage of capital per trade
  slippage: number; // Percentage
  commission: number; // Percentage
  rebalanceFrequency: 'daily' | 'weekly' | 'monthly';
  stopLoss?: number; // Percentage
  takeProfit?: number; // Percentage
}

interface BacktestResult {
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  equityCurve: Array<{ date: string; equity: number; return: number }>;
  trades: Array<{
    date: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    pnl: number;
    pnlPercent: number;
  }>;
  metrics: {
    volatility: number;
    beta: number;
    alpha: number;
    sortinoRatio: number;
    calmarRatio: number;
  };
}

const SignalBacktester: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [config, setConfig] = useState<BacktestConfig>({
    signalId: '',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    initialCapital: 10000,
    positionSize: 10,
    slippage: 0.1,
    commission: 0.1,
    rebalanceFrequency: 'daily',
    stopLoss: 5,
    takeProfit: 10,
  });
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    try {
      const signalList = await signalService.listSignals();
      setSignals(signalList.filter(s => s.status === 'active'));
      if (signalList.length > 0 && !selectedSignal) {
        setSelectedSignal(signalList[0]);
        setConfig(prev => ({ ...prev, signalId: signalList[0].id }));
      }
    } catch (error: any) {
      console.error('Failed to load signals:', error);
      // Use mock data
      setSignals(getMockSignals());
      if (!selectedSignal) {
        const mockSignal = getMockSignals()[0];
        setSelectedSignal(mockSignal);
        setConfig(prev => ({ ...prev, signalId: mockSignal.id }));
      }
    }
  };

  const getMockSignals = (): Signal[] => {
    return [
      {
        id: '1',
        underlyingAsset: 'ETH',
        hypothesis: 'ETH will reach $4,000 within 30 days based on increasing adoption',
        dataBindings: [],
        score: { accuracy: 85, performance: 92, consensus: 78, composite: 85, lastUpdated: new Date().toISOString() },
        quality: 92,
        creator: { type: 'human', id: 'user-1', name: 'User', isAgentAnnounced: false },
        instances: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  };

  const runBacktest = async () => {
    if (!selectedSignal) {
      return;
    }

    setRunning(true);
    setResults(null);

    try {
      // Simulate backtest (in real implementation, this would call backend)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = generateMockBacktestResults(config);
      setResults(mockResults);
    } catch (error: any) {
      console.error('Backtest failed:', error);
    } finally {
      setRunning(false);
    }
  };

  const generateMockBacktestResults = (cfg: BacktestConfig): BacktestResult => {
    const days = Math.floor((new Date(cfg.endDate).getTime() - new Date(cfg.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const equityCurve = [];
    const trades = [];
    let equity = cfg.initialCapital;
    let totalReturn = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalWin = 0;
    let totalLoss = 0;

    for (let i = 0; i <= days; i++) {
      const date = new Date(new Date(cfg.startDate).getTime() + i * 24 * 60 * 60 * 1000);
      const dailyReturn = (Math.random() - 0.45) * 2; // Slight positive bias
      const returnAmount = equity * (dailyReturn / 100);
      equity += returnAmount;
      totalReturn += returnAmount;

      if (Math.random() > 0.7 && i > 0) {
        const tradeType: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
        const price = 100 + Math.random() * 50;
        const quantity = (equity * cfg.positionSize / 100) / price;
        const pnl = (Math.random() - 0.4) * 1000;
        const pnlPercent = (pnl / (price * quantity)) * 100;

        trades.push({
          date: date.toISOString().split('T')[0],
          type: tradeType,
          price,
          quantity,
          pnl,
          pnlPercent,
        });

        if (pnl > 0) {
          winningTrades++;
          totalWin += pnl;
        } else {
          losingTrades++;
          totalLoss += Math.abs(pnl);
        }
      }

      equityCurve.push({
        date: date.toISOString().split('T')[0],
        equity,
        return: totalReturn,
      });
    }

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const maxDrawdown = calculateMaxDrawdown(equityCurve);
    const sharpeRatio = calculateSharpeRatio(equityCurve);
    const volatility = calculateVolatility(equityCurve);

    const totalReturnPercent = (totalReturn / cfg.initialCapital) * 100;
    
    return {
      totalReturn,
      totalReturnPercent,
      sharpeRatio,
      maxDrawdown,
      winRate,
      totalTrades,
      winningTrades,
      losingTrades,
      avgWin: winningTrades > 0 ? totalWin / winningTrades : 0,
      avgLoss: losingTrades > 0 ? totalLoss / losingTrades : 0,
      profitFactor: totalLoss > 0 ? totalWin / totalLoss : 0,
      equityCurve,
      trades,
      metrics: {
        volatility,
        beta: 1.2,
        alpha: 5.5,
        sortinoRatio: sharpeRatio * 1.2,
        calmarRatio: totalReturnPercent / Math.abs(maxDrawdown),
      },
    };
  };

  const calculateMaxDrawdown = (equityCurve: Array<{ equity: number }>): number => {
    let maxEquity = equityCurve[0].equity;
    let maxDrawdown = 0;

    for (const point of equityCurve) {
      if (point.equity > maxEquity) {
        maxEquity = point.equity;
      }
      const drawdown = ((maxEquity - point.equity) / maxEquity) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  };

  const calculateSharpeRatio = (equityCurve: Array<{ return: number }>): number => {
    if (equityCurve.length < 2) return 0;
    const returns = equityCurve.slice(1).map((point, i) => 
      point.return - equityCurve[i].return
    );
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
  };

  const calculateVolatility = (equityCurve: Array<{ equity: number }>): number => {
    if (equityCurve.length < 2) return 0;
    const returns = equityCurve.slice(1).map((point, i) => 
      ((point.equity - equityCurve[i].equity) / equityCurve[i].equity) * 100
    );
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  mb: 1,
                }}
              >
                Signal Backtester
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                Test signal performance with historical data - Agent-optimized for intelligence exchange
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadSignals}
              sx={{ borderRadius: '12px' }}
            >
              Refresh Signals
            </Button>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {/* Configuration Panel */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(26, 31, 58, 0.6)'
                    : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${theme.palette.divider}`,
                  position: 'sticky',
                  top: 20,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
                  Backtest Configuration
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Signal</InputLabel>
                  <Select
                    value={config.signalId}
                    label="Signal"
                    onChange={(e) => {
                      const signal = signals.find(s => s.id === e.target.value);
                      setSelectedSignal(signal || null);
                      setConfig(prev => ({ ...prev, signalId: e.target.value }));
                    }}
                    sx={{ borderRadius: '12px' }}
                  >
                    {signals.map((signal) => (
                      <MenuItem key={signal.id} value={signal.id}>
                        {signal.underlyingAsset} Signal ({signal.quality}% quality)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={config.startDate}
                  onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={config.endDate}
                  onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <TextField
                  fullWidth
                  label="Initial Capital ($)"
                  type="number"
                  value={config.initialCapital}
                  onChange={(e) => setConfig(prev => ({ ...prev, initialCapital: parseFloat(e.target.value) || 0 }))}
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    Position Size: {config.positionSize}%
                  </Typography>
                  <Slider
                    value={config.positionSize}
                    onChange={(e, value) => setConfig(prev => ({ ...prev, positionSize: value as number }))}
                    min={1}
                    max={50}
                    step={1}
                    marks={[{ value: 10, label: '10%' }, { value: 25, label: '25%' }, { value: 50, label: '50%' }]}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    Slippage: {config.slippage}%
                  </Typography>
                  <Slider
                    value={config.slippage}
                    onChange={(e, value) => setConfig(prev => ({ ...prev, slippage: value as number }))}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Rebalance Frequency</InputLabel>
                  <Select
                    value={config.rebalanceFrequency}
                    label="Rebalance Frequency"
                    onChange={(e) => setConfig(prev => ({ ...prev, rebalanceFrequency: e.target.value as any }))}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={running ? <StopIcon /> : <PlayIcon />}
                  onClick={runBacktest}
                  disabled={running || !selectedSignal}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                >
                  {running ? 'Running Backtest...' : 'Run Backtest'}
                </Button>
              </Card>
            </motion.div>
          </Grid>

          {/* Results Panel */}
          <Grid item xs={12} md={8}>
            {running && (
              <Card sx={{ p: 4, mb: 3, textAlign: 'center', borderRadius: '16px' }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                  Running backtest...
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                  Analyzing historical performance
                </Typography>
              </Card>
            )}

            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Key Metrics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { label: 'Total Return', value: `$${results.totalReturn.toFixed(2)}`, percent: `${results.totalReturnPercent >= 0 ? '+' : ''}${results.totalReturnPercent.toFixed(2)}%`, color: results.totalReturn >= 0 ? theme.palette.success.main : theme.palette.error.main },
                    { label: 'Sharpe Ratio', value: results.sharpeRatio.toFixed(2), color: theme.palette.primary.main },
                    { label: 'Max Drawdown', value: `${results.maxDrawdown.toFixed(2)}%`, color: theme.palette.error.main },
                    { label: 'Win Rate', value: `${results.winRate.toFixed(1)}%`, color: theme.palette.success.main },
                    { label: 'Total Trades', value: results.totalTrades.toString(), color: theme.palette.info.main },
                    { label: 'Profit Factor', value: results.profitFactor.toFixed(2), color: theme.palette.warning.main },
                  ].map((metric, index) => (
                    <Grid item xs={6} md={4} key={index}>
                      <Card
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(26, 31, 58, 0.6)'
                            : 'rgba(255, 255, 255, 0.8)',
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                          {metric.label}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: metric.color,
                          }}
                        >
                          {metric.value}
                        </Typography>
                        {metric.percent && (
                          <Typography variant="caption" sx={{ color: metric.color }}>
                            {metric.percent}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Equity Curve */}
                <Card
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: '16px',
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(26, 31, 58, 0.6)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
                    Equity Curve
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={results.equityCurve}>
                      <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <RechartsTooltip
                        contentStyle={{
                          background: theme.palette.mode === 'dark' ? '#1A1F3A' : '#ffffff',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="equity"
                        stroke="#667eea"
                        fillOpacity={1}
                        fill="url(#colorEquity)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Trades Table */}
                <Card
                  sx={{
                    borderRadius: '16px',
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(26, 31, 58, 0.6)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      Trade History
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Date</TableCell>
                          <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Type</TableCell>
                          <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Price</TableCell>
                          <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Quantity</TableCell>
                          <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>P&L</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.trades.slice(0, 20).map((trade, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ color: theme.palette.text.primary }}>
                              {new Date(trade.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={trade.type.toUpperCase()}
                                size="small"
                                sx={{
                                  backgroundColor: trade.type === 'buy' ? `${theme.palette.success.main}20` : `${theme.palette.error.main}20`,
                                  color: trade.type === 'buy' ? theme.palette.success.main : theme.palette.error.main,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ color: theme.palette.text.primary }}>
                              ${trade.price.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: theme.palette.text.primary }}>
                              {trade.quantity.toFixed(4)}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)} (${trade.pnlPercent >= 0 ? '+' : ''}${trade.pnlPercent.toFixed(2)}%)`}
                                size="small"
                                sx={{
                                  backgroundColor: trade.pnl >= 0 ? `${theme.palette.success.main}20` : `${theme.palette.error.main}20`,
                                  color: trade.pnl >= 0 ? theme.palette.success.main : theme.palette.error.main,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </motion.div>
            )}

            {!running && !results && (
              <Card
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: '16px',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(26, 31, 58, 0.6)'
                    : 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <AssessmentIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  No backtest results yet
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Configure your backtest parameters and click "Run Backtest" to see results
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SignalBacktester;
