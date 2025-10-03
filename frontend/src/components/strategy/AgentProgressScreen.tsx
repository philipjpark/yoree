import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  CircularProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Psychology as BrainIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface AgentStatus {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  icon: React.ReactNode;
  color: string;
}

interface AgentProgressScreenProps {
  isVisible: boolean;
  currentAgent: string;
  progress: number;
  message: string;
  onRegenerate?: () => void;
}

const AgentProgressScreen: React.FC<AgentProgressScreenProps> = ({
  isVisible,
  currentAgent,
  progress,
  message,
  onRegenerate
}) => {
  const getAgentStatus = (agentId: string) => {
    if (currentAgent === agentId) {
      return progress === 100 ? 'completed' : 'running';
    }
    
    // Determine if this agent should be completed based on overall progress
    const agentOrder = ['sentiment', 'technical', 'risk', 'codex'];
    const currentIndex = agentOrder.indexOf(currentAgent);
    const agentIndex = agentOrder.indexOf(agentId);
    
    if (agentIndex < currentIndex) {
      return 'completed';
    } else if (agentIndex === currentIndex) {
      return progress === 100 ? 'completed' : 'running';
    } else {
      return 'pending';
    }
  };

  const getAgentProgress = (agentId: string) => {
    if (currentAgent === agentId) {
      return progress;
    }
    
    const agentOrder = ['sentiment', 'technical', 'risk', 'codex'];
    const currentIndex = agentOrder.indexOf(currentAgent);
    const agentIndex = agentOrder.indexOf(agentId);
    
    if (agentIndex < currentIndex) {
      return 100;
    } else if (agentIndex === currentIndex) {
      return progress;
    } else {
      return 0;
    }
  };

  const getAgentMessage = (agentId: string) => {
    if (currentAgent === agentId) {
      return message;
    }
    
    const agentOrder = ['sentiment', 'technical', 'risk', 'codex'];
    const currentIndex = agentOrder.indexOf(currentAgent);
    const agentIndex = agentOrder.indexOf(agentId);
    
    if (agentIndex < currentIndex) {
      return '✅ Analysis completed successfully';
    } else if (agentIndex === currentIndex) {
      return message;
    } else {
      return '⏳ Waiting to start...';
    }
  };

  const agents: AgentStatus[] = [
    {
      id: 'sentiment',
      name: 'Market Analyzer',
      description: 'Analyzing social media sentiment, news impact, and market psychology',
      status: getAgentStatus('sentiment'),
      progress: getAgentProgress('sentiment'),
      message: getAgentMessage('sentiment'),
      icon: <TrendingIcon />,
      color: '#4caf50'
    },
    {
      id: 'technical',
      name: 'Technical Analyzer',
      description: 'Processing RSI, MACD, moving averages, and chart patterns',
      status: getAgentStatus('technical'),
      progress: getAgentProgress('technical'),
      message: getAgentMessage('technical'),
      icon: <SpeedIcon />,
      color: '#2196f3'
    },
    {
      id: 'risk',
      name: 'Risk Manager',
      description: 'Calculating position sizing, stop-losses, and risk-reward ratios',
      status: getAgentStatus('risk'),
      progress: getAgentProgress('risk'),
      message: getAgentMessage('risk'),
      icon: <SecurityIcon />,
      color: '#ff9800'
    },
    {
      id: 'codex',
      name: 'Strategy Generator',
      description: 'Synthesizing all data into comprehensive trading strategy',
      status: getAgentStatus('codex'),
      progress: getAgentProgress('codex'),
      message: getAgentMessage('codex'),
      icon: <BrainIcon />,
      color: '#667eea'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon sx={{ color: '#4caf50' }} />;
      case 'running':
        return <CircularProgress size={20} sx={{ color: 'inherit' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'running':
        return '#2196f3';
      case 'error':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={8}
          sx={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: 4,
            p: 4,
            border: '2px solid #dee2e6',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#2d3748' }}>
              🤖 AI Agents Working
            </Typography>
            <Typography variant="body1" sx={{ color: '#4a5568', mb: 2 }}>
              Our specialized AI agents are collaborating to analyze market data and generate your personalized trading strategy
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
              Market Analyzer • Technical Analyzer • Risk Manager • Strategy Generator
            </Typography>
            
            {/* Overall Progress */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#2d3748' }}>
                Overall Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
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
              <Typography variant="body2" sx={{ mt: 1, color: '#4a5568' }}>
                {progress}% Complete
              </Typography>
            </Box>
          </Box>

          {/* Agent Cards */}
          <Grid container spacing={3}>
            {agents.map((agent, index) => (
              <Grid item xs={12} md={6} key={agent.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      background: 'white',
                      borderRadius: 3,
                      border: `2px solid ${getStatusColor(agent.status)}`,
                      boxShadow: agent.status === 'running' ? '0 8px 32px rgba(33, 150, 243, 0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Agent Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: agent.color,
                            mr: 2,
                            width: 48,
                            height: 48
                          }}
                        >
                          {agent.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                            {agent.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#4a5568' }}>
                            {agent.description}
                          </Typography>
                        </Box>
                        {getStatusIcon(agent.status)}
                      </Box>

                      {/* Progress Bar */}
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={agent.progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(45deg, ${agent.color} 30%, ${agent.color}dd 90%)`,
                              borderRadius: 3
                            }
                          }}
                        />
                        <Typography variant="body2" sx={{ mt: 1, color: '#4a5568' }}>
                          {agent.progress}% Complete
                        </Typography>
                      </Box>

                      {/* Status Message */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#2d3748', fontStyle: 'italic', minHeight: '40px' }}>
                          {agent.message}
                        </Typography>
                      </Box>

                      {/* Status Chip */}
                      <Chip
                        label={agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(agent.status),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Regenerate Button */}
          {onRegenerate && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Chip
                  label="🔄 Regenerate Strategy"
                  onClick={onRegenerate}
                  sx={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#5a6fd8'
                    }
                  }}
                />
              </motion.div>
            </Box>
          )}
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgentProgressScreen;
