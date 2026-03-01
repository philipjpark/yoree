import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
  AccountBalanceWallet as WalletIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material';
import monadService, { MONAD_TESTNET_CONFIG, MonadWalletState } from '../services/monadService';
import unlinkService from '../services/unlinkService';

interface MonadWalletConnectProps {
  onConnect?: (address: string) => void;
  onClose?: () => void;
  variant?: 'default' | 'navbar';
}

const MonadWalletConnect: React.FC<MonadWalletConnectProps> = ({ onConnect, onClose, variant }) => {
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletState, setWalletState] = useState<MonadWalletState | null>(null);
  const [copied, setCopied] = useState(false);
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const state = monadService.getWalletState();
    if (state.isConnected) setWalletState(state);
  }, []);

  const wallets = [
    { name: 'MetaMask', description: 'Connect via MetaMask', icon: '🦊', color: '#F6851B', gradient: 'linear-gradient(135deg, #F6851B 0%, #E2761B 100%)', installUrl: 'https://metamask.io/' },
    { name: 'Phantom', description: 'Multi-chain wallet', icon: '👻', color: '#AB9FF2', gradient: 'linear-gradient(135deg, #AB9FF2 0%, #7B61FF 100%)', installUrl: 'https://phantom.app/' },
    { name: 'WalletConnect', description: 'Connect any wallet', icon: '🔗', color: '#3B99FC', gradient: 'linear-gradient(135deg, #3B99FC 0%, #2E7DD2 100%)', installUrl: 'https://walletconnect.com/' },
  ];

  const handleWalletSelect = async () => {
    setIsConnecting(true);
    try {
      const state = await monadService.connectWallet();
      setWalletState(state);
      await unlinkService.createAccount(state.address);
      if (onConnect) onConnect(state.address);
      setOpen(false);
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      if (error.message.includes('No Web3 provider')) window.open('https://metamask.io/', '_blank');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    monadService.disconnect();
    unlinkService.reset();
    setWalletState(null);
  };

  const handleCopyAddress = () => {
    if (walletState?.address) {
      navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const dialogPaperSx = {
    borderRadius: '20px',
    background: isDark
      ? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)'
      : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
    backdropFilter: 'blur(24px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    boxShadow: isDark
      ? '0 24px 48px rgba(0,0,0,0.5)'
      : '0 24px 48px rgba(0,0,0,0.12)',
  };

  // ── Connected state ──
  if (walletState?.isConnected) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.8,
            px: 1.5, py: 0.6, borderRadius: '10px', cursor: 'pointer',
            background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'rgba(16,185,129,0.3)', background: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)' },
          }}
          onClick={() => setOpen(true)}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.78rem' }}>
            {shortenAddress(walletState.address)}
          </Typography>
          <Chip
            label={`${parseFloat(walletState.balance).toFixed(2)} MON`}
            size="small"
            sx={{
              height: 20, fontSize: '0.65rem', fontWeight: 800,
              background: '#10b98115', color: '#10b981',
              border: '1px solid #10b98120',
            }}
          />
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
          <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1.05rem' }}>
              Monad Testnet Wallet
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ py: 2 }}>
              {/* Address */}
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: '14px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem', fontWeight: 600 }}>
                  WALLET ADDRESS
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all', color: theme.palette.text.primary, fontSize: '0.78rem' }}>
                    {walletState.address}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                    <IconButton size="small" onClick={handleCopyAddress} sx={{ width: 28, height: 28 }}>
                      <CopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Monadscan">
                    <IconButton size="small" onClick={() => window.open(monadService.getExplorerAddressUrl(walletState.address), '_blank')} sx={{ width: 28, height: 28 }}>
                      <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>

              {/* Balance */}
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: '14px', textAlign: 'center',
                  background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                  border: '1px solid rgba(16,185,129,0.12)',
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981', fontSize: '2.2rem' }}>
                  {parseFloat(walletState.balance).toFixed(4)}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.82rem', fontWeight: 500 }}>
                  MON Balance
                </Typography>
              </Paper>

              {/* Unlink */}
              {unlinkService.isInitialized() && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2, borderRadius: '14px',
                    background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
                    border: '1px solid rgba(99,102,241,0.12)',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <LockIcon sx={{ fontSize: 14, color: '#8b5cf6' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.82rem' }}>
                      Unlink Private Account
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                    {unlinkService.getAccount()?.address || 'Initializing...'}
                  </Typography>
                </Paper>
              )}

              {/* Network chips */}
              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                {[
                  { label: 'Monad Testnet', color: '#10b981' },
                  { label: `Chain ${MONAD_TESTNET_CONFIG.chainId}`, color: undefined },
                  { label: '400ms Blocks', color: undefined },
                  { label: '800ms Finality', color: undefined },
                ].map((c) => (
                  <Chip
                    key={c.label}
                    label={c.label}
                    size="small"
                    sx={{
                      height: 22, fontSize: '0.65rem', fontWeight: 700,
                      ...(c.color
                        ? { background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}25` }
                        : { background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }),
                    }}
                  />
                ))}
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => window.open(MONAD_TESTNET_CONFIG.blockExplorerUrls[0], '_blank')}
                  sx={{
                    textTransform: 'none', fontWeight: 700, borderRadius: '12px', fontSize: '0.82rem',
                    borderColor: '#10b98130', color: '#10b981',
                    '&:hover': { borderColor: '#10b981', background: '#10b98108' },
                  }}
                >
                  Monadscan
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => { handleDisconnect(); setOpen(false); }}
                  sx={{
                    textTransform: 'none', fontWeight: 700, borderRadius: '12px', fontSize: '0.82rem',
                    borderColor: '#ef444430', color: '#ef4444',
                    '&:hover': { borderColor: '#ef4444', background: '#ef444408' },
                  }}
                >
                  Disconnect
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>
      </Box>
    );
  }

  // ── Not connected ──
  return (
    <Box>
      <Button
        variant="contained"
        size="small"
        sx={{
          px: 2.5, py: 0.8,
          borderRadius: '10px',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'none',
          background: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
          color: '#10b981',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: 'none',
          '&:hover': {
            background: isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.12)',
            borderColor: 'rgba(16,185,129,0.4)',
            boxShadow: '0 4px 16px rgba(16,185,129,0.15)',
          },
          transition: 'all 0.2s ease',
        }}
        onClick={() => setOpen(true)}
        disabled={isConnecting}
        startIcon={<WalletIcon sx={{ fontSize: 16 }} />}
      >
        {isConnecting ? 'Connecting...' : 'Connect'}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={{ textAlign: 'center', pb: 0, pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1.05rem' }}>
            Connect to Monad Testnet
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', mb: 3, fontSize: '0.82rem' }}>
            Connect your wallet to use the YSM Pipeline on Monad + Unlink
          </Typography>

          <List sx={{ p: 0 }}>
            {wallets.map((wallet, index) => (
              <motion.div
                key={wallet.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.08 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    mb: 1.5, borderRadius: '14px',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: `${wallet.color}50`,
                      background: `${wallet.color}06`,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <ListItem disablePadding>
                    <ListItemButton onClick={handleWalletSelect} disabled={isConnecting} sx={{ p: 2.5 }}>
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <Avatar
                          sx={{
                            width: 40, height: 40,
                            background: wallet.gradient,
                            fontSize: '1.2rem',
                          }}
                        >
                          {wallet.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.9rem' }}>
                            {wallet.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem' }}>
                            {wallet.description}
                          </Typography>
                        }
                      />
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18, opacity: 0.5 }} />
                    </ListItemButton>
                  </ListItem>
                </Paper>
              </motion.div>
            ))}
          </List>

          {/* Faucets */}
          <Paper
            elevation={0}
            sx={{
              mt: 2, p: 2, borderRadius: '14px', textAlign: 'center',
              background: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.03)',
              border: '1px solid rgba(16,185,129,0.1)',
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1.5, fontSize: '0.78rem' }}>
              Need testnet tokens?
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                size="small"
                variant="outlined"
                onClick={() => window.open('https://faucet.unlink.xyz/?referrer=luma', '_blank')}
                sx={{
                  textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderRadius: '10px',
                  borderColor: '#8b5cf625', color: '#8b5cf6',
                  '&:hover': { borderColor: '#8b5cf6', background: '#8b5cf608' },
                }}
              >
                Unlink Faucet
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => window.open('https://testnet.monad.xyz/', '_blank')}
                sx={{
                  textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderRadius: '10px',
                  borderColor: '#10b98125', color: '#10b981',
                  '&:hover': { borderColor: '#10b981', background: '#10b98108' },
                }}
              >
                MON Faucet
              </Button>
            </Stack>
          </Paper>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MonadWalletConnect;
