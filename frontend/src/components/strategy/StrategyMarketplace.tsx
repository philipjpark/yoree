import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  ShoppingCart as BuyIcon,
  Sell as SellIcon,
  Timeline as ChartIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Diamond as DiamondIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useWallet } from '@solana/wallet-adapter-react';
import solMomentumImage from '../../assets/images/sol-momentum-master.svg';
import wifBreakoutImage from '../../assets/images/wif-breakout-pro.svg';
import pythMeanReversionImage from '../../assets/images/pyth-mean-reversion.svg';

interface StrategyToken {
  id: string;
  name: string;
  description: string;
  creator: string;
  tokenAddress: string;
  price: number;
  performance: {
    totalReturn: number;
    monthlyReturn: number;
    weeklyReturn: number;
    dailyReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
  };
  riskMetrics: {
    volatility: number;
    beta: number;
    alpha: number;
    riskLevel: 'Low' | 'Medium' | 'High';
  };
  strategy: {
    type: string;
    asset: string;
    timeframe: string;
    indicators: string[];
    entryRules: string[];
    exitRules: string[];
  };
  metadata: {
    image: string;
    category: string;
    tags: string[];
    createdAt: string;
    lastUpdated: string;
    totalHolders: number;
    marketCap: number;
    volume24h: number;
  };
  status: 'active' | 'paused' | 'archived';
}

