import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  useTheme,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import TokenIcon from '@mui/icons-material/Token';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LaunchIcon from '@mui/icons-material/Launch';
import GavelIcon from '@mui/icons-material/Gavel';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarIcon from '@mui/icons-material/Star';

const TokenLaunch: React.FC = () => {
  const theme = useTheme();

  const features = [
    {
      title: 'Governance Rights',
              description: 'YOREE token holders can participate in platform governance and strategy voting.',
      icon: <GavelIcon sx={{ fontSize: 40 }} />,
      color: '#667eea'
    },
    {
      title: 'Strategy Access',
      description: 'Access to premium AI-powered trading strategies and backtesting tools.',
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      color: '#667eea'
    },
    {
      title: 'Revenue Sharing',
      description: 'Earn a share of platform fees and strategy performance rewards.',
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      color: '#667eea'
    }
  ];

  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.05) 30%, rgba(118, 75, 162, 0.05) 90%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label="🚀 Token Launch"
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
              gutterBottom
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
              YOREE Token Launch
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Join the future of AI-powered crypto trading with Yoree's native token
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        p: 4,
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
                          background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1) 30%, rgba(118, 75, 162, 0.1) 90%)',
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
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
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

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Paper
              elevation={8}
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                p: 6,
                textAlign: 'center',
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
                  background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1) 30%, rgba(118, 75, 162, 0.1) 90%)',
                  zIndex: 0
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h3" 
                  gutterBottom
                  sx={{
                    fontFamily: '"Noto Sans KR", sans-serif',
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 4
                  }}
                >
                  Token Sale Details
                </Typography>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        sx={{
                          p: 3,
                          borderRadius: '20px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Typography variant="h6" gutterBottom color="text.secondary">
                          Total Supply
                        </Typography>
                        <Typography 
                          variant="h4" 
                          sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          1,000,000 YOREE
                        </Typography>
                      </Card>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        sx={{
                          p: 3,
                          borderRadius: '20px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Typography variant="h6" gutterBottom color="text.secondary">
                          Initial Price
                        </Typography>
                        <Typography 
                          variant="h4" 
                          sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          $0.10
                        </Typography>
                      </Card>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        sx={{
                          p: 3,
                          borderRadius: '20px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Typography variant="h6" gutterBottom color="text.secondary">
                          Launch Date
                        </Typography>
                        <Typography 
                          variant="h4" 
                          sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          Q4 2025
                        </Typography>
                      </Card>
                    </motion.div>
                  </Grid>
                </Grid>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<LaunchIcon />}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: '50px',
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
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
                    Join Waitlist
                  </Button>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default TokenLaunch; 