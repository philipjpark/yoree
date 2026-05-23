import React from 'react';
import { Box, Stack, Typography, LinearProgress } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
} from '@mui/icons-material';

export type PipelineFlowStepId = 'connect' | 'analyze' | 'review' | 'act';

export interface PipelineFlowStep {
  id: PipelineFlowStepId;
  label: string;
  short: string;
}

const STEPS: PipelineFlowStep[] = [
  { id: 'connect', label: 'Connect', short: '1' },
  { id: 'analyze', label: 'Analyze', short: '2' },
  { id: 'review', label: 'Review', short: '3' },
  { id: 'act', label: 'Trade', short: '4' },
];

interface PipelineFlowStepperProps {
  activeStep: PipelineFlowStepId;
  isDark: boolean;
  socialsConnected: boolean;
}

const stepIndex = (id: PipelineFlowStepId) => STEPS.findIndex((s) => s.id === id);

export const PipelineFlowStepper: React.FC<PipelineFlowStepperProps> = ({
  activeStep,
  isDark,
  socialsConnected,
}) => {
  const activeIdx = stepIndex(activeStep);
  const progress = ((activeIdx + 1) / STEPS.length) * 100;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#10b981', letterSpacing: '0.08em' }}>
          YOUR FLOW
        </Typography>
        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary', fontSize: '0.68rem' }}>
          {socialsConnected ? 'Socials linked' : 'Connect a social to start'}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          borderRadius: 2,
          mb: 2,
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            background: 'linear-gradient(90deg, #6366f1, #10b981, #f59e0b)',
          },
        }}
      />
      <Stack direction="row" justifyContent="space-between">
        {STEPS.map((step, idx) => {
          const done = idx < activeIdx;
          const current = idx === activeIdx;
          return (
            <Stack key={step.id} alignItems="center" spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: done
                    ? '#10b98120'
                    : current
                    ? 'linear-gradient(135deg, #6366f1, #10b981)'
                    : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)',
                  border: `2px solid ${done ? '#10b981' : current ? 'transparent' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  boxShadow: current ? '0 4px 14px rgba(16,185,129,0.35)' : 'none',
                }}
              >
                {done ? (
                  <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} />
                ) : current ? (
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>{step.short}</Typography>
                ) : (
                  <PendingIcon sx={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }} />
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: current ? 800 : 600,
                  fontSize: '0.62rem',
                  color: current ? '#10b981' : done ? '#10b981' : isDark ? 'rgba(255,255,255,0.45)' : 'text.secondary',
                  textAlign: 'center',
                }}
              >
                {step.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

export default PipelineFlowStepper;
