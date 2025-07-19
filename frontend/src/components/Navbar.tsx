import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Paper
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  Store as StoreIcon,
  Brush as BrushIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Build as BuildIcon,
  LocalDining as DiningIcon,
  Kitchen as KitchenIcon,
  Cake as CakeIcon,
  LocalPizza as PizzaIcon,
  Fastfood as FastfoodIcon,
  SetMeal as SetMealIcon,
  RestaurantMenu as MenuIcon,
  AutoAwesome as AutoIcon
} from '@mui/icons-material';
import WalletConnect from './WalletConnect';
import BNBWalletConnect from './BNBWalletConnect';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon sx={{ fontSize: 20 }} />,
      badge: null
    },
    {
      path: '/strategy-builder',
      label: 'Strategy Builder',
      icon: <KitchenIcon sx={{ fontSize: 20 }} />,
      badge: 'AI'
    },
    {
      path: '/strategy-creator',
      label: 'Create Strategy',
      icon: <MenuIcon sx={{ fontSize: 20 }} />,
      badge: 'NEW'
    },
    {
      path: '/strategy-marketplace',
      label: 'Strategy Market',
      icon: <StoreIcon sx={{ fontSize: 20 }} />,
      badge: null
    },
    {
      path: '/token-incentivization',
      label: 'Token Incentives',
      icon: <CakeIcon sx={{ fontSize: 20 }} />,
      badge: null
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar 
      position="static"
      sx={{
        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
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
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <RestaurantIcon />
              </Avatar>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                YOREE
              </Typography>
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
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    background: isActive(item.path) 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'transparent',
                    backdropFilter: isActive(item.path) ? 'blur(10px)' : 'none',
                    border: isActive(item.path) 
                      ? '1px solid rgba(255, 255, 255, 0.3)' 
                      : '1px solid transparent',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={() => setHoveredButton(item.path)}
                  onMouseLeave={() => setHoveredButton(null)}
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