import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Stack,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Psychology as BrainIcon,
  DataObject as DataIcon,
  RocketLaunch as RocketIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface AgentStep {
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
  timestamp: string;
}

interface OrnateAgentProgressProps {
  steps: AgentStep[];
  currentStep: number;
  totalSteps: number;
}

const OrnateAgentProgress: React.FC<OrnateAgentProgressProps> = ({
  steps,
  currentStep,
  totalSteps,
}) => {
  const { theme } = useTheme();

  const getAgentIcon = (agentName: string) => {
    if (agentName.includes('Data Feed')) return <DataIcon />;
    if (agentName.includes('Hypothesis')) return <BrainIcon />;
    if (agentName.includes('Deployment')) return <RocketIcon />;
    return <SparkleIcon />;
  };

  const getAgentColor = (agentName: string) => {
    if (agentName.includes('Data Feed')) return '#00D4FF';
    if (agentName.includes('Hypothesis')) return '#667eea';
    if (agentName.includes('Deployment')) return '#764ba2';
    return '#667eea';
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 800,
          color: theme.palette.text.primary,
          textAlign: 'center',
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        🤖 Agent Orchestration in Progress
      </Typography>

      <Stack spacing={3}>
        {steps.map((step, index) => {
          const agentColor = getAgentColor(step.agentName);
          const isActive = step.status === 'running';
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card
                sx={{
                  borderRadius: '20px',
                  background: theme.palette.mode === 'dark'
                    ? isActive
                      ? `linear-gradient(135deg, ${agentColor}20 0%, ${agentColor}10 100%)`
                      : 'rgba(26, 31, 58, 0.6)'
                    : isActive
                    ? `linear-gradient(135deg, ${agentColor}15 0%, ${agentColor}05 100%)`
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: isActive
                    ? `2px solid ${agentColor}`
                    : `1px solid ${theme.palette.divider}`,
                  boxShadow: isActive
                    ? `0 8px 32px ${agentColor}40`
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Animated background gradient */}
                {isActive && (
                  <motion.div
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(90deg, ${agentColor}10 0%, ${agentColor}30 50%, ${agentColor}10 100%)`,
                      backgroundSize: '200% 100%',
                      opacity: 0.5,
                    }}
                  />
                )}

                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {/* Agent Avatar */}
                    <motion.div
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: isActive ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          background: isCompleted
                            ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                            : isError
                            ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                            : `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}80 100%)`,
                          boxShadow: isActive
                            ? `0 8px 24px ${agentColor}60`
                            : '0 4px 12px rgba(0, 0, 0, 0.2)',
                          border: `3px solid ${isActive ? agentColor : 'transparent'}`,
                        }}
                      >
                        {isCompleted ? (
                          <CheckIcon sx={{ fontSize: 32, color: 'white' }} />
                        ) : isError ? (
                          <ErrorIcon sx={{ fontSize: 32, color: 'white' }} />
                        ) : (
                          getAgentIcon(step.agentName)
                        )}
                      </Avatar>
                    </motion.div>

                    {/* Agent Info */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {step.agentName}
                        </Typography>
                        {isActive && (
                          <Chip
                            icon={<SparkleIcon />}
                            label="Processing"
                            size="small"
                            sx={{
                              background: `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}80 100%)`,
                              color: 'white',
                              fontWeight: 600,
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.7 },
                              },
                            }}
                          />
                        )}
                        {isCompleted && (
                          <Chip
                            icon={<CheckIcon />}
                            label="Completed"
                            size="small"
                            sx={{
                              background: theme.palette.success.main,
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>

                      {/* Progress Bar */}
                      {isActive && (
                        <Box sx={{ mt: 2 }}>
                          <LinearProgress
                            variant="indeterminate"
                            sx={{
                              height: 8,
                              borderRadius: '4px',
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${agentColor} 0%, ${agentColor}80 100%)`,
                                borderRadius: '4px',
                              },
                            }}
                          />
                        </Box>
                      )}

                      {isCompleted && step.result && (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block' }}>
                          ✓ {step.result.reasoning || 'Task completed successfully'}
                        </Typography>
                      )}

                      {isError && step.error && (
                        <Typography variant="caption" sx={{ color: theme.palette.error.main, mt: 1, display: 'block' }}>
                          ✗ {step.error}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </Stack>

      {/* Overall Progress */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
          Overall Progress: {currentStep} / {totalSteps} Agents
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(currentStep / totalSteps) * 100}
          sx={{
            height: 12,
            borderRadius: '6px',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '6px',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default OrnateAgentProgress;
