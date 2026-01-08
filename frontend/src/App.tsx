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
import SignalMarketsPage from './pages/SignalMarkets';
import CreateSignalPage from './pages/CreateSignal';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        <Navbar />
        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signal-markets" element={<SignalMarketsPage />} />
              <Route path="/create-signal" element={<CreateSignalPage />} />
              <Route path="/portfolio" element={<Dashboard />} />
              <Route path="/analytics" element={<Dashboard />} />
              <Route path="/data-feeds" element={<Dashboard />} />
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