export interface SolanaToken {
  symbol: string;
  name: string;
  address: string;
  description: string;
  marketCap?: number;
  price?: number;
  volume24h?: number;
  website?: string;
  whitepaper?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  category: 'DeFi' | 'NFT' | 'Gaming' | 'Infrastructure' | 'Meme' | 'Other';
  launchDate?: string;
  totalSupply?: number;
  circulatingSupply?: number;
}

class SolanaTokensService {
  private tokens: SolanaToken[] = [
    {
      symbol: 'tBNB',
      name: 'BSC Testnet BNB',
      address: '0x0000000000000000000000000000000000000000',
      description: 'BNB token on BSC testnet for testing and development purposes.',
      marketCap: 1000000000,
      price: 300.00,
      volume24h: 500000000,
      website: 'https://www.bnbchain.org',
      whitepaper: 'https://www.bnbchain.org/en/whitepaper',
      twitter: 'https://twitter.com/BNBCHAIN',
      discord: 'https://discord.gg/bnbchain',
      category: 'Infrastructure',
      launchDate: '2020-09-01',
      totalSupply: 200000000,
      circulatingSupply: 150000000
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      address: 'So11111111111111111111111111111111111111112',
      description: 'High-performance blockchain platform designed for decentralized applications and marketplaces.',
      marketCap: 45000000000,
      price: 95.50,
      volume24h: 2500000000,
      website: 'https://solana.com',
      whitepaper: 'https://solana.com/solana-whitepaper.pdf',
      twitter: 'https://twitter.com/solana',
      discord: 'https://discord.gg/solana',
      category: 'Infrastructure',
      launchDate: '2020-03-16',
      totalSupply: 533000000,
      circulatingSupply: 410000000
    },
    {
      symbol: 'RAY',
      name: 'Raydium',
      address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      description: 'Automated market maker (AMM) and liquidity provider built on Solana.',
      marketCap: 85000000,
      price: 0.85,
      volume24h: 15000000,
      website: 'https://raydium.io',
      whitepaper: 'https://raydium.io/raydiumlitepaper.pdf',
      twitter: 'https://twitter.com/RaydiumProtocol',
      discord: 'https://discord.gg/raydium',
      category: 'DeFi',
      launchDate: '2021-02-14',
      totalSupply: 100000000,
      circulatingSupply: 100000000
    },
    {
      symbol: 'SRM',
      name: 'Serum',
      address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      description: 'Decentralized exchange (DEX) and ecosystem built on Solana.',
      marketCap: 120000000,
      price: 0.12,
      volume24h: 8000000,
      website: 'https://projectserum.com',
      whitepaper: 'https://projectserum.com/serum-dex-litepaper.pdf',
      twitter: 'https://twitter.com/ProjectSerum',
      discord: 'https://discord.gg/ProjectSerum',
      category: 'DeFi',
      launchDate: '2020-08-01',
      totalSupply: 1000000000,
      circulatingSupply: 1000000000
    },
    {
      symbol: 'ORCA',
      name: 'Orca',
      address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
      description: 'User-friendly AMM built on Solana with concentrated liquidity.',
      marketCap: 65000000,
      price: 0.65,
      volume24h: 12000000,
      website: 'https://orca.so',
      whitepaper: 'https://orca.so/whitepaper.pdf',
      twitter: 'https://twitter.com/orca_so',
      discord: 'https://discord.gg/orca',
      category: 'DeFi',
      launchDate: '2021-03-01',
      totalSupply: 100000000,
      circulatingSupply: 100000000
    },
    {
      symbol: 'MNGO',
      name: 'Mango',
      address: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
      description: 'Decentralized trading platform with cross-margin and lending.',
      marketCap: 45000000,
      price: 0.045,
      volume24h: 5000000,
      website: 'https://mango.markets',
      whitepaper: 'https://docs.mango.markets/mango-markets-litepaper',
      twitter: 'https://twitter.com/mangomarkets',
      discord: 'https://discord.gg/mango',
      category: 'DeFi',
      launchDate: '2021-08-01',
      totalSupply: 1000000000,
      circulatingSupply: 1000000000
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      description: 'Community-driven meme token on Solana with utility features.',
      marketCap: 35000000,
      price: 0.0000035,
      volume24h: 8000000,
      website: 'https://bonkcoin.com',
      twitter: 'https://twitter.com/bonk_inu',
      discord: 'https://discord.gg/bonk',
      category: 'Meme',
      launchDate: '2022-12-25',
      totalSupply: 1000000000000000,
      circulatingSupply: 1000000000000000
    },
    {
      symbol: 'JUP',
      name: 'Jupiter',
      address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      description: 'Leading DEX aggregator on Solana providing best swap routes.',
      marketCap: 280000000,
      price: 0.28,
      volume24h: 25000000,
      website: 'https://jup.ag',
      whitepaper: 'https://docs.jup.ag/jupiter/introduction',
      twitter: 'https://twitter.com/jupiterexchange',
      discord: 'https://discord.gg/jupiter',
      category: 'DeFi',
      launchDate: '2024-01-31',
      totalSupply: 1000000000,
      circulatingSupply: 1000000000
    },
    {
      symbol: 'PYTH',
      name: 'Pyth Network',
      address: 'HZ1JovNiVvGrGNiiYvEozEVg58WUyVpBq8gH9g4eJq1',
      description: 'Decentralized oracle network providing real-time market data.',
      marketCap: 180000000,
      price: 0.18,
      volume24h: 15000000,
      website: 'https://pyth.network',
      whitepaper: 'https://pyth.network/whitepaper.pdf',
      twitter: 'https://twitter.com/PythNetwork',
      discord: 'https://discord.gg/pyth',
      category: 'Infrastructure',
      launchDate: '2023-11-20',
      totalSupply: 1000000000,
      circulatingSupply: 1000000000
    },
    {
      symbol: 'WIF',
      name: 'dogwifhat',
      address: 'EKpQGSJtjMFqKZ1KQanSqYXRcF8fBopzLHYxdM65Qjm',
      description: 'Popular meme token featuring a dog with a hat on Solana.',
      marketCap: 220000000,
      price: 0.22,
      volume24h: 18000000,
      website: 'https://dogwifcoin.org',
      twitter: 'https://twitter.com/dogwifcoin',
      discord: 'https://discord.gg/dogwifhat',
      category: 'Meme',
      launchDate: '2023-12-19',
      totalSupply: 1000000000,
      circulatingSupply: 1000000000
    },
    {
      symbol: 'POPCAT',
      name: 'Popcat',
      address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
      description: 'Meme token inspired by the popular Popcat meme.',
      marketCap: 15000000,
      price: 0.015,
      volume24h: 3000000,
      website: 'https://popcat.io',
      twitter: 'https://twitter.com/popcat_sol',
      category: 'Meme',
      launchDate: '2024-01-15',
      totalSupply: 1000000000,
      circulatingSupply: 1000000000
    },
    {
      symbol: 'SAMO',
      name: 'Samoyedcoin',
      address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      description: 'Community-driven meme token and Solana education platform.',
      marketCap: 25000000,
      price: 0.0025,
      volume24h: 4000000,
      website: 'https://samoyedcoin.com',
      twitter: 'https://twitter.com/samoyedcoin',
      discord: 'https://discord.gg/samoyedcoin',
      category: 'Meme',
      launchDate: '2021-04-01',
      totalSupply: 10000000000,
      circulatingSupply: 10000000000
    },
    {
      symbol: 'STEP',
      name: 'Step',
      address: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
      description: 'Fitness and lifestyle token with move-to-earn mechanics.',
      marketCap: 40000000,
      price: 0.04,
      volume24h: 6000000,
      website: 'https://step.app',
      whitepaper: 'https://step.app/whitepaper',
      twitter: 'https://twitter.com/step_app_',
      discord: 'https://discord.gg/step',
      category: 'Gaming',
      launchDate: '2021-09-01',
      totalSupply: 1000000000,
      circulatingSupply: 1000000000
    },
    {
      symbol: 'ATLAS',
      name: 'Star Atlas',
      address: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
      description: 'Gaming token for the Star Atlas space exploration game.',
      marketCap: 35000000,
      price: 0.035,
      volume24h: 5000000,
      website: 'https://staratlas.com',
      whitepaper: 'https://staratlas.com/whitepaper',
      twitter: 'https://twitter.com/staratlas',
      discord: 'https://discord.gg/staratlas',
      category: 'Gaming',
      launchDate: '2021-09-01',
      totalSupply: 1000000000,
      circulatingSupply: 1000000000
    },
    {
      symbol: 'POLIS',
      name: 'Star Atlas DAO',
      address: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjtxchq',
      description: 'Governance token for the Star Atlas DAO.',
      marketCap: 20000000,
      price: 0.20,
      volume24h: 3000000,
      website: 'https://staratlas.com',
      twitter: 'https://twitter.com/staratlas',
      discord: 'https://discord.gg/staratlas',
      category: 'Gaming',
      launchDate: '2021-09-01',
      totalSupply: 100000000,
      circulatingSupply: 100000000
    },
    {
      symbol: 'AUDIO',
      name: 'Audius',
      address: '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM',
      description: 'Decentralized music streaming platform.',
      marketCap: 80000000,
      price: 0.08,
      volume24h: 10000000,
      website: 'https://audius.co',
      whitepaper: 'https://audius.co/whitepaper',
      twitter: 'https://twitter.com/AudiusProject',
      discord: 'https://discord.gg/audius',
      category: 'Other',
      launchDate: '2020-10-01',
      totalSupply: 1000000000,
      circulatingSupply: 1000000000
    }
  ];

  // Get all tokens
  async getAllTokens(): Promise<SolanaToken[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.tokens;
  }

  // Get tokens by category
  async getTokensByCategory(category: SolanaToken['category']): Promise<SolanaToken[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.tokens.filter(token => token.category === category);
  }

  // Search tokens
  async searchTokens(query: string): Promise<SolanaToken[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const lowercaseQuery = query.toLowerCase();
    return this.tokens.filter(token => 
      token.name.toLowerCase().includes(lowercaseQuery) ||
      token.symbol.toLowerCase().includes(lowercaseQuery) ||
      token.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get token by symbol
  async getTokenBySymbol(symbol: string): Promise<SolanaToken | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.tokens.find(token => token.symbol.toLowerCase() === symbol.toLowerCase()) || null;
  }

  // Get trending tokens (mock implementation)
  async getTrendingTokens(): Promise<SolanaToken[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Return tokens with highest volume
    return this.tokens
      .filter(token => token.volume24h)
      .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
      .slice(0, 5);
  }

  // Get categories
  getCategories(): SolanaToken['category'][] {
    return ['DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Meme', 'Other'];
  }
}

const solanaTokensService = new SolanaTokensService();
export default solanaTokensService; 