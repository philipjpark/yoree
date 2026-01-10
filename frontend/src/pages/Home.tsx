import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  AccountBalanceWallet as WalletIcon,
  Analytics as AnalyticsIcon,
  AddCircle as AddCircleIcon,
  ArrowForward as ArrowForwardIcon,
  FlashOn as FlashIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Apps as AppsIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import yoreeLogo from '../assets/images/yoree_logo.png';
// Note: These logos should be copied to frontend/public/ or frontend/src/assets/images/
// For now using placeholder paths - update once logos are accessible
const minamLogo = '/minam-logo.png'; // Should be: minam/apps/web/public/james-dean-logo.png
const syuzhetLogo = '/syuzhet-logo.png'; // Should be: syuzhet/public/Saylor.png

// Mock signal data for live markets preview
const mockSignals = [
  { id: '1', name: 'ETH Bull Signal', asset: 'ETH', price: 0.85, change24h: 12.5, volume: 1250000, quality: 92 },
  { id: '2', name: 'BTC Macro Trend', asset: 'BTC', price: 1.24, change24h: -3.2, volume: 890000, quality: 88 },
  { id: '3', name: 'DeFi Narrative', asset: 'DEFI', price: 0.67, change24h: 8.7, volume: 450000, quality: 85 },
  { id: '4', name: 'Layer 2 Adoption', asset: 'L2', price: 0.92, change24h: 15.3, volume: 320000, quality: 90 },
  { id: '5', name: 'AI Token Surge', asset: 'AI', price: 1.15, change24h: 22.1, volume: 210000, quality: 87 }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [tickerPosition, setTickerPosition] = useState(0);
  const [logoIndex, setLogoIndex] = useState(0);

  const logos = [
    { src: yoreeLogo, alt: 'Yoree Signals Market', name: 'Yoree', link: '/signal-markets' },
    { src: minamLogo, alt: 'Minam Data Feeds', name: 'Minam', link: '/data-feeds' },
    { src: syuzhetLogo, alt: 'Syuzhet Predictions', name: 'Syuzhet', link: '/create-signal' }
  ];

  // Animate ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPosition(prev => (prev + 1) % mockSignals.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Rotate logos every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoIndex(prev => (prev + 1) % logos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Total Markets', value: '1,247', icon: <ChartIcon />, color: '#667eea' },
    { label: '24h Volume', value: '$12.4M', icon: <TrendingUpIcon />, color: '#00FF88' },
    { label: 'Active Traders', value: '8,432', icon: <WalletIcon />, color: '#00D4FF' },
    { label: 'Avg Quality', value: '89.2%', icon: <AnalyticsIcon />, color: '#FFA726' }
  ];

  const features = [
    {
      title: 'Real-Time Trading',
      description: 'Trade signal quality as first-class assets with instant execution',
      icon: <FlashIcon sx={{ fontSize: 40 }} />,
      color: '#00FF88'
    },
    {
      title: 'Quality-Based Pricing',
      description: 'Market prices reflect signal quality evolution in real-time',
      icon: <ChartIcon sx={{ fontSize: 40 }} />,
      color: '#00D4FF'
    },
    {
      title: 'AI-Powered Signals',
      description: 'Generate and evaluate signals using advanced AI analysis',
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      color: '#667eea'
    },
    {
      title: 'Secure Exchange',
      description: 'Enterprise-grade security for all trading operations',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: '#FFA726'
    }
  ];

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number) => `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' ? '#0A0E27' : '#F8FAFC',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(0, 255, 136, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(102, 126, 234, 0.03) 2px,
                rgba(102, 126, 234, 0.03) 4px
              )
            `,
            zIndex: 1
          }
        }}
      />

      {/* Hero Section */}
      <Box sx={{ position: 'relative', zIndex: 1, pt: 8, pb: 6 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center" sx={{ mb: 6 }}>
            {/* Rotating Logo Section */}
            <Grid item xs={12} md={4}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={logoIndex}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  transition={{ duration: 0.6 }}
                >
      <Box
        sx={{
          display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(logos[logoIndex].link)}
                >
                  <Box
                    component="img"
                    src={logos[logoIndex].src}
                    alt={logos[logoIndex].alt}
                    onError={(e: any) => {
                      // Fallback to Yoree logo if image doesn't exist
                      console.warn(`Failed to load logo: ${logos[logoIndex].src}, falling back to Yoree logo`);
                      e.target.src = yoreeLogo;
                    }}
                    onLoad={(e: any) => {
                      // Log successful load for debugging
                      if (logos[logoIndex].src !== yoreeLogo) {
                        console.log(`Successfully loaded logo: ${logos[logoIndex].src}`);
                      }
                    }}
                    sx={{
                      maxWidth: { xs: '250px', md: '400px', lg: '500px' },
                      height: 'auto',
                      borderRadius: 4,
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 20px 60px rgba(102, 126, 234, 0.3)'
                        : '0 20px 60px rgba(102, 126, 234, 0.2)',
                      border: theme.palette.mode === 'dark'
                        ? '2px solid rgba(102, 126, 234, 0.3)'
                        : '2px solid rgba(102, 126, 234, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 30px 80px rgba(102, 126, 234, 0.4)'
                          : '0 30px 80px rgba(102, 126, 234, 0.3)',
                      }
                    }}
                  />
                  <Chip
                    label={logos[logoIndex].name}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 0.5
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      color: theme.palette.text.secondary,
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}
                  >
                    Click to explore {logos[logoIndex].name} features
                  </Typography>
                </Box>
                </motion.div>
              </AnimatePresence>
            </Grid>

            {/* Hero Content */}
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 3, flexWrap: 'wrap' }}>
                    <Chip
                  label="Live Trading"
                  icon={<FlashIcon />}
                      sx={{ 
                    background: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
                    color: '#0A0E27',
                    fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    />
                    <Chip
                  label="Real-Time Quality"
                  icon={<SpeedIcon />}
                      sx={{ 
                    background: 'linear-gradient(135deg, #00D4FF 0%, #00A8CC 100%)',
                    color: '#0A0E27',
                    fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    />
                    <Chip
                  label="Omnichannel"
                  icon={<AppsIcon />}
                      sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    />
                  </Stack>
                  
                  <Typography 
                    variant="h1" 
                    gutterBottom
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '3rem', md: '4.5rem', lg: '5.5rem' },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #00D4FF 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.1,
                  mb: 2,
                      letterSpacing: '-0.02em'
                    }}
                  >
                YOREE SIGNALS MARKET
                  </Typography>
                  
                  <Typography 
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      color: theme.palette.text.primary,
                      mb: 2
                    }}
                  >
                    The Intelligence Exchange
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      mb: 4,
                      maxWidth: 700,
                      mx: { xs: 'auto', md: 0 },
                      fontWeight: 400
                    }} 
                  >
                    Trade signal quality as first-class assets. Where intelligence competes and learns via markets.
                  </Typography>

                  <Stack direction="row" spacing={3} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 6 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                    onClick={() => navigate('/signal-markets')}
                    startIcon={<ChartIcon />}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                      borderRadius: 2
                    }}
                  >
                    Start Trading
                    </Button>
                  </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      size="large"
                    onClick={() => navigate('/create-signal')}
                    startIcon={<AddCircleIcon />}
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                      borderRadius: 2,
                      borderColor: '#667eea',
                      color: '#667eea',
                        '&:hover': {
                        borderColor: '#764ba2',
                        background: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                    Create Signal
                    </Button>
                  </motion.div>
                </Stack>
                  </Box>
              </motion.div>
            </Grid>
          </Grid>

          {/* Live Markets Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
            <Card
              sx={{ 
                background: theme.palette.mode === 'dark'
                  ? 'rgba(26, 31, 58, 0.8)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(102, 126, 234, 0.2)'
                  : '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: 3,
                mb: 6
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    Live Signal Markets
            </Typography>
                  <Button
                    variant="text"
                    onClick={() => navigate('/signal-markets')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ color: '#667eea', fontWeight: 600 }}
                  >
                    View All
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600, borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>Signal</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600, borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>Price</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600, borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>24h Change</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600, borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>Volume</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600, borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>Quality</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.text.secondary, fontWeight: 600, borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockSignals.map((signal) => (
                        <TableRow
                          key={signal.id}
              sx={{ 
                            '&:hover': { background: 'rgba(102, 126, 234, 0.1)' },
                            cursor: 'pointer',
                            '&:last-child td': { border: 0 }
                          }}
                          onClick={() => navigate(`/signal-markets?signal=${signal.id}`)}
                        >
                          <TableCell sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                {signal.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {signal.asset}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                              {formatPrice(signal.price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <Chip
                              label={formatChange(signal.change24h)}
                              size="small"
                              icon={signal.change24h > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              sx={{
                                background: signal.change24h > 0 
                                  ? 'rgba(0, 255, 136, 0.2)' 
                                  : 'rgba(255, 68, 68, 0.2)',
                                color: signal.change24h > 0 ? '#00FF88' : '#FF4444',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              ${(signal.volume / 1000).toFixed(0)}K
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
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
                                      : 'linear-gradient(90deg, #FF4444 0%, #CC0000 100%)'
                                  }
                                }}
                              />
                              <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600, minWidth: 35 }}>
                                {signal.quality}%
            </Typography>
          </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/signal-markets?signal=${signal.id}`);
                              }}
                              sx={{
                                borderColor: '#667eea',
                                color: '#667eea',
                                '&:hover': {
                                  borderColor: '#764ba2',
                                  background: 'rgba(102, 126, 234, 0.1)'
                                }
                              }}
                            >
                              Trade
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Section */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card
                    sx={{
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(26, 31, 58, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: stat.color,
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px ${stat.color}20`
                      }
                    }}
                  >
                    <Box
                        sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                          mx: 'auto',
                        mb: 2
                      }}
                    >
                      {React.cloneElement(stat.icon, { sx: { color: stat.color, fontSize: 28 } })}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}>
                        {stat.value}
                      </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

      {/* Features Section */}
          <Box sx={{ mb: 8 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                color: theme.palette.text.primary, 
                mb: 6,
                textAlign: 'center',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Exchange Features
            </Typography>
            <Grid container spacing={4}>
            {features.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  >
                    <Card
                      sx={{
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(26, 31, 58, 0.6)'
                          : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: theme.palette.mode === 'dark'
                          ? '1px solid rgba(255,255,255,0.1)'
                          : '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 2,
                        p: 4,
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: feature.color,
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 32px ${feature.color}20`
                        }
                      }}
                    >
                      <Box
                            sx={{
                              width: 64,
                              height: 64,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3
                        }}
                      >
                        {React.cloneElement(feature.icon, { sx: { color: feature.color } })}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 2 }}>
                              {feature.title}
                            </Typography>
                      <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                          {feature.description}
                        </Typography>
                    </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
      </Box>

      {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card
            sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                backdropFilter: 'blur(20px)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(102, 126, 234, 0.3)'
                  : '1px solid rgba(102, 126, 234, 0.4)',
                borderRadius: 3,
                p: 6,
                textAlign: 'center'
              }}
            >
              <Typography 
                variant="h3" 
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Ready to Trade Signal Quality?
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 4,
                  maxWidth: 600,
                  mx: 'auto',
                  fontWeight: 400
                }}
              >
                Join the intelligence exchange where signals evolve, markets adapt, and quality is priced in real-time.
              </Typography>
              <Stack direction="row" spacing={3} justifyContent="center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  size="large"
                    onClick={() => navigate('/signal-markets')}
                    startIcon={<ChartIcon />}
                    sx={{ 
                      px: 5,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 2
                    }}
                  >
                    Explore Markets
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/create-signal')}
                    startIcon={<AddCircleIcon />}
                  sx={{
                      px: 5,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 2,
                      borderColor: '#667eea',
                      color: '#667eea',
                    '&:hover': {
                        borderColor: '#764ba2',
                        background: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                    Create Signal
                </Button>
              </motion.div>
              </Stack>
          </Card>
        </motion.div>
      </Container>
      </Box>
    </Box>
  );
};

export default Home; 
