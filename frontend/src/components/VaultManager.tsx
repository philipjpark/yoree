import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';

interface VaultData {
  name: string;
  totalValue: number;
  totalShares: number;
  userShares: number;
  userValue: number;
}

const VaultManager: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [error, setError] = useState<string | null>(null);

  // Mock vault data - replace with real on-chain data
  const [vaultData] = useState<VaultData>({
            name: 'YOREE Strategy Vault',
    totalValue: 125000,
    totalShares: 1000000,
    userShares: 5000,
    userValue: 625
  });

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock deposit - replace with real transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      const depositAmount = parseFloat(amount);
      const newShares = (depositAmount * vaultData.totalShares) / vaultData.totalValue;
      
      console.log(`Deposited ${depositAmount} tokens, received ${newShares} shares`);
      
      setAmount('');
      setError(null);
    } catch (err) {
      setError('Transaction failed. Please try again.');
      console.error('Deposit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > vaultData.userShares) {
      setError('Insufficient shares to withdraw');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock withdraw - replace with real transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const withdrawShares = parseFloat(amount);
      const withdrawValue = (withdrawShares * vaultData.totalValue) / vaultData.totalShares;
      
      console.log(`Withdrew ${withdrawValue} tokens, burned ${withdrawShares} shares`);
      
      setAmount('');
      setError(null);
    } catch (err) {
      setError('Transaction failed. Please try again.');
      console.error('Withdraw error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
            Vault Management
          </Typography>
          
          {/* Vault Overview */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {vaultData.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Value:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${vaultData.totalValue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Shares:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {vaultData.totalShares.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Share Price:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${(vaultData.totalValue / vaultData.totalShares).toFixed(4)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Position
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Your Shares:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {vaultData.userShares.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Your Value:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      ${vaultData.userValue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Share of Vault:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {((vaultData.userShares / vaultData.totalShares) * 100).toFixed(2)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={action === 'deposit' ? 'contained' : 'outlined'}
              onClick={() => setAction('deposit')}
              sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              Deposit
            </Button>
            <Button
              variant={action === 'withdraw' ? 'contained' : 'outlined'}
              onClick={() => setAction('withdraw')}
              sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              Withdraw
            </Button>
          </Box>

          {/* Transaction Form */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              label={action === 'deposit' ? 'Amount to Deposit (USDC)' : 'Shares to Withdraw'}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ flexGrow: 1 }}
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={action === 'deposit' ? handleDeposit : handleWithdraw}
              disabled={loading || !amount}
              sx={{ 
                minWidth: '120px',
                fontFamily: '"Noto Sans KR", sans-serif'
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                action === 'deposit' ? 'Deposit' : 'Withdraw'
              )}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Transaction Preview */}
          {amount && parseFloat(amount) > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" gutterBottom>
                Transaction Preview:
              </Typography>
              {action === 'deposit' ? (
                <Typography variant="body2">
                  You will receive approximately {(parseFloat(amount) * vaultData.totalShares / vaultData.totalValue).toFixed(2)} shares
                </Typography>
              ) : (
                <Typography variant="body2">
                  You will receive approximately ${(parseFloat(amount) * vaultData.totalValue / vaultData.totalShares).toFixed(2)} USDC
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default VaultManager; 