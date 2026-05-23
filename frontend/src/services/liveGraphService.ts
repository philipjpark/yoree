import { DEMO_X_CORPUS, DEMO_X_CORPUS_LABEL } from '../constants/demoXCorpus';
import { isLiveSocialCorpus, signalService } from './signalService';
import { SocialPlatform } from './pipelineService';

export type GraphSourceKind = 'live' | 'demo' | 'unavailable';

export interface GraphPost {
  id: string;
  author: string;
  text: string;
  tickers: string[];
}

export interface LiveGraphData {
  platform: SocialPlatform;
  platformLabel: string;
  handle?: string;
  sourceKind: GraphSourceKind;
  sourceLabel: string;
  sourceCount: number;
  posts: GraphPost[];
}

const TICKER_RE = /(\$[A-Z]{1,5})\b/g;

function extractTickers(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(TICKER_RE)) {
    if (m[1]) found.add(m[1].toUpperCase());
  }
  return [...found];
}

function parseCorpusLines(corpus: string): GraphPost[] {
  return corpus
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('---'))
    .map((line, i) => {
      const match = line.match(/^@?([^:]+):\s*(.+)$/);
      const author = match?.[1]?.trim() || 'unknown';
      const text = match?.[2]?.trim() || line;
      return {
        id: `post-${i}`,
        author,
        text,
        tickers: extractTickers(text),
      };
    });
}

export async function fetchLiveGraph(
  platform: SocialPlatform,
  xHandle?: string,
  options?: { useDemoFallback?: boolean }
): Promise<LiveGraphData> {
  const handle = (xHandle || '').trim();
  const useDemoFallback = options?.useDemoFallback !== false;

  if (platform === 'x') {
    if (useDemoFallback) {
      return {
        platform,
        platformLabel: 'X (Twitter)',
        handle: handle || undefined,
        sourceKind: 'demo',
        sourceLabel: `Demo graph · ${DEMO_X_CORPUS_LABEL} · ${DEMO_X_CORPUS.asOfDate}`,
        sourceCount: DEMO_X_CORPUS.sourceCount,
        posts: parseCorpusLines(DEMO_X_CORPUS.corpus),
      };
    }

    const liveHandle = handle || 'crypto';
    const result = await signalService.getXGraphCorpus(liveHandle);
    if (result && isLiveSocialCorpus(result)) {
      return {
        platform,
        platformLabel: 'X (Twitter)',
        handle,
        sourceKind: 'live',
        sourceLabel: `Live graph · @${handle} · ${result.sourceCount} accounts`,
        sourceCount: result.sourceCount,
        posts: parseCorpusLines(result.corpus),
      };
    }
    const hint = !result
      ? 'Cannot reach backend at ' +
        (process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001') +
        ' — is cargo run running?'
      : result.message ||
        (result.tokenConfigured
          ? 'Live fetch failed — check X API tier/scopes or try again later.'
          : 'Set X_BEARER_TOKEN in backend/.env and restart the server.');
    return {
      platform,
      platformLabel: 'X (Twitter)',
      handle,
      sourceKind: 'unavailable',
      sourceLabel: hint,
      sourceCount: 0,
      posts: [],
    };
  }

  if (platform === 'reddit') {
    const result = await signalService.getRedditPublicCorpus();
    if (result && isLiveSocialCorpus(result)) {
      return {
        platform,
        platformLabel: 'Reddit',
        sourceKind: 'live',
        sourceLabel: `Live · ${result.sourceCount} subreddits`,
        sourceCount: result.sourceCount,
        posts: parseCorpusLines(result.corpus),
      };
    }
  }

  return {
    platform,
    platformLabel: platform,
    sourceKind: 'unavailable',
    sourceLabel: 'Not available yet',
    sourceCount: 0,
    posts: [],
  };
}

export function oneLineHypothesis(text: string, maxLen = 140): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const first = cleaned.split(/(?<=[.!?])\s+/)[0] || cleaned;
  const line = first.length > maxLen ? `${first.slice(0, maxLen - 1)}…` : first;
  return line;
}
