import { PublicKey } from '@solana/web3.js';

export interface StrategyConfig {
  asset: string;
  strategyType: string;
  timeframe: string;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  volumeCondition: string;
  breakoutCondition: string;
}

export interface DeployedStrategy {
  publicKey: PublicKey;
  authority: PublicKey;
  strategyName: string;
  config: StrategyConfig;
  isActive: boolean;
  totalTrades: number;
  totalPnl: number;
}

class StrategyService {
  private connection: any;
  private program: any = null;
  private programId = new PublicKey('11111111111111111111111111111111');
  private mockStrategies: DeployedStrategy[] = [];

  constructor(connection: any) {
    this.connection = connection;
  }

  async initializeProgram(wallet: any) {
    if (!wallet) throw new Error('Wallet not connected');
    console.log('Mock: Program initialized');
  }

  async deployStrategy(
    wallet: any,
    strategyName: string,
    config: StrategyConfig
  ): Promise<DeployedStrategy> {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create mock strategy with a unique PublicKey
      const timestamp = Date.now();
      const uniqueId = timestamp % 1000000; // Use last 6 digits of timestamp
      const strategyPda = new PublicKey(`1111111111111111111111111111111${uniqueId.toString().padStart(6, '0')}`);
      
      const deployedStrategy: DeployedStrategy = {
        publicKey: strategyPda,
        authority: wallet.publicKey,
        strategyName,
        config,
        isActive: false,
        totalTrades: 0,
        totalPnl: 0,
      };

      this.mockStrategies.push(deployedStrategy);
      console.log('Mock: Strategy deployed successfully:', deployedStrategy);
      
      return deployedStrategy;
    } catch (error) {
      console.error('Mock: Failed to deploy strategy:', error);
      throw error;
    }
  }

  async activateStrategy(wallet: any, strategyPublicKey: PublicKey): Promise<void> {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const strategy = this.mockStrategies.find(s => s.publicKey.equals(strategyPublicKey));
      if (strategy) {
        strategy.isActive = true;
        console.log('Mock: Strategy activated successfully');
      }
    } catch (error) {
      console.error('Mock: Failed to activate strategy:', error);
      throw error;
    }
  }

  async deactivateStrategy(wallet: any, strategyPublicKey: PublicKey): Promise<void> {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const strategy = this.mockStrategies.find(s => s.publicKey.equals(strategyPublicKey));
      if (strategy) {
        strategy.isActive = false;
        console.log('Mock: Strategy deactivated successfully');
      }
    } catch (error) {
      console.error('Mock: Failed to deactivate strategy:', error);
      throw error;
    }
  }

  async getStrategy(strategyPublicKey: PublicKey): Promise<DeployedStrategy | null> {
    try {
      const strategy = this.mockStrategies.find(s => s.publicKey.equals(strategyPublicKey));
      return strategy || null;
    } catch (error) {
      console.error('Mock: Failed to fetch strategy:', error);
      return null;
    }
  }

  async getUserStrategies(wallet: any): Promise<DeployedStrategy[]> {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      return this.mockStrategies.filter(s => s.authority.equals(wallet.publicKey));
    } catch (error) {
      console.error('Mock: Failed to fetch user strategies:', error);
      return [];
    }
  }
}

export const strategyService = new StrategyService(null);

export default strategyService; 