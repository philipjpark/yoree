import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Share as SocialIcon,
  Language as WebIcon,
  Psychology as AIIcon,
  ShowChart as ChartIcon,
  CandlestickChart as MarketsIcon,
} from '@mui/icons-material';

interface PipelineHowItWorksProps {
  isDark: boolean;
}

const AGENT_STEPS = [
  {
    icon: <SocialIcon sx={{ fontSize: 18, color: '#3b82f6' }} />,
    title: 'Ingest your graph',
    body: 'Greed reads posts from your connected socials (followers, following, communities) — your real information graph, not a generic feed.',
    accent: '#3b82f6',
  },
  {
    icon: <WebIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />,
    title: 'Corroborate on the web',
    body: 'Agents cross-check the narrative against live web sources — regulatory filings, market pages, forums, news, and structured extracts (including Nimble when needed) — so the thesis is evidence-backed, not feed hype alone.',
    accent: '#8b5cf6',
  },
  {
    icon: <AIIcon sx={{ fontSize: 18, color: '#10b981' }} />,
    title: 'Orchestrate the signal',
    body: 'Multi-step AI fuses your social corpus + web proof into a hypothesis, sentiment, confidence score, and ranked trade ideas.',
    accent: '#10b981',
  },
  {
    icon: <MarketsIcon sx={{ fontSize: 18, color: '#f59e0b' }} />,
    title: 'Discover real assets (live)',
    body: 'Maps the thesis to real instruments — stocks, crypto, futures, options, prediction markets, sports — and attaches live price and 24h move data where available before you act.',
    accent: '#f59e0b',
  },
  {
    icon: <ChartIcon sx={{ fontSize: 18, color: '#06b6d4' }} />,
    title: 'Route to venue',
    body: 'Each asset links to the right place to trade or bet (Robinhood, Binance, Kalshi, DraftKings, and more) with strategy context.',
    accent: '#06b6d4',
  },
];

export const PipelineHowItWorks: React.FC<PipelineHowItWorksProps> = ({ isDark }) => {
  const [open, setOpen] = useState(true);

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
        background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.25, cursor: 'pointer' }}
        onClick={() => setOpen((v) => !v)}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: (theme) => theme.palette.text.primary }}>
            How Greed works (agentic pipeline)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
            Connect socials → one tap → real signal, web proof, live assets
          </Typography>
        </Box>
        <IconButton size="small">{open ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
      </Stack>
      <Collapse in={open}>
        <Stack spacing={1.25} sx={{ px: 2, pb: 2 }}>
          {AGENT_STEPS.map((step) => (
            <Stack key={step.title} direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${step.accent}12`,
                  border: `1px solid ${step.accent}25`,
                }}
              >
                {step.icon}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {step.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.45, fontSize: '0.72rem' }}>
                  {step.body}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default PipelineHowItWorks;
