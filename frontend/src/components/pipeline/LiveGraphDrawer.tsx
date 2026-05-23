import React, { useMemo, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Paper,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../../contexts/ThemeContext';
import { LiveGraphData } from '../../services/liveGraphService';

interface LiveGraphDrawerProps {
  open: boolean;
  onClose: () => void;
  data: LiveGraphData | null;
  loading: boolean;
  isDark: boolean;
  xHandle: string;
  onXHandleChange: (handle: string) => void;
  onRefresh: () => void;
}

const sourceColors: Record<string, { bg: string; color: string; label: string }> = {
  live: { bg: '#10b98118', color: '#10b981', label: 'LIVE' },
  demo: { bg: '#f59e0b18', color: '#f59e0b', label: 'DEMO' },
  unavailable: { bg: '#ef444418', color: '#ef4444', label: 'N/A' },
};

export const LiveGraphDrawer: React.FC<LiveGraphDrawerProps> = ({
  open,
  onClose,
  data,
  loading,
  isDark,
  xHandle,
  onXHandleChange,
  onRefresh,
}) => {
  const { theme } = useTheme();
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const [tradableOnly, setTradableOnly] = useState(false);
  const tradablePattern =
    /(\$[A-Z]{2,12}|0x[a-fA-F0-9]{8,})|\b(BTC|ETH|SOL|BNB|CRCL|USDC|USDT)\b/i;

  const posts = useMemo(() => {
    if (!data?.posts) return [];
    if (!tradableOnly) return data.posts;
    return data.posts.filter((p) => tradablePattern.test(p.text));
  }, [data?.posts, tradableOnly]);

  const badge = data ? sourceColors[data.sourceKind] : sourceColors.unavailable;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          background: isDark ? '#0f172a' : '#f8fafc',
        },
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: textPrimary }}>
              {data?.platformLabel || 'Live graph'}
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary, display: 'block' }}>
              {data?.sourceLabel || 'Loading…'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: textSecondary }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {data?.platform === 'x' && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="X handle"
              value={xHandle}
              onChange={(e) => onXHandleChange(e.target.value.replace(/^@/, ''))}
              placeholder="optional — live only"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Stack>
        )}

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={badge.label} size="small" sx={{ fontWeight: 800, background: badge.bg, color: badge.color }} />
          <Chip
            label={`${posts.length} posts`}
            size="small"
            variant="outlined"
            sx={{
              color: textPrimary,
              borderColor: isDark ? 'rgba(255,255,255,0.25)' : undefined,
            }}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={tradableOnly}
                onChange={(e) => setTradableOnly(e.target.checked)}
              />
            }
            label={<Typography variant="caption" sx={{ color: textSecondary }}>Tradable only</Typography>}
            sx={{ ml: 'auto', mr: 0 }}
          />
        </Stack>

        <Typography variant="caption" sx={{ color: textSecondary, mb: 2, lineHeight: 1.4 }}>
          {data?.sourceKind === 'live'
            ? 'Live data from your X API token on the backend.'
            : data?.sourceKind === 'demo'
            ? 'Embedded demo corpus (fallback toggle is on).'
            : data?.sourceLabel || 'Connect X and set X_BEARER_TOKEN on the backend for live data.'}
        </Typography>

        <Box sx={{ flex: 1, overflow: 'auto', pr: 0.5 }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={32} />
            </Stack>
          ) : posts.length === 0 ? (
            <Typography variant="body2" sx={{ color: textSecondary, textAlign: 'center', py: 4 }}>
              No posts to show.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {posts.map((post) => (
                <Paper
                  key={post.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.68rem' }}>
                    @{post.author}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '0.78rem', lineHeight: 1.45, mt: 0.5, color: textPrimary }}
                  >
                    {post.text}
                  </Typography>
                  {post.tickers.length > 0 && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                      {post.tickers.map((t) => (
                        <Chip
                          key={t}
                          label={t}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            color: textPrimary,
                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : undefined,
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </Box>

        {data?.platform === 'x' && (
          <Box sx={{ pt: 2 }}>
            <Typography
              component="button"
              onClick={onRefresh}
              sx={{
                border: 'none',
                background: 'none',
                color: '#6366f1',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                p: 0,
              }}
            >
              Refresh live graph
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default LiveGraphDrawer;
