import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AccountBalanceWallet as WalletIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import bnbService from '../services/bnbService';

interface BNBWalletConnectProps {
  onConnect?: (address: string) => void;
  onClose?: () => void;
  variant?: 'default' | 'navbar';
}

const BNBWalletConnect: React.FC<BNBWalletConnectProps> = ({ onConnect, onClose, variant }) => {
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const topBNBWallets = [
    {
      name: 'MetaMask',
      description: 'Most popular Web3 wallet for BNB Chain',
      icon: '🦊',
      color: '#F6851B',
      gradient: 'linear-gradient(45deg, #F6851B 30%, #E2761B 90%)',
      installUrl: 'https://metamask.io/',
      isInstalled: true
    },
    {
      name: 'WalletConnect',
      description: 'Connect any wallet to BNB Chain',
      icon: '🔗',
      color: '#3B99FC',
      gradient: 'linear-gradient(45deg, #3B99FC 30%, #2E7DD2 90%)',
      installUrl: 'https://walletconnect.com/',
      isInstalled: true
    },
    {
      name: 'Trust Wallet',
      description: 'Binance\'s official mobile wallet',
      icon: '🛡️',
      color: '#3375BB',
      gradient: 'linear-gradient(45deg, #3375BB 30%, #2A5F9E 90%)',
      installUrl: 'https://trustwallet.com/',
      isInstalled: true
    }
  ];

  const handleWalletSelect = async (wallet: any) => {
    setIsConnecting(true);
    try {
      const address = await bnbService.connectWallet();
      if (onConnect) {
        onConnect(address);
      }
      setOpen(false);
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      // If MetaMask is not installed, redirect to install page
      if (wallet.name === 'MetaMask' && error.message.includes('MetaMask not detected')) {
        window.open(wallet.installUrl, '_blank');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInstallWallet = (installUrl: string) => {
    window.open(installUrl, '_blank');
  };

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  return (
    <Box>
      <Button
        variant="contained"
        size={variant === 'navbar' ? "medium" : "large"}
        data-wallet-connect
        sx={{
          bgcolor: variant === 'navbar' ? 'rgba(255, 255, 255, 0.2)' : 'white',
          color: variant === 'navbar' ? 'white' : 'primary.main',
          px: variant === 'navbar' ? 3 : 4,
          py: variant === 'navbar' ? 1 : 1.5,
          borderRadius: variant === 'navbar' ? '12px' : '25px',
          fontSize: variant === 'navbar' ? '0.95rem' : '1.1rem',
          fontWeight: 600,
          backdropFilter: variant === 'navbar' ? 'blur(10px)' : 'none',
          border: variant === 'navbar' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
          '&:hover': {
            bgcolor: variant === 'navbar' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255,255,255,0.9)',
            transform: variant === 'navbar' ? 'translateY(-1px)' : 'translateY(-2px)',
            boxShadow: variant === 'navbar' ? '0 4px 12px rgba(0,0,0,0.15)' : '0 8px 25px rgba(0,0,0,0.2)',
            border: variant === 'navbar' ? '1px solid rgba(255, 255, 255, 0.5)' : 'none'
          },
          transition: 'all 0.3s ease'
        }}
        onClick={openDialog}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      {/* Wallet Selection Dialog */}
      <Dialog 
        open={open} 
        onClose={closeDialog}
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
          Connect to BNB Chain
        </DialogTitle>
        
        <DialogContent>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              textAlign: 'center', 
              mb: 3,
              fontFamily: '"Noto Sans KR", sans-serif'
            }}
          >
            Choose your wallet to start trading PYUSD on BNB Chain
          </Typography>
          
          <List sx={{ p: 0 }}>
            {topBNBWallets.map((wallet, index) => (
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
                      disabled={isConnecting}
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
                onClick={() => window.open('https://metamask.io/', '_blank')}
              >
                Learn more
              </Button>
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BNBWalletConnect; 