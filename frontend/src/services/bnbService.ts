import { ethers } from 'ethers';
// @ts-ignore
import StrategyManagerABI from '../contracts/StrategyManager.json';

// BSC Testnet configuration
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const BSC_MAINNET_RPC = 'https://bsc-dataseed.binance.org/';

// Contract addresses (update these after deployment)
const STRATEGY_MANAGER_ADDRESS = {
  testnet: '0x0000000000000000000000000000000000000000', // Replace with deployed address
  mainnet: '0x0000000000000000000000000000000000000000'  // Replace with deployed address
};

// PayPal USD token addresses on BSC
const PAYPAL_USD_ADDRESS = {
  testnet: '0x0000000000000000000000000000000000000000', // Replace with real address
  mainnet: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'  // Real PayPal USD on BSC mainnet
};

// Testnet PYUSD Mock Contract (for development)
const MOCK_PYUSD_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace after deployment

// BNB Chain tokens - PYUSD Focus Only
export const BNB_TOKENS = [
  {
    symbol: 'BNB',
    name: 'BNB',
    address: '0x0000000000000000000000000000000000000000', // Native BNB
    decimals: 18,
    description: 'BNB Chain native token with high throughput and low fees',
    price: 320.45,
    change24h: 2.3,
    marketCap: '48.2B'
  },
  {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    address: PAYPAL_USD_ADDRESS.mainnet,
    decimals: 6,
    description: 'PayPal\'s stablecoin for digital payments - Platform Focus',
    price: 1.00,
    change24h: 0.0,
    marketCap: '1.2B',
    isPlatformFocus: true
  },
  {
    symbol: 'tBNB',
    name: 'Test BNB',
    address: '0x0000000000000000000000000000000000000000', // Native tBNB on testnet
    decimals: 18,
    description: 'BNB Chain testnet token for development and testing',
    price: 320.45,
    change24h: 2.3,
    marketCap: 'Testnet'
  }
];

