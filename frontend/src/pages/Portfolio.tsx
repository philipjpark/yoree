import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  AccountBalanceWallet as WalletIcon,
  AttachMoney as MoneyIcon,
  PieChart as PieChartIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Sell as SellIcon,
  ShoppingCart as BuyIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { signalService } from '../services';
import { Signal, SignalMarket } from '../types/signal';
import { useNavigate } from 'react-router-dom';

interface SignalHolding {
  signal: Signal;
  market: SignalMarket;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  quality: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  activeSignals: number;
  avgQuality: number;
  bestPerformer: SignalHolding | null;
  worstPerformer: SignalHolding | null;
}

const Portfolio: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<SignalHolding[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    activeSignals: 0,
    avgQuality: 0,
    bestPerformer: null,
    worstPerformer: null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedHolding, setSelectedHolding] = useState<SignalHolding | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      // Load from localStorage first (signals created in this session)
      const savedSignals = JSON.parse(localStorage.getItem('yoree_portfolio_signals') || '[]');
      
      // Try to fetch from backend
      let backendSignals: Signal[] = [];
      try {
        backendSignals = await signalService.listSignals();
      } catch (e) {
        console.warn('Backend unavailable, using local storage');
      }
      
      // Combine saved signals with backend signals
      const allSignals = [...savedSignals.map((s: any) => s.signal), ...backendSignals];
      
      // Convert to holdings format
      const holdings: SignalHolding[] = allSignals.map((signal) => ({
        signal,
        market: {
          signalId: signal.id,
          pricingModel: 'bonding_curve' as const,
          currentPrice: signal.quality / 100,
          totalVolume: 0,
          buyVolume: 0,
          sellVolume: 0,
          totalShares: 1000000,
          createdAt: signal.createdAt,
        },
        shares: 1000,
        avgPrice: signal.quality / 100,
        currentPrice: signal.quality / 100,
        totalValue: 1000 * (signal.quality / 100),
        pnl: 0,
        pnlPercent: 0,
        quality: signal.quality,
      }));
      
      // If no signals, use mock data
      const finalHoldings = holdings.length > 0 ? holdings : getMockHoldings();
      setHoldings(finalHoldings);
      calculateMetrics(finalHoldings);
    } catch (error: any) {
      console.error('Failed to load portfolio:', error);
      // Use mock data as fallback
      const mockHoldings = getMockHoldings();
      setHoldings(mockHoldings);
      calculateMetrics(mockHoldings);
    } finally {
      setLoading(false);
    }
  };

  const getMockHoldings = (): SignalHolding[] => {
    return [
      {
        signal: {
          id: '1',
          underlyingAsset: 'ETH',
          hypothesis: 'ETH will reach $4,000 within 30 days based on increasing adoption',
          dataBindings: [],
          score: { accuracy: 85, performance: 92, consensus: 78, composite: 85, lastUpdated: new Date().toISOString() },
          quality: 92,
          creator: { type: 'human', id: 'user-1', name: 'You', isAgentAnnounced: false },
          instances: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        market: {
          signalId: '1',
          pricingModel: 'bonding_curve',
          currentPrice: 1.24,
          totalVolume: 1250000,
          buyVolume: 750000,
          sellVolume: 500000,
          totalShares: 1000000,
          createdAt: new Date().toISOString(),
        },
        shares: 500,
        avgPrice: 0.95,
        currentPrice: 1.24,
        totalValue: 620,
        pnl: 145,
        pnlPercent: 30.5,
        quality: 92,
      },
      {
        signal: {
          id: '2',
          underlyingAsset: 'BTC',
          hypothesis: 'Bitcoin macro trend indicates bullish momentum',
          dataBindings: [],
          score: { accuracy: 88, performance: 85, consensus: 82, composite: 85, lastUpdated: new Date().toISOString() },
          quality: 88,
          creator: { type: 'human', id: 'user-1', name: 'You', isAgentAnnounced: false },
          instances: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        market: {
          signalId: '2',
          pricingModel: 'bonding_curve',
          currentPrice: 0.87,
          totalVolume: 890000,
          buyVolume: 500000,
          sellVolume: 390000,
          totalShares: 800000,
          createdAt: new Date().toISOString(),
        },
        shares: 300,
        avgPrice: 0.92,
        currentPrice: 0.87,
        totalValue: 261,
        pnl: -15,
        pnlPercent: -5.4,
        quality: 88,
      },
      {
        signal: {
          id: '3',
          underlyingAsset: 'DEFI',
          hypothesis: 'DeFi narrative gaining traction with new protocol launches',
          dataBindings: [],
          score: { accuracy: 82, performance: 88, consensus: 75, composite: 82, lastUpdated: new Date().toISOString() },
          quality: 85,
          creator: { type: 'agent', id: 'agent-1', name: 'AI Analyst', isAgentAnnounced: true },
          instances: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        market: {
          signalId: '3',
          pricingModel: 'bonding_curve',
          currentPrice: 0.72,
          totalVolume: 450000,
          buyVolume: 280000,
          sellVolume: 170000,
          totalShares: 500000,
          createdAt: new Date().toISOString(),
        },
        shares: 200,
        avgPrice: 0.65,
        currentPrice: 0.72,
        totalValue: 144,
        pnl: 14,
        pnlPercent: 10.8,
        quality: 85,
      },
    ];
  };

  const calculateMetrics = (holdings: SignalHolding[]) => {
    const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalPnL = holdings.reduce((sum, h) => sum + h.pnl, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0);
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
    const avgQuality = holdings.length > 0
      ? holdings.reduce((sum, h) => sum + h.quality, 0) / holdings.length
      : 0;

    const bestPerformer = holdings.reduce((best, h) => 
      !best || h.pnlPercent > best.pnlPercent ? h : best, null as SignalHolding | null
    );
    const worstPerformer = holdings.reduce((worst, h) => 
      !worst || h.pnlPercent < worst.pnlPercent ? h : worst, null as SignalHolding | null
    );

    setMetrics({
      totalValue,
      totalPnL,
      totalPnLPercent,
      activeSignals: holdings.length,
      avgQuality,
      bestPerformer,
      worstPerformer,
    });
  };

  const getPerformanceHistory = (holding: SignalHolding) => {
    // Mock performance history
    const data = [];
    const days = 30;
    let price = holding.avgPrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      price += (Math.random() - 0.5) * price * 0.1;
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(0.1, price),
        value: price * holding.shares,
      });
    }
    return data;
  };

  const getAssetAllocation = () => {
    return holdings.map(h => ({
      name: h.signal.underlyingAsset,
      value: h.totalValue,
    }));
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
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  mb: 1,
                }}
              >
                Portfolio
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                Your signal holdings and performance
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadPortfolio}
              sx={{ borderRadius: '12px' }}
            >
              Refresh
            </Button>
          </Box>
        </motion.div>

        {/* Portfolio Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                }}
              >
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Total Portfolio Value
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  ${metrics.totalValue.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {metrics.totalPnL >= 0 ? (
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: metrics.totalPnL >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 600,
                    }}
                  >
                    {metrics.totalPnL >= 0 ? '+' : ''}{metrics.totalPnL.toFixed(2)} ({metrics.totalPnLPercent >= 0 ? '+' : ''}{metrics.totalPnLPercent.toFixed(2)}%)
                  </Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
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
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Active Signals
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  {metrics.activeSignals}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Signals in portfolio
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
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
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Avg. Quality Score
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  {metrics.avgQuality.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.avgQuality}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #00FF88 0%, #00CC6A 100%)',
                    }
                  }}
                />
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
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
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Best Performer
                </Typography>
                {metrics.bestPerformer ? (
                  <>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                      }}
                    >
                      {metrics.bestPerformer.signal.underlyingAsset}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.success.main,
                        fontWeight: 600,
                      }}
                    >
                      +{metrics.bestPerformer.pnlPercent.toFixed(2)}%
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    No holdings
                  </Typography>
                )}
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Holdings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
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
                Signal Holdings
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Signal</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Shares</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Avg. Price</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Current Price</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Value</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>P&L</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Quality</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holdings.map((holding) => (
                    <TableRow
                      key={holding.signal.id}
                      sx={{
                        '&:hover': {
                          background: theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 0, 0, 0.02)',
                        }
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {holding.signal.underlyingAsset} Signal
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {holding.signal.hypothesis.substring(0, 50)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                        {holding.shares.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.text.primary }}>
                        ${holding.avgPrice.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                        ${holding.currentPrice.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                        ${holding.totalValue.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${holding.pnl >= 0 ? '+' : ''}${holding.pnl.toFixed(2)} (${holding.pnlPercent >= 0 ? '+' : ''}${holding.pnlPercent.toFixed(2)}%)`}
                          size="small"
                          sx={{
                            backgroundColor: holding.pnl >= 0
                              ? `${theme.palette.success.main}20`
                              : `${theme.palette.error.main}20`,
                            color: holding.pnl >= 0 ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={holding.quality}
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: holding.quality > 85
                                  ? 'linear-gradient(90deg, #00FF88 0%, #00CC6A 100%)'
                                  : holding.quality > 70
                                  ? 'linear-gradient(90deg, #FFA726 0%, #FF9800 100%)'
                                  : 'linear-gradient(90deg, #FF4444 0%, #CC0000 100%)',
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600, minWidth: 35 }}>
                            {holding.quality}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedHolding(holding);
                                setShowDetails(true);
                              }}
                            >
                              <ViewIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Trade">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/signal-markets?signal=${holding.signal.id}`)}
                            >
                              <ChartIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </motion.div>

        {/* Performance Chart */}
        {holdings.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
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
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
                    Portfolio Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getPerformanceHistory(holdings[0])}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                        dataKey="value"
                        stroke="#667eea"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
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
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
                    Asset Allocation
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getAssetAllocation()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getAssetAllocation().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#667eea', '#764ba2', '#00D4FF', '#00FF88'][index % 4]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        )}

        {/* Holding Details Dialog */}
        <Dialog
          open={showDetails}
          onClose={() => setShowDetails(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              background: theme.palette.mode === 'dark'
                ? 'rgba(26, 31, 58, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          {selectedHolding && (
            <>
              <DialogTitle>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {selectedHolding.signal.underlyingAsset} Signal Details
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      Hypothesis
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 3 }}>
                      {selectedHolding.signal.hypothesis}
                    </Typography>

                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      Holdings
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 3 }}>
                      {selectedHolding.shares.toLocaleString()} shares @ ${selectedHolding.avgPrice.toFixed(2)} avg
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      Performance
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        ${selectedHolding.totalValue.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: selectedHolding.pnl >= 0 ? theme.palette.success.main : theme.palette.error.main,
                          fontWeight: 600,
                        }}
                      >
                        {selectedHolding.pnl >= 0 ? '+' : ''}{selectedHolding.pnl.toFixed(2)} ({selectedHolding.pnlPercent >= 0 ? '+' : ''}{selectedHolding.pnlPercent.toFixed(2)}%)
                      </Typography>
                    </Box>

                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      Quality Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={selectedHolding.quality}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #00FF88 0%, #00CC6A 100%)',
                          }
                        }}
                      />
                      <Typography variant="body1" sx={{ color: theme.palette.text.primary, fontWeight: 600, minWidth: 45 }}>
                        {selectedHolding.quality}%
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                      Performance History
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={getPerformanceHistory(selectedHolding)}>
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
                        <Line type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={() => setShowDetails(false)} sx={{ borderRadius: '12px' }}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowDetails(false);
                    navigate(`/signal-markets?signal=${selectedHolding.signal.id}`);
                  }}
                  sx={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Trade Signal
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default Portfolio;
