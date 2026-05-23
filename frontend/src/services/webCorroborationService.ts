/**
 * Web corroboration for the Greed Pipeline.
 * Calls backend only — Nimble API key stays server-side.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';

export interface WebEvidence {
  source_type: string;
  title: string;
  url: string;
  snippet: string;
  fetched_at: string;
  via: string;
}

export interface WebDiscoveredAsset {
  symbol: string;
  name: string;
  asset_class: string;
  source_url: string;
  via: string;
}

export interface CorroborateResponse {
  evidence: WebEvidence[];
  tickers: string[];
  discovered_assets?: WebDiscoveredAsset[];
  nimble_calls_used: number;
  cache_hits: number;
  corroboration_block: string;
  enabled: boolean;
}

const DEFAULT_NIMBLE_CALLS = Number(process.env.REACT_APP_NIMBLE_MAX_CALLS || 4);

export async function corroborateCorpus(
  corpus: string,
  maxNimbleCalls = DEFAULT_NIMBLE_CALLS
): Promise<CorroborateResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/web/corroborate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corpus, max_nimble_calls: maxNimbleCalls }),
    });

    if (!response.ok) {
      console.warn('Web corroboration failed:', response.status, response.statusText);
      return null;
    }

    return (await response.json()) as CorroborateResponse;
  } catch (err) {
    console.warn('Web corroboration unavailable:', err);
    return null;
  }
}
