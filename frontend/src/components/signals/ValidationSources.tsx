import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Link,
  Divider,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  CheckCircle as ConnectedIcon,
  Cancel as NotConnectedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as NeutralIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ValidationSource, ValidationSourceType } from '../../types/signal';
import { useTheme } from '@mui/material/styles';

interface ValidationSourcesProps {
  sources: ValidationSource[];
  signalId: string;
  onConnect?: (source: ValidationSource) => void;
}

const sourceConfig: Record<ValidationSourceType, { name: string; icon: string; color: string; url?: string }> = {
  google_trends: { name: 'Google Trends', icon: '📈', color: '#4285F4', url: 'https://trends.google.com' },
  twitter: { name: 'X (Twitter)', icon: '🐦', color: '#1DA1F2', url: 'https://twitter.com' },
  reddit: { name: 'Reddit', icon: '🤖', color: '#FF4500', url: 'https://reddit.com' },
  youtube: { name: 'YouTube', icon: '▶️', color: '#FF0000', url: 'https://youtube.com' },
  discord: { name: 'Discord', icon: '💬', color: '#5865F2', url: 'https://discord.com' },
  telegram: { name: 'Telegram', icon: '✈️', color: '#0088CC', url: 'https://telegram.org' },
  news: { name: 'News', icon: '📰', color: '#FF6B6B', url: 'https://news.google.com' },
  onchain: { name: 'On-Chain', icon: '⛓️', color: '#00D4FF', url: 'https://etherscan.io' },
  opec: { name: 'OPEC', icon: '🛢️', color: '#000000', url: 'https://www.opec.org' },
  eia: { name: 'EIA', icon: '📊', color: '#003366', url: 'https://www.eia.gov' },
  bloomberg: { name: 'Bloomberg', icon: '💼', color: '#000000', url: 'https://www.bloomberg.com' },
  reuters: { name: 'Reuters', icon: '📡', color: '#FFA500', url: 'https://www.reuters.com' },
};

const ValidationSources: React.FC<ValidationSourcesProps> = ({ sources, signalId, onConnect }) => {
  const theme = useTheme();

  const getSentimentIcon = (sentiment?: 'bullish' | 'bearish' | 'neutral') => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUpIcon sx={{ fontSize: 16, color: '#00FF88' }} />;
      case 'bearish':
        return <TrendingDownIcon sx={{ fontSize: 16, color: '#FF4444' }} />;
      default:
        return <NeutralIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
    }
  };

  const getSentimentColor = (sentiment?: 'bullish' | 'bearish' | 'neutral') => {
    switch (sentiment) {
      case 'bullish':
        return '#00FF88';
      case 'bearish':
        return '#FF4444';
      default:
        return theme.palette.text.secondary;
    }
  };

  if (sources.length === 0) {
    return (
      <Card
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '16px',
          background: theme.palette.mode === 'dark'
            ? 'rgba(26, 31, 58, 0.6)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No validation sources available. Sources are automatically discovered based on the signal.
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Validation Sources
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect to external sources to validate or invalidate your signal hypothesis
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {sources.map((source) => {
          const config = sourceConfig[source.type];
          return (
            <Grid item xs={12} sm={6} md={4} key={source.id}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  sx={{
                    borderRadius: '12px',
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(26, 31, 58, 0.6)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 8px 24px ${config.color}30`,
                      borderColor: config.color,
                    },
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}80 100%)`,
                            fontSize: '1.2rem',
                          }}
                        >
                          {config.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                            {config.name}
                          </Typography>
                          {source.isConnected ? (
                            <Chip
                              label="Connected"
                              size="small"
                              icon={<ConnectedIcon sx={{ fontSize: 12 }} />}
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                backgroundColor: '#00FF8820',
                                color: '#00FF88',
                                fontWeight: 600,
                                mt: 0.5,
                              }}
                            />
                          ) : (
                            <Chip
                              label="Not Connected"
                              size="small"
                              icon={<NotConnectedIcon sx={{ fontSize: 12 }} />}
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                backgroundColor: theme.palette.action.disabledBackground,
                                color: theme.palette.text.secondary,
                                fontWeight: 600,
                                mt: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40 }}>
                      {source.description}
                    </Typography>

                    {source.data && (
                      <Box sx={{ mb: 1.5 }}>
                        {source.data.sentiment && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {getSentimentIcon(source.data.sentiment)}
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                                color: getSentimentColor(source.data.sentiment),
                              }}
                            >
                              {source.data.sentiment}
                            </Typography>
                          </Box>
                        )}
                        {source.data.score !== undefined && (
                          <Box sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Score: {source.data.score}/100
                            </Typography>
                          </Box>
                        )}
                        {source.data.trend && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Trend:
                            </Typography>
                            <Chip
                              label={source.data.trend}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                textTransform: 'capitalize',
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!source.isConnected && onConnect && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onConnect(source)}
                          sx={{
                            flex: 1,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            borderRadius: '8px',
                            borderColor: config.color,
                            color: config.color,
                            '&:hover': {
                              borderColor: config.color,
                              backgroundColor: `${config.color}10`,
                            },
                          }}
                        >
                          Connect
                        </Button>
                      )}
                      {config.url && (
                        <Button
                          size="small"
                          variant="contained"
                          href={config.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon />}
                          sx={{
                            flex: 1,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}80 100%)`,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${config.color}80 0%, ${config.color} 100%)`,
                            },
                          }}
                        >
                          Open
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ValidationSources;