const StrategyMarketplace: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [strategies, setStrategies] = useState<StrategyToken[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<StrategyToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyToken | null>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);
  const [sellAmount, setSellAmount] = useState(1);
  const [sortBy, setSortBy] = useState('performance');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');

  // Mock data for demonstration
  const mockStrategies: StrategyToken[] = [
    {
      id: '1',
      name: 'SOL Momentum Master',
      description: 'AI-powered momentum strategy optimized for Solana\'s volatility patterns',
      creator: 'philxdaegu',
      tokenAddress: 'SoL...ABC123',
      price: 0.85,
      performance: {
        totalReturn: 247.30,
        monthlyReturn: 23.4,
        weeklyReturn: 8.7,
        dailyReturn: 2.1,
        sharpeRatio: 2.8,
        maxDrawdown: -12.3,
        winRate: 78.5,
        totalTrades: 156
      },
      riskMetrics: {
        volatility: 0.45,
        beta: 1.2,
        alpha: 0.15,
        riskLevel: 'Medium'
      },
      strategy: {
        type: 'Momentum',
        asset: 'SOL',
        timeframe: '15m',
        indicators: ['RSI', 'MACD', 'Volume'],
        entryRules: ['Price above 20 SMA', 'RSI < 70', 'Volume spike'],
        exitRules: ['Stop loss at 2%', 'Take profit at 6%']
      },
      metadata: {
        image: solMomentumImage,
        category: 'Momentum',
        tags: ['AI', 'High-Frequency', 'SOL'],
        createdAt: '2024-01-15',
        lastUpdated: '2024-01-20',
        totalHolders: 847,
        marketCap: 1250000,
        volume24h: 45000
      },
      status: 'active'
    },
    {
      id: '2',
      name: 'WIF Breakout Pro',
      description: 'Breakout detection strategy for high-beta meme tokens',
      creator: 'CryptoWhale',
      tokenAddress: 'WIF...DEF456',
      price: 1.25,
      performance: {
        totalReturn: 189.71,
        monthlyReturn: 18.9,
        weeklyReturn: 6.2,
        dailyReturn: 1.8,
        sharpeRatio: 2.1,
        maxDrawdown: -18.7,
        winRate: 72.3,
        totalTrades: 89
      },
      riskMetrics: {
        volatility: 0.78,
        beta: 1.8,
        alpha: 0.22,
        riskLevel: 'High'
      },
      strategy: {
        type: 'Breakout',
        asset: 'WIF',
        timeframe: '5m',
        indicators: ['Bollinger Bands', 'Volume', 'Price Action'],
        entryRules: ['Price breaks upper BB', 'Volume > 200% avg'],
        exitRules: ['Stop loss at 3%', 'Take profit at 8%']
      },
      metadata: {
        image: wifBreakoutImage,
        category: 'Breakout',
        tags: ['Meme', 'High-Beta', 'WIF'],
        createdAt: '2024-01-10',
        lastUpdated: '2024-01-19',
        totalHolders: 623,
        marketCap: 890000,
        volume24h: 32000
      },
      status: 'active'
    },
    {
      id: '3',
      name: 'PYTH Mean Reversion',
      description: 'Statistical arbitrage strategy for stable price movements',
      creator: 'DeFiExplorer',
      tokenAddress: 'PYTH...GHI789',
      price: 0.65,
      performance: {
        totalReturn: 89.44,
        monthlyReturn: 12.1,
        weeklyReturn: 3.8,
        dailyReturn: 0.9,
        sharpeRatio: 1.9,
        maxDrawdown: -8.2,
        winRate: 85.2,
        totalTrades: 234
      },
      riskMetrics: {
        volatility: 0.28,
        beta: 0.8,
        alpha: 0.08,
        riskLevel: 'Low'
      },
      strategy: {
        type: 'Mean Reversion',
        asset: 'PYTH',
        timeframe: '1h',
        indicators: ['Bollinger Bands', 'RSI', 'Moving Averages'],
        entryRules: ['Price touches lower BB', 'RSI < 30'],
        exitRules: ['Stop loss at 1.5%', 'Take profit at 4%']
      },
      metadata: {
        image: pythMeanReversionImage,
        category: 'Mean Reversion',
        tags: ['Stable', 'Low-Risk', 'PYTH'],
        createdAt: '2024-01-05',
        lastUpdated: '2024-01-18',
        totalHolders: 1247,
        marketCap: 2100000,
        volume24h: 67000
      },
      status: 'active'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setStrategies(mockStrategies);
      setFilteredStrategies(mockStrategies);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortStrategies();
  }, [strategies, sortBy, filterCategory, filterRisk]);

  const filterAndSortStrategies = () => {
    let filtered = [...strategies];

    // Apply category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(strategy => strategy.metadata.category === filterCategory);
    }

    // Apply risk filter
    if (filterRisk !== 'All') {
      filtered = filtered.filter(strategy => strategy.riskMetrics.riskLevel === filterRisk);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.performance.totalReturn - a.performance.totalReturn;
        case 'price':
          return b.price - a.price;
        case 'marketCap':
          return b.metadata.marketCap - a.metadata.marketCap;
        case 'volume':
          return b.metadata.volume24h - a.metadata.volume24h;
        case 'holders':
          return b.metadata.totalHolders - a.metadata.totalHolders;
        default:
          return 0;
      }
    });

    setFilteredStrategies(filtered);
  };

  const handleBuyStrategy = (strategy: StrategyToken) => {
    setSelectedStrategy(strategy);
    setBuyDialogOpen(true);
  };

  const handleSellStrategy = (strategy: StrategyToken) => {
    setSelectedStrategy(strategy);
    setSellDialogOpen(true);
  };

  const executeBuy = () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    // Implement actual buy logic here
    console.log(`Buying ${buyAmount} tokens of ${selectedStrategy?.name} at ${selectedStrategy?.price} SOL each`);
    setBuyDialogOpen(false);
    setBuyAmount(1);
  };

  const executeSell = () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    // Implement actual sell logic here
    console.log(`Selling ${sellAmount} tokens of ${selectedStrategy?.name} at ${selectedStrategy?.price} SOL each`);
    setSellDialogOpen(false);
    setSellAmount(1);
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? '#4CAF50' : '#f44336';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'High': return '#f44336';
      default: return '#757575';
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>Loading Strategy Marketplace...</Typography>
          <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="🚀 Tokenized Strategies"
            color="primary"
            sx={{ 
              mb: 2,
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              color: 'white'
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 800,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Strategy Marketplace
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
          >
            Buy, sell, and trade AI-generated strategies as tokenized assets on Solana
          </Typography>
        </Box>
      </motion.div>

      {/* Filters and Sorting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="performance">Performance</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="marketCap">Market Cap</MenuItem>
                  <MenuItem value="volume">24h Volume</MenuItem>
                  <MenuItem value="holders">Holders</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  <MenuItem value="Momentum">Momentum</MenuItem>
                  <MenuItem value="Breakout">Breakout</MenuItem>
                  <MenuItem value="Mean Reversion">Mean Reversion</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  label="Risk Level"
                >
                  <MenuItem value="All">All Risk Levels</MenuItem>
                  <MenuItem value="Low">Low Risk</MenuItem>
                  <MenuItem value="Medium">Medium Risk</MenuItem>
                  <MenuItem value="High">High Risk</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {filteredStrategies.length} strategies found
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Strategy Grid */}
      <Grid container spacing={3}>
        <AnimatePresence>
          {filteredStrategies.map((strategy, index) => (
            <Grid item xs={12} md={6} lg={4} key={strategy.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                exit={{ opacity: 0, y: -30 }}
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    {/* Strategy Image */}
                    <CardMedia
                      component="img"
                      height="200"
                      image={strategy.metadata.image}
                      alt={strategy.name}
                      sx={{ objectFit: 'cover' }}
                    />

                    {/* Performance Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        px: 2,
                        py: 1,
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        +{strategy.performance.totalReturn.toFixed(1)}%
                      </Typography>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      {/* Strategy Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontFamily: '"Noto Sans KR", sans-serif',
                              fontWeight: 700,
                              color: 'text.primary',
                              mb: 1
                            }}
                          >
                            {strategy.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ lineHeight: 1.4, mb: 2 }}
                          >
                            {strategy.description}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Performance Metrics */}
                      <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ color: getPerformanceColor(strategy.performance.dailyReturn), fontWeight: 'bold' }}>
                                +{strategy.performance.dailyReturn}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Daily Return
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ color: getPerformanceColor(strategy.performance.weeklyReturn), fontWeight: 'bold' }}>
                                +{strategy.performance.weeklyReturn}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Weekly Return
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Risk and Stats */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={strategy.riskMetrics.riskLevel}
                            size="small"
                            sx={{
                              backgroundColor: getRiskColor(strategy.riskMetrics.riskLevel),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                          <Chip
                            label={`${strategy.performance.winRate}% Win Rate`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${strategy.metadata.totalHolders} Holders`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>

                      {/* Price and Market Data */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {strategy.price} SOL
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Market Cap: {formatCurrency(strategy.metadata.marketCap)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          24h Volume: {formatCurrency(strategy.metadata.volume24h)}
                        </Typography>
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<BuyIcon />}
                          onClick={() => handleBuyStrategy(strategy)}
                          sx={{
                            background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
                            }
                          }}
                        >
                          Buy Strategy
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<SellIcon />}
                          onClick={() => handleSellStrategy(strategy)}
                          sx={{
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderColor: '#f44336',
                            color: '#f44336',
                            '&:hover': {
                              borderColor: '#d32f2f',
                              backgroundColor: 'rgba(244, 67, 54, 0.05)',
                            }
                          }}
                        >
                          Sell
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* Buy Dialog */}
      <Dialog
        open={buyDialogOpen}
        onClose={() => setBuyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 800,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Buy Strategy Token
        </DialogTitle>
        <DialogContent>
          {selectedStrategy && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedStrategy.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedStrategy.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Amount to Buy:
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(Number(e.target.value))}
                  InputProps={{
                    endAdornment: <Typography>tokens</Typography>
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Total Cost:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {(buyAmount * selectedStrategy.price).toFixed(4)} SOL
                </Typography>
              </Box>

              <Box sx={{ p: 2, background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Strategy Performance:</strong> +{selectedStrategy.performance.totalReturn.toFixed(1)}% total return
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Risk Level:</strong> {selectedStrategy.riskMetrics.riskLevel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Win Rate:</strong> {selectedStrategy.performance.winRate}%
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setBuyDialogOpen(false)}
            sx={{ borderRadius: '12px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={executeBuy}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
              borderRadius: '12px',
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
              }
            }}
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog
        open={sellDialogOpen}
        onClose={() => setSellDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 800,
            background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Sell Strategy Token
        </DialogTitle>
        <DialogContent>
          {selectedStrategy && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedStrategy.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedStrategy.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Amount to Sell:
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(Number(e.target.value))}
                  InputProps={{
                    endAdornment: <Typography>tokens</Typography>
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Total Value:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {(sellAmount * selectedStrategy.price).toFixed(4)} SOL
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setSellDialogOpen(false)}
            sx={{ borderRadius: '12px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={executeSell}
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
              borderRadius: '12px',
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)',
              }
            }}
          >
            Confirm Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StrategyMarketplace; 