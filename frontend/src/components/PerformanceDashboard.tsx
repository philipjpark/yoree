import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import performanceService, { PerformanceMetrics, SystemMetrics, UserMetrics } from '../services/performanceService';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    apiResponseTime: 0,
    transactionSpeed: 0
  });
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    sessionDuration: 0,
    pageViews: 0,
    interactions: 0,
    errors: 0
  });

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = performanceService.subscribe((metric) => {
      setMetrics(prev => [...prev, metric]);
    });

    const updateMetrics = () => {
      setSystemMetrics(performanceService.getSystemMetrics());
      setUserMetrics(performanceService.getUserMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isOpen]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceStatus = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return 'success';
    if (value <= threshold) return 'warning';
    return 'error';
  };

  const exportMetrics = (format: 'json' | 'csv') => {
    const data = performanceService.exportMetrics(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearMetrics = () => {
    performanceService.clearMetrics();
    setMetrics([]);
  };

  // Generate chart data from recent metrics
  const chartData = metrics.slice(-20).map((metric, index) => ({
    time: index,
    duration: metric.duration,
    success: metric.success ? 1 : 0
  }));

  const recentErrors = metrics.filter(m => !m.success).slice(-5);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 'bold' }}>
            🚀 Performance Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Metrics">
              <IconButton onClick={() => {
                setSystemMetrics(performanceService.getSystemMetrics());
                setUserMetrics(performanceService.getUserMetrics());
              }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export JSON">
              <IconButton onClick={() => exportMetrics('json')}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              onClick={clearMetrics}
              sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          {/* System Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MemoryIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Memory Usage</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {systemMetrics.memoryUsage.toFixed(1)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemMetrics.memoryUsage}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SpeedIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">API Response</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {formatDuration(systemMetrics.apiResponseTime)}
                  </Typography>
                  <Chip 
                    label={getPerformanceStatus(systemMetrics.apiResponseTime, 100) === 'success' ? 'Good' : 'Slow'}
                    size="small"
                    color={getPerformanceStatus(systemMetrics.apiResponseTime, 100) as any}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <NetworkIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Network Latency</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {formatDuration(systemMetrics.networkLatency)}
                  </Typography>
                  <Chip 
                    label={getPerformanceStatus(systemMetrics.networkLatency, 50) === 'success' ? 'Fast' : 'Slow'}
                    size="small"
                    color={getPerformanceStatus(systemMetrics.networkLatency, 50) as any}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimelineIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Transaction Speed</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {formatDuration(systemMetrics.transactionSpeed)}
                  </Typography>
                  <Chip 
                    label={getPerformanceStatus(systemMetrics.transactionSpeed, 400) === 'success' ? 'Fast' : 'Slow'}
                    size="small"
                    color={getPerformanceStatus(systemMetrics.transactionSpeed, 400) as any}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* User Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                    User Session Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Session Duration</Typography>
                      <Typography variant="h6">{formatDuration(userMetrics.sessionDuration)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Page Views</Typography>
                      <Typography variant="h6">{userMetrics.pageViews}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Interactions</Typography>
                      <Typography variant="h6">{userMetrics.interactions}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Errors</Typography>
                      <Typography variant="h6" color={userMetrics.errors > 0 ? 'error' : 'success'}>
                        {userMetrics.errors}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                    Performance Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Metrics Table */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                Recent Performance Metrics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Component</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.slice(-10).reverse().map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>{metric.component}</TableCell>
                        <TableCell>{metric.action}</TableCell>
                        <TableCell>{formatDuration(metric.duration)}</TableCell>
                        <TableCell>
                          {metric.success ? (
                            <SuccessIcon color="success" fontSize="small" />
                          ) : (
                            <WarningIcon color="error" fontSize="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {metric.error && (
                            <Tooltip title={metric.error}>
                              <Typography variant="body2" color="error" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {metric.error}
                              </Typography>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Recent Errors */}
          {recentErrors.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Noto Sans KR", sans-serif', color: 'error.main' }}>
                  Recent Errors
                </Typography>
                {recentErrors.map((error, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="error.contrastText">
                      <strong>{error.component}.{error.action}:</strong> {error.error}
                    </Typography>
                    <Typography variant="caption" color="error.contrastText">
                      {new Date(error.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PerformanceDashboard; 