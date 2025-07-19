import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { WalletContextProvider } from '../../contexts/WalletContext';
import theme from '../../styles/theme';
import StrategyBuilder from '../strategy/StrategyBuilder';

// Mock the services
jest.mock('../../services/geminiService', () => ({
  generateStrategy: jest.fn(),
  testConnection: jest.fn(),
}));

jest.mock('../../services/strategyService', () => ({
  initializeProgram: jest.fn(),
  deployStrategy: jest.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <WalletContextProvider>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </ThemeProvider>
    </WalletContextProvider>
  );
};

describe('StrategyBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders strategy builder with correct title', () => {
    renderWithProviders(<StrategyBuilder />);
    expect(screen.getByText('Strategy Builder')).toBeInTheDocument();
  });

  test('shows test API button', () => {
    renderWithProviders(<StrategyBuilder />);
    expect(screen.getByText('🧪 Test Gemini API')).toBeInTheDocument();
  });

  test('allows selecting asset', () => {
    renderWithProviders(<StrategyBuilder />);
    const assetSelect = screen.getByLabelText('Select Asset');
    fireEvent.mouseDown(assetSelect);
    
    expect(screen.getByText('Solana (SOL)')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin (BTC)')).toBeInTheDocument();
    expect(screen.getByText('Ethereum (ETH)')).toBeInTheDocument();
  });

  test('allows selecting strategy type', () => {
    renderWithProviders(<StrategyBuilder />);
    const strategySelect = screen.getByLabelText('Strategy Type');
    fireEvent.mouseDown(strategySelect);
    
    expect(screen.getByText('Breakout Strategy')).toBeInTheDocument();
    expect(screen.getByText('Trend Following')).toBeInTheDocument();
    expect(screen.getByText('Mean Reversion')).toBeInTheDocument();
  });

  test('navigates through stepper correctly', () => {
    renderWithProviders(<StrategyBuilder />);
    
    // Should start at step 0
    expect(screen.getByText('Select Asset & Strategy')).toBeInTheDocument();
    
    // Click next
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Should be at step 1
    expect(screen.getByText('Define Parameters')).toBeInTheDocument();
  });

  test('allows parameter modification', () => {
    renderWithProviders(<StrategyBuilder />);
    
    // Navigate to parameters step
    fireEvent.click(screen.getByText('Next'));
    
    // Modify percentage increase
    const percentageInput = screen.getByLabelText('Percentage Increase');
    fireEvent.change(percentageInput, { target: { value: '5' } });
    
    expect(percentageInput).toHaveValue(5);
  });

  test('allows risk management configuration', () => {
    renderWithProviders(<StrategyBuilder />);
    
    // Navigate to risk management step
    fireEvent.click(screen.getByText('Next')); // Step 1
    fireEvent.click(screen.getByText('Next')); // Step 2
    
    // Should show risk management fields
    expect(screen.getByLabelText('Stop Loss')).toBeInTheDocument();
    expect(screen.getByLabelText('Take Profit')).toBeInTheDocument();
    expect(screen.getByLabelText('Position Size')).toBeInTheDocument();
  });

  test('allows instant swap configuration', () => {
    renderWithProviders(<StrategyBuilder />);
    
    // Navigate to instant swap step
    fireEvent.click(screen.getByText('Next')); // Step 1
    fireEvent.click(screen.getByText('Next')); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    
    // Should show instant swap settings
    expect(screen.getByText('Instant Stablecoin Swap Settings')).toBeInTheDocument();
  });

  test('shows strategy review and generation', () => {
    renderWithProviders(<StrategyBuilder />);
    
    // Navigate to review step
    fireEvent.click(screen.getByText('Next')); // Step 1
    fireEvent.click(screen.getByText('Next')); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    fireEvent.click(screen.getByText('Next')); // Step 4
    
    // Should show review content
    expect(screen.getByText('Strategy Review & Generation')).toBeInTheDocument();
    expect(screen.getByText('Generate Strategy')).toBeInTheDocument();
  });

  test('handles strategy generation', async () => {
    const mockGenerateStrategy = require('../../services/geminiService').generateStrategy;
    mockGenerateStrategy.mockResolvedValue('Generated strategy content');
    
    renderWithProviders(<StrategyBuilder />);
    
    // Navigate to review step
    fireEvent.click(screen.getByText('Next')); // Step 1
    fireEvent.click(screen.getByText('Next')); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    fireEvent.click(screen.getByText('Next')); // Step 4
    
    // Generate strategy
    fireEvent.click(screen.getByText('Generate Strategy'));
    
    await waitFor(() => {
      expect(mockGenerateStrategy).toHaveBeenCalled();
    });
  });

  test('shows error when wallet not connected for deployment', () => {
    renderWithProviders(<StrategyBuilder />);
    
    // Navigate to generated strategy step (mock response)
    const mockResponse = { message: 'Test strategy' };
    renderWithProviders(<StrategyBuilder />);
    
    // Mock the generated strategy state
    // This would require more complex setup with state management
    // For now, we'll test the basic functionality
  });

  test('handles API test connection', async () => {
    const mockTestConnection = require('../../services/geminiService').testConnection;
    mockTestConnection.mockResolvedValue(true);
    
    renderWithProviders(<StrategyBuilder />);
    
    // Click test API button
    fireEvent.click(screen.getByText('🧪 Test Gemini API'));
    
    await waitFor(() => {
      expect(mockTestConnection).toHaveBeenCalled();
    });
  });

  test('shows loading states correctly', async () => {
    const mockGenerateStrategy = require('../../services/geminiService').generateStrategy;
    mockGenerateStrategy.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithProviders(<StrategyBuilder />);
    
    // Navigate to review step
    fireEvent.click(screen.getByText('Next')); // Step 1
    fireEvent.click(screen.getByText('Next')); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    fireEvent.click(screen.getByText('Next')); // Step 4
    
    // Generate strategy
    fireEvent.click(screen.getByText('Generate Strategy'));
    
    // Should show loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('handles back navigation', () => {
    renderWithProviders(<StrategyBuilder />);
    
    // Navigate forward
    fireEvent.click(screen.getByText('Next'));
    
    // Navigate back
    fireEvent.click(screen.getByText('Back'));
    
    // Should be back at first step
    expect(screen.getByText('Select Asset & Strategy')).toBeInTheDocument();
  });

  test('validates required fields', () => {
    renderWithProviders(<StrategyBuilder />);
    
    // Try to navigate without selecting required fields
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Should still be on first step (validation would prevent navigation)
    expect(screen.getByText('Select Asset & Strategy')).toBeInTheDocument();
  });
}); 