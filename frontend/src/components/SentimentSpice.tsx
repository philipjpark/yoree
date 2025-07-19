import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestaurantIcon from '@mui/icons-material/Restaurant';

interface SentimentData {
  source: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  content: string;
  timestamp: string;
  confidence: number;
}

const SentimentSpice: React.FC = () => {
  // Simulated sentiment data
  const sentimentData: SentimentData[] = [
    {
      source: 'Twitter',
      sentiment: 'positive',
      content: 'SOL showing strong momentum! 🚀',
      timestamp: '5 min ago',
      confidence: 0.85
    },
    {
      source: 'Reddit',
      sentiment: 'neutral',
      content: 'Market seems stable for now',
      timestamp: '10 min ago',
      confidence: 0.65
    },
    {
      source: 'News',
      sentiment: 'negative',
      content: 'Regulatory concerns affecting crypto markets',
      timestamp: '15 min ago',
      confidence: 0.75
    }
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <SentimentSatisfiedAltIcon sx={{ color: 'success.main' }} />;
      case 'neutral':
        return <SentimentNeutralIcon sx={{ color: 'warning.main' }} />;
      case 'negative':
        return <SentimentDissatisfiedIcon sx={{ color: 'error.main' }} />;
      default:
        return null;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success.main';
      case 'neutral':
        return 'warning.main';
      case 'negative':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: '20px',
        background: 'white',
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <RestaurantIcon />
          </Avatar>
          <Typography variant="h5" sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
            Sentiment Spice
          </Typography>
        </Box>
        <Tooltip title="Refresh Sentiment">
          <IconButton>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {sentimentData.map((data, index) => (
          <Grid item xs={12} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                sx={{ 
                  borderRadius: '15px',
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getSentimentIcon(data.sentiment)}
                      <Typography variant="h6" sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                        {data.source}
                      </Typography>
                    </Box>
                    <Chip 
                      label={data.sentiment}
                      size="small"
                      sx={{ 
                        backgroundColor: getSentimentColor(data.sentiment),
                        color: 'white',
                        fontFamily: '"Noto Sans KR", sans-serif'
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 2,
                      fontFamily: '"Noto Sans KR", sans-serif'
                    }}
                  >
                    {data.content}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                    >
                      {data.timestamp}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                    >
                      Confidence: {(data.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default SentimentSpice; 