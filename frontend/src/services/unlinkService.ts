/**
 * Unlink Service - Private Wallet Integration for Monad Testnet
 * 
 * Unlink adds private blockchain wallets to your app. Users can:
 * - Own accounts (single or multi-signature)
 * - Send tokens (privately and publicly)
 * - Receive tokens (privately)
 * - Interact with smart contracts (DeFi, and more...)
 * 
 * Privacy model:
 *   | Operation  | Amount  | Sender  | Recipient | Token Type |
 *   |------------|---------|---------|-----------|------------|
 *   | Deposit    | Public  | Public  | Private   | Public     |
 *   | Transfer   | Private | Private | Private   | Private    |
 *   | Withdraw   | Public  | Private | Public    | Public     |
 *
 * Docs: https://docs.unlink.xyz
 * Faucet: https://faucet.unlink.xyz/?referrer=luma
 */

import { UNLINK_CONFIG, MONAD_TESTNET_CONFIG } from './monadService';

// ============================================================
// Types
// ============================================================

export interface UnlinkAccount {
  address: string;       // Unlink address (unlink1...)
  publicKey: string;
  isMultiSig: boolean;
  createdAt: string;
}

export interface UnlinkBalance {
  token: string;
  symbol: string;
  balance: string;
  isPrivate: boolean;
}

export interface UnlinkTransaction {
  id: string;
  type: 'deposit' | 'transfer' | 'withdraw';
  amount: string;
  token: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  txHash?: string;
  // For deposits: sender is public, recipient is private
  // For transfers: both are private
  // For withdraws: sender is private, recipient is public
  fromAddress?: string;
  toAddress?: string;
}

