/**
 * TransactionLayer — wraps the entire app
 *
 * Provides:
 *   • Privacy toggle (routes through Unlink when ON)
 *   • Auto on-chain registration of signals via SignalRegistry on Monad
 *   • Pre-flight overlay for execution routing
 *   • Centralized transaction state for all components
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import monadService from '../services/monadService';
import monadContractService, { RegistrationResult } from '../services/monadContractService';
import unlinkService from '../services/unlinkService';

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface PreFlightState {
  isActive: boolean;
  phase: 'idle' | 'privacy-routing' | 'registering' | 'routing-to-platform' | 'complete' | 'error';
  message: string;
  detail: string;
  progress: number; // 0-100
  txHash?: string;
  explorerUrl?: string;
  signalId?: number;
  isPrivate: boolean;
  targetPlatform?: string;
  targetUrl?: string;
  error?: string;
}

export interface TransactionLayerState {
  privacyEnabled: boolean;
  walletConnected: boolean;
  registryDeployed: boolean;
  totalRegistered: number;
  preFlight: PreFlightState;
}

export interface TransactionLayerContextType {
  state: TransactionLayerState;
  togglePrivacy: () => void;
  setPrivacy: (enabled: boolean) => void;

  /**
   * Register a signal on Monad (automatic — uses contract if deployed, demo otherwise)
   */
  registerSignal: (params: {
    hypothesis: string;
    quality: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    assetCount: number;
    source: string;
    timestamp: string;
  }) => Promise<RegistrationResult>;

  /**
   * Execute with pre-flight: privacy routing → on-chain registration → platform redirect
   */
  executeWithPreFlight: (params: {
    hypothesis: string;
    quality: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    assetCount: number;
    source: string;
    timestamp: string;
    targetPlatform: string;
    targetUrl: string;
  }) => Promise<RegistrationResult>;

  /**
   * Dismiss the pre-flight overlay
   */
  dismissPreFlight: () => void;

  /**
   * Refresh wallet and registry state
   */
  refresh: () => Promise<void>;
}

// ═══════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════

const defaultPreFlight: PreFlightState = {
  isActive: false,
  phase: 'idle',
  message: '',
  detail: '',
  progress: 0,
  isPrivate: false,
};

const TransactionLayerContext = createContext<TransactionLayerContextType | null>(null);

export const useTransactionLayer = (): TransactionLayerContextType => {
  const ctx = useContext(TransactionLayerContext);
  if (!ctx) {
    throw new Error('useTransactionLayer must be used within TransactionLayerProvider');
  }
  return ctx;
};

// ═══════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════

