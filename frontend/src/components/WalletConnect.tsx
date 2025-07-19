import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Box, 
  Typography, 
  Chip, 
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
  Divider,
  Paper
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AccountBalanceWallet as WalletIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const WalletConnect: React.FC = () => {
  const { publicKey, connected, select, wallet } = useWallet();
  const [open, setOpen] = useState(false);

  const topSolanaWallets = [
    {
      name: 'Phantom',
      description: 'Connect to trade tokenized strategies',
      icon: '👻',
      color: '#AB9DF2',
      gradient: 'linear-gradient(45deg, #AB9DF2 30%, #8B7FD9 90%)',
      installUrl: 'https://phantom.app/',
      connectUrl: 'https://phantom.app/',
      isInstalled: true
    },
    {
      name: 'Solflare',
      description: 'Professional trading for strategy tokens',
      icon: '🔥',
      color: '#FF6B35',
      gradient: 'linear-gradient(45deg, #FF6B35 30%, #E55A2B 90%)',
      installUrl: 'https://solflare.com/',
      connectUrl: 'https://solflare.com/',
      isInstalled: true
    },
    {
      name: 'Backpack',
      description: 'Next-gen wallet for strategy trading',
      icon: '🎒',
      color: '#00D4AA',
      gradient: 'linear-gradient(45deg, #00D4AA 30%, #00B894 90%)',
      installUrl: 'https://backpack.app/',
      connectUrl: 'https://backpack.app/',
      isInstalled: true
    }
  ];

  const handleWalletSelect = (wallet: any) => {
    // Navigate to the wallet's website
    window.open(wallet.connectUrl, '_blank');
    setOpen(false);
  };

  const handleInstallWallet = (installUrl: string) => {
    window.open(installUrl, '_blank');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {connected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label="Connected" 
              color="success" 
              size="small"
              sx={{ 
                fontFamily: '"Noto Sans KR", sans-serif',
                background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                color: 'white'
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: '"Noto Sans KR", sans-serif',
                color: 'white',
                fontWeight: 600
              }}
            >
              {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
            </Typography>
          </Box>
        </motion.div>
      ) : (
        <>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              startIcon={<WalletIcon />}
              sx={{
                borderRadius: '12px',
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 600,
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease'
              }}
              onClick={() => setOpen(true)}
            >
              Connect Wallet
            </Button>
          </motion.div>

          {/* Wallet Selection Dialog */}
          <Dialog 
            open={open} 
            onClose={() => setOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <DialogTitle
              sx={{
                textAlign: 'center',
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: 800,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                pb: 1
              }}
            >
              Connect to Trade Strategies
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 3,
                  fontFamily: '"Noto Sans KR", sans-serif'
                }}
              >
                Choose your wallet to start trading tokenized AI strategies on Solana
              </Typography>
              
              <List sx={{ p: 0 }}>
                {topSolanaWallets.map((wallet, index) => (
                  <motion.div
                    key={wallet.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        mb: 2,
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <ListItem 
                        disablePadding
                        sx={{ p: 0 }}
                      >
                        <ListItemButton
                          onClick={() => handleWalletSelect(wallet)}
                          sx={{
                            p: 3,
                            '&:hover': {
                              background: 'rgba(102, 126, 234, 0.05)'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 50 }}>
                            <Avatar
                              sx={{
                                width: 50,
                                height: 50,
                                background: wallet.gradient,
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {wallet.icon}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: '"Noto Sans KR", sans-serif',
                                  fontWeight: 700,
                                  color: 'text.primary'
                                }}
                              >
                                {wallet.name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                              >
                                {wallet.description}
                              </Typography>
                            }
                          />
                          {wallet.isInstalled ? (
                            <CheckCircleIcon 
                              sx={{ 
                                color: '#4CAF50',
                                fontSize: 24
                              }} 
                            />
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInstallWallet(wallet.installUrl);
                              }}
                              sx={{
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                px: 2,
                                py: 0.5,
                                borderColor: wallet.color,
                                color: wallet.color,
                                '&:hover': {
                                  background: `${wallet.color}10`,
                                  borderColor: wallet.color
                                }
                              }}
                            >
                              Install
                            </Button>
                          )}
                        </ListItemButton>
                      </ListItem>
                    </Paper>
                  </motion.div>
                ))}
              </List>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                >
                  Don't have a wallet? 
                  <Button
                    variant="text"
                    size="small"
                    sx={{
                      ml: 1,
                      color: '#667eea',
                      fontFamily: '"Noto Sans KR", sans-serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.1)'
                      }
                    }}
                    onClick={() => window.open('https://phantom.app/', '_blank')}
                  >
                    Learn more
                  </Button>
                </Typography>
              </Box>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default WalletConnect; 