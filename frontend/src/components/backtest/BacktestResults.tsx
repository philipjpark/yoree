import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

interface BacktestResult {
  tradeCount: number;
  totalProfit: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  equityCurve: Array<{
    timestamp: string;
    equity: number;
    drawdown: number;
  }>;
}

interface BacktestResultsProps {
  results: BacktestResult;
}

const BacktestResults: React.FC<BacktestResultsProps> = ({ results }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          Backtest Results
        </Typography>

        <Grid container spacing={3}>
          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Profit
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(results.totalProfit)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Win Rate
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatPercentage(results.winRate)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Max Drawdown
                      </Typography>
                      <Typography variant="h6" color="error">
                        {formatPercentage(results.maxDrawdown)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Sharpe Ratio
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {results.sharpeRatio.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Trade Statistics */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Trade Statistics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Total Trades: {results.tradeCount}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={results.winRate * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Win Rate
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatPercentage(results.winRate)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Equity Curve */}
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Equity Curve
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={results.equityCurve}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => formatPercentage(value)}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'equity' ? formatCurrency(value) : formatPercentage(value),
                        name === 'equity' ? 'Equity' : 'Drawdown',
                      ]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="equity"
                      stroke="#4CAF50"
                      name="Equity"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="drawdown"
                      stroke="#F44336"
                      name="Drawdown"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default BacktestResults; 