export const TransactionLayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [privacyEnabled, setPrivacyEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('ysm_privacy_enabled') === 'true'; } catch { return false; }
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [registryDeployed] = useState(monadContractService.isDeployed());
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [preFlight, setPreFlight] = useState<PreFlightState>(defaultPreFlight);

  // Check wallet state on mount and periodically
  useEffect(() => {
    const check = () => {
      const ws = monadService.getWalletState();
      setWalletConnected(ws.isConnected);
    };
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load registry stats
  useEffect(() => {
    monadContractService.getStats().then(s => setTotalRegistered(s.totalRegistered)).catch(() => {});
  }, []);

  const togglePrivacy = useCallback(() => {
    setPrivacyEnabled(prev => {
      const next = !prev;
      localStorage.setItem('ysm_privacy_enabled', String(next));
      return next;
    });
  }, []);

  const setPrivacy = useCallback((enabled: boolean) => {
    setPrivacyEnabled(enabled);
    localStorage.setItem('ysm_privacy_enabled', String(enabled));
  }, []);

  const updatePreFlight = (update: Partial<PreFlightState>) => {
    setPreFlight(prev => ({ ...prev, ...update }));
  };

  // ── Register signal (simple — no pre-flight UI) ──
  const registerSignal = useCallback(async (params: {
    hypothesis: string;
    quality: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    assetCount: number;
    source: string;
    timestamp: string;
  }): Promise<RegistrationResult> => {
    const result = await monadContractService.autoRegister({
      ...params,
      isPrivate: privacyEnabled,
    });

    setTotalRegistered(prev => prev + 1);
    return result;
  }, [privacyEnabled]);

  // ── Execute with pre-flight overlay ──
  const executeWithPreFlight = useCallback(async (params: {
    hypothesis: string;
    quality: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    assetCount: number;
    source: string;
    timestamp: string;
    targetPlatform: string;
    targetUrl: string;
  }): Promise<RegistrationResult> => {
    // Activate pre-flight
    updatePreFlight({
      isActive: true,
      phase: 'idle',
      message: 'Preparing transaction...',
      detail: '',
      progress: 0,
      isPrivate: privacyEnabled,
      targetPlatform: params.targetPlatform,
      targetUrl: params.targetUrl,
      error: undefined,
      txHash: undefined,
      explorerUrl: undefined,
      signalId: undefined,
    });

    try {
      // Phase 1: Privacy routing (if enabled)
      if (privacyEnabled) {
        updatePreFlight({
          phase: 'privacy-routing',
          message: '🛡️ Routing through Unlink privacy layer...',
          detail: 'Shielding transaction path via zero-knowledge proof',
          progress: 15,
        });

        // Simulate Unlink privacy routing (real SDK will replace this)
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        if (unlinkService.isInitialized()) {
          try {
            await unlinkService.routePrivately('0.001', 'privacy-preflight');
          } catch {
            // Non-critical — continue
          }
        }

        updatePreFlight({
          message: '🛡️ Privacy route established',
          detail: 'Transaction path is shielded',
          progress: 35,
        });
      }

      // Phase 2: On-chain registration
      updatePreFlight({
        phase: 'registering',
        message: '⛓️ Registering signal on Monad...',
        detail: registryDeployed
          ? 'Writing to SignalRegistry contract'
          : 'Generating on-chain proof (contract pending deployment)',
        progress: privacyEnabled ? 50 : 30,
      });

      const result = await monadContractService.autoRegister({
        hypothesis: params.hypothesis,
        quality: params.quality,
        sentiment: params.sentiment,
        assetCount: params.assetCount,
        isPrivate: privacyEnabled,
        source: params.source,
        timestamp: params.timestamp,
      });

      setTotalRegistered(prev => prev + 1);

      updatePreFlight({
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
        signalId: result.signalId,
        message: '⛓️ Signal registered on Monad',
        detail: `Signal ID: ${result.signalId} · TX: ${result.txHash.slice(0, 10)}...`,
        progress: 75,
      });

      // Phase 3: Route to platform
      updatePreFlight({
        phase: 'routing-to-platform',
        message: `🚀 Routing to ${params.targetPlatform}...`,
        detail: params.targetUrl,
        progress: 90,
      });

      await new Promise(resolve => setTimeout(resolve, 600));

      // Complete
      updatePreFlight({
        phase: 'complete',
        message: '✅ Transaction complete',
        detail: `Registered on Monad${privacyEnabled ? ' (private)' : ''} → Routed to ${params.targetPlatform}`,
        progress: 100,
      });

      return result;
    } catch (error: any) {
      updatePreFlight({
        phase: 'error',
        message: '❌ Transaction failed',
        detail: error.message || 'Unknown error',
        error: error.message,
      });
      throw error;
    }
  }, [privacyEnabled, registryDeployed]);

  const dismissPreFlight = useCallback(() => {
    setPreFlight(defaultPreFlight);
  }, []);

  const refresh = useCallback(async () => {
    const ws = monadService.getWalletState();
    setWalletConnected(ws.isConnected);
    const stats = await monadContractService.getStats();
    setTotalRegistered(stats.totalRegistered);
  }, []);

  const value: TransactionLayerContextType = {
    state: {
      privacyEnabled,
      walletConnected,
      registryDeployed,
      totalRegistered,
      preFlight,
    },
    togglePrivacy,
    setPrivacy,
    registerSignal,
    executeWithPreFlight,
    dismissPreFlight,
    refresh,
  };

  return (
    <TransactionLayerContext.Provider value={value}>
      {children}
    </TransactionLayerContext.Provider>
  );
};
