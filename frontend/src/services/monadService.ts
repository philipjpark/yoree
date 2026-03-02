import { ethers } from 'ethers';

// ============================================================
// Monad Testnet Configuration
// Docs: https://docs.monad.xyz/developer-essentials/network-information
// ============================================================
export const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  chainIdHex: '0x279F',
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadscan.com'],
  // Block time: 400ms, Finality: 800ms
};

// Unlink Protocol on Monad Testnet
// Docs: https://docs.unlink.xyz
export const UNLINK_CONFIG = {
  gatewayUrl: 'https://api.unlink.xyz',
  poolAddress: '0x0813da0a10328e5ed617d37e514ac2f6fa49a254',
  monNativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  faucetUrl: 'https://faucet.unlink.xyz/?referrer=luma',
};

// ABI for interacting with the Unlink Pool contract (minimal interface)
const UNLINK_POOL_ABI = [
  'function deposit(address token, uint256 amount) payable',
  'function withdraw(address token, uint256 amount, address recipient)',
  'event Deposit(address indexed sender, address indexed token, uint256 amount)',
  'event Withdrawal(address indexed recipient, address indexed token, uint256 amount)',
];

// ERC20 minimal ABI for token approvals
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export interface MonadWalletState {
  address: string;
  balance: string; // MON balance in ether units
  chainId: number;
  isConnected: boolean;
  isMonadTestnet: boolean;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
}