export interface UnlinkWalletState {
  isInitialized: boolean;
  account: UnlinkAccount | null;
  balances: UnlinkBalance[];
  transactions: UnlinkTransaction[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================
// Unlink Service
// ============================================================

class UnlinkService {
  private gatewayUrl: string;
  private poolAddress: string;
  private state: UnlinkWalletState;

  constructor() {
    this.gatewayUrl = UNLINK_CONFIG.gatewayUrl;
    this.poolAddress = UNLINK_CONFIG.poolAddress;
    this.state = {
      isInitialized: false,
      account: null,
      balances: [],
      transactions: [],
      isLoading: false,
      error: null,
    };
  }

  // ============================================================
  // Account Management
  // ============================================================

  /**
   * Create a new Unlink private account.
   * This generates private keys from a mnemonic.
   * Each account has a unique Unlink address (unlink1...).
   */
  async createAccount(eoaAddress: string): Promise<UnlinkAccount> {
    this.state.isLoading = true;
    this.state.error = null;

    try {
      const response = await fetch(`${this.gatewayUrl}/v1/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eoa: eoaAddress,
          chainId: MONAD_TESTNET_CONFIG.chainId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create account: ${response.statusText}`);
      }

      const data = await response.json();
      const account: UnlinkAccount = {
        address: data.address || `unlink1${eoaAddress.slice(2, 42)}`,
        publicKey: data.publicKey || eoaAddress,
        isMultiSig: false,
        createdAt: new Date().toISOString(),
      };

      this.state.account = account;
      this.state.isInitialized = true;
      console.log('🔐 Unlink account created:', account.address);
      return account;
    } catch (error: any) {
      // In testnet/demo mode, create a mock account for development
      console.warn('Using demo Unlink account (API may not be available):', error.message);
      const mockAccount: UnlinkAccount = {
        address: `unlink1${eoaAddress.slice(2, 42).toLowerCase()}`,
        publicKey: eoaAddress,
        isMultiSig: false,
        createdAt: new Date().toISOString(),
      };
      this.state.account = mockAccount;
      this.state.isInitialized = true;
      return mockAccount;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Get the current Unlink account info.
   */
  getAccount(): UnlinkAccount | null {
    return this.state.account;
  }

  // ============================================================
  // Balance Operations
  // ============================================================

  /**
   * Get private balances for the connected Unlink account.
   * Balances are only visible to the account owner.
   */
  async getBalances(): Promise<UnlinkBalance[]> {
    if (!this.state.account) {
      throw new Error('No Unlink account initialized');
    }

    this.state.isLoading = true;

    try {
      const response = await fetch(
        `${this.gatewayUrl}/v1/accounts/${this.state.account.address}/balances`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch balances: ${response.statusText}`);
      }

      const data = await response.json();
      this.state.balances = data.balances || [];
      return this.state.balances;
    } catch (error: any) {
      // Demo mode: return mock balances
      console.warn('Using demo balances:', error.message);
      const mockBalances: UnlinkBalance[] = [
        {
          token: UNLINK_CONFIG.monNativeToken,
          symbol: 'MON',
          balance: '0.00',
          isPrivate: true,
        },
      ];
      this.state.balances = mockBalances;
      return mockBalances;
    } finally {
      this.state.isLoading = false;
    }
  }

  // ============================================================
  // Transaction Operations
  // ============================================================

  /**
   * Get transaction history for the connected account.
   */
  async getTransactions(): Promise<UnlinkTransaction[]> {
    if (!this.state.account) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.gatewayUrl}/v1/accounts/${this.state.account.address}/transactions`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const data = await response.json();
      this.state.transactions = data.transactions || [];
      return this.state.transactions;
    } catch (error: any) {
      console.warn('Using demo transaction history:', error.message);
      return this.state.transactions;
    }
  }

  /**
   * Record a deposit transaction (tracking only - actual deposit via monadService).
   */
  recordDeposit(txHash: string, amount: string, fromAddress: string): void {
    const tx: UnlinkTransaction = {
      id: `dep-${Date.now()}`,
      type: 'deposit',
      amount,
      token: 'MON',
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      txHash,
      fromAddress,
      toAddress: this.state.account?.address,
    };
    this.state.transactions.unshift(tx);
  }

  /**
   * Record a withdrawal transaction (tracking only - actual withdrawal via monadService).
   */
  recordWithdrawal(txHash: string, amount: string, toAddress: string): void {
    const tx: UnlinkTransaction = {
      id: `wth-${Date.now()}`,
      type: 'withdraw',
      amount,
      token: 'MON',
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      txHash,
      fromAddress: this.state.account?.address,
      toAddress,
    };
    this.state.transactions.unshift(tx);
  }

  /**
   * Record a private transfer.
   */
  recordTransfer(txHash: string, amount: string, toUnlinkAddress: string): void {
    const tx: UnlinkTransaction = {
      id: `tfr-${Date.now()}`,
      type: 'transfer',
      amount,
      token: 'MON',
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      txHash,
      fromAddress: this.state.account?.address,
      toAddress: toUnlinkAddress,
    };
    this.state.transactions.unshift(tx);
  }

  // ============================================================
  // State
  // ============================================================

  getState(): UnlinkWalletState {
    return { ...this.state };
  }

  isInitialized(): boolean {
    return this.state.isInitialized;
  }

  reset(): void {
    this.state = {
      isInitialized: false,
      account: null,
      balances: [],
      transactions: [],
      isLoading: false,
      error: null,
    };
  }

  // ============================================================
  // Utility
  // ============================================================

  /**
   * Get the faucet URL for testnet tokens (MON + UNLINK tokens).
   */
  getFaucetUrl(): string {
    return UNLINK_CONFIG.faucetUrl;
  }

  /**
   * Get the Unlink Pool contract address.
   */
  getPoolAddress(): string {
    return this.poolAddress;
  }

  /**
   * Get privacy info for a given operation type.
   */
  getPrivacyInfo(operationType: 'deposit' | 'transfer' | 'withdraw'): {
    amount: 'public' | 'private';
    sender: 'public' | 'private';
    recipient: 'public' | 'private';
    tokenType: 'public' | 'private';
  } {
    switch (operationType) {
      case 'deposit':
        return { amount: 'public', sender: 'public', recipient: 'private', tokenType: 'public' };
      case 'transfer':
        return { amount: 'private', sender: 'private', recipient: 'private', tokenType: 'private' };
      case 'withdraw':
        return { amount: 'public', sender: 'private', recipient: 'public', tokenType: 'public' };
    }
  }
}

const unlinkService = new UnlinkService();
export default unlinkService;
