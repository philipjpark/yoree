import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle as CheckIcon,
  RocketLaunch as RocketIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  AccountBalanceWallet as WalletIcon,
  AutoAwesome as SparkleIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { Signal } from '../../types/signal';
import { useNavigate } from 'react-router-dom';
import TokenizationFlow, { TokenizationData } from './TokenizationFlow';
import { Dialog } from '@mui/material';

interface SignalSuccessScreenProps {
  signal: Signal;
  onViewPortfolio?: () => void;
  onViewCommunity?: () => void;
  onTokenize?: () => void;
}

const SignalSuccessScreen: React.FC<SignalSuccessScreenProps> = ({
  signal,
  onViewPortfolio,
  onViewCommunity,
  onTokenize,
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [confettiActive, setConfettiActive] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showTokenization, setShowTokenization] = useState(false);

  useEffect(() => {
    // Animate progress bar
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    // Stop confetti after 3 seconds
    const timer = setTimeout(() => setConfettiActive(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleViewPortfolio = () => {
    if (onViewPortfolio) {
      onViewPortfolio();
    } else {
      navigate('/portfolio');
    }
  };

  const handleViewCommunity = () => {
    if (onViewCommunity) {
      onViewCommunity();
    } else {
      navigate('/community');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 50%, #0A0E27 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #f5f7fa 100%)',
        position: 'relative',
        overflow: 'hidden',
        pt: 8,
        pb: 8,
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -100, x: Math.random() * window.innerWidth }}
            animate={{
              opacity: [0, 1, 0],
              y: window.innerHeight + 100,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              fontSize: '20px',
            }}
          >
            {confettiActive && '✨'}
          </motion.div>
        ))}
      </Box>

      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          {/* Success Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                    border: '4px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <CheckIcon sx={{ fontSize: 60, color: 'white' }} />
                </Avatar>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    right: -10,
                    bottom: -10,
                    border: '3px solid',
                    borderColor: 'transparent',
                    borderTopColor: '#667eea',
                    borderRadius: '50%',
                  }}
                />
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                🎉 Signal Created Successfully!
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 4,
                }}
              >
                Your intelligence asset is now live on the exchange
              </Typography>
            </motion.div>
          </Box>

          {/* Signal Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card
              sx={{
                mb: 4,
                borderRadius: '24px',
                background: theme.palette.mode === 'dark'
                  ? 'rgba(26, 31, 58, 0.8)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                          Signal ID
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                          {signal.id}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                          Underlying Asset
                        </Typography>
                        <Chip
                          label={signal.underlyingAsset}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                          Quality Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={signal.quality}
                            sx={{
                              flex: 1,
                              height: 12,
                              borderRadius: '6px',
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '6px',
                              },
                            }}
                          />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, minWidth: 50 }}>
                            {signal.quality.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                        Hypothesis
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.primary,
                          lineHeight: 1.8,
                          p: 2,
                          borderRadius: '12px',
                          background: theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {signal.hypothesis}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Data Feeds */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: theme.palette.text.primary }}>
                    Data Feeds
                  </Typography>
                  <Grid container spacing={2}>
                    {signal.dataBindings.map((binding, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            background: theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {binding.feedName}
                          </Typography>
                          <Chip
                            label={binding.feedType}
                            size="small"
                            sx={{
                              mt: 1,
                              background: theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)',
                              color: theme.palette.text.primary,
                            }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<WalletIcon />}
                  onClick={handleViewPortfolio}
                  sx={{
                    py: 2,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #667eea 100%)',
                      boxShadow: '0 6px 30px rgba(102, 126, 234, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  View in Portfolio
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<ViewIcon />}
                  onClick={handleViewCommunity}
                  sx={{
                    py: 2,
                    borderRadius: '16px',
                    borderWidth: 2,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderWidth: 2,
                      background: 'rgba(102, 126, 234, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  View in Community
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<SparkleIcon />}
                  onClick={() => {
                    setShowTokenization(true);
                    if (onTokenize) onTokenize();
                  }}
                  sx={{
                    py: 2,
                    borderRadius: '16px',
                    borderWidth: 2,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      borderWidth: 2,
                      background: 'rgba(118, 75, 162, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Tokenize Signal
                </Button>
              </Grid>
            </Grid>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SignalSuccessScreen;
