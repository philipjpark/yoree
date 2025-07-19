import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestaurantIcon from '@mui/icons-material/Restaurant';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  lastUpdate: string;
}

const MarketDataKitchen: React.FC = () => {
  // Simulated market data
  const marketData: MarketData[] = [
    {
      symbol: 'SOL/USD',
      price: 132.94,
      change: -1.23,
      volume: 2456789,
      lastUpdate: '2 min ago'
    },
    {
      symbol: 'WIF/USD',
      price: 0.69,
      change: 8.45,
      volume: 1234567,
      lastUpdate: '1 min ago'
    },
    {
      symbol: 'PYTH/USD',
      price: 0.08,
      change: 2.87,
      volume: 987654,
      lastUpdate: '3 min ago'
    }
  ];

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
            Market Data Kitchen
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {marketData.map((data, index) => (
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
                    <Typography variant="h6" sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                      {data.symbol}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                    >
                      Updated {data.lastUpdate}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h4" sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                      ${data.price.toLocaleString()}
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: data.change >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {data.change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      <Typography variant="body1">
                        {Math.abs(data.change)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Volume
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={70} 
                      sx={{ 
                        flexGrow: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: 'primary.main'
                        }
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {data.volume.toLocaleString()}
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

export default MarketDataKitchen; 