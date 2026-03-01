import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Groups as CommunityIcon,
  Hub as PipelineIcon,
  Lock as UnlinkIcon,
    Menu as MenuIcon,
    Close as CloseIcon,
    Shield as ShieldIcon,
    ShieldOutlined as ShieldOutlinedIcon,
  } from '@mui/icons-material';
import { IconButton, useTheme as useMuiTheme } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactionLayer } from '../contexts/TransactionLayer';
import MonadWalletConnect from './MonadWalletConnect';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { mode, toggleMode } = useTheme();
  const { state: txState, togglePrivacy } = useTransactionLayer();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme.palette.mode === 'dark';

  const navItems = [
    { path: '/pipeline', label: 'Pipeline', icon: <PipelineIcon sx={{ fontSize: 18 }} />, badge: 'NEW' },
    { path: '/unlink', label: 'Unlink + MON', icon: <UnlinkIcon sx={{ fontSize: 18 }} />, badge: 'NEW' },
    { path: '/portfolio', label: 'Portfolio', icon: <DashboardIcon sx={{ fontSize: 18 }} />, badge: null },
    { path: '/analytics', label: 'Analytics', icon: <AnalyticsIcon sx={{ fontSize: 18 }} />, badge: null },
    { path: '/community', label: 'Community', icon: <CommunityIcon sx={{ fontSize: 18 }} />, badge: null },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: isDark
            ? 'rgba(10, 15, 30, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 0.5, minHeight: { xs: 56, md: 64 } }}>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                component={RouterLink}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  mr: { xs: 1, md: 3 },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    mr: 1.5,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 20, color: '#fff' }} />
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      letterSpacing: '-0.01em',
                      background: isDark
                        ? 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)'
                        : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.2,
                    }}
                  >
                    YOREE
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.6rem',
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      lineHeight: 1,
                    }}
                  >
                    SIGNALS MARKET
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* Desktop Nav */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexGrow: 1 }}>
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                  >
                    <Button
                      component={RouterLink}
                      to={item.path}
                      startIcon={item.icon}
                      size="small"
                      sx={{
                        position: 'relative',
                        borderRadius: '10px',
                        px: 2,
                        py: 0.8,
                        color: isActive(item.path)
                          ? '#6366f1'
                          : theme.palette.text.secondary,
                        fontWeight: isActive(item.path) ? 700 : 600,
                        textTransform: 'none',
                        fontSize: '0.82rem',
                        background: isActive(item.path)
                          ? isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)'
                          : 'transparent',
                        border: `1px solid ${isActive(item.path) ? 'rgba(99, 102, 241, 0.2)' : 'transparent'}`,
                        '&:hover': {
                          background: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)',
                          color: '#6366f1',
                        },
                        transition: 'all 0.2s ease',
                        '& .MuiButton-startIcon': {
                          marginRight: 0.5,
                        },
                      }}
                    >
                      {item.label}
                      {item.badge && (
                        <Box
                          sx={{
                            ml: 0.8,
                            px: 0.6,
                            py: 0.1,
                            borderRadius: '4px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                            fontSize: '0.55rem',
                            fontWeight: 800,
                            color: '#fff',
                            lineHeight: 1.4,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            )}

            {/* Spacer on mobile */}
            {isMobile && <Box sx={{ flexGrow: 1 }} />}

            {/* Right side */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* Theme Toggle */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <IconButton
                  onClick={toggleMode}
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    color: theme.palette.text.secondary,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    '&:hover': {
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      color: '#f59e0b',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {mode === 'dark' ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </motion.div>

              {/* Privacy Shield Toggle */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.32 }}
              >
                <Tooltip title={txState.privacyEnabled ? 'Privacy ON — Transactions routed through Unlink' : 'Privacy OFF — Click to enable Unlink shielding'}>
                  <IconButton
                    onClick={togglePrivacy}
                    size="small"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      color: txState.privacyEnabled ? '#8b5cf6' : theme.palette.text.secondary,
                      background: txState.privacyEnabled
                        ? isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)'
                        : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${txState.privacyEnabled ? 'rgba(139,92,246,0.3)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      '&:hover': {
                        background: txState.privacyEnabled
                          ? isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.12)'
                          : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        color: '#8b5cf6',
                      },
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    {txState.privacyEnabled ? <ShieldIcon sx={{ fontSize: 18 }} /> : <ShieldOutlinedIcon sx={{ fontSize: 18 }} />}
                    {txState.privacyEnabled && (
                      <Box
                        sx={{
                          position: 'absolute', top: 3, right: 3,
                          width: 6, height: 6, borderRadius: '50%',
                          background: '#8b5cf6',
                          boxShadow: '0 0 6px rgba(139,92,246,0.6)',
                        }}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              </motion.div>

              {/* On-chain badge */}
              {txState.totalRegistered > 0 && !isMobile && (
                <Chip
                  label={`⛓ ${txState.totalRegistered}`}
                  size="small"
                  sx={{
                    height: 22, fontSize: '0.62rem', fontWeight: 800,
                    background: '#10b98110', color: '#10b981',
                    border: '1px solid #10b98120',
                    cursor: 'default',
                  }}
                />
              )}

              {/* Wallet */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.35 }}
              >
                <MonadWalletConnect variant="navbar" />
              </motion.div>

              {/* Mobile menu button */}
              {isMobile && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    color: theme.palette.text.secondary,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    ml: 0.5,
                  }}
                >
                  <MenuIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: isDark
              ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
            Navigation
          </Typography>
          <IconButton onClick={() => setMobileOpen(false)} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        <Divider sx={{ opacity: 0.1 }} />
        <List sx={{ px: 1, py: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: '12px',
                  py: 1.2,
                  background: isActive(item.path)
                    ? isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)'
                    : 'transparent',
                  '&:hover': { background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? '#6366f1' : theme.palette.text.secondary }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 700 : 600,
                    fontSize: '0.88rem',
                    color: isActive(item.path) ? '#6366f1' : theme.palette.text.primary,
                  }}
                />
                {item.badge && (
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.2,
                      borderRadius: '5px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: '#fff',
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
