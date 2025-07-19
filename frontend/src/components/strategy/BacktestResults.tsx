import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tabs,
  Tab,
  Alert,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface BacktestResult {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  calmarRatio: number;
  trades: Trade[];
  equityCurve: EquityPoint[];
}

interface Trade {
  id: string;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  type: 'long' | 'short';
  status: 'win' | 'loss';
}

interface EquityPoint {
  date: string;
  equity: number;
  drawdown: number;
}

interface BacktestResultsProps {
  results: BacktestResult | null;
  loading: boolean;
  error: string;
  onRunBacktest: () => void;
}

const BacktestResults: React.FC<BacktestResultsProps> = ({
  results,
  loading,
  error,
  onRunBacktest
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const getPerformanceColor = (value: number, threshold: number = 0) => {
    if (value > threshold) return 'success';
    if (value < threshold) return 'error';
    return 'warning';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ShowChartIcon color="primary" />
            <Typography variant="h6">Backtest Results</Typography>
          </Box>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Running backtest analysis...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={onRunBacktest}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ShowChartIcon color="primary" />
            <Typography variant="h6">Backtest Results</Typography>
          </Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Run a backtest to see how your strategy would have performed historically.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            onClick={onRunBacktest}
            startIcon={<ShowChartIcon />}
          >
            Run Backtest
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <ShowChartIcon color="primary" />
          <Typography variant="h6">Backtest Results</Typography>
        </Box>

        {/* Performance Summary */}
        <Paper sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              {results.totalReturn > 0 ? (
                <TrendingUpIcon sx={{ fontSize: 40, color: 'white' }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 40, color: 'white' }} />
              )}
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {formatPercent(results.totalReturn)} Total Return
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {results.totalTrades} trades • {results.winRate.toFixed(1)}% win rate
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                label={results.totalReturn > 0 ? 'PROFITABLE' : 'UNPROFITABLE'}
                color={results.totalReturn > 0 ? 'success' : 'error'}
                variant="filled"
                sx={{ color: 'white', fontWeight: 'bold' }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color={getPerformanceColor(results.annualizedReturn)}>
                  {formatPercent(results.annualizedReturn)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Annualized Return
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color={getPerformanceColor(results.sharpeRatio, 1)}>
                  {results.sharpeRatio.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sharpe Ratio
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color={getPerformanceColor(-results.maxDrawdown, -20)}>
                  {formatPercent(-results.maxDrawdown)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Max Drawdown
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color={getPerformanceColor(results.profitFactor, 1.5)}>
                  {results.profitFactor.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Profit Factor
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Analysis Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Trade History" />
            <Tab label="Performance Metrics" />
            <Tab label="Risk Analysis" />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Recent Trades
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Entry</TableCell>
                        <TableCell>Exit</TableCell>
                        <TableCell>P&L</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.trades.slice(0, 10).map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell>{new Date(trade.entryDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={trade.type.toUpperCase()}
                              size="small"
                              color={trade.type === 'long' ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{formatCurrency(trade.entryPrice)}</TableCell>
                          <TableCell>{formatCurrency(trade.exitPrice)}</TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color={trade.pnl > 0 ? 'success.main' : 'error.main'}
                              sx={{ fontWeight: 'bold' }}
                            >
                              {formatCurrency(trade.pnl)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {trade.status === 'win' ? (
                              <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                              <WarningIcon color="error" fontSize="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Trading Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Total Trades:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {results.totalTrades}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Profitable Trades:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {results.profitableTrades}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Win Rate:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {results.winRate.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Average Win:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(results.averageWin)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Average Loss:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {formatCurrency(results.averageLoss)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Risk Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Calmar Ratio:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {results.calmarRatio.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Sharpe Ratio:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {results.sharpeRatio.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Profit Factor:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {results.profitFactor.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Risk Assessment
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Risk Level
                        </Typography>
                        <Chip
                          label={
                            results.maxDrawdown > 30 ? 'HIGH' :
                            results.maxDrawdown > 15 ? 'MEDIUM' : 'LOW'
                          }
                          color={
                            results.maxDrawdown > 30 ? 'error' :
                            results.maxDrawdown > 15 ? 'warning' : 'success'
                          }
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Based on maximum drawdown of {formatPercent(-results.maxDrawdown)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Strategy Quality
                        </Typography>
                        <Chip
                          label={
                            results.sharpeRatio > 1.5 ? 'EXCELLENT' :
                            results.sharpeRatio > 1.0 ? 'GOOD' :
                            results.sharpeRatio > 0.5 ? 'FAIR' : 'POOR'
                          }
                          color={
                            results.sharpeRatio > 1.5 ? 'success' :
                            results.sharpeRatio > 1.0 ? 'primary' :
                            results.sharpeRatio > 0.5 ? 'warning' : 'error'
                          }
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Based on Sharpe ratio of {results.sharpeRatio.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Recommendations */}
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Strategy Assessment:</strong> {
              results.totalReturn > 20 && results.sharpeRatio > 1.0 ? 
              'This strategy shows strong performance with good risk-adjusted returns.' :
              results.totalReturn > 0 ? 
              'This strategy is profitable but may need optimization for better risk-adjusted returns.' :
              'This strategy needs significant improvement. Consider revising parameters or approach.'
            }
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BacktestResults; 