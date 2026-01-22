import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  Avatar
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  AddCircle as AddCircleIcon,
  Analytics as AnalyticsIcon,
  DataObject as DataObjectIcon,
  AccountBalance as ExchangeIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Groups as CommunityIcon
} from '@mui/icons-material';
import { IconButton, useTheme as useMuiTheme } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import BNBWalletConnect from './BNBWalletConnect';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { mode, toggleMode } = useTheme();
  const theme = useMuiTheme();

  const navItems = [
    {
      path: '/signal-markets',
      label: 'Markets',
      icon: <ExchangeIcon sx={{ fontSize: 20 }} />,
      badge: null
    },
    {
      path: '/create-signal',
      label: 'Create Signal',
      icon: <AddCircleIcon sx={{ fontSize: 20 }} />,
      badge: null
    },
    {
      path: '/portfolio',
      label: 'Portfolio',
      icon: <DashboardIcon sx={{ fontSize: 20 }} />,
      badge: null
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: <AnalyticsIcon sx={{ fontSize: 20 }} />,
      badge: null
    },
    {
      path: '/data-feeds',
      label: 'Data Feeds',
      icon: <DataObjectIcon sx={{ fontSize: 20 }} />,
      badge: null
    },
    {
      path: '/community',
      label: 'Community',
      icon: <CommunityIcon sx={{ fontSize: 20 }} />,
      badge: null
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar 
      position="static"
      sx={{
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: theme.palette.mode === 'dark'
          ? '1px solid rgba(102, 126, 234, 0.2)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: 4
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  mr: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 800,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #ffffff 0%, #E2E8F0 100%)'
                      : 'linear-gradient(45deg, #2C3E50 0%, #34495e 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                    fontSize: '1.1rem'
                  }}
                >
                  YOREE SIGNALS MARKET
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.65rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 500,
                    letterSpacing: '0.5px'
                  }}
                >
                  The Intelligence Exchange
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Navigation Items */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1 }}>
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Button
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    position: 'relative',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    background: isActive(item.path) 
                      ? 'rgba(102, 126, 234, 0.2)' 
                      : 'transparent',
                    backdropFilter: isActive(item.path) ? 'blur(10px)' : 'none',
                    border: isActive(item.path) 
                      ? '1px solid rgba(102, 126, 234, 0.4)' 
                      : '1px solid transparent',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.label}
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        ml: 1,
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        background: item.badge === 'NEW' 
                          ? 'linear-gradient(45deg, #ff6b6b 30%, #ff8e8e 90%)'
                          : 'linear-gradient(45deg, #4facfe 30%, #00f2fe 90%)',
                        color: 'white',
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                  )}
                </Button>
              </motion.div>
            ))}
          </Box>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <IconButton
              onClick={toggleMode}
              sx={{
                color: mode === 'dark' 
                  ? theme.palette.text.primary 
                  : '#2C3E50', // Darker color for moon icon in light mode
                mr: 2,
                backgroundColor: mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  background: mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </motion.div>

          {/* Wallet Connect */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <BNBWalletConnect variant="navbar" />
          </motion.div>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 