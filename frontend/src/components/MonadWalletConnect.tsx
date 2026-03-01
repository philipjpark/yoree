import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
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
  Divider,
  LinearProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
  AccountBalanceWallet as WalletIcon,
  Lock as LockIcon,
  Hub as HubIcon,
  Verified as VerifiedIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Close as CloseIcon,
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
    { name: 'MetaMask', description: 'Most popular browser wallet', icon: '🦊', color: '#F6851B', gradient: 'linear-gradient(135deg, #F6851B 0%, #E2761B 100%)', installUrl: 'https://metamask.io/' },
    { name: 'Phantom', description: 'Multi-chain wallet', icon: '👻', color: '#AB9FF2', gradient: 'linear-gradient(135deg, #AB9FF2 0%, #7B61FF 100%)', installUrl: 'https://phantom.app/' },
    { name: 'WalletConnect', description: 'Scan with any wallet', icon: '🔗', color: '#3B99FC', gradient: 'linear-gradient(135deg, #3B99FC 0%, #2E7DD2 100%)', installUrl: 'https://walletconnect.com/' },
  ];

  const handleWalletSelect = async (walletName?: string) => {
    // Disabled automatic connection - user must manually connect via wallet extension
    // This prevents automatic MetaMask popup when clicking wallet options
    if (walletName === 'MetaMask' && window.ethereum) {
      // Just open MetaMask extension page or do nothing
      console.log('MetaMask detected. Please connect manually via the extension.');
      return;
    }
    // For other wallets, just show install links or do nothing
    console.log(`Please connect ${walletName || 'your wallet'} manually.`);
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
    borderRadius: '24px',
    background: isDark
      ? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)'
      : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
    backdropFilter: 'blur(24px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    boxShadow: isDark
      ? '0 24px 48px rgba(0,0,0,0.5)'
      : '0 24px 48px rgba(0,0,0,0.12)',
    overflow: 'hidden',
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
          <DialogContent sx={{ p: 0 }}>
            {/* Header */}
            <Box sx={{
              p: 3, pb: 2,
              background: isDark
                ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.06) 100%)'
                : 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(99,102,241,0.04) 100%)',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
                  }}>
                    <WalletIcon sx={{ fontSize: 20, color: '#fff' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2, fontSize: '1rem' }}>
                      Your Wallet
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.68rem' }}>
                        Connected
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
                <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: theme.palette.text.secondary }}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Box>

            <Stack spacing={2} sx={{ p: 3 }}>
              {/* Address */}
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: '14px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  ADDRESS
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all', color: theme.palette.text.primary, fontSize: '0.76rem' }}>
                    {walletState.address}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                    <IconButton size="small" onClick={handleCopyAddress} sx={{ width: 26, height: 26 }}>
                      <CopyIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View on explorer">
                    <IconButton size="small" onClick={() => window.open(monadService.getExplorerAddressUrl(walletState.address), '_blank')} sx={{ width: 26, height: 26 }}>
                      <OpenInNewIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>

              {/* Balance + Unlink side by side */}
              <Stack direction="row" spacing={1.5}>
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1, p: 2, borderRadius: '14px', textAlign: 'center',
                    background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                    border: '1px solid rgba(16,185,129,0.12)',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', fontSize: '1.8rem', lineHeight: 1.2 }}>
                    {parseFloat(walletState.balance).toFixed(3)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem', fontWeight: 600 }}>
                    MON Balance
                  </Typography>
                </Paper>

                {unlinkService.isInitialized() && (
                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1, p: 2, borderRadius: '14px', textAlign: 'center',
                      background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
                      border: '1px solid rgba(139,92,246,0.12)',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center" sx={{ mb: 0.5 }}>
                      <ShieldIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.72rem' }}>
                        Private Layer
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: theme.palette.text.secondary, fontSize: '0.65rem', display: 'block' }}>
                      {unlinkService.getAccount()?.address ? shortenAddress(unlinkService.getAccount()!.address) : 'Ready'}
                    </Typography>
                    <Chip
                      label="Unlink Active"
                      size="small"
                      sx={{
                        mt: 0.5, height: 18, fontSize: '0.55rem', fontWeight: 700,
                        background: '#8b5cf610', color: '#8b5cf6', border: '1px solid #8b5cf620',
                      }}
                    />
                  </Paper>
                )}
              </Stack>

              {/* Infrastructure badges */}
              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                <Chip
                  label="Monad Testnet"
                  size="small"
                  icon={<HubIcon sx={{ fontSize: '12px !important', color: '#10b981 !important' }} />}
                  sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, background: '#10b98110', color: '#10b981', border: '1px solid #10b98120' }}
                />
                <Chip label={`Chain ${MONAD_TESTNET_CONFIG.chainId}`} size="small"
                  sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
                />
                <Chip label="400ms Blocks" size="small"
                  icon={<SpeedIcon sx={{ fontSize: '11px !important' }} />}
                  sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
                />
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => window.open(MONAD_TESTNET_CONFIG.blockExplorerUrls[0], '_blank')}
                  endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    textTransform: 'none', fontWeight: 700, borderRadius: '12px', fontSize: '0.8rem',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    color: theme.palette.text.secondary,
                    '&:hover': { borderColor: '#10b98150', background: '#10b98108', color: '#10b981' },
                  }}
                >
                  Explorer
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => { handleDisconnect(); setOpen(false); }}
                  sx={{
                    textTransform: 'none', fontWeight: 700, borderRadius: '12px', fontSize: '0.8rem',
                    borderColor: '#ef444420', color: '#ef4444',
                    '&:hover': { borderColor: '#ef4444', background: '#ef444406' },
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
        <DialogContent sx={{ p: 0 }}>
          {/* ── Hero header ── */}
          <Box sx={{
            p: 4, pb: 3, textAlign: 'center',
            background: isDark
              ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.06) 100%)'
              : 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(16,185,129,0.04) 100%)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
          }}>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: '16px', mx: 'auto', mb: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
              }}>
                <WalletIcon sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
            </motion.div>

            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 0.5, fontSize: '1.15rem' }}>
              Connect to Yoree
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.82rem', maxWidth: 340, mx: 'auto' }}>
              Link your wallet to verify signals on-chain, execute trades, and unlock privacy routing
            </Typography>
          </Box>

          {/* ── Infrastructure badges ── */}
          <Box sx={{ px: 3, py: 2 }}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2.5 }}>
              {[
                { icon: <HubIcon sx={{ fontSize: 14 }} />, label: 'Monad', sub: '400ms finality', color: '#10b981' },
                { icon: <ShieldIcon sx={{ fontSize: 14 }} />, label: 'Unlink', sub: 'ZK privacy', color: '#8b5cf6' },
                { icon: <VerifiedIcon sx={{ fontSize: 14 }} />, label: 'On-chain', sub: 'Signal registry', color: '#6366f1' },
              ].map((item) => (
                <Paper
                  key={item.label}
                  elevation={0}
                  sx={{
                    flex: 1, p: 1.5, borderRadius: '12px', textAlign: 'center',
                    background: `${item.color}06`,
                    border: `1px solid ${item.color}15`,
                    transition: 'all 0.2s ease',
                    '&:hover': { border: `1px solid ${item.color}30`, background: `${item.color}08` },
                  }}
                >
                  <Box sx={{ color: item.color, mb: 0.3 }}>{item.icon}</Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: item.color, fontSize: '0.68rem', display: 'block', lineHeight: 1.2 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.55rem', display: 'block' }}>
                    {item.sub}
                  </Typography>
                </Paper>
              ))}
            </Stack>

            <Divider sx={{ mb: 2.5, borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />

            {/* ── Wallet options ── */}
            <Typography variant="overline" sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.1em', fontSize: '0.6rem', display: 'block', mb: 1.5, textAlign: 'center' }}>
              CHOOSE WALLET
            </Typography>

            {isConnecting && (
              <LinearProgress sx={{
                mb: 2, borderRadius: 4, height: 3,
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' },
              }} />
            )}

            <List sx={{ p: 0 }}>
              {wallets.map((wallet, index) => (
                <motion.div
                  key={wallet.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 + index * 0.08 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      mb: 1, borderRadius: '12px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: `${wallet.color}40`,
                        background: `${wallet.color}05`,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 16px ${wallet.color}10`,
                      },
                    }}
                  >
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => handleWalletSelect(wallet.name)}
                        disabled={isConnecting}
                        sx={{ px: 2, py: 1.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 44 }}>
                          <Avatar
                            sx={{
                              width: 36, height: 36,
                              background: wallet.gradient,
                              fontSize: '1.1rem',
                            }}
                          >
                            {wallet.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.85rem' }}>
                              {wallet.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.68rem' }}>
                              {wallet.description}
                            </Typography>
                          }
                        />
                        <Box sx={{
                          width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          transition: 'all 0.2s',
                        }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: 'transparent' }} />
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  </Paper>
                </motion.div>
              ))}
            </List>

            {/* ── Faucets – collapsed into subtle footer ── */}
            <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 2, mb: 1 }}>
              <Chip
                label="Need MON?"
                size="small"
                onClick={() => window.open('https://testnet.monad.xyz/', '_blank')}
                sx={{
                  height: 22, fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
                  background: '#10b98108', color: '#10b981', border: '1px solid #10b98115',
                  '&:hover': { background: '#10b98112' },
                }}
              />
              <Chip
                label="Unlink + MON"
                size="small"
                icon={<LockIcon sx={{ fontSize: '10px !important', color: '#8b5cf6 !important' }} />}
                onClick={() => window.open('https://faucet.unlink.xyz/?referrer=luma', '_blank')}
                sx={{
                  height: 22, fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
                  background: '#8b5cf608', color: '#8b5cf6', border: '1px solid #8b5cf615',
                  '&:hover': { background: '#8b5cf612' },
                }}
              />
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MonadWalletConnect;
