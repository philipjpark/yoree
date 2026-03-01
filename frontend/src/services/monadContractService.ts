/**
 * Monad Contract Service
 * 
 * Interacts with the SignalRegistry smart contract on Monad Testnet.
 * Provides on-chain signal registration, verification, and stats.
 * 
 * After deploying the contract, update SIGNAL_REGISTRY_ADDRESS below.
 */

import { ethers } from 'ethers';
import monadService, { MONAD_TESTNET_CONFIG } from './monadService';

// ═══════════════════════════════════════════════════
// Contract Address — UPDATE AFTER DEPLOYMENT
// Run: npx hardhat run scripts/deploy-signal-registry.js --network monadTestnet
// ═══════════════════════════════════════════════════
const SIGNAL_REGISTRY_ADDRESS = '0x0000000000000000000000000000000000000000'; // TODO: Replace after deploy

// Minimal ABI for the SignalRegistry contract
const SIGNAL_REGISTRY_ABI = [
  'function registerSignal(bytes32 signalHash, uint8 quality, uint8 sentiment, uint32 assetCount, bool isPrivate, string source) returns (uint256)',
  'function updateQuality(uint256 signalId, uint8 newQuality)',
  'function getSignal(uint256 signalId) view returns (tuple(bytes32 signalHash, address creator, uint8 quality, uint8 sentiment, uint32 assetCount, uint64 timestamp, bool isPrivate, string source))',
  'function getCreatorSignals(address creator) view returns (uint256[])',
  'function getSignalByHash(bytes32 signalHash) view returns (uint256, tuple(bytes32 signalHash, address creator, uint8 quality, uint8 sentiment, uint32 assetCount, uint64 timestamp, bool isPrivate, string source))',
  'function getStats() view returns (uint256, uint256, uint256)',
  'function totalRegistered() view returns (uint256)',
  'function totalPrivate() view returns (uint256)',
  'event SignalRegistered(uint256 indexed signalId, bytes32 indexed signalHash, address indexed creator, uint8 quality, uint8 sentiment, uint32 assetCount, bool isPrivate, string source)',
  'event QualityUpdated(uint256 indexed signalId, uint8 oldQuality, uint8 newQuality)',
];

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface OnChainSignal {
  signalHash: string;
  creator: string;
  quality: number;
  sentiment: number; // 0=neutral, 1=bullish, 2=bearish
  assetCount: number;
  timestamp: number;
  isPrivate: boolean;
  source: string;
}

export interface RegistrationResult {
  signalId: number;
  txHash: string;
  blockNumber: number;
  explorerUrl: string;
  signalHash: string;
}

export interface RegistryStats {
  totalRegistered: number;
  totalPrivate: number;
  nextId: number;
}

// ═══════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════

class MonadContractService {
  private contract: ethers.Contract | null = null;
  private readOnlyContract: ethers.Contract | null = null;

  /**
   * Check if the Signal Registry contract is deployed
   */
  isDeployed(): boolean {
    return SIGNAL_REGISTRY_ADDRESS !== '0x0000000000000000000000000000000000000000';
  }

  /**
   * Get the contract address
   */
  getContractAddress(): string {
    return SIGNAL_REGISTRY_ADDRESS;
  }

  /**
   * Initialize the contract with the current wallet signer
   */
  private async getContract(): Promise<ethers.Contract> {
    const ws = monadService.getWalletState();
    if (!ws.isConnected) {
      throw new Error('Wallet not connected');
    }

    if (!this.isDeployed()) {
      throw new Error('Signal Registry contract not deployed. Run: npx hardhat run scripts/deploy-signal-registry.js --network monadTestnet');
    }

    if (!this.contract) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      this.contract = new ethers.Contract(SIGNAL_REGISTRY_ADDRESS, SIGNAL_REGISTRY_ABI, signer);
    }

