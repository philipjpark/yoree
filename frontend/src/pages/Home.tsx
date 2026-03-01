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
  LinearProgress,
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
  Hub as HubIcon,
  Lock as LockIcon,
  Psychology as AIIcon,
  Share as SocialIcon,
  AccountBalance as BrokerageIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import yoreeLogo from '../assets/images/yoree_logo.png';
const minamLogo = '/minam-logo.png';
const syuzhetLogo = '/syuzhet-logo.png';

const mockSignals = [
  { id: '1', name: 'ETH Bull Signal', asset: 'ETH', price: 0.85, change24h: 12.5, volume: 1250000, quality: 92 },
  { id: '2', name: 'BTC Macro Trend', asset: 'BTC', price: 1.24, change24h: -3.2, volume: 890000, quality: 88 },
  { id: '3', name: 'DeFi Narrative', asset: 'DEFI', price: 0.67, change24h: 8.7, volume: 450000, quality: 85 },
  { id: '4', name: 'Layer 2 Adoption', asset: 'L2', price: 0.92, change24h: 15.3, volume: 320000, quality: 90 },
  { id: '5', name: 'AI Token Surge', asset: 'AI', price: 1.15, change24h: 22.1, volume: 210000, quality: 87 },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [logoIndex, setLogoIndex] = useState(0);

  const logos = [
    { src: yoreeLogo, alt: 'Yoree Signals Market', name: 'Yoree', link: '/signal-markets' },
    { src: minamLogo, alt: 'Minam Data Feeds', name: 'Minam', link: '/data-feeds' },
    { src: syuzhetLogo, alt: 'Syuzhet Predictions', name: 'Syuzhet', link: '/create-signal' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % logos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Total Markets', value: '1,247', icon: <ChartIcon />, color: '#6366f1' },
    { label: '24h Volume', value: '$12.4M', icon: <TrendingUpIcon />, color: '#10b981' },
    { label: 'Active Traders', value: '8,432', icon: <WalletIcon />, color: '#3b82f6' },
    { label: 'Avg Quality', value: '89.2%', icon: <AnalyticsIcon />, color: '#f59e0b' },
  ];

  const pipelineSteps = [
    { icon: <SocialIcon sx={{ fontSize: 20 }} />, label: 'Socials', desc: 'X, TG, TikTok, Reddit', color: '#3b82f6' },
    { icon: <AIIcon sx={{ fontSize: 20 }} />, label: 'AI Layer', desc: 'GPT-4o, YSM Engine', color: '#6366f1' },
    { icon: <HubIcon sx={{ fontSize: 20 }} />, label: 'YSM', desc: 'Signal + Asset Discovery', color: '#10b981' },
    { icon: <LockIcon sx={{ fontSize: 20 }} />, label: 'Monad', desc: 'Private via Unlink', color: '#8b5cf6' },
    { icon: <BrokerageIcon sx={{ fontSize: 20 }} />, label: 'Execute', desc: 'Robinhood, Binance, Kalshi', color: '#f59e0b' },
  ];

  const features = [
    {
      title: 'Real-Time Trading',
      description: 'Trade signal quality as first-class assets with instant execution on any connected brokerage.',
      icon: <FlashIcon sx={{ fontSize: 28 }} />,
      color: '#10b981',
    },
    {
      title: 'AI-Powered Signals',
      description: 'Multiple AI models analyze social data to generate actionable trading hypotheses.',
      icon: <SpeedIcon sx={{ fontSize: 28 }} />,
      color: '#6366f1',
    },
    {
      title: 'On-Chain Privacy',
      description: 'Execute private transactions on Monad via Unlink zero-knowledge proofs.',
      icon: <SecurityIcon sx={{ fontSize: 28 }} />,
      color: '#8b5cf6',
    },
    {
      title: 'Omnichannel Routing',
      description: 'Signals auto-route to the right platform — crypto, stocks, predictions, or sports.',
      icon: <HubIcon sx={{ fontSize: 28 }} />,
      color: '#f59e0b',
    },
  ];

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number) => `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;

  const glassCard = (children: React.ReactNode) => (
    <Card
      elevation={0}
      sx={{
        background: isDark
          ? 'linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.7) 100%)'
          : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      {children}
    </Card>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 50%, #020617 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid pattern */}
      <Box
        sx={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: isDark ? 0.4 : 0.2,
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)'} 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Glow orbs */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: '-5%', right: '15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)' }} />
        <Box sx={{ position: 'absolute', bottom: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)' }} />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Container maxWidth="xl">
          {/* ── Hero ── */}
          <Box sx={{ pt: { xs: 6, md: 10 }, pb: 6 }}>
            <Grid container spacing={4} alignItems="center">
              {/* Logo */}
              <Grid item xs={12} md={4}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={logoIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => navigate(logos[logoIndex].link)}
                    >
                      <Box
                        component="img"
                        src={logos[logoIndex].src}
                        alt={logos[logoIndex].alt}
                        onError={(e: any) => { e.target.src = yoreeLogo; }}
                        sx={{
                          maxWidth: { xs: 220, md: 360 },
                          height: 'auto',
                          borderRadius: '20px',
                          boxShadow: `0 20px 60px ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          transition: 'all 0.3s ease',
                          '&:hover': { transform: 'scale(1.03)' },
                        }}
                      />
                      <Chip
                        label={logos[logoIndex].name}
                        size="small"
                        sx={{
                          mt: 2, fontWeight: 700, fontSize: '0.78rem',
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: '#fff',
                        }}
                      />
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Grid>

              {/* Hero Content */}
              <Grid item xs={12} md={8}>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 3, flexWrap: 'wrap', gap: 0.5 }}>
                      {[
                        { label: 'Live Trading', color: '#10b981' },
                        { label: 'AI-Powered', color: '#6366f1' },
                        { label: 'On-Chain Privacy', color: '#8b5cf6' },
                      ].map((tag) => (
                        <Chip
                          key={tag.label}
                          label={tag.label}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: '0.72rem', height: 26,
                            background: `${tag.color}15`, color: tag.color,
                            border: `1px solid ${tag.color}30`,
                          }}
                        />
                      ))}
                    </Stack>

                    <Typography
                      variant="h1"
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: '2.5rem', md: '3.8rem', lg: '4.5rem' },
                        background: isDark
                          ? 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)'
                          : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        lineHeight: 1.1, mb: 2, letterSpacing: '-0.03em',
                      }}
                    >
                      YOREE SIGNALS{' '}
                      <Box
                        component="span"
                        sx={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #10b981 100%)',
                          backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}
                      >
                        MARKET
                      </Box>
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1.5, fontSize: { xs: '1.2rem', md: '1.5rem' } }}
                    >
                      The Intelligence Exchange
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 600, mx: { xs: 'auto', md: 0 }, fontWeight: 400, lineHeight: 1.6, fontSize: '1rem' }}
                    >
                      From social intelligence to trade execution — AI-powered signals flow through the YSM pipeline
                      to any brokerage, with on-chain privacy via Monad + Unlink.
                    </Typography>

                    <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => navigate('/pipeline')}
                          startIcon={<HubIcon />}
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            px: 3.5, py: 1.3, fontSize: '0.95rem', fontWeight: 700, textTransform: 'none',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow: '0 8px 28px rgba(99,102,241,0.3)',
                            '&:hover': { boxShadow: '0 12px 36px rgba(99,102,241,0.4)' },
                          }}
                        >
                          Open Pipeline
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => navigate('/signal-markets')}
                          startIcon={<ChartIcon />}
                          sx={{
                            px: 3.5, py: 1.3, fontSize: '0.95rem', fontWeight: 700, textTransform: 'none',
                            borderRadius: '14px',
                            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                            color: theme.palette.text.primary,
                            '&:hover': { borderColor: '#6366f1', background: '#6366f106' },
                          }}
                        >
                          Explore Markets
                        </Button>
                      </motion.div>
                    </Stack>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Box>

          {/* ── Pipeline Preview ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {glassCard(
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                    }}>
                      <HubIcon sx={{ fontSize: 18, color: '#fff' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1rem' }}>
                        YSM Bicameral Pipeline
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Social → AI → Signals → Assets → Execution
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="text"
                    onClick={() => navigate('/pipeline')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ color: '#6366f1', fontWeight: 700, textTransform: 'none', fontSize: '0.85rem' }}
                  >
                    Full Dashboard
                  </Button>
                </Stack>

                <Stack
                  direction="row"
                  spacing={{ xs: 0.5, md: 1.5 }}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ flexWrap: 'wrap', gap: { xs: 1, md: 0 } }}
                >
                  {pipelineSteps.map((step, i) => (
                    <React.Fragment key={step.label}>
                      {i > 0 && (
                        <ArrowForwardIcon
                          sx={{
                            color: theme.palette.text.secondary, fontSize: 16, opacity: 0.3,
                            display: { xs: 'none', sm: 'block' },
                          }}
                        />
                      )}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2, borderRadius: '14px', textAlign: 'center',
                          minWidth: { xs: 90, md: 130 },
                          background: isDark ? `${step.color}08` : `${step.color}05`,
                          border: `1px solid ${step.color}18`,
                          transition: 'all 0.25s',
                          cursor: 'pointer',
                          '&:hover': { borderColor: `${step.color}40`, transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${step.color}12` },
                        }}
                        onClick={() => navigate('/pipeline')}
                      >
                        <Box sx={{
                          width: 40, height: 40, borderRadius: '10px', mx: 'auto', mb: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${step.color}15`, color: step.color,
                        }}>
                          {step.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.78rem' }}>
                          {step.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.62rem' }}>
                          {step.desc}
                        </Typography>
                      </Paper>
                    </React.Fragment>
                  ))}
                </Stack>
              </CardContent>
            )}
          </motion.div>

          {/* ── Stats ── */}
          <Grid container spacing={2} sx={{ my: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3, borderRadius: '16px', textAlign: 'center',
                      background: isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: `${stat.color}40`, transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${stat.color}10` },
                    }}
                  >
                    <Box sx={{
                      width: 44, height: 44, borderRadius: '12px', mx: 'auto', mb: 1.5,
                      background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {React.cloneElement(stat.icon, { sx: { color: stat.color, fontSize: 22 } })}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1.6rem', mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.78rem' }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* ── Live Markets ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            {glassCard(
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1rem' }}>
                    Live Signal Markets
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => navigate('/signal-markets')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ color: '#6366f1', fontWeight: 700, textTransform: 'none', fontSize: '0.82rem' }}
                  >
                    View All
                  </Button>
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['Signal', 'Price', '24h', 'Volume', 'Quality', ''].map((h) => (
                          <TableCell
                            key={h}
                            align={h === 'Signal' ? 'left' : 'right'}
                            sx={{
                              color: theme.palette.text.secondary, fontWeight: 700, fontSize: '0.7rem',
                              borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                              textTransform: 'uppercase', letterSpacing: '0.08em', py: 1.5,
                            }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockSignals.map((signal) => (
                        <TableRow
                          key={signal.id}
                          sx={{
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            '&:hover': { background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)' },
                            '&:last-child td': { border: 0 },
                          }}
                          onClick={() => navigate(`/signal-markets?signal=${signal.id}`)}
                        >
                          <TableCell sx={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.85rem' }}>
                                {signal.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.68rem' }}>
                                {signal.asset}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '0.88rem' }}>
                              {formatPrice(signal.price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                            <Chip
                              label={formatChange(signal.change24h)}
                              size="small"
                              sx={{
                                height: 24, fontSize: '0.72rem', fontWeight: 700,
                                background: signal.change24h > 0 ? '#10b98115' : '#ef444415',
                                color: signal.change24h > 0 ? '#10b981' : '#ef4444',
                                border: `1px solid ${signal.change24h > 0 ? '#10b98125' : '#ef444425'}`,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                              ${(signal.volume / 1000).toFixed(0)}K
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                            <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                              <LinearProgress
                                variant="determinate"
                                value={signal.quality}
                                sx={{
                                  width: 48, height: 4, borderRadius: 2,
                                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    background: signal.quality > 85
                                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                                      : signal.quality > 70
                                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                      : 'linear-gradient(90deg, #ef4444, #f87171)',
                                  },
                                }}
                              />
                              <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 700, fontSize: '0.78rem', minWidth: 30 }}>
                                {signal.quality}%
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                            <Button
                              size="small"
                              onClick={(e) => { e.stopPropagation(); navigate(`/signal-markets?signal=${signal.id}`); }}
                              sx={{
                                textTransform: 'none', fontSize: '0.75rem', fontWeight: 700,
                                borderRadius: '8px', px: 1.5, minWidth: 'auto',
                                color: '#6366f1',
                                background: '#6366f108',
                                border: '1px solid #6366f120',
                                '&:hover': { background: '#6366f115' },
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
            )}
          </motion.div>

          {/* ── Features ── */}
          <Box sx={{ my: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800, color: theme.palette.text.primary, mb: 4, textAlign: 'center',
                fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.02em',
              }}
            >
              Exchange Features
            </Typography>
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3, borderRadius: '16px', height: '100%',
                        background: isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                        transition: 'all 0.3s ease',
                        '&:hover': { borderColor: `${feature.color}30`, transform: 'translateY(-3px)' },
                      }}
                    >
                      <Box sx={{
                        width: 48, height: 48, borderRadius: '12px', mb: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${feature.color}12`, color: feature.color,
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1, fontSize: '0.95rem' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5, fontSize: '0.82rem' }}>
                        {feature.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* ── CTA ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Box
              sx={{
                mb: 6, p: { xs: 4, md: 6 }, borderRadius: '20px', textAlign: 'center',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)'
                  : 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.04) 100%)',
                border: `1px solid ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'}`,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.02em' }}
              >
                Ready to Trade Signal Quality?
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 520, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}
              >
                Join the intelligence exchange where signals evolve, markets adapt, and quality is priced in real-time.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/pipeline')}
                    startIcon={<HubIcon />}
                    sx={{
                      px: 4, py: 1.3, fontSize: '0.95rem', fontWeight: 700, textTransform: 'none',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '0 8px 28px rgba(99,102,241,0.3)',
                    }}
                  >
                    Open Pipeline
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/create-signal')}
                    startIcon={<AddCircleIcon />}
                    sx={{
                      px: 4, py: 1.3, fontSize: '0.95rem', fontWeight: 700, textTransform: 'none',
                      borderRadius: '14px',
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                      color: theme.palette.text.primary,
                      '&:hover': { borderColor: '#6366f1', background: '#6366f106' },
                    }}
                  >
                    Create Signal
                  </Button>
                </motion.div>
              </Stack>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
