import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  Alert,
  LinearProgress,
  Avatar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Token as TokenIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as SparkleIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { Signal } from '../../types/signal';

interface TokenizationFlowProps {
  signal: Signal;
  onComplete?: (tokenData: TokenizationData) => void;
  onCancel?: () => void;
}

export interface TokenizationData {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  initialPrice: number;
  bondingCurve: 'linear' | 'exponential' | 'polynomial';
  curveParameters: {
    k: number;
    reserveRatio: number;
  };
  vestingSchedule: {
    cliff: number;
    duration: number;
    releaseRate: number;
  };
  governance: {
    votingPower: number;
    proposalThreshold: number;
  };
  metadata: {
    description: string;
    website?: string;
    socialLinks?: string[];
  };
}

const TokenizationFlow: React.FC<TokenizationFlowProps> = ({ signal, onComplete, onCancel }) => {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [tokenData, setTokenData] = useState<TokenizationData>({
    tokenName: `${signal.underlyingAsset} Signal Token`,
    tokenSymbol: `${signal.underlyingAsset}SIG`,
    totalSupply: 1000000,
    initialPrice: 0.01,
    bondingCurve: 'linear',
    curveParameters: {
      k: 0.5,
      reserveRatio: 0.5,
    },
    vestingSchedule: {
      cliff: 30,
      duration: 365,
      releaseRate: 0.1,
    },
    governance: {
      votingPower: 1,
      proposalThreshold: 1000,
    },
    metadata: {
      description: signal.hypothesis,
    },
  });

  const steps = [
    'Token Basics',
    'Pricing Model',
    'Vesting & Distribution',
    'Governance',
    'Review & Deploy',
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(tokenData);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
              Token Basics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Token Name"
                  value={tokenData.tokenName}
                  onChange={(e) => setTokenData({ ...tokenData, tokenName: e.target.value })}
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Token Symbol"
                  value={tokenData.tokenSymbol}
                  onChange={(e) => setTokenData({ ...tokenData, tokenSymbol: e.target.value.toUpperCase() })}
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    Total Supply: {tokenData.totalSupply.toLocaleString()} tokens
                  </Typography>
                  <Slider
                    value={tokenData.totalSupply}
                    onChange={(e, value) => setTokenData({ ...tokenData, totalSupply: value as number })}
                    min={10000}
                    max={10000000}
                    step={10000}
                    marks={[
                      { value: 100000, label: '100K' },
                      { value: 1000000, label: '1M' },
                      { value: 10000000, label: '10M' },
                    ]}
                    sx={{
                      '& .MuiSlider-thumb': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Initial Price (USD)"
                  type="number"
                  value={tokenData.initialPrice}
                  onChange={(e) => setTokenData({ ...tokenData, initialPrice: parseFloat(e.target.value) || 0 })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
              Pricing Model
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Bonding Curve Type</InputLabel>
                  <Select
                    value={tokenData.bondingCurve}
                    label="Bonding Curve Type"
                    onChange={(e) => setTokenData({ ...tokenData, bondingCurve: e.target.value as any })}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="linear">Linear (Constant Price)</MenuItem>
                    <MenuItem value="exponential">Exponential (Increasing Price)</MenuItem>
                    <MenuItem value="polynomial">Polynomial (Custom Curve)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    Curve Parameter K: {tokenData.curveParameters.k}
                  </Typography>
                  <Slider
                    value={tokenData.curveParameters.k}
                    onChange={(e, value) =>
                      setTokenData({
                        ...tokenData,
                        curveParameters: { ...tokenData.curveParameters, k: value as number },
                      })
                    }
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    Reserve Ratio: {tokenData.curveParameters.reserveRatio}
                  </Typography>
                  <Slider
                    value={tokenData.curveParameters.reserveRatio}
                    onChange={(e, value) =>
                      setTokenData({
                        ...tokenData,
                        curveParameters: { ...tokenData.curveParameters, reserveRatio: value as number },
                      })
                    }
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                  <Typography variant="body2">
                    The bonding curve determines how token price changes with supply. Higher K values create steeper curves.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
              Vesting & Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cliff Period (days)"
                  type="number"
                  value={tokenData.vestingSchedule.cliff}
                  onChange={(e) =>
                    setTokenData({
                      ...tokenData,
                      vestingSchedule: { ...tokenData.vestingSchedule, cliff: parseInt(e.target.value) || 0 },
                    })
                  }
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Vesting Duration (days)"
                  type="number"
                  value={tokenData.vestingSchedule.duration}
                  onChange={(e) =>
                    setTokenData({
                      ...tokenData,
                      vestingSchedule: { ...tokenData.vestingSchedule, duration: parseInt(e.target.value) || 0 },
                    })
                  }
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    Release Rate: {tokenData.vestingSchedule.releaseRate * 100}% per period
                  </Typography>
                  <Slider
                    value={tokenData.vestingSchedule.releaseRate}
                    onChange={(e, value) =>
                      setTokenData({
                        ...tokenData,
                        vestingSchedule: { ...tokenData.vestingSchedule, releaseRate: value as number },
                      })
                    }
                    min={0.01}
                    max={0.5}
                    step={0.01}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
              Governance Parameters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    Voting Power per Token: {tokenData.governance.votingPower}x
                  </Typography>
                  <Slider
                    value={tokenData.governance.votingPower}
                    onChange={(e, value) =>
                      setTokenData({
                        ...tokenData,
                        governance: { ...tokenData.governance, votingPower: value as number },
                      })
                    }
                    min={0.1}
                    max={10}
                    step={0.1}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Proposal Threshold (tokens)"
                  type="number"
                  value={tokenData.governance.proposalThreshold}
                  onChange={(e) =>
                    setTokenData({
                      ...tokenData,
                      governance: { ...tokenData.governance, proposalThreshold: parseInt(e.target.value) || 0 },
                    })
                  }
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
              Review & Deploy
            </Typography>
            <Card
              sx={{
                p: 3,
                mb: 3,
                borderRadius: '16px',
                background: theme.palette.mode === 'dark' ? 'rgba(26, 31, 58, 0.6)' : 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Token Name
                  </Typography>
                  <Typography variant="h6">{tokenData.tokenName}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Symbol
                  </Typography>
                  <Typography variant="h6">{tokenData.tokenSymbol}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Total Supply
                  </Typography>
                  <Typography variant="h6">{tokenData.totalSupply.toLocaleString()}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Initial Price
                  </Typography>
                  <Typography variant="h6">${tokenData.initialPrice}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Bonding Curve
                  </Typography>
                  <Chip label={tokenData.bondingCurve} sx={{ mt: 1 }} />
                </Box>
              </Stack>
            </Card>
            <Alert severity="success" sx={{ borderRadius: '12px' }}>
              <Typography variant="body2">
                Ready to deploy! This will create a tokenized version of your signal on the blockchain.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: '24px',
        background: theme.palette.mode === 'dark' ? 'rgba(26, 31, 58, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <TokenIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Tokenize Signal
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Convert your signal into a tradeable token
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={onCancel || handleBack}
            disabled={activeStep === 0}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
            sx={{
              borderRadius: '12px',
              px: 4,
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {activeStep === steps.length - 1 ? 'Deploy Token' : 'Next'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenizationFlow;
