/**
 * PreFlightOverlay
 *
 * Animated overlay shown during execution routing:
 *   1. Privacy routing via Unlink (if enabled)
 *   2. On-chain registration on Monad
 *   3. Platform routing
 *
 * Rendered at the App level — visible across all pages.
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  Backdrop,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield as ShieldIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Hub as HubIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material';
import { useTransactionLayer } from '../contexts/TransactionLayer';

const phaseConfig: Record<string, { icon: React.ReactNode; color: string; pulseColor: string }> = {
  'idle': { icon: <HubIcon />, color: '#6366f1', pulseColor: 'rgba(99,102,241,0.3)' },
  'privacy-routing': { icon: <ShieldIcon />, color: '#8b5cf6', pulseColor: 'rgba(139,92,246,0.3)' },
  'registering': { icon: <HubIcon />, color: '#10b981', pulseColor: 'rgba(16,185,129,0.3)' },
  'routing-to-platform': { icon: <RocketIcon />, color: '#f59e0b', pulseColor: 'rgba(245,158,11,0.3)' },
  'complete': { icon: <CheckIcon />, color: '#10b981', pulseColor: 'rgba(16,185,129,0.3)' },
  'error': { icon: <ErrorIcon />, color: '#ef4444', pulseColor: 'rgba(239,68,68,0.3)' },
};

const PreFlightOverlay: React.FC = () => {
  const { state, dismissPreFlight } = useTransactionLayer();
  const { preFlight } = state;
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';

  const config = phaseConfig[preFlight.phase] || phaseConfig['idle'];

  return (
    <AnimatePresence>
      {preFlight.isActive && (
        <Backdrop
          open
          sx={{
            zIndex: 9999,
            backdropFilter: 'blur(12px)',
            background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Paper
              elevation={0}
              sx={{
                width: { xs: '90vw', sm: 440 },
                p: 4,
                borderRadius: '24px',
                background: isDark
                  ? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
                border: `1px solid ${config.color}30`,
                boxShadow: `0 32px 64px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'}, 0 0 80px ${config.pulseColor}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top accent line */}
              <Box
                sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${config.color}, ${config.color}60, transparent)`,
                }}
              />

              {/* Close button (only when complete or error) */}
              {(preFlight.phase === 'complete' || preFlight.phase === 'error') && (
                <IconButton
                  onClick={dismissPreFlight}
                  size="small"
                  sx={{ position: 'absolute', top: 12, right: 12, color: theme.palette.text.secondary }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}

              {/* Animated icon */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <motion.div
                  animate={
                    preFlight.phase === 'complete' || preFlight.phase === 'error'
                      ? { scale: [1, 1.1, 1] }
                      : { scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }
                  }
                  transition={
                    preFlight.phase === 'complete' || preFlight.phase === 'error'
                      ? { duration: 0.4 }
                      : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  <Box
                    sx={{
                      width: 72, height: 72, borderRadius: '20px', mx: 'auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${config.color}15`,
                      border: `2px solid ${config.color}30`,
                      boxShadow: `0 8px 32px ${config.pulseColor}`,
                      color: config.color,
                      '& .MuiSvgIcon-root': { fontSize: 36 },
                    }}
                  >
                    {config.icon}
                  </Box>
                </motion.div>
              </Box>

              {/* Message */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  textAlign: 'center',
                  mb: 0.5,
                  fontSize: '1.05rem',
                }}
              >
                {preFlight.message}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  textAlign: 'center',
                  mb: 2.5,
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                }}
              >
                {preFlight.detail}
              </Typography>

              {/* Progress bar */}
              {preFlight.phase !== 'complete' && preFlight.phase !== 'error' && (
                <LinearProgress
                  variant={preFlight.progress > 0 ? 'determinate' : 'indeterminate'}
                  value={preFlight.progress}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    mb: 2.5,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${config.color}, ${config.color}AA)`,
                      borderRadius: 2,
                    },
                  }}
                />
              )}

              {/* Status chips */}
              <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" sx={{ gap: 0.5, mb: 2 }}>
                {preFlight.isPrivate && (
                  <Chip
                    icon={<LockIcon sx={{ fontSize: 12 }} />}
                    label="Private"
                    size="small"
                    sx={{
                      height: 24, fontSize: '0.65rem', fontWeight: 700,
                      background: '#8b5cf615', color: '#8b5cf6',
                      border: '1px solid #8b5cf625',
                      '& .MuiChip-icon': { color: '#8b5cf6' },
                    }}
                  />
                )}
                {preFlight.txHash && (
                  <Chip
                    label={`TX: ${preFlight.txHash.slice(0, 10)}...`}
                    size="small"
                    onClick={() => preFlight.explorerUrl && window.open(preFlight.explorerUrl, '_blank')}
                    sx={{
                      height: 24, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                      background: '#10b98115', color: '#10b981',
                      border: '1px solid #10b98125',
                    }}
                  />
                )}
                {preFlight.targetPlatform && (
                  <Chip
                    label={preFlight.targetPlatform}
                    size="small"
                    sx={{
                      height: 24, fontSize: '0.65rem', fontWeight: 700,
                      background: '#f59e0b15', color: '#f59e0b',
                      border: '1px solid #f59e0b25',
                    }}
                  />
                )}
              </Stack>

              {/* Pipeline phases */}
              <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mb: 2 }}>
                {[
                  { label: 'Privacy', done: ['registering', 'routing-to-platform', 'complete'].includes(preFlight.phase), active: preFlight.phase === 'privacy-routing' && preFlight.isPrivate, skipped: !preFlight.isPrivate },
                  { label: 'Register', done: ['routing-to-platform', 'complete'].includes(preFlight.phase), active: preFlight.phase === 'registering' },
                  { label: 'Route', done: preFlight.phase === 'complete', active: preFlight.phase === 'routing-to-platform' },
                ].map((step, i) => (
                  <React.Fragment key={step.label}>
                    {i > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary, fontSize: 10 }}>→</Box>
                    )}
                    <Chip
                      label={step.label}
                      size="small"
                      sx={{
                        height: 22, fontSize: '0.6rem', fontWeight: 700,
                        background: step.done ? '#10b98118'
                          : step.active ? `${config.color}18`
                          : step.skipped ? `${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`
                          : 'transparent',
                        color: step.done ? '#10b981'
                          : step.active ? config.color
                          : step.skipped ? theme.palette.text.disabled
                          : theme.palette.text.secondary,
                        border: `1px solid ${
                          step.done ? '#10b98130'
                          : step.active ? `${config.color}40`
                          : 'transparent'
                        }`,
                        textDecoration: step.skipped ? 'line-through' : 'none',
                      }}
                    />
                  </React.Fragment>
                ))}
              </Stack>

              {/* Actions (on complete) */}
              {preFlight.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Stack direction="row" spacing={1.5} justifyContent="center">
                    {preFlight.explorerUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open(preFlight.explorerUrl, '_blank')}
                        startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: '10px',
                          borderColor: '#10b98130', color: '#10b981',
                          '&:hover': { borderColor: '#10b981', background: '#10b98108' },
                        }}
                      >
                        Monadscan
                      </Button>
                    )}
                    {preFlight.targetUrl && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => window.open(preFlight.targetUrl, '_blank')}
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: '10px',
                          background: `linear-gradient(135deg, ${config.color}, ${config.color}CC)`,
                          '&:hover': { boxShadow: `0 8px 24px ${config.pulseColor}` },
                        }}
                      >
                        {preFlight.targetPlatform || 'Open Platform'}
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="text"
                      onClick={dismissPreFlight}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, borderRadius: '10px' }}
                    >
                      Done
                    </Button>
                  </Stack>
                </motion.div>
              )}

              {/* Error actions */}
              {preFlight.phase === 'error' && (
                <Stack direction="row" spacing={1.5} justifyContent="center">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={dismissPreFlight}
                    sx={{
                      textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: '10px',
                      borderColor: '#ef444430', color: '#ef4444',
                      '&:hover': { borderColor: '#ef4444', background: '#ef444408' },
                    }}
                  >
                    Dismiss
                  </Button>
                </Stack>
              )}
            </Paper>
          </motion.div>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

export default PreFlightOverlay;
