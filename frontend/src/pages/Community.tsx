import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Stack,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Visibility as ViewIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  AutoAwesome as SparkleIcon,
  AccountCircle as UserIcon,
  Psychology as BrainIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { signalService } from '../services';
import { Signal } from '../types/signal';
import { useNavigate } from 'react-router-dom';

interface CommunitySignal extends Signal {
  views: number;
  likes: number;
  shares: number;
  creatorAvatar?: string;
  creatorName: string;
}

const Community: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [signals, setSignals] = useState<CommunitySignal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<CommunitySignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState<'quality' | 'recent' | 'popular'>('quality');
  const [selectedSignal, setSelectedSignal] = useState<CommunitySignal | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadSignals();
  }, []);

  useEffect(() => {
    filterAndSortSignals();
  }, [signals, searchQuery, sortBy, activeTab]);

  const loadSignals = async () => {
    try {
      setLoading(true);
      const signalList = await signalService.listSignals();
      const communitySignals: CommunitySignal[] = signalList.map((signal) => ({
        ...signal,
        views: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 500) + 10,
        shares: Math.floor(Math.random() * 100) + 5,
        creatorName: signal.creator.name || (signal.creator.type === 'agent' ? 'AI Agent' : 'User'),
        creatorAvatar: signal.creator.type === 'agent' ? undefined : undefined,
      }));
      setSignals(communitySignals);
      setFilteredSignals(communitySignals);
    } catch (error: any) {
      console.error('Failed to load signals:', error);
      // Use mock data
      const mockSignals = getMockSignals();
      setSignals(mockSignals);
      setFilteredSignals(mockSignals);
    } finally {
      setLoading(false);
    }
  };

  const getMockSignals = (): CommunitySignal[] => {
    return [
      {
        id: '1',
        underlyingAsset: 'ETH',
        hypothesis: 'ETH will reach $4,000 within 30 days based on increasing adoption and institutional interest',
        dataBindings: [],
        score: { accuracy: 85, performance: 92, consensus: 78, composite: 85, lastUpdated: new Date().toISOString() },
        quality: 92,
        creator: { type: 'human', id: 'user-1', name: 'CryptoTrader', isAgentAnnounced: false },
        instances: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 1247,
        likes: 342,
        shares: 89,
        creatorName: 'CryptoTrader',
      },
      {
        id: '2',
        underlyingAsset: 'BTC',
        hypothesis: 'Bitcoin will consolidate above $65k before next leg up to $75k',
        dataBindings: [],
        score: { accuracy: 78, performance: 85, consensus: 82, composite: 82, lastUpdated: new Date().toISOString() },
        quality: 88,
        creator: { type: 'agent', id: 'agent-1', name: 'Yoree AI Agent', isAgentAnnounced: true },
        instances: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 2156,
        likes: 567,
        shares: 134,
        creatorName: 'Yoree AI Agent',
      },
    ];
  };

  const filterAndSortSignals = () => {
    let filtered = [...signals];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (signal) =>
          signal.underlyingAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
          signal.hypothesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          signal.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter((s) => s.creator.type === 'agent');
    } else if (activeTab === 2) {
      filtered = filtered.filter((s) => s.creator.type === 'human');
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'quality') {
        return b.quality - a.quality;
      } else if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.views - a.views;
      }
    });

    setFilteredSignals(filtered);
  };

  const handleLike = (signalId: string) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === signalId ? { ...s, likes: s.likes + 1 } : s))
    );
  };

  const handleViewSignal = (signal: CommunitySignal) => {
    setSelectedSignal(signal);
    setShowDetails(true);
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
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: theme.palette.text.primary,
                mb: 2,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Community Signal Board
            </Typography>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
              Discover, evaluate, and trade intelligence assets from the community
            </Typography>

            {/* Search and Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Search signals by asset, hypothesis, or creator..."
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      background: theme.palette.mode === 'dark' ? 'rgba(26, 31, 58, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={() => {
                    const options: ('quality' | 'recent' | 'popular')[] = ['quality', 'recent', 'popular'];
                    const currentIndex = options.indexOf(sortBy);
                    setSortBy(options[(currentIndex + 1) % options.length]);
                  }}
                  sx={{
                    borderRadius: '16px',
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Button>
              </Grid>
            </Grid>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                mb: 3,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                },
              }}
            >
              <Tab label="All Signals" />
              <Tab label="🤖 AI Generated" />
              <Tab label="👤 Human Created" />
            </Tabs>
          </Box>
        </motion.div>

        {/* Signals Grid */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
              Loading signals...
            </Typography>
          </Box>
        ) : filteredSignals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
              No signals found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {filteredSignals.map((signal, index) => (
                <Grid item xs={12} md={6} lg={4} key={signal.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '20px',
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(26, 31, 58, 0.8)'
                          : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)',
                        },
                      }}
                      onClick={() => handleViewSignal(signal)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box>
                            <Chip
                              label={signal.underlyingAsset}
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 700,
                                mb: 1,
                              }}
                            />
                            {signal.creator.type === 'agent' && (
                              <Chip
                                icon={<SparkleIcon />}
                                label="AI Agent"
                                size="small"
                                sx={{
                                  ml: 1,
                                  background: 'rgba(102, 126, 234, 0.2)',
                                  color: theme.palette.primary.main,
                                }}
                              />
                            )}
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                              {signal.quality}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              Quality
                            </Typography>
                          </Box>
                        </Box>

                        {/* Hypothesis */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.primary,
                            mb: 2,
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {signal.hypothesis}
                        </Typography>

                        {/* Quality Progress */}
                        <LinearProgress
                          variant="determinate"
                          value={signal.quality}
                          sx={{
                            height: 8,
                            borderRadius: '4px',
                            mb: 2,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: '4px',
                            },
                          }}
                        />

                        <Divider sx={{ my: 2 }} />

                        {/* Creator and Stats */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                background: signal.creator.type === 'agent'
                                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              }}
                            >
                              {signal.creator.type === 'agent' ? <BrainIcon /> : <UserIcon />}
                            </Avatar>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {signal.creatorName}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={2}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                                👁️ {signal.views}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                                ❤️ {signal.likes}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Container>

      {/* Signal Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: theme.palette.mode === 'dark' ? 'rgba(26, 31, 58, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        {selectedSignal && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {selectedSignal.underlyingAsset} Signal
                </Typography>
                <IconButton onClick={() => setShowDetails(false)}>
                  <ViewIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                {selectedSignal.hypothesis}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Quality Score
                  </Typography>
                  <Typography variant="h6">{selectedSignal.quality}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Creator
                  </Typography>
                  <Typography variant="body2">{selectedSignal.creatorName}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => navigate(`/portfolio`)}>View in Portfolio</Button>
              <Button variant="contained" onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Community;
