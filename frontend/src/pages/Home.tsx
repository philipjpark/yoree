import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  Chip,
  Avatar,
  Stack
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  SentimentSatisfiedAlt as SentimentSatisfiedAltIcon,
  EmojiEvents as TrophyIcon,
  Security as SecurityIcon,
  PlayArrow as PlayIcon,
  ArrowForward as ArrowForwardIcon,
  Psychology as BrainIcon,
  ShowChart as ChartIcon,
  AccountBalanceWallet as WalletIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import TokenLaunch from '../components/TokenLaunch';
import CryptoKitchen from '../components/common/CryptoKitchen';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI Recipe Generator',
      description: 'Advanced AI algorithms that create profitable trading recipes from fresh market ingredients',
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      color: '#00D4AA',
      gradient: 'linear-gradient(135deg, #00D4AA 0%, #4DD4B8 100%)',
      stats: '89.3% Success Rate'
    },
    {
      title: 'Fresh Market Data',
      description: 'Live market ingredients, technical seasonings, and comprehensive portfolio tracking',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: '#42A5F5',
      gradient: 'linear-gradient(135deg, #42A5F5 0%, #64B5F6 100%)',
      stats: '24/7 Fresh'
    },
    {
      title: 'Market Sentiment Spice',
      description: 'AI-powered market sentiment seasoning across social media and news sources',
      icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 40 }} />,
      color: '#FFA726',
      gradient: 'linear-gradient(135deg, #FFA726 0%, #FFB74D 100%)',
      stats: 'Real-Time Spice'
    },
    {
      title: 'Research Cookbook',
      description: 'Academic research and institutional recipes integrated into strategy development',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: '#9C27B0',
      gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
      stats: '1000+ Recipes'
    },
    {
      title: 'Chef Rewards',
      description: 'Earn YREE tokens based on recipe performance and kitchen engagement',
      icon: <TrophyIcon sx={{ fontSize: 40 }} />,
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
      stats: '$2.4M Rewarded'
    },
    {
      title: 'Secure Pantry',
      description: 'Enterprise-grade security for storing and protecting your digital ingredients',
      icon: <WalletIcon sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
      stats: 'Bank-Level Security'
    }
  ];

  const stats = [
    { label: 'Active Chefs', value: '12,847', icon: <TrendingUpIcon />, color: '#00D4AA', change: '+24%', gradient: 'linear-gradient(135deg, #00D4AA 0%, #4DD4B8 100%)' },
    { label: 'Recipes Created', value: '45,234', icon: <BrainIcon />, color: '#42A5F5', change: '+156%', gradient: 'linear-gradient(135deg, #42A5F5 0%, #64B5F6 100%)' },
    { label: 'Ingredients Processed', value: '$127.2M', icon: <ChartIcon />, color: '#FFA726', change: '+89%', gradient: 'linear-gradient(135deg, #FFA726 0%, #FFB74D 100%)' },
    { label: 'Recipe Success Rate', value: '94.7%', icon: <TrophyIcon />, color: '#9C27B0', change: '+5.4%', gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F8FAFC',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Light Kitchen Table Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%),
            radial-gradient(circle at 20% 20%, rgba(0, 212, 170, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(66, 165, 245, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(255, 107, 107, 0.03) 0%, transparent 50%),
            linear-gradient(45deg, transparent 30%, rgba(0, 212, 170, 0.02) 50%, transparent 70%)
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
                45deg,
                transparent,
                transparent 4px,
                rgba(0, 212, 170, 0.01) 4px,
                rgba(0, 212, 170, 0.01) 8px
              )
            `,
            zIndex: 1
          }
        }}
      />

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
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Box sx={{ mb: 6 }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Chip
                      label="AI-Powered"
                      sx={{ 
                        background: 'linear-gradient(135deg, #00D4AA 0%, #4DD4B8 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    />
                    <Chip
                      label="Professional Grade"
                      sx={{ 
                        background: 'linear-gradient(135deg, #42A5F5 0%, #64B5F6 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    />
                    <Chip
                      label="Real-Time"
                      sx={{ 
                        background: 'linear-gradient(135deg, #FFA726 0%, #FFB74D 100%)',
                        color: 'white',
                        fontWeight: 600,
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
                      background: 'linear-gradient(45deg, #00D4AA, #42A5F5, #00D4AA)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.1,
                      mb: 3,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    YOREE (요리)
                  </Typography>
                  
                  <Typography 
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                      color: '#2D3748',
                      mb: 3,
                      lineHeight: 1.2
                    }}
                  >
                    Your AI Trading Kitchen
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#4A5568',
                      mb: 4,
                      lineHeight: 1.6,
                      fontWeight: 400,
                      maxWidth: 600
                    }} 
                    paragraph
                  >
                    Cook up profitable trading strategies with fresh market ingredients, AI-powered recipes, 
                    and professional-grade tools. Turn raw market data into delicious trading opportunities.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
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
                        background: 'linear-gradient(135deg, #00D4AA 0%, #4DD4B8 100%)',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: '0 8px 25px rgba(0, 212, 170, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00A085 0%, #00D4AA 100%)',
                          boxShadow: '0 12px 35px rgba(0, 212, 170, 0.4)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Start Cooking
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
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderColor: '#42A5F5',
                        color: '#42A5F5',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#1976D2',
                          background: 'rgba(66, 165, 245, 0.05)',
                          borderWidth: 2
                        }
                      }}
                    >
                      View Kitchen
                    </Button>
                  </motion.div>
                </Stack>

                {/* Quick Stats */}
                <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#00D4AA', mb: 0.5 }}>
                      94.7%
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4A5568' }}>
                      Recipe Success
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#42A5F5', mb: 0.5 }}>
                      $127M
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4A5568' }}>
                      Ingredients Processed
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFA726', mb: 0.5 }}>
                      12K+
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4A5568' }}>
                      Active Chefs
                    </Typography>
                  </Box>
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <CryptoKitchen />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="xl" sx={{ py: 12, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                color: '#1A202C', 
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Kitchen Performance
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#718096', 
                maxWidth: 600, 
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Fresh metrics from our trading kitchen showing recipe success rates and ingredient quality
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      background: 'white',
                      borderRadius: 4,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-8px)',
                        borderColor: stat.color
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: stat.gradient || stat.color,
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 3,
                          background: stat.gradient || stat.color,
                          boxShadow: `0 8px 24px ${stat.color}30`
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 900, 
                          mb: 1, 
                          color: '#1A202C',
                          fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#4A5568', 
                          fontWeight: 600, 
                          mb: 1,
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}
                      >
                        {stat.label}
                      </Typography>
                      {stat.change && (
                        <Chip
                          label={stat.change}
                          size="small"
                          sx={{
                            backgroundColor: stat.change.startsWith('+') ? '#00D4AA' : '#FF6B6B',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                          }}
                        />
                      )}
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 12, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography 
              variant="h3" 
              sx={{
                fontWeight: 900,
                color: '#1A202C',
                mb: 3,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Professional Kitchen Tools
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#718096',
                maxWidth: 700, 
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              Professional-grade cooking tools and AI-powered recipes designed for serious trading chefs
            </Typography>
          </Box>

          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    whileHover={{ y: -12, scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      sx={{
                        p: 5,
                        height: '100%',
                        borderRadius: 4,
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
                          borderColor: feature.color,
                          '&::before': {
                            opacity: 1
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: feature.gradient,
                          zIndex: 1,
                          opacity: 0.8,
                          transition: 'opacity 0.3s ease'
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative', zIndex: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar
                            sx={{
                              width: 64,
                              height: 64,
                              mr: 3,
                              background: feature.gradient,
                              boxShadow: `0 8px 24px ${feature.color}30`
                            }}
                          >
                            {feature.icon}
                          </Avatar>
                          <Box>
                            <Typography 
                              variant="h6" 
                              sx={{
                                fontWeight: 800,
                                color: '#1A202C',
                                mb: 0.5,
                                fontSize: '1.2rem'
                              }}
                            >
                              {feature.title}
                            </Typography>
                            <Chip
                              label={feature.stats}
                              size="small"
                              sx={{
                                backgroundColor: feature.color,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#4A5568',
                            lineHeight: 1.6,
                            fontSize: '1rem'
                          }}
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
          <Card
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #00D4AA 0%, #42A5F5 100%)',
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 212, 170, 0.3)',
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
                Ready to Start Cooking Profits?
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ mb: 4, opacity: 0.9 }}
              >
                Join thousands of trading chefs who are already creating delicious profits in our kitchen
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
                  Start Cooking Now
                </Button>
              </motion.div>
            </Box>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Home; 