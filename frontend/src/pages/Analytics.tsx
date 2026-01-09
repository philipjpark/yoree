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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { signalService } from '../services';
import { Signal, SignalPerformanceHistory } from '../types/signal';

interface MarketMetrics {
  totalSignals: number;
  activeSignals: number;
  totalVolume: number;
  avgQuality: number;
  topPerformer: Signal | null;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
}

interface QualityDistribution {
  range: string;
  count: number;
  percentage: number;
}

const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [metrics, setMetrics] = useState<MarketMetrics>({
    totalSignals: 0,
    activeSignals: 0,
    totalVolume: 0,
    avgQuality: 0,
    topPerformer: null,
    marketTrend: 'neutral',
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const signalList = await signalService.listSignals();
      setSignals(signalList);
      calculateMetrics(signalList);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      // Use mock data
      const mockSignals = getMockSignals();
      setSignals(mockSignals);
      calculateMetrics(mockSignals);
    } finally {
      setLoading(false);
    }
  };

  const getMockSignals = (): Signal[] => {
    return [
      {
        id: '1',
        underlyingAsset: 'ETH',
        hypothesis: 'ETH will reach $4,000 within 30 days',
        dataBindings: [],
        score: { accuracy: 85, performance: 92, consensus: 78, composite: 85, lastUpdated: new Date().toISOString() },
        quality: 92,
        creator: { type: 'human', id: 'user-1', name: 'Trader A', isAgentAnnounced: false },
        instances: [],
        status: 'active',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        underlyingAsset: 'BTC',
        hypothesis: 'Bitcoin macro trend indicates bullish momentum',
        dataBindings: [],
        score: { accuracy: 88, performance: 85, consensus: 82, composite: 85, lastUpdated: new Date().toISOString() },
        quality: 88,
        creator: { type: 'agent', id: 'agent-1', name: 'AI Analyst', isAgentAnnounced: true },
        instances: [],
        status: 'active',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        underlyingAsset: 'DEFI',
        hypothesis: 'DeFi narrative gaining traction',
        dataBindings: [],
        score: { accuracy: 82, performance: 88, consensus: 75, composite: 82, lastUpdated: new Date().toISOString() },
        quality: 85,
        creator: { type: 'human', id: 'user-2', name: 'Trader B', isAgentAnnounced: false },
        instances: [],
        status: 'active',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  };

  const calculateMetrics = (signalList: Signal[]) => {
    const active = signalList.filter(s => s.status === 'active');
    const avgQuality = active.length > 0
      ? active.reduce((sum, s) => sum + s.quality, 0) / active.length
      : 0;
    const topPerformer = active.reduce((best, s) => 
      !best || s.quality > best.quality ? s : best, null as Signal | null
    );

    // Mock volume calculation
    const totalVolume = active.length * 500000;

    setMetrics({
      totalSignals: signalList.length,
      activeSignals: active.length,
      totalVolume,
      avgQuality,
      topPerformer,
      marketTrend: avgQuality > 80 ? 'bullish' : avgQuality > 60 ? 'neutral' : 'bearish',
    });
  };

  const getQualityDistribution = (): QualityDistribution[] => {
    const ranges = [
      { min: 90, max: 100, label: '90-100%' },
      { min: 80, max: 89, label: '80-89%' },
      { min: 70, max: 79, label: '70-79%' },
      { min: 60, max: 69, label: '60-69%' },
      { min: 0, max: 59, label: '<60%' },
    ];

    return ranges.map(range => {
      const count = signals.filter(s => s.quality >= range.min && s.quality <= range.max).length;
      return {
        range: range.label,
        count,
        percentage: signals.length > 0 ? (count / signals.length) * 100 : 0,
      };
    });
  };

  const getPerformanceOverTime = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 180;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        avgQuality: 75 + Math.random() * 20,
        activeSignals: Math.floor(10 + Math.random() * 20),
        volume: Math.floor(500000 + Math.random() * 1000000),
      });
    }
    return data;
  };

  const getAssetDistribution = () => {
    const assets: Record<string, number> = {};
    signals.forEach(s => {
      assets[s.underlyingAsset] = (assets[s.underlyingAsset] || 0) + 1;
    });
    return Object.entries(assets).map(([name, count]) => ({ name, value: count }));
  };

  const getCreatorDistribution = () => {
    const human = signals.filter(s => s.creator.type === 'human').length;
    const agent = signals.filter(s => s.creator.type === 'agent').length;
    return [
      { name: 'Human', value: human },
      { name: 'Agent', value: agent },
    ];
  };

  const COLORS = ['#667eea', '#764ba2', '#00D4FF', '#00FF88', '#FFA726', '#EC4899'];

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
                Analytics
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                Market intelligence and signal performance insights
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{ borderRadius: '12px' }}
              >
                Export
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  >
                    <ChartIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                      Total Signals
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      {metrics.totalSignals}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {metrics.activeSignals} active
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      background: 'linear-gradient(135deg, #00D4FF 0%, #00A8CC 100%)',
                      color: 'white',
                    }}
                  >
                    <SpeedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                      Avg. Quality
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      {metrics.avgQuality.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
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

          <Grid item xs={12} sm={6} md={3}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      background: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
                      color: '#0A0E27',
                    }}
                  >
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                      Total Volume
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      ${(metrics.totalVolume / 1000000).toFixed(2)}M
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Last {timeRange}
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      background: metrics.marketTrend === 'bullish'
                        ? 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)'
                        : metrics.marketTrend === 'bearish'
                        ? 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)'
                        : 'linear-gradient(135deg, #FFA726 0%, #FF9800 100%)',
                      color: metrics.marketTrend === 'bullish' ? '#0A0E27' : 'white',
                    }}
                  >
                    {metrics.marketTrend === 'bullish' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                      Market Trend
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, textTransform: 'capitalize' }}>
                      {metrics.marketTrend}
                    </Typography>
                  </Box>
                </Box>
                {metrics.topPerformer && (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Top: {metrics.topPerformer.underlyingAsset} ({metrics.topPerformer.quality}%)
                  </Typography>
                )}
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
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
                  Market Performance Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={getPerformanceOverTime()}>
                    <defs>
                      <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                    <YAxis yAxisId="left" stroke={theme.palette.text.secondary} />
                    <YAxis yAxisId="right" orientation="right" stroke={theme.palette.text.secondary} />
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? '#1A1F3A' : '#ffffff',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgQuality"
                      stroke="#667eea"
                      fillOpacity={1}
                      fill="url(#colorQuality)"
                      name="Avg Quality %"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="volume"
                      stroke="#00D4FF"
                      fillOpacity={1}
                      fill="url(#colorVolume)"
                      name="Volume"
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
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
                  Quality Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getQualityDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) => `${range}: ${percentage.toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {getQualityDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

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
                  Creator Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getCreatorDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCreatorDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#667eea' : '#00D4FF'} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Signal Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
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
                Signal Performance Rankings
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Signal</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Quality</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Accuracy</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Performance</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Consensus</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Creator</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {signals
                    .sort((a, b) => b.quality - a.quality)
                    .map((signal, index) => (
                      <TableRow
                        key={signal.id}
                        sx={{
                          '&:hover': {
                            background: theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 0, 0, 0.02)',
                          }
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{
                              backgroundColor: index === 0 ? '#00FF8820' : 'transparent',
                              color: index === 0 ? '#00FF88' : theme.palette.text.secondary,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                              {signal.underlyingAsset} Signal
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {signal.hypothesis.substring(0, 40)}...
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={signal.quality}
                              sx={{
                                width: 60,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: signal.quality > 85
                                    ? 'linear-gradient(90deg, #00FF88 0%, #00CC6A 100%)'
                                    : signal.quality > 70
                                    ? 'linear-gradient(90deg, #FFA726 0%, #FF9800 100%)'
                                    : 'linear-gradient(90deg, #FF4444 0%, #CC0000 100%)',
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600, minWidth: 35 }}>
                              {signal.quality}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.text.primary }}>
                          {signal.score.accuracy.toFixed(1)}%
                        </TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.text.primary }}>
                          {signal.score.performance.toFixed(1)}%
                        </TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>
                          {signal.score.consensus.toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={signal.creator.type === 'agent' ? '🤖 Agent' : '👤 Human'}
                            size="small"
                            sx={{
                              backgroundColor: signal.creator.type === 'agent' ? '#00D4FF20' : '#667eea20',
                              color: signal.creator.type === 'agent' ? '#00D4FF' : '#667eea',
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
      </Container>
    </Box>
  );
};

export default Analytics;
