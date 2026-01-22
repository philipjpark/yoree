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
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Avatar,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ShowChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  DataObject as DataIcon,
  Speed as SpeedIcon,
  AddCircle as AddCircleIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { minamService } from '../services';
import { MinamFeed, MinamFeedType } from '../types/signal';
import { useNavigate } from 'react-router-dom';

// Signal asset classes (Syuzhet-style categories)
type SignalAssetClass = 'momentum' | 'sentiment' | 'fundamental' | 'macro' | 'technical' | 'social' | 'onchain' | 'volatility';

interface SignalAssetClassConfig {
  id: SignalAssetClass;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  feedTypes: MinamFeedType[];
}

const signalAssetClasses: SignalAssetClassConfig[] = [
  {
    id: 'momentum',
    name: 'Momentum Signals',
    description: 'Price momentum and trend strength indicators',
    icon: <TrendingUpIcon />,
    color: '#00FF88',
    feedTypes: ['price', 'volume', 'technical_indicators'],
  },
  {
    id: 'sentiment',
    name: 'Sentiment Signals',
    description: 'Market sentiment from social media and news',
    icon: <PsychologyIcon />,
    color: '#00D4FF',
    feedTypes: ['sentiment', 'social', 'news'],
  },
  {
    id: 'fundamental',
    name: 'Fundamental Signals',
    description: 'On-chain metrics and fundamental analysis',
    icon: <DataIcon />,
    color: '#667eea',
    feedTypes: ['onchain_metrics', 'price'],
  },
  {
    id: 'macro',
    name: 'Macro Signals',
    description: 'Broader market trends and regime changes',
    icon: <ChartIcon />,
    color: '#764ba2',
    feedTypes: ['price', 'volume', 'onchain_metrics'],
  },
  {
    id: 'technical',
    name: 'Technical Signals',
    description: 'Technical indicators and chart patterns',
    icon: <SpeedIcon />,
    color: '#FFA726',
    feedTypes: ['technical_indicators', 'price', 'volume'],
  },
  {
    id: 'social',
    name: 'Social Signals',
    description: 'Social media trends and community activity',
    icon: <PsychologyIcon />,
    color: '#EC4899',
    feedTypes: ['social', 'sentiment'],
  },
  {
    id: 'onchain',
    name: 'On-Chain Signals',
    description: 'Blockchain metrics and on-chain analytics',
    icon: <DataIcon />,
    color: '#10B981',
    feedTypes: ['onchain_metrics'],
  },
  {
    id: 'volatility',
    name: 'Volatility Signals',
    description: 'Market volatility and risk indicators',
    icon: <SpeedIcon />,
    color: '#F59E0B',
    feedTypes: ['price', 'volume', 'technical_indicators'],
  },
];

