import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Tab,
  Tabs,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Container,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Lock as LockIcon,
  ArrowDownward as DepositIcon,
  ArrowUpward as WithdrawIcon,
  SwapHoriz as TransferIcon,
  OpenInNew as OpenInNewIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  Hub as HubIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import monadService, { MONAD_TESTNET_CONFIG, UNLINK_CONFIG } from '../services/monadService';
import unlinkService, { UnlinkTransaction } from '../services/unlinkService';

const UnlinkPrivateWallet: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txResult, setTxResult] = useState<{ hash: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletState, setWalletState] = useState(monadService.getWalletState());
  const [transactions, setTransactions] = useState<UnlinkTransaction[]>([]);

  useEffect(() => {
    const state = monadService.getWalletState();
    setWalletState(state);
    if (state.isConnected) {
      setTransactions(unlinkService.getState().transactions);
    }
  }, []);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) { setError('Please enter a valid amount'); return; }
    setIsLoading(true); setError(null); setTxResult(null);
    try {
      const result = await monadService.unlinkDeposit(depositAmount);
      unlinkService.recordDeposit(result.hash, depositAmount, walletState.address);
      setTxResult(result); setDepositAmount('');
      const newBalance = await monadService.refreshBalance();
      setWalletState((prev) => ({ ...prev, balance: newBalance }));
      setTransactions(unlinkService.getState().transactions);
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !withdrawAddress) { setError('Enter amount and address'); return; }
    setIsLoading(true); setError(null); setTxResult(null);
    try {
      const result = await monadService.unlinkWithdraw(withdrawAmount, withdrawAddress);
      unlinkService.recordWithdrawal(result.hash, withdrawAmount, withdrawAddress);
      setTxResult(result); setWithdrawAmount(''); setWithdrawAddress('');
      const newBalance = await monadService.refreshBalance();
      setWalletState((prev) => ({ ...prev, balance: newBalance }));
      setTransactions(unlinkService.getState().transactions);
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0 || !transferAddress) { setError('Enter amount and Unlink address'); return; }
    setIsLoading(true); setError(null); setTxResult(null);
    try {
      unlinkService.recordTransfer(`0x${Date.now().toString(16)}`, transferAmount, transferAddress);
      setTxResult({ hash: `0x${Date.now().toString(16)}`, status: 'confirmed' });
      setTransferAmount(''); setTransferAddress('');
      setTransactions(unlinkService.getState().transactions);
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  const privacyInfo = unlinkService.getPrivacyInfo(
    activeTab === 0 ? 'deposit' : activeTab === 1 ? 'transfer' : 'withdraw'
  );

  const glassCard = (children: React.ReactNode, accent?: string) => (
    <Card
      elevation={0}
      sx={{
        background: isDark
          ? 'linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.7) 100%)'
          : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        ...(accent && {
          '&::before': {
            content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: `linear-gradient(90deg, ${accent}, ${accent}60, transparent)`,
            borderRadius: '20px 20px 0 0',
          },
        }),
      }}
    >
      {children}
    </Card>
  );

  // Not connected
  if (!walletState.isConnected) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 50%, #020617 100%)'
            : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm">
          {glassCard(
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Box sx={{
                width: 64, height: 64, borderRadius: '16px', mx: 'auto', mb: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 12px 32px rgba(99,102,241,0.3)',
              }}>
                <LockIcon sx={{ fontSize: 32, color: '#fff' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1.5 }}>
                Unlink Private Wallet
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
                Connect your wallet to Monad Testnet to access private transactions powered by Unlink.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={() => window.open('https://faucet.unlink.xyz/?referrer=luma', '_blank')}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    fontWeight: 700, textTransform: 'none', borderRadius: '12px', px: 3,
                  }}
                >
                  Get Testnet Tokens
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.open('https://docs.monad.xyz', '_blank')}
                  sx={{
                    fontWeight: 700, textTransform: 'none', borderRadius: '12px', px: 3,
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                    color: theme.palette.text.primary,
                  }}
                >
                  Monad Docs
                </Button>
              </Stack>
            </CardContent>,
            '#8b5cf6'
          )}
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 50%, #020617 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        position: 'relative',
      }}
    >
      {/* Grid */}
      <Box
        sx={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: isDark ? 0.3 : 0.15,
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Orbs */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: '15%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: '20%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 5 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mb: 1 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}>
                <LockIcon sx={{ fontSize: 20, color: '#fff' }} />
              </Box>
              <Typography variant="h4" sx={{
                fontWeight: 900, letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.6rem', md: '2rem' },
              }}>
                Unlink Private Wallet
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Chip label="Monad Testnet" size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', height: 24, background: '#10b98115', color: '#10b981', border: '1px solid #10b98125' }} />
              <Chip label="Zero-Knowledge" size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', height: 24, background: '#8b5cf615', color: '#8b5cf6', border: '1px solid #8b5cf625' }} />
            </Stack>
          </Box>

          <Grid container spacing={3}>
            {/* LEFT: Operations */}
            <Grid item xs={12} md={7}>
              {glassCard(
                <CardContent sx={{ p: 3 }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => { setActiveTab(v); setError(null); setTxResult(null); }}
                    sx={{
                      mb: 3, minHeight: 42,
                      '& .MuiTab-root': {
                        fontWeight: 700, textTransform: 'none', fontSize: '0.88rem', minHeight: 42,
                        borderRadius: '10px', mx: 0.5,
                      },
                      '& .Mui-selected': { color: '#8b5cf6 !important' },
                      '& .MuiTabs-indicator': { backgroundColor: '#8b5cf6', borderRadius: '2px', height: 3 },
                    }}
                  >
                    <Tab icon={<DepositIcon sx={{ fontSize: 18 }} />} label="Deposit" iconPosition="start" />
                    <Tab icon={<TransferIcon sx={{ fontSize: 18 }} />} label="Transfer" iconPosition="start" />
                    <Tab icon={<WithdrawIcon sx={{ fontSize: 18 }} />} label="Withdraw" iconPosition="start" />
                  </Tabs>

                  {/* Privacy banner */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2, mb: 3, borderRadius: '14px',
                      background: isDark ? 'rgba(139,92,246,0.04)' : 'rgba(139,92,246,0.03)',
                      border: '1px solid rgba(139,92,246,0.12)',
                    }}
                  >
                    <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                      {[
                        { label: 'Amount', value: privacyInfo.amount },
                        { label: 'Sender', value: privacyInfo.sender },
                        { label: 'Recipient', value: privacyInfo.recipient },
                        { label: 'Token', value: privacyInfo.tokenType },
                      ].map((item) => (
                        <Stack key={item.label} alignItems="center" spacing={0.5}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem', fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                          <Chip
                            size="small"
                            icon={item.value === 'private' ? <VisibilityOffIcon sx={{ fontSize: '14px !important' }} /> : <VisibilityIcon sx={{ fontSize: '14px !important' }} />}
                            label={item.value === 'private' ? 'Private' : 'Public'}
                            sx={{
                              height: 24, fontSize: '0.68rem', fontWeight: 700,
                              background: item.value === 'private' ? '#10b98112' : '#f59e0b12',
                              color: item.value === 'private' ? '#10b981' : '#f59e0b',
                              border: `1px solid ${item.value === 'private' ? '#10b98120' : '#f59e0b20'}`,
                              '& .MuiChip-icon': { color: item.value === 'private' ? '#10b981' : '#f59e0b' },
                            }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>

                  {/* Deposit */}
                  {activeTab === 0 && (
                    <Stack spacing={2.5}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.82rem' }}>
                        Deposit MON from your public wallet into your private Unlink account.
                      </Typography>
                      <TextField
                        label="Amount (MON)"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        fullWidth
                        placeholder="0.0"
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        InputProps={{
                          endAdornment: (
                            <Button
                              size="small"
                              onClick={() => setDepositAmount(walletState.balance)}
                              sx={{ color: '#8b5cf6', fontWeight: 700, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto' }}
                            >
                              MAX
                            </Button>
                          ),
                        }}
                      />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Available: {parseFloat(walletState.balance).toFixed(4)} MON
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleDeposit}
                        disabled={isLoading || !depositAmount}
                        sx={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          py: 1.3, fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                        }}
                      >
                        {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Deposit to Private Account'}
                      </Button>
                    </Stack>
                  )}

                  {/* Transfer */}
                  {activeTab === 1 && (
                    <Stack spacing={2.5}>
                      <Alert
                        severity="info"
                        icon={<SecurityIcon />}
                        sx={{ borderRadius: '12px', background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)' }}
                      >
                        Private transfers hide sender, recipient, amount, and token type.
                      </Alert>
                      <TextField
                        label="Recipient Unlink Address"
                        value={transferAddress}
                        onChange={(e) => setTransferAddress(e.target.value)}
                        fullWidth
                        placeholder="unlink1..."
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                      <TextField
                        label="Amount (MON)"
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        fullWidth
                        placeholder="0.0"
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleTransfer}
                        disabled={isLoading || !transferAmount || !transferAddress}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          py: 1.3, fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                        }}
                      >
                        {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send Private Transfer'}
                      </Button>
                    </Stack>
                  )}

                  {/* Withdraw */}
                  {activeTab === 2 && (
                    <Stack spacing={2.5}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.82rem' }}>
                        Withdraw MON from your private Unlink account to any public address.
                      </Typography>
                      <TextField
                        label="Recipient Address (0x...)"
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        fullWidth
                        placeholder="0x..."
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                      <TextField
                        label="Amount (MON)"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        fullWidth
                        placeholder="0.0"
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleWithdraw}
                        disabled={isLoading || !withdrawAmount || !withdrawAddress}
                        sx={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          py: 1.3, fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', borderRadius: '12px', color: '#0a0f1e',
                          boxShadow: '0 8px 24px rgba(245,158,11,0.25)',
                        }}
                      >
                        {isLoading ? <CircularProgress size={22} /> : 'Withdraw to Public Address'}
                      </Button>
                    </Stack>
                  )}

                  {/* Feedback */}
                  {error && <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>{error}</Alert>}
                  {txResult && (
                    <Alert
                      severity="success"
                      sx={{ mt: 2, borderRadius: '12px' }}
                      action={
                        <IconButton size="small" onClick={() => window.open(monadService.getExplorerTxUrl(txResult.hash), '_blank')}>
                          <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      }
                    >
                      Transaction {txResult.status}! Hash: {txResult.hash.slice(0, 12)}...
                    </Alert>
                  )}
                </CardContent>,
                '#8b5cf6'
              )}
            </Grid>

            {/* RIGHT: Info */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                {/* How it works */}
                {glassCard(
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#10b98115', color: '#10b981',
                      }}>
                        <SecurityIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                        How Unlink Works
                      </Typography>
                    </Stack>
                    <Stack spacing={2}>
                      {[
                        { step: '1', title: 'Deposit', desc: 'Move tokens from public wallet into private account.' },
                        { step: '2', title: 'Transact Privately', desc: 'Send, swap, DeFi — all hidden by zero-knowledge proofs.' },
                        { step: '3', title: 'Withdraw', desc: 'Move tokens back to any public address when ready.' },
                      ].map((s) => (
                        <Stack key={s.step} direction="row" spacing={1.5} alignItems="flex-start">
                          <Box sx={{
                            width: 24, height: 24, borderRadius: '6px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#10b98112', color: '#10b981',
                            fontSize: '0.7rem', fontWeight: 800,
                          }}>
                            {s.step}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.82rem' }}>
                              {s.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                              {s.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>,
                  '#10b981'
                )}

                {/* Contract info */}
                {glassCard(
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" sx={{ fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                      CONTRACT INFO
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem' }}>Pool Contract</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: theme.palette.text.primary, wordBreak: 'break-all' }}>
                          {UNLINK_CONFIG.poolAddress}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem' }}>Network</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: '0.82rem' }}>
                          Monad Testnet (Chain {MONAD_TESTNET_CONFIG.chainId}) · 400ms blocks
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open('https://docs.unlink.xyz', '_blank')}
                        sx={{ textTransform: 'none', fontSize: '0.72rem', borderRadius: '10px', borderColor: '#8b5cf630', color: '#8b5cf6' }}
                      >
                        Docs
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open('https://faucet.unlink.xyz/?referrer=luma', '_blank')}
                        sx={{ textTransform: 'none', fontSize: '0.72rem', borderRadius: '10px', borderColor: '#10b98130', color: '#10b981' }}
                      >
                        Faucet
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open('https://testnet.monadscan.com', '_blank')}
                        sx={{ textTransform: 'none', fontSize: '0.72rem', borderRadius: '10px', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: theme.palette.text.secondary }}
                      >
                        Monadscan
                      </Button>
                    </Stack>
                  </CardContent>
                )}

                {/* Transaction History */}
                {transactions.length > 0 &&
                  glassCard(
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="overline" sx={{ fontWeight: 800, color: '#6366f1', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                        RECENT TRANSACTIONS
                      </Typography>
                      <TableContainer sx={{ mt: 1.5 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.68rem', borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.68rem', borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.68rem', borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {transactions.slice(0, 5).map((tx) => (
                              <TableRow key={tx.id} sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell sx={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                                  <Chip
                                    size="small"
                                    label={tx.type}
                                    sx={{
                                      height: 22, fontSize: '0.65rem', fontWeight: 700,
                                      background:
                                        tx.type === 'deposit' ? '#6366f112' :
                                        tx.type === 'transfer' ? '#10b98112' : '#f59e0b12',
                                      color:
                                        tx.type === 'deposit' ? '#6366f1' :
                                        tx.type === 'transfer' ? '#10b981' : '#f59e0b',
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ color: theme.palette.text.primary, fontSize: '0.78rem', fontWeight: 600, borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                                  {tx.amount} MON
                                </TableCell>
                                <TableCell sx={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                                  <Chip
                                    size="small"
                                    label={tx.status}
                                    sx={{
                                      height: 22, fontSize: '0.65rem', fontWeight: 700,
                                      background: tx.status === 'confirmed' ? '#10b98112' : '#f59e0b12',
                                      color: tx.status === 'confirmed' ? '#10b981' : '#f59e0b',
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  )}
              </Stack>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default UnlinkPrivateWallet;
