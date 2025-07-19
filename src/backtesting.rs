/// Module: Advanced Backtesting framework for strategies with comprehensive metrics and risk analysis.
use crate::data_sources::{PriceData, DataProvider};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Comprehensive result of a backtest run with detailed performance metrics.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BacktestResult {
    pub strategy_name: String,
    pub timeframe: String,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    
    // Core Performance Metrics
    pub total_return: f64,
    pub annualized_return: f64,
    pub volatility: f64,
    pub sharpe_ratio: f64,
    pub max_drawdown: f64,
    
    // Trade Statistics
    pub total_trades: usize,
    pub winning_trades: usize,
    pub win_rate: f64,
    pub profit_factor: f64,
    
    // Equity Curve
    pub equity_curve: Vec<EquityPoint>,
    pub trades: Vec<Trade>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EquityPoint {
    pub timestamp: DateTime<Utc>,
    pub equity: f64,
    pub cumulative_return: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trade {
    pub entry_time: DateTime<Utc>,
    pub exit_time: DateTime<Utc>,
    pub symbol: String,
    pub entry_price: f64,
    pub exit_price: f64,
    pub quantity: f64,
    pub pnl: f64,
    pub pnl_pct: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BacktestConfig {
    pub initial_capital: f64,
    pub commission_rate: f64,
    pub slippage_rate: f64,
    pub risk_free_rate: f64,
}

impl Default for BacktestConfig {
    fn default() -> Self {
        BacktestConfig {
            initial_capital: 100000.0,
            commission_rate: 0.001,  // 0.1%
            slippage_rate: 0.0005,   // 0.05%
            risk_free_rate: 0.02,    // 2% risk-free rate
        }
    }
}

/// Advanced backtesting engine
pub struct BacktestEngine {
    pub config: BacktestConfig,
    pub equity_curve: Vec<EquityPoint>,
    pub trades: Vec<Trade>,
}

impl BacktestEngine {
    pub fn new(config: BacktestConfig) -> Self {
        BacktestEngine {
            config,
            equity_curve: Vec::new(),
            trades: Vec::new(),
        }
    }
    
    /// Run comprehensive backtest with real historical data from CoinGecko
    pub async fn run_backtest_with_real_data(
        &mut self,
        symbol: &str,
        strategy_name: &str,
        days: u32,
    ) -> Result<BacktestResult, Box<dyn std::error::Error + Send + Sync>> {
        
        // Fetch real historical data
        let data_provider = DataProvider::new(None);
        let historical_data = data_provider.fetch_historical_data(symbol, days).await
            .map_err(|e| Box::new(std::io::Error::new(std::io::ErrorKind::Other, e)) as Box<dyn std::error::Error + Send + Sync>)?;
        
        self.run_backtest(&historical_data, strategy_name, days).await
    }
    
    /// Run comprehensive backtest with strategy on historical data
    pub async fn run_backtest(
        &mut self,
        historical_data: &[PriceData],
        strategy_name: &str,
        days: u32,
    ) -> Result<BacktestResult, Box<dyn std::error::Error + Send + Sync>> {
        
        if historical_data.is_empty() {
            return Err("No historical data provided".into());
        }
        
        let mut equity = self.config.initial_capital;
        let start_date = Utc::now();
        let end_date = Utc::now();
        
        // Enhanced momentum strategy with proper risk management
        let mut position_size = 0.0;
        let mut entry_price = 0.0;
        let mut in_position = false;
        
        for (i, price_point) in historical_data.iter().enumerate() {
            if i < 20 { continue; } // Need enough data for moving averages
            
            let current_price = price_point.price;
            
            // Simple moving average crossover strategy
            let short_ma = calculate_sma(&historical_data[i-10..=i], 10);
            let long_ma = calculate_sma(&historical_data[i-20..=i], 20);
            
            // Entry signal: short MA crosses above long MA
            if !in_position && short_ma > long_ma && i > 0 {
                let prev_short_ma = calculate_sma(&historical_data[i-11..i], 10);
                let prev_long_ma = calculate_sma(&historical_data[i-21..i], 20);
                
                if prev_short_ma <= prev_long_ma { // Confirm crossover
                    // Enter position
                    entry_price = current_price;
                    position_size = (equity * 0.95) / current_price; // Use 95% of equity
                    in_position = true;
                    
                    println!("Entering position: Price={}, Size={}", entry_price, position_size);
                }
            }
            // Exit signal: short MA crosses below long MA or stop loss
            else if in_position {
                let should_exit = short_ma < long_ma || 
                                 current_price < entry_price * 0.95; // 5% stop loss
                
                if should_exit {
                    // Exit position
                    let exit_price = current_price;
                    let pnl_gross = (exit_price - entry_price) * position_size;
                    let commission = (entry_price + exit_price) * position_size * self.config.commission_rate;
                    let slippage = entry_price * position_size * self.config.slippage_rate;
                    let net_pnl = pnl_gross - commission - slippage;
                    
                    equity += net_pnl;
                    
                    let trade = Trade {
                        entry_time: Utc::now(),
                        exit_time: Utc::now(),
                        symbol: "BTC".to_string(),
                        entry_price,
                        exit_price,
                        quantity: position_size,
                        pnl: net_pnl,
                        pnl_pct: net_pnl / (entry_price * position_size),
                    };
                    
                    self.trades.push(trade);
                    in_position = false;
                    
                    println!("Exiting position: Price={}, PnL={}", exit_price, net_pnl);
                }
            }
            
            // Record equity curve
            let equity_point = EquityPoint {
                timestamp: Utc::now(),
                equity,
                cumulative_return: (equity - self.config.initial_capital) / self.config.initial_capital,
            };
            
            self.equity_curve.push(equity_point);
        }
        
        // Calculate comprehensive performance metrics
        let winning_trades = self.trades.iter().filter(|t| t.pnl > 0.0).count();
        let total_return = (equity - self.config.initial_capital) / self.config.initial_capital;
        let win_rate = if !self.trades.is_empty() { 
            winning_trades as f64 / self.trades.len() as f64 
        } else { 0.0 };
        
        // Calculate volatility and Sharpe ratio
        let returns: Vec<f64> = self.equity_curve.windows(2)
            .map(|window| {
                if window[0].equity > 0.0 {
                    (window[1].equity - window[0].equity) / window[0].equity
                } else { 0.0 }
            })
            .collect();
        
        let avg_return = if !returns.is_empty() {
            returns.iter().sum::<f64>() / returns.len() as f64
        } else { 0.0 };
        
        let volatility = if returns.len() > 1 {
            let variance = returns.iter()
                .map(|r| (r - avg_return).powi(2))
                .sum::<f64>() / (returns.len() - 1) as f64;
            variance.sqrt() * (252.0_f64).sqrt() // Annualized
        } else { 0.0 };
        
        let sharpe_ratio = if volatility > 0.0 {
            (total_return - self.config.risk_free_rate) / volatility
        } else { 0.0 };
        
        // Calculate maximum drawdown
        let mut peak = self.config.initial_capital;
        let mut max_drawdown = 0.0;
        
        for point in &self.equity_curve {
            if point.equity > peak {
                peak = point.equity;
            }
            let drawdown = (peak - point.equity) / peak;
            if drawdown > max_drawdown {
                max_drawdown = drawdown;
            }
        }
        
        // Calculate profit factor
        let gross_profit: f64 = self.trades.iter()
            .filter(|t| t.pnl > 0.0)
            .map(|t| t.pnl)
            .sum();
        let gross_loss: f64 = self.trades.iter()
            .filter(|t| t.pnl < 0.0)
            .map(|t| t.pnl.abs())
            .sum();
        
        let profit_factor = if gross_loss > 0.0 { gross_profit / gross_loss } else { 0.0 };
        
        let result = BacktestResult {
            strategy_name: strategy_name.to_string(),
            timeframe: "1d".to_string(),
            start_date,
            end_date,
            total_return,
            annualized_return: total_return * 365.0 / days as f64, // Rough annualization
            volatility,
            sharpe_ratio,
            max_drawdown,
            total_trades: self.trades.len(),
            winning_trades,
            win_rate,
            profit_factor,
            equity_curve: self.equity_curve.clone(),
            trades: self.trades.clone(),
        };
        
        Ok(result)
    }
}

/// Helper function to calculate simple moving average
fn calculate_sma(data: &[PriceData], period: usize) -> f64 {
    if data.len() < period {
        return 0.0;
    }
    
    let sum: f64 = data.iter().rev().take(period).map(|p| p.price).sum();
    sum / period as f64
}

/// Legacy function for compatibility with enhanced functionality
pub fn run_backtest(data: &[PriceData]) -> BacktestResult {
    let mut engine = BacktestEngine::new(BacktestConfig::default());
    
    // Convert to async runtime for legacy compatibility
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
        engine.run_backtest(data, "Legacy Strategy", 365).await.unwrap_or_else(|e| {
            eprintln!("Backtest error: {}", e);
            BacktestResult {
                strategy_name: "Legacy Strategy (Error)".to_string(),
                timeframe: "1d".to_string(),
                start_date: Utc::now(),
                end_date: Utc::now(),
                total_return: 0.0,
                annualized_return: 0.0,
                volatility: 0.0,
                sharpe_ratio: 0.0,
                max_drawdown: 0.0,
                total_trades: 0,
                winning_trades: 0,
                win_rate: 0.0,
                profit_factor: 0.0,
                equity_curve: Vec::new(),
                trades: Vec::new(),
            }
        })
    })
}