class MonadService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private unlinkPool: ethers.Contract | null = null;
  private walletState: MonadWalletState = {
    address: '',
    balance: '0',
    chainId: 0,
    isConnected: false,
    isMonadTestnet: false,
  };

  constructor() {
    this.initializeProvider().catch(console.error);
  }

  // ============================================================
  // Provider Initialization
  // ============================================================
  private async initializeProvider(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);

        // Listen for account and chain changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            this.disconnect();
          } else {
            this.walletState.address = accounts[0];
            this.refreshBalance();
          }
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      } catch (error) {
        console.error('Failed to initialize Monad provider:', error);
      }
    }
  }

  private async ensureProvider(): Promise<ethers.BrowserProvider> {
    if (!this.provider) {
      await this.initializeProvider();
    }
    if (!this.provider) {
      throw new Error('No Web3 provider detected. Please install MetaMask or a compatible wallet.');
    }
    return this.provider;
  }

  // ============================================================
  // Wallet Connection
  // ============================================================
  async connectWallet(): Promise<MonadWalletState> {
    // ⚠️ Wallet connections are disabled in this environment.
    // This is intentional for development / demo mode so that users
    // cannot connect real wallets until production.
    //
    // To re-enable wallet connections for production:
    // - Restore the original implementation of this method that
    //   calls `eth_requestAccounts` and initializes signer / balance.
    //
    // For now, always throw a clear error without touching the provider.
    const error = new Error('Monad wallet connections are disabled in this environment.');
    console.warn(error.message);
    throw error;
  }

  async switchToMonadTestnet(): Promise<void> {
    const provider = await this.ensureProvider();

    try {
      // Try switching first
      await provider.send('wallet_switchEthereumChain', [
        { chainId: MONAD_TESTNET_CONFIG.chainIdHex },
      ]);
    } catch (switchError: any) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        await provider.send('wallet_addEthereumChain', [
          {
            chainId: MONAD_TESTNET_CONFIG.chainIdHex,
            chainName: MONAD_TESTNET_CONFIG.chainName,
            nativeCurrency: MONAD_TESTNET_CONFIG.nativeCurrency,
            rpcUrls: MONAD_TESTNET_CONFIG.rpcUrls,
            blockExplorerUrls: MONAD_TESTNET_CONFIG.blockExplorerUrls,
          },
        ]);
      } else {
        throw switchError;
      }
    }
  }

  disconnect(): void {
    this.walletState = {
      address: '',
      balance: '0',
      chainId: 0,
      isConnected: false,
      isMonadTestnet: false,
    };
    this.signer = null;
    this.unlinkPool = null;
  }

  // ============================================================
  // Balance & Queries
  // ============================================================
  async getBalance(address?: string): Promise<string> {
    const provider = await this.ensureProvider();
    const addr = address || this.walletState.address;
    if (!addr) throw new Error('No address provided');
    const balance = await provider.getBalance(addr);
    return ethers.formatEther(balance);
  }

  async refreshBalance(): Promise<string> {
    if (!this.walletState.address) return '0';
    const balance = await this.getBalance(this.walletState.address);
    this.walletState.balance = balance;
    return balance;
  }

  async getTokenBalance(tokenAddress: string, userAddress?: string): Promise<string> {
    const provider = await this.ensureProvider();
    const addr = userAddress || this.walletState.address;
    if (!addr) throw new Error('No address provided');

    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [balance, decimals] = await Promise.all([
      token.balanceOf(addr),
      token.decimals(),
    ]);
    return ethers.formatUnits(balance, decimals);
  }

  getWalletState(): MonadWalletState {
    return { ...this.walletState };
  }

  // ============================================================
  // Unlink Private Wallet Operations
  // ============================================================

  /**
   * Deposit native MON into the Unlink private pool.
   * Once deposited, the balance is only visible to the owner.
   */
  async unlinkDeposit(amountInMON: string): Promise<TransactionResult> {
    if (!this.signer || !this.unlinkPool) {
      throw new Error('Wallet not connected. Please connect to Monad Testnet first.');
    }

    const amountWei = ethers.parseEther(amountInMON);

    try {
      const tx = await this.unlinkPool.deposit(
        UNLINK_CONFIG.monNativeToken,
        amountWei,
        { value: amountWei }
      );

      console.log('🔒 Unlink Deposit TX:', tx.hash);
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
      };
    } catch (error: any) {
      console.error('Unlink deposit failed:', error);
      throw new Error(`Deposit failed: ${error.message || error}`);
    }
  }

  /**
   * Withdraw MON from the Unlink private pool to a public address.
   * Note: Withdrawal amount and recipient are visible on-chain.
   */
  async unlinkWithdraw(amountInMON: string, recipientAddress: string): Promise<TransactionResult> {
    if (!this.signer || !this.unlinkPool) {
      throw new Error('Wallet not connected. Please connect to Monad Testnet first.');
    }

    const amountWei = ethers.parseEther(amountInMON);

    try {
      const tx = await this.unlinkPool.withdraw(
        UNLINK_CONFIG.monNativeToken,
        amountWei,
        recipientAddress
      );

      console.log('🔓 Unlink Withdraw TX:', tx.hash);
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
      };
    } catch (error: any) {
      console.error('Unlink withdraw failed:', error);
      throw new Error(`Withdrawal failed: ${error.message || error}`);
    }
  }

  /**
   * Send a regular (public) MON transfer on Monad Testnet.
   */
  async sendMON(toAddress: string, amountInMON: string): Promise<TransactionResult> {
    if (!this.signer) {
      throw new Error('Wallet not connected.');
    }

    const amountWei = ethers.parseEther(amountInMON);

    try {
      const tx = await this.signer.sendTransaction({
        to: toAddress,
        value: amountWei,
      });

      console.log('💸 MON Transfer TX:', tx.hash);
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        status: receipt!.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt!.blockNumber,
      };
    } catch (error: any) {
      console.error('MON transfer failed:', error);
      throw new Error(`Transfer failed: ${error.message || error}`);
    }
  }

  // ============================================================
  // Network Information
  // ============================================================
  async getNetworkInfo(): Promise<{
    chainId: number;
    name: string;
    isTestnet: boolean;
    blockNumber: number;
  }> {
    const provider = await this.ensureProvider();
    const [network, blockNumber] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
    ]);

    return {
      chainId: Number(network.chainId),
      name: Number(network.chainId) === MONAD_TESTNET_CONFIG.chainId ? 'Monad Testnet' : 'Unknown',
      isTestnet: Number(network.chainId) === MONAD_TESTNET_CONFIG.chainId,
      blockNumber,
    };
  }

  /**
   * Get the Monad Testnet block explorer URL for a transaction
   */
  getExplorerTxUrl(txHash: string): string {
    return `${MONAD_TESTNET_CONFIG.blockExplorerUrls[0]}/tx/${txHash}`;
  }

  /**
   * Get the Monad Testnet block explorer URL for an address
   */
  getExplorerAddressUrl(address: string): string {
    return `${MONAD_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${address}`;
  }
}

const monadService = new MonadService();
export default monadService;
