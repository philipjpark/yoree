import axios from 'axios';

export interface TokenPriceData {
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

interface CoinGeckoSimplePriceResponse {
  [key: string]: {
    usd: number;
    usd_market_cap: number;
    usd_24h_vol: number;
    usd_24h_change: number;
    usd_24h_high: number;
    usd_24h_low: number;
    last_updated_at: number;
  };
}

class RealTimePriceService {
  private readonly COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
  private readonly COINGECKO_TOKEN_MAP: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binancecoin',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'RAY': 'raydium',
    'SRM': 'serum',
    'ORCA': 'orca',
    'MNGO': 'mango-markets',
    'BONK': 'bonk',
    'JUP': 'jupiter-exchange',
    'PYTH': 'pyth-network',
    'WIF': 'dogwifhat',
    'POPCAT': 'popcat',
    'SAMO': 'samoyedcoin',
    'STEP': 'step-app',
    'ATLAS': 'star-atlas',
    'POLIS': 'star-atlas-dao',
    'AUDIO': 'audius',
    'tBNB': 'binancecoin' // Using binancecoin for tBNB as a proxy
  };

  private cache: Map<string, { data: TokenPriceData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  private async fetchFromCoinGecko(coinIds: string[]): Promise<CoinGeckoSimplePriceResponse> {
    try {
      const response = await axios.get<CoinGeckoSimplePriceResponse>(this.COINGECKO_API_URL, {
        params: {
          ids: coinIds.join(','),
          vs_currencies: 'usd',
          include_24hr_vol: true,
          include_24hr_change: true,
          include_market_cap: true,
          include_high_24h: true,
          include_low_24h: true,
          include_last_updated_at: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching from CoinGecko API:', error);
      throw new Error('Failed to fetch prices from CoinGecko');
    }
  }

  private mapCoinGeckoDataToTokenPriceData(symbol: string, data: any): TokenPriceData {
    return {
      symbol: symbol,
      price: data.usd || 0,
      marketCap: data.usd_market_cap || 0,
      volume24h: data.usd_24h_vol || 0,
      priceChange24h: data.usd_24h_change || 0,
      priceChangePercentage24h: data.usd_24h_change || 0, // CoinGecko returns absolute change, not percentage
      high24h: data.usd_24h_high || 0,
      low24h: data.usd_24h_low || 0,
      lastUpdated: new Date((data.last_updated_at || Date.now() / 1000) * 1000).toISOString(),
    };
  }

  public async getTokenPrice(symbol: string): Promise<TokenPriceData> {
    const cached = this.cache.get(symbol);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      return cached.data;
    }

    const coinId = this.COINGECKO_TOKEN_MAP[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error(`Token ${symbol} not found in CoinGecko map.`);
    }

    const data = await this.fetchFromCoinGecko([coinId]);
    const priceData = this.mapCoinGeckoDataToTokenPriceData(symbol, data[coinId]);

    this.cache.set(symbol, { data: priceData, timestamp: Date.now() });
    return priceData;
  }

  public async getMultipleTokenPrices(symbols: string[]): Promise<TokenPriceData[]> {
    const coinIdsToFetch: string[] = [];
    const results: TokenPriceData[] = [];
    const now = Date.now();

    for (const symbol of symbols) {
      const cached = this.cache.get(symbol);
      if (cached && (now - cached.timestamp < this.CACHE_DURATION)) {
        results.push(cached.data);
      } else {
        const coinId = this.COINGECKO_TOKEN_MAP[symbol.toUpperCase()];
        if (coinId && !coinIdsToFetch.includes(coinId)) {
          coinIdsToFetch.push(coinId);
        }
      }
    }

    if (coinIdsToFetch.length > 0) {
      const fetchedData = await this.fetchFromCoinGecko(coinIdsToFetch);
      for (const symbol of symbols) {
        const coinId = this.COINGECKO_TOKEN_MAP[symbol.toUpperCase()];
        if (coinId && fetchedData[coinId]) {
          const priceData = this.mapCoinGeckoDataToTokenPriceData(symbol, fetchedData[coinId]);
          this.cache.set(symbol, { data: priceData, timestamp: now });
          results.push(priceData);
        }
      }
    }
    return results;
  }
}

const realTimePriceService = new RealTimePriceService();
export default realTimePriceService;
