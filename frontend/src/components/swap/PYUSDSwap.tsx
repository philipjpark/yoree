import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Alert,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import { SwapHoriz, AccountBalance, TrendingUp } from '@mui/icons-material';
import { WALLET_CONFIG, getWalletDisplay, isPhilxdaegu } from '../../utils/walletUtils';
import bnbService from '../../services/bnbService';

interface SwapState {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  isConnected: boolean;
  walletAddress: string;
  pyusdBalance: string;
  bnbBalance: string;
  isSwapping: boolean;
  swapHistory: any[];
}

const PYUSDSwap: React.FC = () => {
  const [swapState, setSwapState] = useState<SwapState>({
    fromToken: 'PYUSD',
    toToken: 'tBNB',
    fromAmount: '',
    toAmount: '',
    slippage: 0.5,
    isConnected: false,
    walletAddress: '',
    pyusdBalance: '0',
    bnbBalance: '0',
    isSwapping: false,
    swapHistory: []
  });

  // Mock swap history for philxdaegu
  const mockSwapHistory = [
    {
      id: 1,
      fromToken: 'PYUSD',
      toToken: 'tBNB',
      fromAmount: '100',
      toAmount: '0.312',
      timestamp: new Date(Date.now() - 3600000),
      txHash: '0x1234...abcd',
      status: 'completed'
    },
    {
      id: 2,
      fromToken: 'tBNB',
      toToken: 'PYUSD',
      fromAmount: '0.5',
      toAmount: '160.25',
      timestamp: new Date(Date.now() - 7200000),
      txHash: '0x5678...efgh',
      status: 'completed'
    }
  ];

  useEffect(() => {
    // Connect to wallet and fetch real balances
    const connectWallet = async () => {
      try {
        const address = await bnbService.connectWallet();
        const isPhil = isPhilxdaegu(address);
        
        // Get real balances
        const balances = await bnbService.getAllBalances(address);
        
        setSwapState(prev => ({
          ...prev,
          isConnected: true,
          walletAddress: address,
          pyusdBalance: balances.pyusd,
          bnbBalance: balances.tbnb, // Use tBNB balance for testnet
          swapHistory: isPhil ? mockSwapHistory : []
        }));
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    };

    connectWallet();
  }, []);

  const handleAmountChange = (field: 'fromAmount' | 'toAmount', value: string) => {
    if (field === 'fromAmount') {
      // Calculate toAmount based on current rate (1 PYUSD ≈ 0.003125 tBNB)
      const fromAmount = parseFloat(value) || 0;
      const toAmount = (fromAmount * 0.003125).toFixed(6);
      
      setSwapState(prev => ({
        ...prev,
        fromAmount: value,
        toAmount: toAmount
      }));
    } else {
      // Calculate fromAmount based on current rate
      const toAmount = parseFloat(value) || 0;
      const fromAmount = (toAmount / 0.003125).toFixed(2);
      
      setSwapState(prev => ({
        ...prev,
        fromAmount: fromAmount,
        toAmount: value
      }));
    }
  };

  const handleSwap = async () => {
    if (!swapState.fromAmount || !swapState.toAmount) return;

    setSwapState(prev => ({ ...prev, isSwapping: true }));

    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add to swap history
      const newSwap = {
        id: Date.now(),
        fromToken: swapState.fromToken,
        toToken: swapState.toToken,
        fromAmount: swapState.fromAmount,
        toAmount: swapState.toAmount,
        timestamp: new Date(),
        txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
        status: 'completed'
      };

      setSwapState(prev => ({
        ...prev,
        isSwapping: false,
        swapHistory: [newSwap, ...prev.swapHistory],
        fromAmount: '',
        toAmount: ''
      }));

    } catch (error) {
      console.error('Swap failed:', error);
      setSwapState(prev => ({ ...prev, isSwapping: false }));
    }
  };

  const switchTokens = () => {
    setSwapState(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount
    }));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        💰 PYUSD ↔ tBNB Swap
      </Typography>

      {/* Wallet Connection Status */}
      <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountBalance />
            <Box>
              <Typography variant="h6">
                {swapState.isConnected ? getWalletDisplay(swapState.walletAddress) : 'Not Connected'}
              </Typography>
              <Typography variant="body2">
                PYUSD: {swapState.pyusdBalance} | tBNB: {swapState.bnbBalance}
              </Typography>
            </Box>
            {isPhilxdaegu(swapState.walletAddress) && (
              <Chip label="Hackathon Demo" color="secondary" size="small" />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Swap Interface */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Swap Tokens
          </Typography>

          {/* From Token */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={`From ${swapState.fromToken}`}
              type="number"
              value={swapState.fromAmount}
              onChange={(e) => handleAmountChange('fromAmount', e.target.value)}
              InputProps={{
                endAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Balance: {swapState.fromToken === 'PYUSD' ? swapState.pyusdBalance : swapState.bnbBalance}
                    </Typography>
                  </Box>
                )
              }}
            />
          </Box>

          {/* Switch Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              onClick={switchTokens}
              startIcon={<SwapHoriz />}
            >
              Switch
            </Button>
          </Box>

          {/* To Token */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={`To ${swapState.toToken}`}
              type="number"
              value={swapState.toAmount}
              onChange={(e) => handleAmountChange('toAmount', e.target.value)}
              InputProps={{
                endAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Balance: {swapState.toToken === 'PYUSD' ? swapState.pyusdBalance : swapState.bnbBalance}
                    </Typography>
                  </Box>
                )
              }}
            />
          </Box>

          {/* Slippage */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Slippage Tolerance</InputLabel>
            <Select
              value={swapState.slippage}
              onChange={(e) => setSwapState(prev => ({ ...prev, slippage: e.target.value as number }))}
              label="Slippage Tolerance"
            >
              <MenuItem value={0.1}>0.1%</MenuItem>
              <MenuItem value={0.5}>0.5%</MenuItem>
              <MenuItem value={1.0}>1.0%</MenuItem>
            </Select>
          </FormControl>

          {/* Swap Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSwap}
            disabled={!swapState.fromAmount || !swapState.toAmount || swapState.isSwapping}
            sx={{ mb: 2 }}
          >
            {swapState.isSwapping ? 'Swapping...' : `Swap ${swapState.fromToken} for ${swapState.toToken}`}
          </Button>

          {/* Rate Info */}
          <Alert severity="info">
            Rate: 1 PYUSD ≈ 0.003125 tBNB (Current Market Rate)
          </Alert>
        </CardContent>
      </Card>

      {/* Swap History */}
      {swapState.swapHistory.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Swaps
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {swapState.swapHistory.map((swap) => (
              <Box key={swap.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {swap.fromAmount} {swap.fromToken} → {swap.toAmount} {swap.toToken}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {swap.timestamp.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Chip 
                      label={swap.status} 
                      color={swap.status === 'completed' ? 'success' : 'warning'} 
                      size="small" 
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {swap.txHash}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PYUSDSwap; 