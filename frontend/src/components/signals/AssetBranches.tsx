import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  Collapse,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Link as LinkIcon,
  AccountBalance as ExchangeIcon,
  CheckCircle as ConnectedIcon,
  Cancel as NotConnectedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AssetBranches as AssetBranchesType, RelatedAsset, AssetClass } from '../../types/signal';
import { useTheme } from '@mui/material/styles';

interface AssetBranchesProps {
  branches: AssetBranchesType;
  signalId: string;
  onConnectExchange?: (asset: RelatedAsset) => void;
  onTrade?: (asset: RelatedAsset) => void;
}

const assetClassConfig: Record<AssetClass, { name: string; icon: string; color: string }> = {
  crypto: { name: 'Crypto', icon: '₿', color: '#F7931A' },
  stocks: { name: 'Stocks', icon: '📈', color: '#00C853' },
  futures: { name: 'Futures', icon: '📊', color: '#2196F3' },
  forex: { name: 'Forex', icon: '💱', color: '#9C27B0' },
  predictions: { name: 'Predictions', icon: '🔮', color: '#FF9800' },
  etfs: { name: 'ETFs', icon: '📦', color: '#00BCD4' },
  bonds: { name: 'Bonds', icon: '💵', color: '#4CAF50' },
  commodities: { name: 'Commodities', icon: '⚡', color: '#FF5722' },
};

const AssetBranches: React.FC<AssetBranchesProps> = ({
  branches,
  signalId,
  onConnectExchange,
  onTrade,
}) => {
  const theme = useTheme();
  const [expandedClasses, setExpandedClasses] = useState<Set<AssetClass>>(new Set());

  const toggleClass = (assetClass: AssetClass) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(assetClass)) {
      newExpanded.delete(assetClass);
    } else {
      newExpanded.add(assetClass);
    }
    setExpandedClasses(newExpanded);
  };

  const renderAssetCard = (asset: RelatedAsset) => (
    <motion.div
      key={asset.id}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          borderRadius: '12px',
          background: theme.palette.mode === 'dark'
            ? 'rgba(26, 31, 58, 0.6)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 24px ${assetClassConfig[asset.assetClass].color}30`,
            borderColor: assetClassConfig[asset.assetClass].color,
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                {asset.symbol}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {asset.name}
              </Typography>
            </Box>
            <Chip
              label={assetClassConfig[asset.assetClass].name}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                backgroundColor: `${assetClassConfig[asset.assetClass].color}20`,
                color: assetClassConfig[asset.assetClass].color,
                fontWeight: 600,
              }}
            />
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Price
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ${asset.currentPrice.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                24h Change
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {asset.priceChange24h >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#00FF88' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: '#FF4444' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                    color: asset.priceChange24h >= 0 ? '#00FF88' : '#FF4444',
                  }}
                >
                  {asset.priceChange24h >= 0 ? '+' : ''}
                  {asset.priceChange24h.toFixed(2)}%
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Relevance
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                {asset.relevanceScore}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={asset.relevanceScore}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: assetClassConfig[asset.assetClass].color,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ExchangeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {asset.exchange}
              </Typography>
            </Box>
            {asset.connectionStatus === 'connected' ? (
              <Tooltip title="Exchange Connected">
                <ConnectedIcon sx={{ fontSize: 16, color: '#00FF88' }} />
              </Tooltip>
            ) : (
              <Tooltip title="Exchange Not Connected">
                <NotConnectedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Tooltip>
            )}
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {asset.connectionStatus !== 'connected' && onConnectExchange && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => onConnectExchange(asset)}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  borderColor: assetClassConfig[asset.assetClass].color,
                  color: assetClassConfig[asset.assetClass].color,
                  '&:hover': {
                    borderColor: assetClassConfig[asset.assetClass].color,
                    backgroundColor: `${assetClassConfig[asset.assetClass].color}10`,
                  },
                }}
              >
                Connect
              </Button>
            )}
            {onTrade && (
              <Button
                size="small"
                variant="contained"
                onClick={() => onTrade(asset)}
                disabled={asset.connectionStatus !== 'connected'}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${assetClassConfig[asset.assetClass].color} 0%, ${assetClassConfig[asset.assetClass].color}80 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${assetClassConfig[asset.assetClass].color}80 0%, ${assetClassConfig[asset.assetClass].color} 100%)`,
                  },
                  '&:disabled': {
                    background: theme.palette.action.disabledBackground,
                  },
                }}
              >
                Trade
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAssetClass = (assetClass: AssetClass, assets: RelatedAsset[]) => {
    if (assets.length === 0) return null;

    const config = assetClassConfig[assetClass];
    const isExpanded = expandedClasses.has(assetClass);

    return (
      <Card
        key={assetClass}
        sx={{
          mb: 2,
          borderRadius: '16px',
          background: theme.palette.mode === 'dark'
            ? 'rgba(26, 31, 58, 0.8)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              p: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
            onClick={() => toggleClass(assetClass)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}80 100%)`,
                  fontSize: '1.5rem',
                }}
              >
                {config.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {config.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {assets.length} related asset{assets.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={isExpanded}>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {assets.map((asset) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                    {renderAssetCard(asset)}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const allClasses: AssetClass[] = ['crypto', 'stocks', 'futures', 'forex', 'predictions', 'etfs', 'bonds', 'commodities'];
  const hasBranches = allClasses.some((ac) => branches[ac] && branches[ac].length > 0);

  if (!hasBranches) {
    return (
      <Card
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '16px',
          background: theme.palette.mode === 'dark'
            ? 'rgba(26, 31, 58, 0.6)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No asset branches discovered yet. Asset discovery happens automatically when the signal is created.
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Asset Branches
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Related assets discovered across all asset classes. Connect exchanges to trade directly.
        </Typography>
      </Box>

      {allClasses.map((assetClass) => {
        const assets = branches[assetClass] || [];
        return renderAssetClass(assetClass, assets);
      })}
    </Box>
  );
};

export default AssetBranches;
