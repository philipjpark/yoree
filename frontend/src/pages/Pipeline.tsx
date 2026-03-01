import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Chip,
  Avatar,
  TextField,
  Paper,
  Switch,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  Fade,
  Collapse,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Psychology as AIIcon,
  Hub as HubIcon,
  AccountBalance as BrokerageIcon,
  Share as SocialIcon,
  Lock as LockIcon,
  FlashOn as FlashIcon,
  CheckCircle as CheckIcon,
  Send as SendIcon,
  Speed as SpeedIcon,
  OpenInNew as OpenInNewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Bolt as BoltIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DataObject as DataIcon,
  Casino as CasinoIcon,
  SportsFootball as SportsIcon,
  ShowChart as ChartIcon,
  CurrencyBitcoin as CryptoIcon,
  Gavel as GavelIcon,
  AddCircle as AddCircleIcon,
  AutoAwesome as SparkleIcon,
  AccountBalanceWallet as WalletIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactionLayer } from '../contexts/TransactionLayer';
import { useNavigate } from 'react-router-dom';
import pipelineService, {
  SocialPlatform,
  AIModel,
  BrokerageId,
  PipelineSignal,
  DiscoveredAsset,
  PipelineStep,
  PLATFORM_DIRECTORY,
  DATA_APIS,
} from '../services/pipelineService';
import monadService from '../services/monadService';
import monadContractService from '../services/monadContractService';

const categoryIcons: Record<string, React.ReactNode> = {
  'Predictions': <CasinoIcon sx={{ fontSize: 16 }} />,
  'Sports Bets': <SportsIcon sx={{ fontSize: 16 }} />,
  'Crypto': <CryptoIcon sx={{ fontSize: 16 }} />,
  'Stocks': <ChartIcon sx={{ fontSize: 16 }} />,
  'DeFi': <BoltIcon sx={{ fontSize: 16 }} />,
  'Private': <LockIcon sx={{ fontSize: 16 }} />,
  'L1 Chain': <HubIcon sx={{ fontSize: 16 }} />,
  'Futures': <TrendingUpIcon sx={{ fontSize: 16 }} />,
  'Forex': <GavelIcon sx={{ fontSize: 16 }} />,
};

const categoryColors: Record<string, string> = {
  'Predictions': '#8b5cf6',
  'Sports Bets': '#10b981',
  'Crypto': '#f59e0b',
  'Stocks': '#3b82f6',
  'DeFi': '#6366f1',
  'Private': '#a855f7',
  'L1 Chain': '#06b6d4',
  'Futures': '#ef4444',
  'Forex': '#ec4899',
};

