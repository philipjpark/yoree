/**
 * Live market quotes for discovered pipeline assets.
 */

import { DiscoveredAsset } from './pipelineService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';

export interface AssetQuote {
  symbol: string;
  price?: number;
  change24h?: number;
  change24h_percent?: number;
  currency: string;
  market_source: string;
  fetched_at: string;
}

export async function enrichAssetsWithLiveQuotes(
  assets: DiscoveredAsset[]
): Promise<DiscoveredAsset[]> {
  if (!assets.length) return assets;

  try {
    const response = await fetch(`${API_BASE_URL}/api/markets/enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assets: assets.map((a) => ({
          symbol: a.symbol,
          asset_class: a.assetClass,
        })),
      }),
    });

    if (!response.ok) return assets;

    const data = (await response.json()) as { quotes?: AssetQuote[] };
    const bySymbol = new Map(
      (data.quotes || []).map((q) => [q.symbol.toUpperCase(), q])
    );

    return assets.map((asset) => {
      const q = bySymbol.get(asset.symbol.toUpperCase());
      if (!q || q.price == null) return asset;
      return {
        ...asset,
        livePrice: q.price,
        change24h: q.change24h,
        change24hPercent: q.change24h_percent,
        priceCurrency: q.currency || 'USD',
        marketSource: q.market_source,
        marketFetchedAt: q.fetched_at,
      };
    });
  } catch {
    return assets;
  }
}

export function formatUsdPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}
