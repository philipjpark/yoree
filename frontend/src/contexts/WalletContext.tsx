import React, { FC, ReactNode, useMemo, createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import monadService, { MonadWalletState, MONAD_TESTNET_CONFIG } from '../services/monadService';
import unlinkService from '../services/unlinkService';

// Import wallet styles
require('@solana/wallet-adapter-react-ui/styles.css');

// ============================================================
// Monad/EVM Wallet Context
// ============================================================

interface EVMWalletContextType {
  walletState: MonadWalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isMonadConnected: boolean;
  isUnlinkInitialized: boolean;
  refreshBalance: () => Promise<void>;
}

const EVMWalletContext = createContext<EVMWalletContextType>({
  walletState: {
    address: '',
    balance: '0',
    chainId: 0,
    isConnected: false,
    isMonadTestnet: false,
  },
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isMonadConnected: false,
  isUnlinkInitialized: false,
  refreshBalance: async () => {},
});

export const useEVMWallet = () => useContext(EVMWalletContext);

// ============================================================
// Combined Wallet Context Provider
// ============================================================

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Solana setup (kept for backward compatibility)
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // EVM/Monad state
  const [walletState, setWalletState] = useState<MonadWalletState>({
    address: '',
    balance: '0',
    chainId: 0,
    isConnected: false,
    isMonadTestnet: false,
  });
  const [isUnlinkInitialized, setIsUnlinkInitialized] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    const existingState = monadService.getWalletState();
    if (existingState.isConnected) {
      setWalletState(existingState);
      setIsUnlinkInitialized(unlinkService.isInitialized());
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const state = await monadService.connectWallet();
      setWalletState(state);

      // Initialize Unlink private account
      await unlinkService.createAccount(state.address);
      setIsUnlinkInitialized(true);
    } catch (error) {
      console.error('Failed to connect EVM wallet:', error);
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    monadService.disconnect();
    unlinkService.reset();
    setWalletState({
      address: '',
      balance: '0',
      chainId: 0,
      isConnected: false,
      isMonadTestnet: false,
    });
    setIsUnlinkInitialized(false);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (walletState.isConnected) {
      const balance = await monadService.refreshBalance();
      setWalletState(prev => ({ ...prev, balance }));
    }
  }, [walletState.isConnected]);

  const evmValue: EVMWalletContextType = {
    walletState,
    connectWallet,
    disconnectWallet,
    isMonadConnected: walletState.isConnected && walletState.isMonadTestnet,
    isUnlinkInitialized,
    refreshBalance,
  };

  return (
    <EVMWalletContext.Provider value={evmValue}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </EVMWalletContext.Provider>
  );
};