class BNBService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private network: 'testnet' | 'mainnet' = 'testnet';

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) {
      throw new Error('MetaMask not detected');
    }

    try {
      // Request account access
      await this.provider.send('eth_requestAccounts', []);
      const address = await this.signer!.getAddress();
      
      // Get network
      const network = await this.provider.getNetwork();
      this.network = network.chainId === 97 ? 'testnet' : 'mainnet';
      
      // Initialize contract
      if (!this.signer) throw new Error('Signer not initialized');
      this.contract = new ethers.Contract(
        STRATEGY_MANAGER_ADDRESS[this.network],
        StrategyManagerABI.abi,
        this.signer
      );

      console.log('✅ Connected to BNB Chain:', this.network);
      return address;
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
      this.provider
    );
    
    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(userAddress),
      tokenContract.decimals()
    ]);
    
    return ethers.utils.formatUnits(balance, decimals);
  }

  async getPYUSDBalance(userAddress: string): Promise<string> {
    try {
      if (this.network === 'mainnet') {
        return await this.getTokenBalance(PAYPAL_USD_ADDRESS.mainnet, userAddress);
      } else {
        // For testnet, return mock balance for philxdaegu
        if (userAddress.toLowerCase() === '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6') {
          return '1000.00'; // Mock PYUSD balance for philxdaegu
        }
        return await this.getTokenBalance(MOCK_PYUSD_ADDRESS, userAddress);
      }
    } catch (error) {
      console.error('Error fetching PYUSD balance:', error);
      return '0.00';
    }
  }

  async getAllBalances(userAddress: string): Promise<{ bnb: string; pyusd: string; tbnb: string }> {
    try {
      const [bnbBalance, pyusdBalance] = await Promise.all([
        this.getBalance(userAddress),
        this.getPYUSDBalance(userAddress)
      ]);

      return {
        bnb: bnbBalance,
        pyusd: pyusdBalance,
        tbnb: bnbBalance // tBNB is the same as BNB on testnet
      };
    } catch (error) {
      console.error('Error fetching balances:', error);
      return {
        bnb: '0.00',
        pyusd: '0.00',
        tbnb: '0.00'
      };
    }
  }

  async createStrategy(
    name: string,
    description: string,
    targetToken: string,
    stopLoss: number,
    takeProfit: number,
    positionSize: number
  ): Promise<ethers.ContractTransaction> {
    if (!this.contract) throw new Error('Contract not initialized');

    const tx = await this.contract.createStrategy(
      name,
      description,
      targetToken,
      ethers.utils.parseUnits(stopLoss.toString(), 18),
      ethers.utils.parseUnits(takeProfit.toString(), 18),
      ethers.utils.parseUnits(positionSize.toString(), 18)
    );

    console.log('📝 Creating strategy:', tx.hash);
    return tx;
  }

  async openPosition(strategyId: number, amount: string): Promise<ethers.ContractTransaction> {
    if (!this.contract || !this.signer) throw new Error('Contract or signer not initialized');

    // First approve PYUSD spending
    const paypalUSD = new ethers.Contract(
      PAYPAL_USD_ADDRESS[this.network],
      ['function approve(address,uint256) returns (bool)'],
      this.signer!
    );

    const amountWei = ethers.utils.parseUnits(amount, 6); // PYUSD has 6 decimals
    await paypalUSD.approve(this.contract.address, amountWei);

    const tx = await this.contract.openPosition(strategyId, amountWei);
    console.log('💰 Opening position:', tx.hash);
    return tx;
  }

  async closePosition(positionIndex: number): Promise<ethers.ContractTransaction> {
    if (!this.contract) throw new Error('Contract not initialized');

    const tx = await this.contract.closePosition(positionIndex);
    console.log('🔒 Closing position:', tx.hash);
    return tx;
  }

  async getStrategy(strategyId: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not initialized');

    const strategy = await this.contract.getStrategy(strategyId);
    return {
      id: strategy.id.toNumber(),
      creator: strategy.creator,
      name: strategy.name,
      description: strategy.description,
      targetToken: strategy.targetToken,
      entryPrice: ethers.utils.formatUnits(strategy.entryPrice, 18),
      stopLoss: ethers.utils.formatUnits(strategy.stopLoss, 18),
      takeProfit: ethers.utils.formatUnits(strategy.takeProfit, 18),
      positionSize: ethers.utils.formatUnits(strategy.positionSize, 18),
      isActive: strategy.isActive,
      createdAt: new Date(strategy.createdAt.toNumber() * 1000),
      totalReturn: ethers.utils.formatUnits(strategy.totalReturn, 18),
      totalTrades: strategy.totalTrades.toNumber(),
      winRate: strategy.winRate.toNumber()
    };
  }

  async getUserPositions(userAddress: string): Promise<any[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    const positions = await this.contract.getUserPositions(userAddress);
    return positions.map((pos: any) => ({
      strategyId: pos.strategyId.toNumber(),
      amount: ethers.utils.formatUnits(pos.amount, 18),
      entryPrice: ethers.utils.formatUnits(pos.entryPrice, 18),
      timestamp: new Date(pos.timestamp.toNumber() * 1000),
      isOpen: pos.isOpen
    }));
  }

  async getUserStats(userAddress: string): Promise<{totalVolume: string, totalProfit: string}> {
    if (!this.contract) throw new Error('Contract not initialized');

    const [totalVolume, totalProfit] = await this.contract.getUserStats(userAddress);
    return {
      totalVolume: ethers.utils.formatUnits(totalVolume, 18),
      totalProfit: ethers.utils.formatUnits(totalProfit, 18)
    };
  }

  async getCurrentPrice(tokenAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    const price = await this.contract.getCurrentPrice(tokenAddress);
    return ethers.utils.formatUnits(price, 18);
  }

  // AI Trading Signals (mock for now, integrate with real AI service)
  async getAITradingSignals(tokenSymbol: string): Promise<any> {
    // Simulate AI analysis
    const signals = {
      token: tokenSymbol,
      signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
      confidence: Math.random() * 100,
      reasoning: `AI analysis suggests ${tokenSymbol} shows ${Math.random() > 0.5 ? 'bullish' : 'bearish'} momentum`,
      timestamp: new Date()
    };

    return signals;
  }

  // Get transaction history
  async getTransactionHistory(address: string): Promise<any[]> {
    if (!this.provider) throw new Error('Provider not initialized');

    // Get recent transactions
    const history = [
      {
        hash: '0x123...abc',
        from: address,
        to: STRATEGY_MANAGER_ADDRESS[this.network],
        value: '1000000000000000000', // 1 BNB in wei
        timestamp: new Date(),
        type: 'Strategy Creation'
      },
      {
        hash: '0x456...def',
        from: address,
        to: STRATEGY_MANAGER_ADDRESS[this.network],
        value: '50000000', // 50 PYUSD in wei
        timestamp: new Date(Date.now() - 3600000),
        type: 'Position Opened'
      }
    ];

    return history;
  }

  // Check if wallet is connected to BSC
  async checkNetwork(): Promise<boolean> {
    if (!this.provider) return false;

    const network = await this.provider.getNetwork();
    return network.chainId === 56 || network.chainId === 97; // BSC Mainnet or Testnet
  }

  // Switch to BSC Testnet
  async switchToBSCTestnet(): Promise<void> {
    if (!this.provider) throw new Error('Provider not initialized');

    try {
      await this.provider.send('wallet_addEthereumChain', [{
        chainId: '0x61', // 97 in hex
        chainName: 'BSC Testnet',
        nativeCurrency: {
          name: 'tBNB',
          symbol: 'tBNB',
          decimals: 18
        },
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com/']
      }]);
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  }
}

const bnbService = new BNBService();
export default bnbService; 