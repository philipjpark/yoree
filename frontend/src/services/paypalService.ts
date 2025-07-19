export interface PYUSDPayment {
  id: string;
  amount: number;
  recipient: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  transactionHash?: string;
  network: 'ethereum' | 'solana';
}

export interface PYUSDSubscription {
  id: string;
  userId: string;
  planId: string;
  amount: number; // in PYUSD
  interval: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  startDate: number;
  nextBillingDate: number;
  autoRenew: boolean;
  network: 'ethereum' | 'solana';
}

export interface PYUSDCrossBorderPayment {
  id: string;
  senderCountry: string;
  recipientCountry: string;
  amount: number; // in PYUSD
  exchangeRate: number;
  fees: number;
  status: 'pending' | 'completed' | 'failed';
  estimatedDelivery: number;
  network: 'ethereum' | 'solana';
  recipientAddress: string;
}

export interface PYUSDLoyaltyReward {
  id: string;
  userId: string;
  type: 'cashback' | 'points' | 'discount';
  amount: number; // in PYUSD
  description: string;
  earnedDate: number;
  expiryDate: number;
  redeemed: boolean;
  network: 'ethereum' | 'solana';
}

export interface PYUSDMicroTransaction {
  id: string;
  userId: string;
  amount: number; // in PYUSD (small amounts)
  purpose: 'strategy_execution' | 'feature_unlock' | 'tip' | 'donation';
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  network: 'ethereum' | 'solana';
}