const Pipeline: React.FC = () => {
  const { theme } = useTheme();
  const { state: txState, registerSignal: registerOnChain, executeWithPreFlight } = useTransactionLayer();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [socialConnections, setSocialConnections] = useState(pipelineService.getSocialConnections());
  const [aiModels, setAIModels] = useState(pipelineService.getAIModels());
  const [brokerages, setBrokerages] = useState(pipelineService.getBrokerages());
  const [stats, setStats] = useState(pipelineService.getStats());
  const [recentSignals, setRecentSignals] = useState<PipelineSignal[]>([]);
  const [signalInput, setSignalInput] = useState('');
  const [selectedSource, setSelectedSource] = useState<SocialPlatform>('x');
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showAPIs, setShowAPIs] = useState(false);
  const [activeSignal, setActiveSignal] = useState<PipelineSignal | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdSignalId, setCreatedSignalId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  // On-chain registration state
  const [onChainResult, setOnChainResult] = useState<{ txHash: string; signalId: number; explorerUrl: string } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  // "Others" manual source dialog
  const [showOtherDialog, setShowOtherDialog] = useState(false);
  const [otherSourceName, setOtherSourceName] = useState('');
  const [otherSourceUrl, setOtherSourceUrl] = useState('');
  const [otherSourceContent, setOtherSourceContent] = useState('');

  useEffect(() => {
    const ws = monadService.getWalletState();
    setWalletConnected(ws.isConnected);
    if (ws.isConnected) {
      pipelineService.markUnlinkConnected(true);
      setBrokerages(pipelineService.getBrokerages());
      setStats(pipelineService.getStats());
    }
  }, []);

  // Register step update callback for real-time animation
  useEffect(() => {
    pipelineService.setStepUpdateCallback((signal) => {
      setActiveSignal({ ...signal });
    });
    return () => pipelineService.clearStepUpdateCallback();
  }, []);

  const handleConnectSocial = (platform: SocialPlatform) => {
    if (platform === 'other') {
      setShowOtherDialog(true);
      return;
    }
    pipelineService.connectSocial(platform, `demo_${platform}`);
    setSocialConnections(pipelineService.getSocialConnections());
    setStats(pipelineService.getStats());
  };

  const handleOtherSourceSubmit = () => {
    if (otherSourceName.trim()) {
      pipelineService.connectOtherSource(otherSourceName, otherSourceUrl);
      if (otherSourceContent.trim()) {
        setSignalInput(otherSourceContent);
        setSelectedSource('other');
      }
      setSocialConnections(pipelineService.getSocialConnections());
      setStats(pipelineService.getStats());
      setShowOtherDialog(false);
      setOtherSourceName('');
      setOtherSourceUrl('');
      setOtherSourceContent('');
    }
  };

  const handleToggleAI = (modelId: AIModel, active: boolean) => {
    pipelineService.toggleAIModel(modelId, active);
    setAIModels(pipelineService.getAIModels());
    setStats(pipelineService.getStats());
  };

  const handleConnectBrokerage = (id: BrokerageId) => {
    if (id === 'unlink-private') {
      navigate('/unlink');
      return;
    }
    pipelineService.connectBrokerage(id);
    setBrokerages(pipelineService.getBrokerages());
    setStats(pipelineService.getStats());
  };

  const handleProcessSignal = async () => {
    if (!signalInput.trim()) return;
    setIsProcessing(true);
    setActiveSignal(null);
    setCreatedSignalId(null);
    setStreamingText('');
    setIsStreaming(true);

    // Simulate streaming hypothesis text
    const input = signalInput;
    
    try {
      const result = await pipelineService.processSignal(selectedSource, input);
      setRecentSignals(pipelineService.getRecentSignals());
      setStats(pipelineService.getStats());
      setActiveSignal(result);

      // Stream the hypothesis text character by character for dynamism
      setStreamingText('');
      const hypothesis = result.hypothesis;
      for (let i = 0; i < hypothesis.length; i++) {
        await new Promise(r => setTimeout(r, 12));
        setStreamingText(prev => prev + hypothesis[i]);
      }
      setIsStreaming(false);

      // Auto-register on Monad (silently, in background)
      setOnChainResult(null);
      try {
        const chainResult = await registerOnChain({
          hypothesis: result.hypothesis,
          quality: result.confidence,
          sentiment: result.sentiment || 'neutral',
          assetCount: result.discoveredAssets.length,
          source: 'pipeline',
          timestamp: result.timestamp,
        });
        setOnChainResult({
          txHash: chainResult.txHash,
          signalId: chainResult.signalId,
          explorerUrl: chainResult.explorerUrl,
        });
      } catch {
        // Non-critical: on-chain registration is optional
      }

      setSignalInput('');
    } catch (err) {
      console.error('Pipeline error:', err);
      setIsStreaming(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSignal = async () => {
    if (!activeSignal) return;
    const created = pipelineService.createSignalFromPipeline(activeSignal);
    setCreatedSignalId(created.id);

    // Auto-register on Monad (on-chain)
    setIsRegistering(true);
    try {
      const result = await registerOnChain({
        hypothesis: activeSignal.hypothesis,
        quality: activeSignal.confidence,
        sentiment: activeSignal.sentiment || 'neutral',
        assetCount: activeSignal.discoveredAssets.length,
        source: 'pipeline',
        timestamp: activeSignal.timestamp,
      });
      setOnChainResult({
        txHash: result.txHash,
        signalId: result.signalId,
        explorerUrl: result.explorerUrl,
      });
    } catch (err) {
      console.warn('On-chain registration skipped:', err);
    } finally {
      setIsRegistering(false);
    }

    setShowCreateDialog(true);
  };

  // Group platforms by category for directory
  const platformsByCategory: Record<string, typeof PLATFORM_DIRECTORY[string][]> = {};
  for (const [, platform] of Object.entries(PLATFORM_DIRECTORY)) {
    if (!platformsByCategory[platform.category]) platformsByCategory[platform.category] = [];
    platformsByCategory[platform.category].push(platform);
  }

  const glassCard = (children: React.ReactNode, accent: string) => (
    <Card
      sx={{
        height: '100%',
        background: isDark
          ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)'
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        borderRadius: '20px',
        overflow: 'visible',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          border: `1px solid ${accent}40`,
          boxShadow: `0 20px 60px ${accent}15`,
          transform: 'translateY(-2px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${accent}, ${accent}60, transparent)`,
          borderRadius: '20px 20px 0 0',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  );

  // ─── Pipeline Step Progress Component ───
  const PipelineStepProgress = ({ steps }: { steps: PipelineStep[] }) => (
    <Stack spacing={1} sx={{ mt: 2 }}>
      {steps.map((step, idx) => (
        <motion.div
          key={step.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step.status === 'completed' ? '#10b98115'
                : step.status === 'running' ? '#f59e0b15'
                : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${
                step.status === 'completed' ? '#10b98130'
                : step.status === 'running' ? '#f59e0b30'
                : 'transparent'
              }`,
            }}>
              {step.status === 'completed' ? (
                <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} />
              ) : step.status === 'running' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <SpeedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                </motion.div>
              ) : (
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, fontSize: '0.65rem' }}>
                  {idx + 1}
                </Typography>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{
                fontWeight: step.status === 'running' ? 700 : 600,
                color: step.status === 'running' ? '#f59e0b'
                  : step.status === 'completed' ? '#10b981'
                  : theme.palette.text.secondary,
                fontSize: '0.78rem',
              }}>
                {step.name}
              </Typography>
              {step.result && step.status === 'completed' && (
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem' }}>
                  {step.result}
                </Typography>
              )}
            </Box>
            {step.status === 'running' && (
              <LinearProgress sx={{ width: 50, height: 3, borderRadius: 2 }} color="warning" />
            )}
          </Stack>
        </motion.div>
      ))}
    </Stack>
  );

  // ─── Asset Result Card (matches Create Signal style) ───
  const AssetResultCard = ({ asset, index }: { asset: DiscoveredAsset; index: number }) => {
    const color = categoryColors[asset.assetClass] || '#6366f1';
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2, borderRadius: '14px',
            background: isDark ? `${color}06` : `${color}04`,
            border: `1px solid ${color}20`,
            transition: 'all 0.25s ease',
            '&:hover': {
              borderColor: `${color}50`,
              background: `${color}10`,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 24px ${color}15`,
            },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}15`, color: color,
              }}>
                {categoryIcons[asset.assetClass] || <ChartIcon sx={{ fontSize: 18 }} />}
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.88rem' }}>
                    {asset.symbol}
                  </Typography>
                  {asset.action && (
                    <Chip
                      label={asset.action.toUpperCase()}
                      size="small"
                      sx={{
                        height: 18, fontSize: '0.58rem', fontWeight: 800,
                        background: asset.action === 'long' ? '#10b98118' : asset.action === 'short' ? '#ef444418' : '#f59e0b18',
                        color: asset.action === 'long' ? '#10b981' : asset.action === 'short' ? '#ef4444' : '#f59e0b',
                        border: `1px solid ${asset.action === 'long' ? '#10b98130' : asset.action === 'short' ? '#ef444430' : '#f59e0b30'}`,
                      }}
                    />
                  )}
                </Stack>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.68rem' }}>
                  {asset.name} · {asset.assetClass}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Chip
                label={`${asset.confidence}%`}
                size="small"
                sx={{
                  height: 22, fontSize: '0.65rem', fontWeight: 800,
                  background: asset.confidence > 80 ? '#10b98118' : '#f59e0b18',
                  color: asset.confidence > 80 ? '#10b981' : '#f59e0b',
                }}
              />
              <Tooltip title={`Trade on ${asset.platformName || asset.platform} (Pre-flight: privacy → register → route)`} arrow>
                <Button
                  size="small"
                  onClick={() => {
                    if (activeSignal) {
                      executeWithPreFlight({
                        hypothesis: activeSignal.hypothesis,
                        quality: activeSignal.confidence,
                        sentiment: activeSignal.sentiment || 'neutral',
                        assetCount: activeSignal.discoveredAssets.length,
                        source: 'pipeline',
                        timestamp: activeSignal.timestamp,
                        targetPlatform: asset.platformName || asset.platform,
                        targetUrl: asset.platformUrl,
                      }).catch(console.error);
                    } else {
                      window.open(asset.platformUrl, '_blank');
                    }
                  }}
                  sx={{
                    minWidth: 'auto', px: 1.5, py: 0.5, borderRadius: '8px',
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'none',
                    color: color,
                    background: `${color}08`,
                    border: `1px solid ${color}20`,
                    '&:hover': { background: `${color}15` },
                  }}
                  endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                >
                  {asset.platformName || asset.platform}
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
          {asset.reasoning && (
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', fontSize: '0.66rem', lineHeight: 1.4 }}>
              {asset.reasoning}
            </Typography>
          )}
        </Paper>
      </motion.div>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 50%, #020617 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        position: 'relative',
      }}
    >
      {/* Subtle grid pattern */}
      <Box
        sx={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: isDark ? 0.4 : 0.2,
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)'} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: '10%', left: '40%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 5 }}>
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mb: 1 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
              }}>
                <HubIcon sx={{ fontSize: 24, color: '#fff' }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #6366f1 0%, #10b981 50%, #f59e0b 100%)',
                  backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', md: '2.4rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                YSM Signal Pipeline
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary, opacity: 0.7, maxWidth: 700, mx: 'auto', mb: 2, fontWeight: 400 }}>
              Social Intelligence → AI Processing → Signal Generation → Asset Discovery → Trade Execution
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
              {[
                { icon: <FlashIcon sx={{ fontSize: 14 }} />, label: `${stats.totalSignalsProcessed} Signals`, color: '#6366f1' },
                { icon: <SocialIcon sx={{ fontSize: 14 }} />, label: `${stats.socialPlatformsConnected} Socials`, color: '#3b82f6' },
                { icon: <AIIcon sx={{ fontSize: 14 }} />, label: `${stats.aiModelsActive} AI`, color: '#10b981' },
                { icon: <BrokerageIcon sx={{ fontSize: 14 }} />, label: `${stats.brokeragesConnected} Brokerages`, color: '#f59e0b' },
                ...(pipelineService.hasApiKey() ? [{ icon: <SparkleIcon sx={{ fontSize: 14 }} />, label: 'OpenAI Connected', color: '#10a37f' }] : []),
              ].map((s, i) => (
                <Chip
                  key={i}
                  icon={s.icon}
                  label={s.label}
                  size="small"
                  sx={{
                    fontWeight: 700, fontSize: '0.72rem', height: 28,
                    background: `${s.color}15`, color: s.color,
                    border: `1px solid ${s.color}30`,
                    '& .MuiChip-icon': { color: s.color },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </motion.div>

        {/* ── 3-Column Pipeline ── */}
        <Grid container spacing={3} alignItems="stretch">
          {/* ═══ LEFT: INPUT END ═══ */}
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              {glassCard(
                <>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    }}>
                      <SocialIcon sx={{ fontSize: 18, color: '#fff' }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                        INPUT END
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Your Socials + Your AI
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Socials */}
                  <Typography variant="overline" sx={{ fontWeight: 800, color: '#6366f1', mb: 1.5, display: 'block', letterSpacing: '0.1em', fontSize: '0.68rem' }}>
                    SOCIAL CONNECTIONS
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    {socialConnections.map((social) => (
                      <Paper
                        key={social.platform}
                        elevation={0}
                        sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          p: 1.5, borderRadius: '12px',
                          background: social.isConnected
                            ? `${social.color}10`
                            : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                          border: `1px solid ${social.isConnected ? `${social.color}30` : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          '&:hover': { borderColor: social.color, background: `${social.color}08` },
                        }}
                        onClick={() => !social.isConnected && handleConnectSocial(social.platform)}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{
                            width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${social.color}15`, fontSize: '1rem',
                          }}>
                            {social.icon}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 650, color: theme.palette.text.primary, fontSize: '0.82rem' }}>
                              {social.displayName}
                            </Typography>
                            {social.isConnected && (
                              <Typography variant="caption" sx={{ color: social.color, fontWeight: 600, fontSize: '0.68rem' }}>
                                @{social.username} · {social.dataPoints} items
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        {social.isConnected ? (
                          <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                        ) : (
                          <Chip label="Connect" size="small" sx={{
                            fontSize: '0.65rem', height: 24, fontWeight: 700,
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                          }} />
                        )}
                      </Paper>
                    ))}
                  </Stack>

                  {/* AI Models */}
                  <Typography variant="overline" sx={{ fontWeight: 800, color: '#10b981', mb: 1.5, display: 'block', letterSpacing: '0.1em', fontSize: '0.68rem' }}>
                    AI MODELS
                  </Typography>
                  <Stack spacing={1}>
                    {aiModels.map((model) => (
                      <Paper
                        key={model.modelId}
                        elevation={0}
                        sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          p: 1.5, borderRadius: '12px',
                          background: model.isActive
                            ? `${model.color}08`
                            : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                          border: `1px solid ${model.isActive ? `${model.color}25` : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                        }}
                      >
                        <Box sx={{ flex: 1, mr: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: model.isActive ? model.color : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                              boxShadow: model.isActive ? `0 0 8px ${model.color}60` : 'none',
                            }} />
                            <Typography variant="body2" sx={{ fontWeight: 650, color: theme.palette.text.primary, fontSize: '0.82rem' }}>
                              {model.displayName}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.68rem' }}>
                            {model.provider} · {model.description.slice(0, 45)}
                          </Typography>
                        </Box>
                        <Switch
                          size="small"
                          checked={model.isActive}
                          onChange={(e) => handleToggleAI(model.modelId, e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: model.color },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: model.color },
                          }}
                        />
                      </Paper>
                    ))}
                  </Stack>
                </>,
                '#6366f1'
              )}
            </motion.div>
          </Grid>

          {/* ═══ CENTER: YSM ENGINE ═══ */}
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {glassCard(
                <>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }}>
                      <HubIcon sx={{ fontSize: 18, color: '#fff' }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                        YSM ENGINE
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Signal + Asset Discovery
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Source selector */}
                  <Typography variant="overline" sx={{ fontWeight: 800, color: '#10b981', mb: 1, display: 'block', letterSpacing: '0.1em', fontSize: '0.68rem' }}>
                    SIGNAL SOURCE
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                    {(['x', 'telegram', 'reddit', 'discord', 'google-trends', 'substack', 'medium', 'other'] as SocialPlatform[]).map((platform) => {
                      const conn = socialConnections.find(s => s.platform === platform);
                      return (
                        <Chip
                          key={platform}
                          label={conn?.displayName || platform}
                          size="small"
                          onClick={() => {
                            if (platform === 'other') {
                              setShowOtherDialog(true);
                            } else {
                              setSelectedSource(platform);
                            }
                          }}
                          sx={{
                            fontWeight: 700, fontSize: '0.65rem', height: 24,
                            background: selectedSource === platform ? '#10b98120' : 'transparent',
                            border: `1px solid ${selectedSource === platform ? '#10b981' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                            color: selectedSource === platform ? '#10b981' : theme.palette.text.secondary,
                          }}
                        />
                      );
                    })}
                  </Stack>

                  {/* Signal Input */}
                  <TextField
                    multiline
                    rows={3}
                    value={signalInput}
                    onChange={(e) => setSignalInput(e.target.value)}
                    placeholder='Try: "ETH bullish breakout" or "NFL odds undervalued" or "Fed rate prediction"'
                    fullWidth
                    size="small"
                    disabled={isProcessing}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '14px',
                        fontSize: '0.85rem',
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleProcessSignal}
                    disabled={isProcessing || !signalInput.trim()}
                    startIcon={isProcessing ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      fontWeight: 700, fontSize: '0.88rem', textTransform: 'none',
                      borderRadius: '12px', py: 1.2,
                      boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                      '&:hover': { boxShadow: '0 12px 32px rgba(16,185,129,0.35)' },
                    }}
                  >
                    {isProcessing ? 'Running Pipeline...' : 'Run Through Pipeline'}
                  </Button>

                  {/* Pipeline Step Progress */}
                  <AnimatePresence>
                    {isProcessing && activeSignal?.pipelineSteps && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <PipelineStepProgress steps={activeSignal.pipelineSteps} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Streaming Hypothesis Output */}
                  <AnimatePresence>
                    {(isStreaming || (activeSignal && !isProcessing)) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <Box sx={{ mt: 3 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: '#10b981', letterSpacing: '0.1em', fontSize: '0.68rem' }}>
                              PIPELINE OUTPUT
                            </Typography>
                            {activeSignal?.sentiment && (
                              <Chip
                                label={activeSignal.sentiment.toUpperCase()}
                                size="small"
                                sx={{
                                  height: 20, fontSize: '0.6rem', fontWeight: 800,
                                  background: activeSignal.sentiment === 'bullish' ? '#10b98120' : activeSignal.sentiment === 'bearish' ? '#ef444420' : '#f59e0b20',
                                  color: activeSignal.sentiment === 'bullish' ? '#10b981' : activeSignal.sentiment === 'bearish' ? '#ef4444' : '#f59e0b',
                                }}
                              />
                            )}
                            {activeSignal?.confidence && (
                              <Chip
                                label={`${activeSignal.confidence}% confidence`}
                                size="small"
                                sx={{
                                  height: 20, fontSize: '0.6rem', fontWeight: 800,
                                  background: '#6366f115', color: '#6366f1',
                                }}
                              />
                            )}
                            {onChainResult && (
                              <Chip
                                label={`⛓ #${onChainResult.signalId}`}
                                size="small"
                                onClick={() => window.open(onChainResult.explorerUrl, '_blank')}
                                sx={{
                                  height: 20, fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer',
                                  background: '#10b98115', color: '#10b981',
                                  border: '1px solid #10b98120',
                                }}
                              />
                            )}
                            {txState.privacyEnabled && (
                              <Chip
                                label="🛡️"
                                size="small"
                                sx={{
                                  height: 20, fontSize: '0.6rem', fontWeight: 800,
                                  background: '#8b5cf615', color: '#8b5cf6',
                                  border: '1px solid #8b5cf620',
                                  minWidth: 0, px: 0.5,
                                }}
                              />
                            )}
                          </Stack>

                          {/* Hypothesis with streaming effect */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2, borderRadius: '14px', mb: 2,
                              background: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.03)',
                              border: '1px solid rgba(16,185,129,0.15)',
                            }}
                          >
                            <Typography variant="body2" sx={{
                              fontWeight: 600, color: theme.palette.text.primary,
                              fontSize: '0.82rem', lineHeight: 1.5,
                            }}>
                              {isStreaming ? streamingText : activeSignal?.hypothesis}
                              {isStreaming && (
                                <motion.span
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                  style={{ display: 'inline-block', marginLeft: 2 }}
                                >
                                  ▊
                                </motion.span>
                              )}
                            </Typography>
                          </Paper>

                          {/* AI Reasoning */}
                          {activeSignal?.aiReasoning && !isStreaming && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5, borderRadius: '10px', mb: 2,
                                background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.03)',
                                border: '1px solid rgba(99,102,241,0.1)',
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                                <AIIcon sx={{ fontSize: 14, color: '#6366f1' }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6366f1', fontSize: '0.65rem' }}>
                                  AI REASONING
                                </Typography>
                              </Stack>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem', lineHeight: 1.4 }}>
                                {activeSignal.aiReasoning}
                              </Typography>
                            </Paper>
                          )}

                          {/* Pipeline flow indicator */}
                          {!isStreaming && activeSignal?.pipelineSteps && (
                            <PipelineStepProgress steps={activeSignal.pipelineSteps} />
                          )}
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pipeline flow */}
                  {!activeSignal && !isProcessing && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 0.5 }}>
                      {['Input', 'YSM', 'Output'].map((label, i) => (
                        <React.Fragment key={label}>
                          {i > 0 && <ArrowForwardIcon sx={{ color: theme.palette.text.primary, fontSize: 16, alignSelf: 'center', opacity: 0.7 }} />}
                          <Chip
                            label={label}
                            size="small"
                            sx={{
                              fontWeight: 700, fontSize: '0.65rem', height: 24,
                              background: ['#6366f115', '#10b98120', '#f59e0b15'][i],
                              color: ['#6366f1', '#10b981', '#f59e0b'][i],
                            }}
                          />
                        </React.Fragment>
                      ))}
                    </Box>
                  )}
                </>,
                '#10b981'
              )}
            </motion.div>
          </Grid>

          {/* ═══ RIGHT: OUTPUT END + RESULTS ═══ */}
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              {glassCard(
                <>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    }}>
                      <BrokerageIcon sx={{ fontSize: 18, color: '#fff' }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                        OUTPUT END
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Your Brokerages + Execution
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Discovered Assets (when signal is processed) */}
                  <AnimatePresence>
                    {activeSignal && activeSignal.discoveredAssets.length > 0 && !isProcessing && !isStreaming && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <Typography variant="overline" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1.5, display: 'block', letterSpacing: '0.1em', fontSize: '0.68rem' }}>
                          DISCOVERED ASSETS ({activeSignal.discoveredAssets.length})
                        </Typography>
                        <Stack spacing={1} sx={{ mb: 2 }}>
                          {activeSignal.discoveredAssets.map((asset, idx) => (
                            <AssetResultCard key={`${asset.symbol}-${asset.platform}-${idx}`} asset={asset} index={idx} />
                          ))}
                        </Stack>

                        {/* CREATE SIGNAL BUTTON */}
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={handleCreateSignal}
                          startIcon={createdSignalId ? <CheckIcon /> : <AddCircleIcon />}
                          disabled={!!createdSignalId}
                          sx={{
                            mb: 2,
                            background: createdSignalId
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            fontWeight: 700, fontSize: '0.88rem', textTransform: 'none',
                            borderRadius: '12px', py: 1.2,
                            boxShadow: createdSignalId
                              ? '0 8px 24px rgba(16,185,129,0.25)'
                              : '0 8px 24px rgba(99,102,241,0.25)',
                            '&:hover': {
                              boxShadow: '0 12px 32px rgba(99,102,241,0.35)',
                            },
                          }}
                        >
                          {createdSignalId ? 'Signal Created ✓' : '+ Create Signal from Pipeline'}
                        </Button>

                        {createdSignalId && (
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate('/portfolio')}
                              startIcon={<WalletIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                flex: 1, textTransform: 'none', fontSize: '0.72rem', borderRadius: '10px', fontWeight: 700,
                                borderColor: '#6366f1', color: '#6366f1',
                                '&:hover': { background: '#6366f108' },
                              }}
                            >
                              Portfolio
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate('/signal-markets')}
                              startIcon={<ChartIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                flex: 1, textTransform: 'none', fontSize: '0.72rem', borderRadius: '10px', fontWeight: 700,
                                borderColor: '#10b981', color: '#10b981',
                                '&:hover': { background: '#10b98108' },
                              }}
                            >
                              Markets
                            </Button>
                          </Stack>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Default: Brokerage list grouped by asset class (when no active signal result) */}
                  {(!activeSignal || isProcessing || isStreaming) && (
                    <>
                      {(() => {
                        const categoryMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
                          crypto:      { label: 'Crypto',       color: '#f59e0b', icon: <CryptoIcon sx={{ fontSize: 13 }} /> },
                          stocks:      { label: 'Stocks',       color: '#3b82f6', icon: <ChartIcon sx={{ fontSize: 13 }} /> },
                          predictions: { label: 'Predictions',  color: '#8b5cf6', icon: <CasinoIcon sx={{ fontSize: 13 }} /> },
                          sports:      { label: 'Sports',       color: '#10b981', icon: <SportsIcon sx={{ fontSize: 13 }} /> },
                          defi:        { label: 'DeFi',         color: '#6366f1', icon: <BoltIcon sx={{ fontSize: 13 }} /> },
                          private:     { label: 'Private',      color: '#a855f7', icon: <LockIcon sx={{ fontSize: 13 }} /> },
                        };
                        const grouped: Record<string, typeof brokerages> = {};
                        brokerages.forEach(b => {
                          if (!grouped[b.category]) grouped[b.category] = [];
                          grouped[b.category].push(b);
                        });
                        const order = ['crypto', 'stocks', 'predictions', 'sports', 'defi', 'private'];
                        return order.filter(cat => grouped[cat]?.length).map(cat => {
                          const meta = categoryMeta[cat];
                          return (
                            <Box key={cat} sx={{ mb: 2 }}>
                              <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 1 }}>
                                <Box sx={{
                                  width: 22, height: 22, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: `${meta.color}15`, color: meta.color,
                                }}>
                                  {meta.icon}
                                </Box>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: meta.color, letterSpacing: '0.1em', fontSize: '0.62rem', lineHeight: 1 }}>
                                  {meta.label}
                                </Typography>
                                <Chip
                                  label={grouped[cat].length}
                                  size="small"
                                  sx={{
                                    height: 16, fontSize: '0.55rem', fontWeight: 800, minWidth: 0,
                                    background: `${meta.color}12`, color: meta.color,
                                    '& .MuiChip-label': { px: 0.5 },
                                  }}
                                />
                              </Stack>
                              <Stack spacing={0.6}>
                                {grouped[cat].map((brokerage) => (
                                  <Paper
                                    key={brokerage.id}
                                    elevation={0}
                                    sx={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                      px: 1.5, py: 1, borderRadius: '10px',
                                      background: brokerage.isConnected
                                        ? `${brokerage.color}06`
                                        : isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)',
                                      border: `1px solid ${brokerage.isConnected ? `${brokerage.color}20` : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      '&:hover': { borderColor: `${brokerage.color}50`, background: `${brokerage.color}06` },
                                    }}
                                    onClick={() => !brokerage.isConnected && handleConnectBrokerage(brokerage.id)}
                                  >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <Box sx={{
                                        width: 28, height: 28, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${brokerage.color}10`, fontSize: '0.85rem',
                                      }}>
                                        {brokerage.icon}
                                      </Box>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 650, color: theme.palette.text.primary, fontSize: '0.78rem', lineHeight: 1.2 }}>
                                          {brokerage.displayName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.6rem' }}>
                                          {brokerage.supportedAssets.slice(0, 3).join(' · ')}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                    {brokerage.isConnected ? (
                                      <CheckIcon sx={{ color: '#10b981', fontSize: 16 }} />
                                    ) : (
                                      <Tooltip title={`Open ${brokerage.displayName}`}>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => { e.stopPropagation(); window.open(brokerage.connectionUrl, '_blank'); }}
                                          sx={{ width: 24, height: 24 }}
                                        >
                                          <OpenInNewIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Paper>
                                ))}
                              </Stack>
                            </Box>
                          );
                        });
                      })()}
                    </>
                  )}

                  {/* Verification footer */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5, borderRadius: '12px', mt: 1,
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(16,185,129,0.03) 100%)'
                        : 'linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(16,185,129,0.02) 100%)',
                      border: '1px solid rgba(99,102,241,0.1)',
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
                      <Chip
                        label="Signals verified on-chain"
                        size="small"
                        icon={<CheckIcon sx={{ fontSize: '12px !important', color: '#10b981 !important' }} />}
                        sx={{
                          height: 22, fontSize: '0.6rem', fontWeight: 700,
                          background: '#10b98108', color: '#10b981',
                          border: '1px solid #10b98115',
                        }}
                      />
                      <Chip
                        label="Monadscan"
                        size="small"
                        onClick={() => window.open('https://testnet.monadscan.com', '_blank')}
                        sx={{
                          height: 22, fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        }}
                      />
                      <Chip
                        label="Private Wallet"
                        size="small"
                        onClick={() => navigate('/unlink')}
                        icon={<LockIcon sx={{ fontSize: '11px !important', color: '#8b5cf6 !important' }} />}
                        sx={{
                          height: 22, fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
                          background: '#8b5cf608', color: '#8b5cf6',
                          border: '1px solid #8b5cf615',
                        }}
                      />
                    </Stack>
                  </Paper>
                </>,
                '#f59e0b'
              )}
            </motion.div>
          </Grid>
        </Grid>

        {/* ── Recent Signals History ── */}
        {recentSignals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card
              sx={{
                mt: 4, borderRadius: '20px', overflow: 'hidden',
                background: isDark
                  ? 'linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.7) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
                backdropFilter: 'blur(24px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                    }}>
                      <FlashIcon sx={{ fontSize: 18, color: '#fff' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1rem' }}>
                        Recent Pipeline Signals
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {recentSignals.length} signals processed
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Grid container spacing={2}>
                  {recentSignals.slice(0, 6).map((signal, idx) => (
                    <Grid item xs={12} md={6} key={signal.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2, borderRadius: '14px',
                            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: '#6366f130',
                              background: '#6366f106',
                            },
                          }}
                          onClick={() => {
                            setActiveSignal(signal);
                            setStreamingText(signal.hypothesis);
                            setIsStreaming(false);
                            setCreatedSignalId(null);
                          }}
                        >
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Stack direction="row" spacing={0.5}>
                              {signal.sentiment && (
                                <Chip
                                  label={signal.sentiment}
                                  size="small"
                                  sx={{
                                    height: 20, fontSize: '0.6rem', fontWeight: 700,
                                    background: signal.sentiment === 'bullish' ? '#10b98118' : signal.sentiment === 'bearish' ? '#ef444418' : '#f59e0b18',
                                    color: signal.sentiment === 'bullish' ? '#10b981' : signal.sentiment === 'bearish' ? '#ef4444' : '#f59e0b',
                                  }}
                                />
                              )}
                              <Chip
                                label={`${signal.confidence}%`}
                                size="small"
                                sx={{
                                  height: 20, fontSize: '0.6rem', fontWeight: 700,
                                  background: '#6366f115', color: '#6366f1',
                                }}
                              />
                            </Stack>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.6rem' }}>
                              {new Date(signal.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '0.78rem', lineHeight: 1.4, mb: 1 }}>
                            {signal.hypothesis.slice(0, 100)}...
                          </Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                            {signal.discoveredAssets.slice(0, 4).map((a, i) => (
                              <Chip
                                key={i}
                                label={`${a.symbol} · ${a.platformName || a.platform}`}
                                size="small"
                                sx={{
                                  fontSize: '0.6rem', height: 20, fontWeight: 700,
                                  background: `${categoryColors[a.assetClass] || '#6366f1'}10`,
                                  color: categoryColors[a.assetClass] || '#6366f1',
                                  border: `1px solid ${categoryColors[a.assetClass] || '#6366f1'}20`,
                                }}
                              />
                            ))}
                          </Stack>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Platform Directory ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card
            sx={{
              mt: 4, borderRadius: '20px', overflow: 'hidden',
              background: isDark
                ? 'linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.7) 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}
          >
            <Box
              sx={{
                p: 3, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
              onClick={() => setShowDirectory(!showDirectory)}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #6366f1 0%, #f59e0b 100%)',
                }}>
                  <BrokerageIcon sx={{ fontSize: 22, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1.05rem' }}>
                    Platform Directory
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {Object.keys(PLATFORM_DIRECTORY).length} platforms across all asset classes — click any to visit
                  </Typography>
                </Box>
              </Stack>
              {showDirectory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={showDirectory}>
              <Divider sx={{ opacity: 0.1 }} />
              <Box sx={{ p: 3, pt: 2 }}>
                <Grid container spacing={2}>
                  {Object.entries(platformsByCategory).map(([category, platforms]) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={category}>
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                          <Box sx={{
                            width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${categoryColors[category] || '#6366f1'}15`,
                            color: categoryColors[category] || '#6366f1',
                          }}>
                            {categoryIcons[category] || <BrokerageIcon sx={{ fontSize: 14 }} />}
                          </Box>
                          <Typography variant="overline" sx={{
                            fontWeight: 800, color: categoryColors[category] || '#6366f1',
                            fontSize: '0.65rem', letterSpacing: '0.12em',
                          }}>
                            {category}
                          </Typography>
                        </Stack>
                        <Stack spacing={0.5}>
                          {platforms.map((p) => (
                            <Paper
                              key={p.name}
                              elevation={0}
                              onClick={() => window.open(p.url, '_blank')}
                              sx={{
                                p: 1.5, borderRadius: '10px', cursor: 'pointer',
                                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: categoryColors[category] || '#6366f1',
                                  background: `${categoryColors[category] || '#6366f1'}06`,
                                  transform: 'translateX(4px)',
                                },
                              }}
                            >
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.8rem' }}>
                                    {p.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem' }}>
                                    {p.description.slice(0, 40)}
                                  </Typography>
                                </Box>
                                <OpenInNewIcon sx={{ fontSize: 14, color: theme.palette.text.secondary, opacity: 0.5 }} />
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Collapse>
          </Card>
        </motion.div>

        {/* ── Data APIs ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card
            sx={{
              mt: 3, borderRadius: '20px', overflow: 'hidden',
              background: isDark
                ? 'linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.7) 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}
          >
            <Box
              sx={{
                p: 3, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
              onClick={() => setShowAPIs(!showAPIs)}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                }}>
                  <DataIcon sx={{ fontSize: 22, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1.05rem' }}>
                    Open Source Data APIs
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Free data sources powering signal generation
                  </Typography>
                </Box>
              </Stack>
              {showAPIs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={showAPIs}>
              <Divider sx={{ opacity: 0.1 }} />
              <Box sx={{ p: 3, pt: 2 }}>
                <Grid container spacing={2}>
                  {Object.entries(DATA_APIS).map(([key, api]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Paper
                        elevation={0}
                        onClick={() => window.open(api.docs, '_blank')}
                        sx={{
                          p: 2, borderRadius: '14px', cursor: 'pointer', height: '100%',
                          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#3b82f6',
                            background: '#3b82f606',
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                            {api.name}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {api.free && (
                              <Chip label="FREE" size="small" sx={{
                                height: 18, fontSize: '0.6rem', fontWeight: 800,
                                background: '#10b98120', color: '#10b981',
                              }} />
                            )}
                            <OpenInNewIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          </Stack>
                        </Stack>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}>
                          {api.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Collapse>
          </Card>
        </motion.div>

        {/* ── Pipeline Summary Bar ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Box
            sx={{
              mt: 4, p: 3, borderRadius: '20px', textAlign: 'center',
              background: isDark
                ? 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(16,185,129,0.04) 50%, rgba(245,158,11,0.03) 100%)'
                : 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(16,185,129,0.03) 50%, rgba(245,158,11,0.02) 100%)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
              flexWrap="wrap"
              sx={{ gap: 0.5 }}
            >
              {[
                { label: 'Socials', color: '#3b82f6', icon: <SocialIcon sx={{ fontSize: 14 }} /> },
                { label: 'AI', color: '#6366f1', icon: <AIIcon sx={{ fontSize: 14 }} /> },
                { label: 'YSM', color: '#10b981', icon: <HubIcon sx={{ fontSize: 14 }} /> },
                { label: 'Signals', color: '#34d399', icon: <TrendingUpIcon sx={{ fontSize: 14 }} /> },
                { label: 'Monad', color: '#8b5cf6', icon: <LockIcon sx={{ fontSize: 14 }} /> },
                { label: 'Execution', color: '#f59e0b', icon: <BrokerageIcon sx={{ fontSize: 14 }} /> },
              ].map((step, i) => (
                <React.Fragment key={step.label}>
                  {i > 0 && <ArrowForwardIcon sx={{ color: theme.palette.text.primary, fontSize: 14, opacity: 0.7 }} />}
                  <Chip
                    icon={step.icon}
                    label={step.label}
                    size="small"
                    sx={{
                      fontWeight: 700, fontSize: '0.7rem', height: 26,
                      background: `${step.color}12`, color: step.color,
                      '& .MuiChip-icon': { color: step.color },
                    }}
                  />
                </React.Fragment>
              ))}
            </Stack>
          </Box>
        </motion.div>
      </Container>

      {/* ── Signal Created Dialog ── */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark
              ? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)'
              : 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Avatar
              sx={{
                width: 80, height: 80, mx: 'auto', mb: 2,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
              }}
            >
              <CheckIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Avatar>
          </motion.div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
            🎉 Signal Created!
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            Your pipeline signal has been added to Portfolio and Markets
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {activeSignal && (
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: '14px', mb: 2,
                  background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {activeSignal.hypothesis.slice(0, 150)}...
                </Typography>
              </Paper>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
                {activeSignal.discoveredAssets.slice(0, 5).map((a, i) => (
                  <Chip
                    key={i}
                    label={`${a.symbol} · ${a.platformName || a.platform}`}
                    size="small"
                    sx={{
                      fontSize: '0.68rem', fontWeight: 700,
                      background: `${categoryColors[a.assetClass] || '#6366f1'}10`,
                      color: categoryColors[a.assetClass] || '#6366f1',
                    }}
                  />
                ))}
              </Stack>

              {/* On-chain registration result */}
              {isRegistering ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2, borderRadius: '14px', mt: 2,
                    background: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.03)',
                    border: '1px solid rgba(16,185,129,0.12)',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                    <CircularProgress size={16} sx={{ color: '#10b981' }} />
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }}>
                      Registering on Monad...
                    </Typography>
                  </Stack>
                </Paper>
              ) : onChainResult && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2, borderRadius: '14px', mt: 2,
                    background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                    border: '1px solid rgba(16,185,129,0.15)',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center" sx={{ mb: 0.5 }}>
                    <CheckIcon sx={{ fontSize: 14, color: '#10b981' }} />
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, fontSize: '0.72rem' }}>
                      VERIFIED ON MONAD
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
                    <Chip
                      label={`Signal #${onChainResult.signalId}`}
                      size="small"
                      sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, background: '#10b98115', color: '#10b981', border: '1px solid #10b98125' }}
                    />
                    <Chip
                      label={`TX: ${onChainResult.txHash.slice(0, 10)}...`}
                      size="small"
                      onClick={() => window.open(onChainResult.explorerUrl, '_blank')}
                      sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, background: '#10b98115', color: '#10b981', border: '1px solid #10b98125', cursor: 'pointer' }}
                    />
                    {txState.privacyEnabled && (
                      <Chip
                        label="🛡️ Private"
                        size="small"
                        sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, background: '#8b5cf615', color: '#8b5cf6', border: '1px solid #8b5cf625' }}
                      />
                    )}
                  </Stack>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => { setShowCreateDialog(false); navigate('/portfolio'); }}
            startIcon={<WalletIcon />}
            sx={{
              px: 3, py: 1.2, borderRadius: '12px', fontWeight: 700, textTransform: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': { boxShadow: '0 8px 24px rgba(99,102,241,0.3)' },
            }}
          >
            View in Portfolio
          </Button>
          <Button
            variant="outlined"
            onClick={() => { setShowCreateDialog(false); navigate('/signal-markets'); }}
            startIcon={<ChartIcon />}
            sx={{
              px: 3, py: 1.2, borderRadius: '12px', fontWeight: 700, textTransform: 'none',
              borderColor: '#10b981', color: '#10b981',
              '&:hover': { background: '#10b98108' },
            }}
          >
            View in Markets
          </Button>
          <Button
            variant="text"
            onClick={() => setShowCreateDialog(false)}
            sx={{ px: 3, py: 1.2, borderRadius: '12px', fontWeight: 600, textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Others / Manual Source Dialog ── */}
      <Dialog
        open={showOtherDialog}
        onClose={() => setShowOtherDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark
              ? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)'
              : 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1.05rem' }}>
            Add Custom Source
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.78rem', mt: 0.5 }}>
            Manually add any data source — paste a URL, research paper, newsletter excerpt, or raw signal data.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Source Name"
              placeholder="e.g. My Alpha Research, Bloomberg Terminal, Private Group"
              value={otherSourceName}
              onChange={(e) => setOtherSourceName(e.target.value)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                },
              }}
            />
            <TextField
              label="URL (optional)"
              placeholder="https://..."
              value={otherSourceUrl}
              onChange={(e) => setOtherSourceUrl(e.target.value)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                },
              }}
            />
            <TextField
              label="Content / Signal (optional)"
              placeholder="Paste the signal content, thesis, or data you want to run through the pipeline..."
              value={otherSourceContent}
              onChange={(e) => setOtherSourceContent(e.target.value)}
              multiline
              rows={4}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                },
              }}
            />
            <Alert
              severity="info"
              sx={{
                borderRadius: '12px',
                fontSize: '0.72rem',
                background: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
                border: '1px solid rgba(59,130,246,0.15)',
                '& .MuiAlert-icon': { fontSize: 18 },
              }}
            >
              Custom sources let you pipe any data into the YSM Signal Pipeline. Once connected, the AI engine will analyze it alongside your other sources.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setShowOtherDialog(false)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleOtherSourceSubmit}
            disabled={!otherSourceName.trim()}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': { boxShadow: '0 8px 24px rgba(99,102,241,0.3)' },
            }}
          >
            Add Source
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pipeline;
