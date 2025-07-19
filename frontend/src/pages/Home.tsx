import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Restaurant as RestaurantIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  SentimentSatisfiedAlt as SentimentSatisfiedAltIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  PlayArrow as PlayIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Diamond as DiamondIcon,
  LocalFireDepartment as FireIcon,
  Psychology as BrainIcon,
  ShowChart as ChartIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import TokenLaunch from '../components/TokenLaunch';
import CryptoShakers from '../components/common/CryptoShakers';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI Strategy Chef',
      description: 'Our AI chef creates personalized trading strategies with precision and flair',
      icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
      gradient: 'linear-gradient(45deg, #667eea20 30%, #764ba220 90%)'
    },
    {
      title: 'Market Data Kitchen',
      description: 'Real-time market data and analytics served fresh daily',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
      gradient: 'linear-gradient(45deg, #667eea20 30%, #764ba220 90%)'
    },
    {
      title: 'Sentiment Spice',
      description: 'Add market sentiment analysis for that extra flavor',
      icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
      gradient: 'linear-gradient(45deg, #667eea20 30%, #764ba220 90%)'
    },
    {
      title: 'Research Corpus',
      description: 'Academic research integration for evidence-based strategies',
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
      gradient: 'linear-gradient(45deg, #667eea20 30%, #764ba220 90%)'
    },
    {
      title: 'Token Incentives',
              description: 'Earn YOREE tokens through strategic trading performance',
      icon: <TrophyIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
      gradient: 'linear-gradient(45deg, #667eea20 30%, #764ba220 90%)'
    },
    {
      title: 'Vault Management',
      description: 'Secure vault system for managing your trading positions',
      icon: <WalletIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
      gradient: 'linear-gradient(45deg, #667eea20 30%, #764ba220 90%)'
    }
  ];

  const stats = [
    { label: 'Active Traders', value: '2,847', icon: <TrendingUpIcon />, color: '#4CAF50' },
    { label: 'Strategies Generated', value: '15,234', icon: <BrainIcon />, color: '#2196F3' },
    { label: 'Total Volume', value: '$47.2M', icon: <ChartIcon />, color: '#FF9800' },
    { label: 'Success Rate', value: '89.3%', icon: <TrophyIcon />, color: '#9C27B0' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) => `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.primary.light}20 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Box sx={{ mb: 4 }}>
                  <Chip
                    label="🚀 AI-Powered Trading Platform"
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
                    variant="h1" 
                    gutterBottom
                    sx={{
                      fontFamily: '"Noto Sans KR", sans-serif',
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.1,
                      mb: 3
                    }}
                  >
                    YOREE
                  </Typography>
                  <Typography 
                    variant="h2"
                    sx={{
                      fontFamily: '"Noto Sans KR", sans-serif',
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      color: 'text.primary',
                      mb: 2
                    }}
                  >
                    Your AI Trading Companion
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: 'text.secondary',
                      mb: 4,
                      lineHeight: 1.6,
                      fontWeight: 400
                    }} 
                    paragraph
                  >
                    Cook up your stock strategies in the crypto space. AI-powered insights, 
                    real-time data, and academic research all in one yummy platform.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/strategy-builder')}
                      startIcon={<PlayIcon />}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        borderRadius: '50px',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                          boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Start Trading
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/dashboard')}
                      sx={{ 
                        borderRadius: '50px',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          borderColor: '#5a6fd8',
                          background: 'rgba(102, 126, 234, 0.05)'
                        }
                      }}
                    >
                      View Dashboard
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      zIndex: 0
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        textAlign: 'center', 
                        mb: 3,
                        fontWeight: 'bold',
                        color: 'primary.main'
                      }}
                    >
                      🍳 Chef's Trading Station
                    </Typography>
                    <CryptoShakers />
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="xl" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        background: stat.color,
                        fontSize: '1.5rem'
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
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
              Why Choose YOREE?
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Experience the perfect blend of AI intelligence, academic research, and real-time market data
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      sx={{
                        p: 4,
                        height: '100%',
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: feature.gradient,
                          zIndex: 0
                        },
                        '&:hover': {
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            mb: 3,
                            background: feature.color,
                            fontSize: '2rem'
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Typography 
                          variant="h5" 
                          gutterBottom
                          sx={{
                            fontFamily: '"Noto Sans KR", sans-serif',
                            fontWeight: 700,
                            color: 'text.primary',
                            mb: 2
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color="text.secondary"
                          sx={{ lineHeight: 1.6 }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Token Launch Section */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <TokenLaunch />
      </Box>

      {/* CTA Section */}
      <Container maxWidth="xl" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 6,
              borderRadius: '32px',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h3" 
                sx={{
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 800,
                  mb: 3
                }}
              >
                Ready to Start Your Trading Journey?
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ mb: 4, opacity: 0.9 }}
              >
                Join thousands of traders who trust YOREE for their AI-powered strategies
              </Typography>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/strategy-builder')}
                  startIcon={<PlayIcon />}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50px',
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  Get Started Now
                </Button>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Home; 