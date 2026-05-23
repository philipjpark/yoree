export type DefaultStrategyId = 'buy_hold' | 'momentum' | 'mean_reversion' | 'breakout';

export interface DefaultExecutionStrategy {
  id: DefaultStrategyId;
  name: string;
  tagline: string;
  action: 'long' | 'short' | 'watch';
  entry: string;
  exit: string;
  risk: string;
  timeHorizon: string;
}

export const DEFAULT_EXECUTION_STRATEGIES: DefaultExecutionStrategy[] = [
  {
    id: 'buy_hold',
    name: 'Buy & Hold',
    tagline: 'Accumulate on weakness, hold through noise',
    action: 'long',
    entry: 'Scale in near support or after a confirmed higher low; avoid chasing vertical spikes.',
    exit: 'Trim into extended rallies; core position until thesis breaks (trend or macro invalidation).',
    risk: 'Size 1–2% risk per add; wide stop below major structure or invalidation level.',
    timeHorizon: 'Weeks to months',
  },
  {
    id: 'momentum',
    name: 'Momentum',
    tagline: 'Trade strength — ride the trend',
    action: 'long',
    entry: 'Enter on breakout above resistance with rising volume; add on first pullback to breakout zone.',
    exit: 'Take partial profits at 1R/2R; trail stop under 20EMA or last swing low.',
    risk: 'Max 1–2% account risk; skip if volume fades or RSI diverges on new highs.',
    timeHorizon: '1–5 days',
  },
  {
    id: 'mean_reversion',
    name: 'Mean Reversion',
    tagline: 'Buy the dip / fade the spike',
    action: 'long',
    entry: 'Buy oversold bounces at support (Bollinger lower band, prior demand zone) when broader trend intact.',
    exit: 'Exit at mean (20EMA / VWAP) or prior resistance; cut if support fails.',
    risk: 'Smaller size (0.5–1% risk); tight stop below support — failed bounce = exit fast.',
    timeHorizon: 'Intraday to 3 days',
  },
  {
    id: 'breakout',
    name: 'Breakout',
    tagline: 'Range break with defined invalidation',
    action: 'long',
    entry: 'Enter when price closes above range high; confirm with volume > recent average.',
    exit: 'Target measured move (range height); stop back inside range on failed breakout.',
    risk: 'Risk 1% to stop just below breakout level; avoid false breaks in low liquidity.',
    timeHorizon: '1–7 days',
  },
];

export function getDefaultStrategy(id: DefaultStrategyId): DefaultExecutionStrategy {
  return DEFAULT_EXECUTION_STRATEGIES.find((s) => s.id === id) ?? DEFAULT_EXECUTION_STRATEGIES[1];
}
