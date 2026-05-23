import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Link,
  Button,
  IconButton,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckIcon from '@mui/icons-material/Check';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { PipelineSignal } from '../../services/pipelineService';
import { oneLineHypothesis } from '../../services/liveGraphService';
import { formatUsdPrice } from '../../services/assetMarketService';

interface PipelineSignalResultProps {
  signal: PipelineSignal;
  isDark: boolean;
  createdSignalId: string | null;
  savedToBackend: boolean;
  isSaving: boolean;
  onSaveAgain: () => void;
  onPortfolio: () => void;
}

export const PipelineSignalResult: React.FC<PipelineSignalResultProps> = ({
  signal,
  isDark,
  createdSignalId,
  savedToBackend,
  isSaving,
  onSaveAgain,
  onPortfolio,
}) => {
  const hypothesis = oneLineHypothesis(signal.hypothesis);
  const webEvidence = signal.webEvidence || [];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '16px',
        border: '1px solid rgba(16,185,129,0.25)',
        background: isDark ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.03)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="overline" sx={{ fontWeight: 800, color: '#10b981', letterSpacing: '0.08em' }}>
          Signal generated
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {signal.sentiment && (
            <Chip label={signal.sentiment} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800 }} />
          )}
          <Chip label={`${signal.confidence}%`} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800 }} />
          {createdSignalId && (
            <Chip
              icon={<CheckIcon sx={{ fontSize: 14 }} />}
              label={savedToBackend ? 'Saved' : 'Local'}
              size="small"
              color="success"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.62rem' }}
            />
          )}
        </Stack>
      </Stack>

      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.45, mb: 2 }}>
        {hypothesis}
      </Typography>

      {(webEvidence.length > 0 || signal.discoveredAssets.length > 0) && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {webEvidence.map((ev, i) => (
            <Stack
              key={`${ev.url}-${i}`}
              direction="row"
              alignItems="center"
              spacing={1}
              component={Link}
              href={ev.url}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: 'inherit', textDecoration: 'none' }}
            >
              <Chip label={ev.source_type} size="small" sx={{ height: 20, fontSize: '0.58rem' }} />
              <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600, flex: 1 }}>
                {ev.title}
              </Typography>
              <OpenInNewIcon sx={{ fontSize: 14, color: '#8b5cf6' }} />
            </Stack>
          ))}
          {signal.discoveredAssets.slice(0, 6).map((a) => (
            <Stack
              key={`${a.symbol}-${a.platform}`}
              direction="row"
              alignItems="center"
              spacing={1}
              component={Link}
              href={a.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: 'inherit', textDecoration: 'none' }}
            >
              <Chip label={a.symbol} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
              <Typography variant="body2" sx={{ fontSize: '0.78rem', flex: 1 }}>
                {a.name}
                {a.livePrice != null && (
                  <Box component="span" sx={{ ml: 1, fontWeight: 700 }}>
                    {formatUsdPrice(a.livePrice)}
                    {a.change24hPercent != null && (
                      <Box
                        component="span"
                        sx={{ ml: 0.5, color: a.change24hPercent >= 0 ? '#10b981' : '#ef4444' }}
                      >
                        {a.change24hPercent >= 0 ? '+' : ''}
                        {a.change24hPercent.toFixed(1)}%
                      </Box>
                    )}
                  </Box>
                )}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {a.platformName}
              </Typography>
              <OpenInNewIcon sx={{ fontSize: 14, opacity: 0.6 }} />
            </Stack>
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          onClick={onPortfolio}
          startIcon={<WalletIcon sx={{ fontSize: 16 }} />}
          sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
        >
          Portfolio
        </Button>
        {!createdSignalId && (
          <Button
            size="small"
            variant="contained"
            onClick={onSaveAgain}
            disabled={isSaving}
            sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
          >
            Save signal
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default PipelineSignalResult;