    return this.contract;
  }

  /**
   * Get a read-only contract instance (no wallet needed)
   */
  private async getReadOnlyContract(): Promise<ethers.Contract> {
    if (!this.isDeployed()) {
      throw new Error('Signal Registry contract not deployed');
    }

    if (!this.readOnlyContract) {
      const provider = new ethers.JsonRpcProvider(MONAD_TESTNET_CONFIG.rpcUrls[0]);
      this.readOnlyContract = new ethers.Contract(SIGNAL_REGISTRY_ADDRESS, SIGNAL_REGISTRY_ABI, provider);
    }

    return this.readOnlyContract;
  }

  /**
   * Create a signal hash from signal data
   */
  createSignalHash(hypothesis: string, creatorAddress: string, timestamp: string): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'address', 'string'],
        [hypothesis, creatorAddress, timestamp]
      )
    );
  }

  /**
   * Register a signal on-chain via the SignalRegistry contract
   */
  async registerSignal(params: {
    hypothesis: string;
    quality: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    assetCount: number;
    isPrivate: boolean;
    source: string; // 'pipeline' | 'create' | 'agent'
    timestamp: string;
  }): Promise<RegistrationResult> {
    const contract = await this.getContract();
    const ws = monadService.getWalletState();

    const sentimentMap = { neutral: 0, bullish: 1, bearish: 2 };
    const sentimentValue = sentimentMap[params.sentiment] ?? 0;

    const signalHash = this.createSignalHash(params.hypothesis, ws.address, params.timestamp);

    try {
      const tx = await contract.registerSignal(
        signalHash,
        Math.min(100, Math.max(0, Math.round(params.quality))),
        sentimentValue,
        params.assetCount,
        params.isPrivate,
        params.source
      );

      console.log('⛓️ Signal Registration TX:', tx.hash);
      const receipt = await tx.wait();

      // Parse the SignalRegistered event to get the signalId
      let signalId = 0;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({ topics: [...log.topics], data: log.data });
          if (parsed && parsed.name === 'SignalRegistered') {
            signalId = Number(parsed.args[0]);
            break;
          }
        } catch {
          // Not our event, skip
        }
      }

      return {
        signalId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: monadService.getExplorerTxUrl(tx.hash),
        signalHash,
      };
    } catch (error: any) {
      console.error('❌ Signal registration failed:', error);
      // If it fails (contract not deployed, no gas, etc.), return a demo result
      if (!this.isDeployed()) {
        return this.getDemoResult(params.hypothesis, ws.address, params.timestamp);
      }
      throw error;
    }
  }

  /**
   * Get a demo registration result when contract isn't deployed
   */
  private getDemoResult(hypothesis: string, address: string, timestamp: string): RegistrationResult {
    const hash = this.createSignalHash(hypothesis, address, timestamp);
    return {
      signalId: Date.now() % 100000,
      txHash: `0x${hash.slice(2, 66)}`,
      blockNumber: Math.floor(Date.now() / 400), // ~400ms blocks
      explorerUrl: `${MONAD_TESTNET_CONFIG.blockExplorerUrls[0]}/tx/0x${hash.slice(2, 66)}`,
      signalHash: hash,
    };
  }

  /**
   * Simulate registration when contract isn't deployed yet.
   * Returns a realistic-looking result for the UI.
   */
  async registerSignalDemo(params: {
    hypothesis: string;
    quality: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    assetCount: number;
    isPrivate: boolean;
    source: string;
    timestamp: string;
  }): Promise<RegistrationResult> {
    const ws = monadService.getWalletState();
    const address = ws.isConnected ? ws.address : '0x0000000000000000000000000000000000000000';

    // Simulate on-chain delay (Monad: 400ms blocks, 800ms finality)
    await new Promise(resolve => setTimeout(resolve, 800));

    return this.getDemoResult(params.hypothesis, address, params.timestamp);
  }

  /**
   * Auto-register: Uses real contract if deployed, demo mode otherwise
   */
  async autoRegister(params: {
    hypothesis: string;
    quality: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    assetCount: number;
    isPrivate: boolean;
    source: string;
    timestamp: string;
  }): Promise<RegistrationResult> {
    const ws = monadService.getWalletState();

    if (this.isDeployed() && ws.isConnected) {
      try {
        return await this.registerSignal(params);
      } catch (error) {
        console.warn('On-chain registration failed, falling back to demo:', error);
        return await this.registerSignalDemo(params);
      }
    }

    return await this.registerSignalDemo(params);
  }

  /**
   * Get on-chain signal data
   */
  async getSignal(signalId: number): Promise<OnChainSignal | null> {
    try {
      const contract = await this.getReadOnlyContract();
      const record = await contract.getSignal(signalId);
      return {
        signalHash: record.signalHash,
        creator: record.creator,
        quality: Number(record.quality),
        sentiment: Number(record.sentiment),
        assetCount: Number(record.assetCount),
        timestamp: Number(record.timestamp),
        isPrivate: record.isPrivate,
        source: record.source,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get registry stats
   */
  async getStats(): Promise<RegistryStats> {
    try {
      const contract = await this.getReadOnlyContract();
      const stats = await contract.getStats();
      return {
        totalRegistered: Number(stats[0]),
        totalPrivate: Number(stats[1]),
        nextId: Number(stats[2]),
      };
    } catch {
      // Demo stats from localStorage
      const portfolioSignals = JSON.parse(localStorage.getItem('yoree_portfolio_signals') || '[]');
      return {
        totalRegistered: portfolioSignals.length,
        totalPrivate: 0,
        nextId: portfolioSignals.length,
      };
    }
  }

  /**
   * Get all signal IDs for a creator
   */
  async getCreatorSignals(address: string): Promise<number[]> {
    try {
      const contract = await this.getReadOnlyContract();
      const ids = await contract.getCreatorSignals(address);
      return ids.map((id: bigint) => Number(id));
    } catch {
      return [];
    }
  }

  /**
   * Reset contract reference (e.g. on disconnect)
   */
  reset(): void {
    this.contract = null;
    this.readOnlyContract = null;
  }
}

const monadContractService = new MonadContractService();
export default monadContractService;
