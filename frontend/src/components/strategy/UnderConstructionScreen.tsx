import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Construction as ConstructionIcon,
  Build as BuildIcon,
  Engineering as EngineeringIcon,
  Rocket as RocketIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

interface UnderConstructionScreenProps {
  isVisible: boolean;
  onClose: () => void;
  featureName?: string;
}

const UnderConstructionScreen: React.FC<UnderConstructionScreenProps> = ({
  isVisible,
  onClose,
  featureName = "Backtesting Feature"
}) => {
  if (!isVisible) return null;

  const features = [
    {
      icon: <BuildIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: "Advanced Backtesting Engine",
      description: "Historical data analysis with multiple timeframes",
      status: "In Development"
    },
    {
      icon: <EngineeringIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      title: "Risk Metrics Calculator",
      description: "Sharpe ratio, maximum drawdown, and volatility analysis",
      status: "In Development"
    },
    {
      icon: <RocketIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      title: "Performance Visualization",
      description: "Interactive charts and detailed performance reports",
      status: "In Development"
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Paper
            elevation={24}
            sx={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: 4,
              overflow: 'hidden',
              border: '2px solid #e3e8f0',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 4,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <ConstructionIcon sx={{ fontSize: 80, color: 'white', mb: 2 }} />
              </motion.div>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                🚧 Under Construction
              </Typography>
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                {featureName}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                We're building something amazing for you!
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 4 }}>
              {/* Progress Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2d3748' }}>
                  Development Progress
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Overall Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      75%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={75}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Expected completion: Q1 2026
                </Typography>
              </Box>

              {/* Features Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#2d3748' }}>
                  What's Coming
                </Typography>
                <Grid container spacing={3}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            background: 'white',
                            borderRadius: 3,
                            border: '1px solid #e3e8f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Box sx={{ mb: 2 }}>
                              {feature.icon}
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#2d3748' }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                              {feature.description}
                            </Typography>
                            <Chip
                              label={feature.status}
                              size="small"
                              sx={{
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 'bold'
                              }}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Coming Soon Message */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  border: '1px solid #bae6fd'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#0369a1' }}>
                  🎉 Coming Soon!
                </Typography>
                <Typography variant="body2" sx={{ color: '#0c4a6e' }}>
                  We're working hard to bring you the most advanced backtesting capabilities. 
                  Stay tuned for updates!
                </Typography>
              </Box>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                background: '#f8f9fa',
                p: 3,
                textAlign: 'center',
                borderTop: '1px solid #e3e8f0'
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={onClose}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Go Back
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnderConstructionScreen;
