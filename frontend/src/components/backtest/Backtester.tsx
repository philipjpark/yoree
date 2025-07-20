import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  TrendingUp,
  TrendingDown,
  ShowChart,
  Timeline,
  Settings,
  Fullscreen,
  FullscreenExit,
  Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface BacktestResult {
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  equity: number[];
  dates: string[];
  trades: Trade[];
}

interface Trade {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  profitPercentage: number;
  type: 'long' | 'short';
}

interface BacktesterProps {
  strategy: any;
  token: string;
  onClose?: () => void;
}

const Backtester: React.FC<BacktesterProps> = ({ strategy, token, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeframe, setTimeframe] = useState('1D');
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const timeframes = [
    { value: '1H', label: '1 Hour' },
    { value: '4H', label: '4 Hours' },
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' }
  ];

  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setResults(null);

    try {
      // Simulate backtest progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Generate mock backtest results
      const mockResults: BacktestResult = {
        totalReturn: 23.45,
        maxDrawdown: -8.12,
        sharpeRatio: 1.67,
        winRate: 68.5,
        totalTrades: 47,
        profitFactor: 2.34,
        equity: generateEquityCurve(),
        dates: generateDates(),
        trades: generateMockTrades()
      };

      setResults(mockResults);
    } catch (err) {
      setError('Failed to run backtest');
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  const generateEquityCurve = (): number[] => {
    const curve = [];
    let equity = 10000; // Starting capital
    for (let i = 0; i < 100; i++) {
      // Simulate realistic equity curve with some volatility
      const dailyReturn = (Math.random() - 0.48) * 0.02; // Slightly positive bias
      equity *= (1 + dailyReturn);
      curve.push(equity);
    }
    return curve;
  };

  const generateDates = (): string[] => {
    const dates = [];
    const startDate = new Date();
    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - (100 - i));
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const generateMockTrades = (): Trade[] => {
    const trades: Trade[] = [];
    const basePrice = strategy.strategy.entry;
    
    for (let i = 0; i < 10; i++) {
      const entryPrice = basePrice * (0.95 + Math.random() * 0.1);
      const exitPrice = entryPrice * (0.98 + Math.random() * 0.04);
      const profit = exitPrice - entryPrice;
      const profitPercentage = (profit / entryPrice) * 100;
      const tradeType: 'long' | 'short' = Math.random() > 0.5 ? 'long' : 'short';
      
      trades.push({
        entryDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        exitDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        entryPrice,
        exitPrice,
        profit,
        profitPercentage,
        type: tradeType
      });
    }
    
    return trades.sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
  };

  const stopBacktest = () => {
    setIsRunning(false);
    setProgress(0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Add keyboard shortcut to close with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div
        onClick={(e) => {
          // Close when clicking outside the card
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Card 
          sx={{ 
            height: isFullscreen ? '100vh' : '80vh',
            background: 'linear-gradient(135deg, #1e222d 0%, #2a2e39 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
        >
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShowChart sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {token} Backtester
            </Typography>
            <Chip 
              label={`${strategy.strategy.confidence}% Confidence`}
              color="success"
              size="small"
              sx={{ color: 'white' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                sx={{ 
                  color: 'white',
                  '& .MuiSelect-icon': { color: 'white' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                {timeframes.map((tf) => (
                  <MenuItem key={tf.value} value={tf.value}>{tf.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Settings">
              <IconButton size="small" sx={{ color: 'white' }}>
                <Settings />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton size="small" sx={{ color: 'white' }} onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Close Backtester">
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': { background: 'rgba(255,255,255,0.2)' }
                }} 
                onClick={onClose}
              >
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardContent sx={{ p: 0, height: 'calc(100% - 80px)' }}>
          <Grid container sx={{ height: '100%' }}>
            {/* Left Panel - Controls and Results */}
            <Grid item xs={12} md={4} sx={{ p: 2, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Controls */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🎮 Controls
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={isRunning ? <Pause /> : <PlayArrow />}
                    onClick={isRunning ? stopBacktest : runBacktest}
                    disabled={isRunning}
                    sx={{ 
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': { 
                        background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                      },
                      '&:disabled': {
                        background: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    {isRunning ? '⏸️ Pause' : '▶️ Run Backtest'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Stop />}
                    onClick={stopBacktest}
                    disabled={!isRunning}
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': { 
                        borderColor: 'rgba(255,255,255,0.5)',
                        background: 'rgba(255,255,255,0.1)'
                      },
                      '&:disabled': {
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  >
                    ⏹️ Stop
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => setResults(null)}
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': { 
                        borderColor: 'rgba(255,255,255,0.5)',
                        background: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    🔄 Reset
                  </Button>
                </Box>

                {isRunning && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Running backtest... {progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        }
                      }}
                    />
                  </Box>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>

              {/* Strategy Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📊 Strategy Summary
                </Typography>
                
                <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.05)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Entry</Typography>
                      <Typography variant="h6" color="success.main">
                        ${strategy.strategy.entry.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Target</Typography>
                      <Typography variant="h6" color="success.main">
                        ${strategy.strategy.target.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Stop Loss</Typography>
                      <Typography variant="h6" color="error.main">
                        ${strategy.strategy.stopLoss.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Risk</Typography>
                      <Typography variant="h6">
                        {strategy.strategy.riskPercentage}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Results */}
              {results && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    📈 Results
                  </Typography>
                  
                  <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.05)' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Total Return</Typography>
                        <Typography 
                          variant="h6" 
                          color={results.totalReturn >= 0 ? 'success.main' : 'error.main'}
                        >
                          {results.totalReturn >= 0 ? '+' : ''}{results.totalReturn.toFixed(2)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Max Drawdown</Typography>
                        <Typography variant="h6" color="error.main">
                          {results.maxDrawdown.toFixed(2)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Sharpe Ratio</Typography>
                        <Typography variant="h6" color="success.main">
                          {results.sharpeRatio.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Win Rate</Typography>
                        <Typography variant="h6" color="success.main">
                          {results.winRate.toFixed(1)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Total Trades</Typography>
                        <Typography variant="h6">
                          {results.totalTrades}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Profit Factor</Typography>
                        <Typography variant="h6" color="success.main">
                          {results.profitFactor.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}
            </Grid>

            {/* Right Panel - Chart */}
            <Grid item xs={12} md={8} sx={{ p: 2 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Chart Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    📈 Equity Curve
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      icon={<TrendingUp />} 
                      label="Long" 
                      size="small" 
                      color="success"
                      sx={{ color: 'white' }}
                    />
                    <Chip 
                      icon={<TrendingDown />} 
                      label="Short" 
                      size="small" 
                      color="error"
                      sx={{ color: 'white' }}
                    />
                  </Box>
                </Box>

                {/* Chart Area */}
                <Paper 
                  sx={{ 
                    flex: 1, 
                    background: '#1e222d',
                    border: '1px solid #2a2e39',
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {!results ? (
                    <Box sx={{ textAlign: 'center', color: '#ffffff' }}>
                      <Timeline sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ mb: 1, opacity: 0.8 }}>
                        No Data Available
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>
                        Run a backtest to see the equity curve
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: '100%' }}>
                      {/* Simple Chart Visualization */}
                      <svg width="100%" height="100%" viewBox="0 0 800 400">
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#667eea" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#667eea" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        
                        {/* Grid lines */}
                        {[...Array(5)].map((_, i) => (
                          <line
                            key={i}
                            x1="0"
                            y1={80 * i}
                            x2="800"
                            y2={80 * i}
                            stroke="#2a2e39"
                            strokeWidth="1"
                          />
                        ))}
                        
                        {/* Equity curve */}
                        <path
                          d={results.equity.map((value, index) => {
                            const x = (index / (results.equity.length - 1)) * 800;
                            const y = 400 - ((value - Math.min(...results.equity)) / (Math.max(...results.equity) - Math.min(...results.equity))) * 400;
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          stroke="#667eea"
                          strokeWidth="3"
                          fill="none"
                        />
                        
                        {/* Area under curve */}
                        <path
                          d={`M 0 400 ${results.equity.map((value, index) => {
                            const x = (index / (results.equity.length - 1)) * 800;
                            const y = 400 - ((value - Math.min(...results.equity)) / (Math.max(...results.equity) - Math.min(...results.equity))) * 400;
                            return `L ${x} ${y}`;
                          }).join(' ')} L 800 400 Z`}
                          fill="url(#chartGradient)"
                        />
                        
                        {/* Entry and exit points */}
                        <circle
                          cx="50"
                          cy="200"
                          r="6"
                          fill="#4caf50"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <circle
                          cx="750"
                          cy="150"
                          r="6"
                          fill="#f44336"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                    </Box>
                  )}
                </Paper>

                {/* Recent Trades */}
                {results && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      📋 Recent Trades
                    </Typography>
                    
                    <Paper sx={{ background: 'rgba(255,255,255,0.05)', maxHeight: 200, overflow: 'auto' }}>
                      {results.trades.slice(-5).map((trade, index) => (
                        <Box key={index} sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {trade.type.toUpperCase()} {trade.entryDate}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${trade.entryPrice.toFixed(2)} → ${trade.exitPrice.toFixed(2)}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="h6" 
                              color={trade.profit >= 0 ? 'success.main' : 'error.main'}
                            >
                              {trade.profit >= 0 ? '+' : ''}{trade.profitPercentage.toFixed(2)}%
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Paper>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
              </Card>
      </div>
      </motion.div>
    );
  };

export default Backtester; 