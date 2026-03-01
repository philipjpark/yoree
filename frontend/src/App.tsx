import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './contexts/WalletContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import StrategyBuilder from './components/strategy/StrategyBuilder';
import TokenIncentivization from './components/incentives/TokenIncentivization';
import Backtest from './pages/Backtest';
import Dashboard from './pages/Dashboard';
import StrategyMarketplace from './components/strategy/StrategyMarketplace';
import StrategyCreator from './components/strategy/StrategyCreator';
import PYUSDSwap from './components/swap/PYUSDSwap';
import DataFeeds from './pages/DataFeeds';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import DataVault from './pages/DataVault';
import SignalBacktester from './pages/SignalBacktester';
import Community from './pages/Community';

// YSM Signal Pipeline + Monad/Unlink
import Pipeline from './pages/Pipeline';
import UnlinkPrivateWallet from './components/UnlinkPrivateWallet';
import { TransactionLayerProvider } from './contexts/TransactionLayer';
import PreFlightOverlay from './components/PreFlightOverlay';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <TransactionLayerProvider>
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        <Navbar />
        <PreFlightOverlay />
        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/unlink" element={<UnlinkPrivateWallet />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/data-feeds" element={<DataFeeds />} />
              <Route path="/data-vault" element={<DataVault />} />
              <Route path="/signal-backtester" element={<SignalBacktester />} />
              <Route path="/community" element={<Community />} />
              {/* Legacy routes - keep for backward compatibility */}
              <Route path="/strategy-builder" element={<StrategyBuilder />} />
              <Route path="/strategy-creator" element={<StrategyCreator />} />
              <Route path="/strategy-marketplace" element={<StrategyMarketplace />} />
              <Route path="/token-incentivization" element={<TokenIncentivization />} />
              <Route path="/backtest" element={<Backtest />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pyusd-swap" element={<PYUSDSwap />} />
        </Routes>
      </div>
    </Router>
    </TransactionLayerProvider>
  );
};

const App: React.FC = () => {
  return (
    <WalletContextProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </WalletContextProvider>
  );
};

export default App; 