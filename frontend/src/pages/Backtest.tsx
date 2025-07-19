import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { motion } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import BacktestResults from '../components/backtest/BacktestResults';
import { strategyApi } from '../services/api';

// Generate mock data for the chart
const generateMockData = () => {
  const data = [];
  let price = 100;
  const volatility = 2;
  const trend = 0.1;
  
  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.5) * volatility + trend;
    price += change;
    data.push({
      time: i,
      price: price,
      volume: Math.random() * 1000 + 500
    });
  }
  return data;
};

const Backtest: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartType, setChartType] = useState('candlestick');
  const mockData = generateMockData();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Mock data for demonstration
  const mockResults = {
    tradeCount: 156,
    totalProfit: 28.75,
    winRate: 0.68,
    maxDrawdown: 0.15,
    sharpeRatio: 2.45,
    profitFactor: 2.5,
    equityCurve: Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      equity: 10000 + Math.random() * 5000,
      drawdown: Math.random() * 0.2,
    })),
  };

  const handleRunBacktest = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the backend API
      // const response = await strategyApi.runBacktest(strategyId);
      // setResults(response.data);
      
      // For now, we'll use mock data
      setTimeout(() => {
        setResults(mockResults);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to run backtest:', error);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) => `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.secondary.light}20 100%)`,
        py: 4
      }}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
              mb: 4
            }}
          >
            Strategy Backtest
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {/* Configuration Panel */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  background: 'white',
                  height: '100%'
                }}
              >
                <Typography variant="h5" sx={{ fontFamily: '"Noto Sans KR", sans-serif', mb: 3 }}>
                  Backtest Configuration
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Timeframe</InputLabel>
                    <Select
                      value={timeframe}
                      label="Timeframe"
                      onChange={(e) => setTimeframe(e.target.value)}
                    >
                      <MenuItem value="1m">1 Minute</MenuItem>
                      <MenuItem value="5m">5 Minutes</MenuItem>
                      <MenuItem value="15m">15 Minutes</MenuItem>
                      <MenuItem value="1h">1 Hour</MenuItem>
                      <MenuItem value="4h">4 Hours</MenuItem>
                      <MenuItem value="1d">1 Day</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <TextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    size="large"
                    sx={{ mt: 2 }}
                    onClick={handleRunBacktest}
                    disabled={loading}
                  >
                    {loading ? 'Running...' : 'Run Backtest'}
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Results Panel */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  background: 'white',
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                    Backtest Results
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Save Results">
                      <IconButton>
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share Results">
                      <IconButton>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Chart Section */}
                <Box sx={{ height: 300, mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Price Chart</Typography>
                    <ToggleButtonGroup
                      value={chartType}
                      exclusive
                      onChange={(e, value) => value && setChartType(value)}
                      size="small"
                    >
                      <ToggleButton value="candlestick">Candlestick</ToggleButton>
                      <ToggleButton value="line">Line</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={mockData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={['auto', 'auto']} />
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#4CAF50"
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                      <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ShowChartIcon />
                          <Typography variant="h6">Total Return</Typography>
                        </Box>
                        <Typography variant="h4">{mockResults.totalProfit}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TrendingUpIcon />
                          <Typography variant="h6">Win Rate</Typography>
                        </Box>
                        <Typography variant="h4">{mockResults.winRate * 100}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Profit Factor</Typography>
                          <Typography variant="body2">{mockResults.profitFactor}</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={mockResults.profitFactor * 20} 
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: 'primary.main'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Sharpe Ratio</Typography>
                          <Typography variant="body2">{mockResults.sharpeRatio}</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={mockResults.sharpeRatio * 20} 
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: 'secondary.main'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {results && <BacktestResults results={results} />}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Backtest; 