class PayPalService {
  private baseUrl = 'https://api.paypal.com/v1';
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || null;
    this.clientSecret = process.env.REACT_APP_PAYPAL_CLIENT_SECRET || null;
  }

  // Authenticate with PayPal
  private async authenticate(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId!}:${this.clientSecret!}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with PayPal');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return data.access_token;
    } catch (error) {
      console.error('Failed to authenticate with PayPal:', error);
      throw error;
    }
  }

  // Send PYUSD payment (microtransactions)
  async sendPYUSDPayment(recipient: string, amount: number, description: string, network: 'ethereum' | 'solana' = 'ethereum'): Promise<PYUSDPayment> {
    try {
      const token = await this.authenticate();
      
      // Simulate PYUSD payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const payment: PYUSDPayment = {
        id: `pyusd_${Date.now()}`,
        amount,
        recipient,
        description,
        status: 'completed',
        timestamp: Date.now(),
        transactionHash: `0x${Math.random().toString(36).substring(2, 15)}${Date.now().toString(16)}`,
        network
      };

      console.log('PYUSD payment sent:', payment);
      return payment;
    } catch (error) {
      console.error('Failed to send PYUSD payment:', error);
      throw error;
    }
  }

  // Create PYUSD subscription for strategy marketplace
  async createPYUSDSubscription(userId: string, planId: string, amount: number, network: 'ethereum' | 'solana' = 'ethereum'): Promise<PYUSDSubscription> {
    try {
      // Simulate subscription creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const subscription: PYUSDSubscription = {
        id: `sub_${Date.now()}`,
        userId,
        planId,
        amount,
        interval: 'monthly',
        status: 'active',
        startDate: Date.now(),
        nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        autoRenew: true,
        network
      };

      // Store in local storage for demo
      const subscriptions = JSON.parse(localStorage.getItem('pyusdSubscriptions') || '[]');
      subscriptions.push(subscription);
      localStorage.setItem('pyusdSubscriptions', JSON.stringify(subscriptions));

      return subscription;
    } catch (error) {
      console.error('Failed to create PYUSD subscription:', error);
      throw error;
    }
  }

  // Process cross-border PYUSD payment
  async processCrossBorderPYUSDPayment(
    senderCountry: string,
    recipientCountry: string,
    amount: number,
    recipientAddress: string,
    network: 'ethereum' | 'solana' = 'ethereum'
  ): Promise<PYUSDCrossBorderPayment> {
    try {
      // Simulate cross-border payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const exchangeRate = 1.0; // PYUSD is stable
      const fees = amount * 0.005; // 0.5% fee for cross-border
      
      const payment: PYUSDCrossBorderPayment = {
        id: `xborder_${Date.now()}`,
        senderCountry,
        recipientCountry,
        amount,
        exchangeRate,
        fees,
        status: 'completed',
        estimatedDelivery: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        network,
        recipientAddress
      };

      console.log('Cross-border PYUSD payment processed:', payment);
      return payment;
    } catch (error) {
      console.error('Failed to process cross-border PYUSD payment:', error);
      throw error;
    }
  }

  // Add PYUSD loyalty reward
  async addPYUSDLoyaltyReward(
    userId: string, 
    type: 'cashback' | 'points' | 'discount', 
    amount: number, 
    description: string,
    network: 'ethereum' | 'solana' = 'ethereum'
  ): Promise<PYUSDLoyaltyReward> {
    try {
      const reward: PYUSDLoyaltyReward = {
        id: `reward_${Date.now()}`,
        userId,
        type,
        amount,
        description,
        earnedDate: Date.now(),
        expiryDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        redeemed: false,
        network
      };

      // Store in local storage for demo
      const rewards = JSON.parse(localStorage.getItem('pyusdLoyaltyRewards') || '[]');
      rewards.push(reward);
      localStorage.setItem('pyusdLoyaltyRewards', JSON.stringify(rewards));

      return reward;
    } catch (error) {
      console.error('Failed to add PYUSD loyalty reward:', error);
      throw error;
    }
  }

  // Get user PYUSD loyalty rewards
  async getUserPYUSDLoyaltyRewards(userId: string): Promise<PYUSDLoyaltyReward[]> {
    try {
      const rewards = JSON.parse(localStorage.getItem('pyusdLoyaltyRewards') || '[]');
      return rewards.filter((reward: PYUSDLoyaltyReward) => reward.userId === userId);
    } catch (error) {
      console.error('Failed to get user PYUSD loyalty rewards:', error);
      return [];
    }
  }

  // Process microtransaction (for small payments)
  async processMicroTransaction(
    userId: string,
    amount: number,
    purpose: 'strategy_execution' | 'feature_unlock' | 'tip' | 'donation',
    network: 'ethereum' | 'solana' = 'ethereum'
  ): Promise<PYUSDMicroTransaction> {
    try {
      // Simulate microtransaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const microTx: PYUSDMicroTransaction = {
        id: `micro_${Date.now()}`,
        userId,
        amount,
        purpose,
        status: 'completed',
        timestamp: Date.now(),
        network
      };

      console.log('PYUSD microtransaction processed:', microTx);
      return microTx;
    } catch (error) {
      console.error('Failed to process microtransaction:', error);
      throw error;
    }
  }

  // Get PYUSD subscription plans
  async getPYUSDSubscriptionPlans(): Promise<any[]> {
    return [
      {
        id: 'basic_pyusd',
        name: 'Basic PYUSD',
        price: 9.99,
        interval: 'monthly',
        features: ['5 strategies', 'Basic analytics', 'Email support'],
        maxStrategies: 5,
        prioritySupport: false,
        network: 'ethereum'
      },
      {
        id: 'pro_pyusd',
        name: 'Pro PYUSD',
        price: 29.99,
        interval: 'monthly',
        features: ['Unlimited strategies', 'Advanced analytics', 'Priority support', 'AI trading'],
        maxStrategies: -1,
        prioritySupport: true,
        network: 'ethereum'
      },
      {
        id: 'enterprise_pyusd',
        name: 'Enterprise PYUSD',
        price: 99.99,
        interval: 'monthly',
        features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'API access'],
        maxStrategies: -1,
        prioritySupport: true,
        network: 'ethereum'
      }
    ];
  }

  // Get user PYUSD subscription
  async getUserPYUSDSubscription(userId: string): Promise<PYUSDSubscription | null> {
    try {
      const subscriptions = JSON.parse(localStorage.getItem('pyusdSubscriptions') || '[]');
      return subscriptions.find((sub: PYUSDSubscription) => sub.userId === userId) || null;
    } catch (error) {
      console.error('Failed to get user PYUSD subscription:', error);
      return null;
    }
  }

  // Redeem PYUSD loyalty reward
  async redeemPYUSDLoyaltyReward(rewardId: string): Promise<boolean> {
    try {
      const rewards = JSON.parse(localStorage.getItem('pyusdLoyaltyRewards') || '[]');
      const rewardIndex = rewards.findIndex((r: PYUSDLoyaltyReward) => r.id === rewardId);
      
      if (rewardIndex !== -1) {
        rewards[rewardIndex].redeemed = true;
        localStorage.setItem('pyusdLoyaltyRewards', JSON.stringify(rewards));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to redeem PYUSD loyalty reward:', error);
      return false;
    }
  }

  // Get PYUSD balance (mock)
  async getPYUSDBalance(userId: string, network: 'ethereum' | 'solana' = 'ethereum'): Promise<number> {
    try {
      // Simulate balance check
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock balance
      return Math.random() * 1000 + 100; // 100-1100 PYUSD
    } catch (error) {
      console.error('Failed to get PYUSD balance:', error);
      return 0;
    }
  }
}

export default new PayPalService(); 