const DataFeeds: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState<MinamFeed[]>([]);
  const [filteredFeeds, setFilteredFeeds] = useState<MinamFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetClass, setSelectedAssetClass] = useState<SignalAssetClass | 'all'>('all');
  const [selectedFeed, setSelectedFeed] = useState<MinamFeed | null>(null);
  const [showFeedDialog, setShowFeedDialog] = useState(false);

  useEffect(() => {
    loadFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeds, searchQuery, selectedAssetClass]);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      const feedList = await minamService.listFeeds();
      setFeeds(feedList.filter(feed => feed.isActive));
    } catch (err: any) {
      // Silently use mock data as fallback
      setFeeds(getMockFeeds());
    } finally {
      setLoading(false);
    }
  };

  const filterFeeds = () => {
    let filtered = feeds;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(feed =>
        feed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feed.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feed.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by asset class
    if (selectedAssetClass !== 'all') {
      const assetClass = signalAssetClasses.find(ac => ac.id === selectedAssetClass);
      if (assetClass) {
        filtered = filtered.filter(feed => assetClass.feedTypes.includes(feed.type));
      }
    }

    setFilteredFeeds(filtered);
  };

  const getMockFeeds = (): MinamFeed[] => {
    return [
      {
        id: '1',
        name: 'BTC/USD Price Feed',
        type: 'price',
        description: 'Real-time Bitcoin price data with 1-second updates',
        provider: 'CoinGecko',
        dataFormat: 'JSON',
        updateFrequency: 'realtime',
        isActive: true,
      },
      {
        id: '2',
        name: 'ETH Sentiment Analysis',
        type: 'sentiment',
        description: 'Social media sentiment scores for Ethereum',
        provider: 'Twitter API',
        dataFormat: 'JSON',
        updateFrequency: 'minute',
        isActive: true,
      },
      {
        id: '3',
        name: 'DeFi TVL Metrics',
        type: 'onchain_metrics',
        description: 'Total Value Locked across DeFi protocols',
        provider: 'DeFiLlama',
        dataFormat: 'JSON',
        updateFrequency: 'hourly',
        isActive: true,
      },
      {
        id: '4',
        name: 'Crypto Volume Aggregator',
        type: 'volume',
        description: 'Aggregated trading volume across major exchanges',
        provider: 'CoinMarketCap',
        dataFormat: 'JSON',
        updateFrequency: 'realtime',
        isActive: true,
      },
      {
        id: '5',
        name: 'Reddit Crypto Mentions',
        type: 'social',
        description: 'Reddit post and comment mentions for crypto assets',
        provider: 'Reddit API',
        dataFormat: 'JSON',
        updateFrequency: 'minute',
        isActive: true,
      },
      {
        id: '6',
        name: 'RSI Technical Indicator',
        type: 'technical_indicators',
        description: 'Relative Strength Index for major crypto pairs',
        provider: 'TradingView',
        dataFormat: 'JSON',
        updateFrequency: 'realtime',
        isActive: true,
      },
    ];
  };

  const handleFeedClick = (feed: MinamFeed) => {
    setSelectedFeed(feed);
    setShowFeedDialog(true);
  };

  const handleCreateSignal = (feed1?: MinamFeed, feed2?: MinamFeed) => {
    if (feed1 && feed2) {
      navigate(`/create-signal?feed1=${feed1.id}&feed2=${feed2.id}`);
    } else {
      navigate('/create-signal');
    }
  };

  const getAssetClassForFeed = (feed: MinamFeed): SignalAssetClass | null => {
    for (const assetClass of signalAssetClasses) {
      if (assetClass.feedTypes.includes(feed.type)) {
        return assetClass.id;
      }
    }
    return null;
  };

  const getFeedTypeColor = (type: MinamFeedType): string => {
    const typeColors: Record<MinamFeedType, string> = {
      price: '#00FF88',
      sentiment: '#00D4FF',
      onchain_metrics: '#667eea',
      volume: '#764ba2',
      social: '#EC4899',
      news: '#FFA726',
      technical_indicators: '#10B981',
      other: '#94A3B8',
    };
    return typeColors[type] || typeColors.other;
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
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mr: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <DataIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  Data Feeds
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                  Browse and select data feeds to power your signals
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 800, mx: 'auto', mb: 3 }}>
              Connect to real-time data sources from Minam. Each feed can be bound to signals for continuous quality scoring and market evaluation.
            </Typography>
          </Box>
        </motion.div>

        {/* Signal Asset Classes (Syuzhet-style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
              Signal Asset Classes
            </Typography>
            <Grid container spacing={2}>
              {signalAssetClasses.map((assetClass) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={assetClass.id}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      onClick={() => setSelectedAssetClass(selectedAssetClass === assetClass.id ? 'all' : assetClass.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '16px',
                        background: selectedAssetClass === assetClass.id
                          ? `linear-gradient(135deg, ${assetClass.color}20 0%, ${assetClass.color}10 100%)`
                          : theme.palette.mode === 'dark'
                          ? 'rgba(26, 31, 58, 0.6)'
                          : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: selectedAssetClass === assetClass.id
                          ? `2px solid ${assetClass.color}`
                          : `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 8px 24px ${assetClass.color}30`,
                          transform: 'translateY(-4px)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: `linear-gradient(90deg, ${assetClass.color} 0%, ${assetClass.color}80 100%)`,
                          opacity: selectedAssetClass === assetClass.id ? 1 : 0.3,
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
                              background: `linear-gradient(135deg, ${assetClass.color} 0%, ${assetClass.color}80 100%)`,
                              color: 'white'
                            }}
                          >
                            {assetClass.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                              {assetClass.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {assetClass.feedTypes.length} feed types
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}>
                          {assetClass.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            sx={{
              mb: 4,
              p: 3,
              borderRadius: '16px',
              background: theme.palette.mode === 'dark'
                ? 'rgba(26, 31, 58, 0.6)'
                : 'rgba(255, 255, 255, 0.8)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search feeds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadFeeds}
                sx={{ borderRadius: '12px' }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={() => handleCreateSignal()}
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Create Signal
              </Button>
            </Box>
          </Card>
        </motion.div>


        {/* Feeds Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Available Feeds ({filteredFeeds.length})
              </Typography>
              {selectedAssetClass !== 'all' && (
                <Chip
                  label={`Filtered: ${signalAssetClasses.find(ac => ac.id === selectedAssetClass)?.name}`}
                  onDelete={() => setSelectedAssetClass('all')}
                  color="primary"
                />
              )}
            </Box>

            {filteredFeeds.length === 0 ? (
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
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                  No feeds found
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                  Try adjusting your search or filter criteria
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAssetClass('all');
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {filteredFeeds.map((feed) => {
                  const assetClass = getAssetClassForFeed(feed);
                  const assetClassConfig = assetClass ? signalAssetClasses.find(ac => ac.id === assetClass) : null;
                  const typeColor = getFeedTypeColor(feed.type);

                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={feed.id}>
                      <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          onClick={() => handleFeedClick(feed)}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: '16px',
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(26, 31, 58, 0.6)'
                              : 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.3s ease',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                              boxShadow: `0 8px 24px ${typeColor}30`,
                              transform: 'translateY(-4px)',
                              borderColor: typeColor,
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '3px',
                              background: `linear-gradient(90deg, ${typeColor} 0%, ${typeColor}80 100%)`,
                              borderRadius: '16px 16px 0 0',
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  mr: 2,
                                  background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}80 100%)`,
                                  color: 'white'
                                }}
                              >
                                <ApiIcon />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
                                  {feed.name}
                                </Typography>
                                <Chip
                                  label={feed.type}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${typeColor}20`,
                                    color: typeColor,
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    height: 20,
                                  }}
                                />
                              </Box>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                                mb: 2,
                                flex: 1,
                                lineHeight: 1.5,
                              }}
                            >
                              {feed.description}
                            </Typography>

                            <Divider sx={{ my: 1.5 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Provider
                              </Typography>
                              <Chip
                                label={feed.provider}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Update Frequency
                              </Typography>
                              <Chip
                                label={feed.updateFrequency}
                                size="small"
                                sx={{
                                  backgroundColor: feed.updateFrequency === 'realtime' ? '#00FF8820' : '#94A3B820',
                                  color: feed.updateFrequency === 'realtime' ? '#00FF88' : theme.palette.text.secondary,
                                  fontSize: '0.7rem',
                                  height: 20,
                                  fontWeight: 600,
                                }}
                              />
                            </Box>

                            {assetClassConfig && (
                              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      background: assetClassConfig.color,
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    {assetClassConfig.name}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </motion.div>
        )}

        {/* Feed Detail Dialog */}
        <Dialog
          open={showFeedDialog}
          onClose={() => setShowFeedDialog(false)}
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
          {selectedFeed && (
            <>
              <DialogTitle sx={{ pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      background: `linear-gradient(135deg, ${getFeedTypeColor(selectedFeed.type)} 0%, ${getFeedTypeColor(selectedFeed.type)}80 100%)`,
                      color: 'white'
                    }}
                  >
                    <ApiIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      {selectedFeed.name}
                    </Typography>
                    <Chip
                      label={selectedFeed.type}
                      size="small"
                      sx={{
                        backgroundColor: `${getFeedTypeColor(selectedFeed.type)}20`,
                        color: getFeedTypeColor(selectedFeed.type),
                        fontWeight: 600,
                        mt: 1,
                      }}
                    />
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                  {selectedFeed.description}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                      Provider
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                      {selectedFeed.provider}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                      Update Frequency
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                      {selectedFeed.updateFrequency}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                      Data Format
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                      {selectedFeed.dataFormat}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={selectedFeed.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={selectedFeed.isActive ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
                  Use This Feed
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                  This feed can be bound to signals for real-time data updates and quality scoring. Select it when creating a new signal.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={() => setShowFeedDialog(false)} sx={{ borderRadius: '12px' }}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowFeedDialog(false);
                    handleCreateSignal(selectedFeed);
                  }}
                  startIcon={<AddCircleIcon />}
                  sx={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Use in Signal
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default DataFeeds;
