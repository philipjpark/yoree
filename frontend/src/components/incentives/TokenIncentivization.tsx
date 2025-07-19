import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Diamond as DiamondIcon,
  LocalFireDepartment as FireIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  Leaderboard as LeaderboardIcon,
  Visibility as VisibilityIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

interface TraderProfile {
  id: string;
  name: string;
  avatar: string;
  tier: 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  coefficient: number;
  currentSeasonPoints: number;
  totalTrades: number;
  profitableTrades: number;
  highBetaTokenTrades: number;
  specialAchievements: string[];
  rank: number;
}

interface TokenTier {
  name: string;
  marketCapRange: string;
  multiplier: number;
  color: string;
  examples: string[];
}

const TokenIncentivization: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTrader, setSelectedTrader] = useState<TraderProfile | null>(null);

  const steps = [
    'Leaderboard',
    'Coefficient System',
    'Token Tiers',
    'Achievements',
    'Rewards',
    'Your Profile'
  ];

  const tokenTiers: TokenTier[] = [
    {
      name: 'Tier 1 - Blue Chips',
      marketCapRange: '$1B+',
      multiplier: 1.0,
      color: '#2196F3',
      examples: ['SOL', 'WIF', 'PYTH']
    },
    {
      name: 'Tier 2 - Established',
      marketCapRange: '$100M - $1B',
      multiplier: 1.5,
      color: '#4CAF50',
      examples: ['MATIC', 'AVAX', 'DOT']
    },
    {
      name: 'Tier 3 - Emerging',
      marketCapRange: '$10M - $100M',
      multiplier: 2.0,
      color: '#FF9800',
      examples: ['BONK', 'WIF', 'POPCAT']
    },
    {
      name: 'Tier 4 - High-Beta',
      marketCapRange: '$1M - $10M',
      multiplier: 3.0,
      color: '#F44336',
      examples: ['New meme coins', 'DeFi tokens']
    },
    {
      name: 'Tier 5 - Ultra High-Beta',
      marketCapRange: '< $1M',
      multiplier: 4.0,
      color: '#9C27B0',
      examples: ['Micro-cap gems', 'Experimental tokens']
    }
  ];

  const mockLeaderboard: TraderProfile[] = [
    {
      id: '1',
      name: 'philxdaegu',
      avatar: '👨‍💻',
      tier: 'Diamond',
      coefficient: 2847.5,
      currentSeasonPoints: 1850,
      totalTrades: 47,
      profitableTrades: 42,
      highBetaTokenTrades: 23,
      specialAchievements: ['High-Beta Master', 'Volatility King', 'Consistency Champion'],
      rank: 1
    }
  ];

  const leaderboardData = [
            { tier: 'Diamond', rank: 'Top 1%', yoree: 1000, color: '#B9F2FF', icon: <DiamondIcon /> },
        { tier: 'Platinum', rank: 'Top 5%', yoree: 500, color: '#E5E4E2', icon: <StarIcon /> },
        { tier: 'Gold', rank: 'Top 10%', yoree: 250, color: '#FFD700', icon: <TrophyIcon /> },
        { tier: 'Silver', rank: 'Top 25%', yoree: 100, color: '#C0C0C0', icon: <StarIcon /> },
        { tier: 'Bronze', rank: 'Top 50%', yoree: 50, color: '#CD7F32', icon: <StarIcon /> }
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return '#B9F2FF';
      case 'Platinum': return '#E5E4E2';
      case 'Gold': return '#FFD700';
      case 'Silver': return '#C0C0C0';
      case 'Bronze': return '#CD7F32';
      default: return '#grey';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Diamond': return <DiamondIcon />;
      case 'Platinum': return <StarIcon />;
      case 'Gold': return <TrophyIcon />;
      case 'Silver': return <StarIcon />;
      case 'Bronze': return <StarIcon />;
      default: return <StarIcon />;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Golden Trader Leaderboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Top performers in the YOREE coefficient system. Higher coefficients = more YOREE rewards.
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LeaderboardIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Current Season Rankings</Typography>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Trader</TableCell>
                        <TableCell>Tier</TableCell>
                        <TableCell>Coefficient</TableCell>
                        <TableCell>Season Points</TableCell>
                        <TableCell>Win Rate</TableCell>
                        <TableCell>High-Beta Trades</TableCell>
                        <TableCell>Achievements</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockLeaderboard.map((trader) => (
                        <TableRow 
                          key={trader.id}
                          hover
                          onClick={() => setSelectedTrader(trader)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="h6" sx={{ mr: 1 }}>
                                #{trader.rank}
                              </Typography>
                              {trader.rank <= 3 && (
                                <TrophyIcon sx={{ color: getTierColor(trader.tier) }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                {trader.avatar}
                              </Avatar>
                              <Typography variant="body1" fontWeight="medium">
                                {trader.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={trader.tier}
                              size="small"
                              sx={{
                                bgcolor: getTierColor(trader.tier),
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {trader.coefficient.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {trader.currentSeasonPoints}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {((trader.profitableTrades / trader.totalTrades) * 100).toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {trader.highBetaTokenTrades}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {trader.specialAchievements.slice(0, 2).map((achievement, index) => (
                                <Tooltip key={index} title={achievement}>
                                  <Chip
                                    label={achievement}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.6rem' }}
                                  />
                                </Tooltip>
                              ))}
                              {trader.specialAchievements.length > 2 && (
                                <Chip
                                  label={`+${trader.specialAchievements.length - 2}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.6rem' }}
                                />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {selectedTrader && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedTrader.name} - Detailed Profile
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Trades: {selectedTrader.totalTrades}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Profitable Trades: {selectedTrader.profitableTrades}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        High-Beta Trades: {selectedTrader.highBetaTokenTrades}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Current Season Points: {selectedTrader.currentSeasonPoints}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overall Coefficient: {selectedTrader.coefficient.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Win Rate: {((selectedTrader.profitableTrades / selectedTrader.totalTrades) * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Coefficient System Explained
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              How the YOREE coefficient system works:
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Core Formula</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Seasonal Score = Σ(Trade Points × TOM × PnL Multiplier × Risk Factor × Duration Factor)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Final Coefficient = (Current Season × 1.0) + (Previous × 0.5) + (Two Ago × 0.25) + (Three+ Ago × 0.1)
                    </Typography>
                    <Alert severity="info">
                      Higher coefficients = More YOREE rewards
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Scoring Components</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">Base Points:</Typography>
                      <Typography variant="body2">• Profitable trade: +10 points</Typography>
                      <Typography variant="body2">• Loss: -5 points</Typography>
                      <Typography variant="body2">• Break-even: +2 points</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">PnL Multipliers:</Typography>
                      <Typography variant="body2">• 0-5% profit: 1.0x</Typography>
                      <Typography variant="body2">• 5-15% profit: 1.5x</Typography>
                      <Typography variant="body2">• 15-30% profit: 2.0x</Typography>
                      <Typography variant="body2">• 30%+ profit: 3.0x</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Risk & Duration Factors</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" fontWeight="bold">Position Size:</Typography>
                        <Typography variant="body2">• Small (1-5%): 1.0x</Typography>
                        <Typography variant="body2">• Medium (5-15%): 1.2x</Typography>
                        <Typography variant="body2">• Large (15%+): 1.5x</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" fontWeight="bold">Holding Duration:</Typography>
                        <Typography variant="body2">• Scalping (&lt;1 hour): 0.8x</Typography>
                        <Typography variant="body2">• Day trading (1-24h): 1.0x</Typography>
                        <Typography variant="body2">• Swing trading (1-7d): 1.3x</Typography>
                        <Typography variant="body2">• Position trading (1+w): 1.5x</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Token Obscurity Multiplier (TOM)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The inverse system - more obscure and volatile tokens earn higher multipliers.
            </Typography>

            <Grid container spacing={3}>
              {tokenTiers.map((tier, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      border: `2px solid ${tier.color}`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${tier.color}40`,
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: tier.color,
                            mr: 2
                          }}
                        />
                        <Typography variant="h6" fontWeight="bold">
                          {tier.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Market Cap: {tier.marketCapRange}
                      </Typography>
                      
                      <Chip
                        label={`${tier.multiplier}x Multiplier`}
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                      
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                        Examples:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {tier.examples.map((example, idx) => (
                          <Chip
                            key={idx}
                            label={example}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bonus Multipliers
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FireIcon sx={{ mr: 1, color: 'orange' }} />
                      <Typography variant="body2" fontWeight="bold">
                        High Volatility: +0.5x
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Tokens with &gt;50% daily price swings
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <VisibilityIcon sx={{ mr: 1, color: 'blue' }} />
                      <Typography variant="body2" fontWeight="bold">
                        New Token: +1.0x
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Tokens launched within 30 days
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon sx={{ mr: 1, color: 'green' }} />
                      <Typography variant="body2" fontWeight="bold">
                        Meme Coin: +0.3x
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Popular meme-based tokens
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Special Achievements
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Unlock special achievements for bonus YOREE rewards and exclusive NFTs.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DiamondIcon sx={{ mr: 1, color: '#B9F2FF' }} />
                      <Typography variant="h6">High-Beta Master</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Most points earned from Tier 4-5 tokens
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      75% complete - 15/20 high-beta trades
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FireIcon sx={{ mr: 1, color: 'orange' }} />
                      <Typography variant="h6">Volatility King</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Highest success rate on 50%+ daily swings
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={90} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      90% complete - 9/10 volatile trades profitable
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrophyIcon sx={{ mr: 1, color: '#FFD700' }} />
                      <Typography variant="h6">Consistency Champion</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      10+ profitable trades in high-beta tokens
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={60} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      60% complete - 6/10 high-beta trades profitable
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SpeedIcon sx={{ mr: 1, color: 'red' }} />
                      <Typography variant="h6">Risk Taker</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Largest position sizes on volatile tokens
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={40} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      40% complete - 4/10 large position trades
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              YOREE Reward Tiers
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Earn YOREE tokens based on your coefficient ranking and achievements.
            </Typography>

            <Grid container spacing={3}>
              {leaderboardData.map((reward, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      border: `3px solid ${reward.color}`,
                      background: `linear-gradient(135deg, ${reward.color}20 0%, ${reward.color}10 100%)`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${reward.color}40`,
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: reward.color,
                            color: 'white',
                            fontSize: '2rem'
                          }}
                        >
                          {reward.icon}
                        </Avatar>
                      </Box>
                      
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                        {reward.tier}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {reward.rank}
                      </Typography>
                      
                      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                        {reward.yoree.toLocaleString()} YOREE
                      </Typography>
                      
                      <Chip
                        label="6-month vesting"
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      
                      {index === 0 && (
                        <Chip
                          label="+ Exclusive NFT"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Rewards
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" fontWeight="bold">
                      Special Achievements: 20% of total allocation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bonus YOREE for unlocking achievements
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" fontWeight="bold">
                      Community Events: 10% of total allocation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Participation rewards and tournaments
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" fontWeight="bold">
                      Staking Rewards: Additional YOREE
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Earn more by staking existing tokens
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Your Trading Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Track your progress and see how you're performing in the YOREE coefficient system.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Overview
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            2,847
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current Coefficient
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            47
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Trades
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            89%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Win Rate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="info.main">
                            23
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            High-Beta Trades
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current Tier
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: '#B9F2FF',
                          color: 'white',
                          fontSize: '2rem',
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <DiamondIcon />
                      </Avatar>
                      <Typography variant="h5" fontWeight="bold">
                        Diamond Trader
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Top 1% - 1,000 YOREE
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Trades
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Token</TableCell>
                            <TableCell>Tier</TableCell>
                            <TableCell>PnL</TableCell>
                            <TableCell>Points Earned</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { token: 'WIF', tier: 'Tier 3', pnl: '+15%', points: 45, date: '2025-06-20' },
                            { token: 'PYTH', tier: 'Tier 3', pnl: '+8%', points: 24, date: '2025-06-20' },
                            { token: 'SOL', tier: 'Tier 1', pnl: '+3%', points: 9, date: '2025-06-19' },
                            { token: 'BONK', tier: 'Tier 4', pnl: '+25%', points: 150, date: '2025-06-18' },
                            { token: 'JUP', tier: 'Tier 2', pnl: '-2%', points: -10, date: '2025-06-17' }
                          ].map((trade, index) => (
                            <TableRow key={index}>
                              <TableCell>{trade.token}</TableCell>
                              <TableCell>
                                <Chip label={trade.tier} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color={trade.pnl.startsWith('+') ? 'success.main' : 'error.main'}
                                  fontWeight="bold"
                                >
                                  {trade.pnl}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color={trade.points > 0 ? 'success.main' : 'error.main'}
                                  fontWeight="bold"
                                >
                                  {trade.points > 0 ? '+' : ''}{trade.points}
                                </Typography>
                              </TableCell>
                              <TableCell>{trade.date}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            YOREE Token Incentivization
          </Typography>

          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                mb: 4,
                overflowX: 'auto',
                '& .MuiStepLabel-root': {
                  minWidth: 0,
                },
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  lineHeight: 1.2,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                },
                '& .MuiStepLabel-labelContainer': {
                  padding: { xs: '0 2px', sm: '0 4px' },
                },
                '& .MuiStep-root': {
                  minWidth: 'auto',
                  flex: { xs: '0 0 auto', sm: 1 },
                },
                '& .MuiStepConnector-root': {
                  display: 'none',
                }
              }}
              orientation="horizontal"
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Progress Indicator */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Step {activeStep + 1} of {steps.length}
              </Typography>
              <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${((activeStep + 1) / steps.length) * 100}%`,
                    height: 8,
                    bgcolor: 'primary.main',
                    transition: 'width 0.3s ease-in-out',
                  }}
                />
              </Box>
            </Box>

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              {activeStep < steps.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default TokenIncentivization; 