use std::sync::Arc;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use tracing::{info, error};

use crate::blockchain::{BNBChainService, SwapResult, Balances};

#[derive(Clone, Serialize, Deserialize)]
pub struct TradingPosition {
    pub id: String,
    pub token: String,
    pub amount: String,
    pub entry_price: f64,
    pub current_price: f64,
    pub pnl: f64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct TradingSignal {
    pub token: String,
    pub signal: String, // "BUY", "SELL", "HOLD"
    pub confidence: f64,
    pub reasoning: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

pub struct TradingService {
    bnb_service: Arc<BNBChainService>,
}

impl TradingService {
    pub async fn new(bnb_service: Arc<BNBChainService>) -> Result<Self> {
        Ok(Self { bnb_service })
    }
    
    pub async fn execute_swap(
        &self,
        from_token: &str,
        to_token: &str,
        amount: &str,
        wallet_address: &str,
    ) -> Result<SwapResult> {
        info!(
            "Executing swap: {} {} → {} for wallet {}",
            amount, from_token, to_token, wallet_address
        );
        
        // Validate swap parameters
        self.validate_swap(from_token, to_token, amount, wallet_address).await?;
        
        // Execute the swap on blockchain
        let result = self.bnb_service.execute_swap(from_token, to_token, amount, wallet_address).await?;
        
        info!(
            "Swap completed: TX Hash: {}, New PYUSD: {}, New tBNB: {}",
            result.transaction_hash, result.new_balances.pyusd, result.new_balances.tbnb
        );
        
        Ok(result)
    }
    
    async fn validate_swap(
        &self,
        from_token: &str,
        to_token: &str,
        amount: &str,
        wallet_address: &str,
    ) -> Result<()> {
        // Check if tokens are supported
        let supported_tokens = ["PYUSD", "tBNB", "BNB"];
        if !supported_tokens.contains(&from_token) || !supported_tokens.contains(&to_token) {
            return Err(anyhow::anyhow!("Unsupported token pair"));
        }
        
        // Check if amount is valid
        let amount_f64 = amount.parse::<f64>()?;
        if amount_f64 <= 0.0 {
            return Err(anyhow::anyhow!("Invalid amount"));
        }
        
        // Check if user has sufficient balance
        let balances = self.bnb_service.get_all_balances(wallet_address).await?;
        let current_balance = match from_token {
            "PYUSD" => balances.pyusd.parse::<f64>()?,
            "tBNB" | "BNB" => balances.tbnb.parse::<f64>()?,
            _ => return Err(anyhow::anyhow!("Unsupported token")),
        };
        
        if current_balance < amount_f64 {
            return Err(anyhow::anyhow!("Insufficient balance"));
        }
        
        Ok(())
    }
    
    pub async fn get_trading_positions(&self, wallet_address: &str) -> Result<Vec<TradingPosition>> {
        // This would fetch from the database
        // For now, return mock positions
        
        let mock_positions = vec![
            TradingPosition {
                id: "1".to_string(),
                token: "PYUSD".to_string(),
                amount: "100.00".to_string(),
                entry_price: 1.0,
                current_price: 1.0,
                pnl: 0.0,
                timestamp: chrono::Utc::now(),
            },
            TradingPosition {
                id: "2".to_string(),
                token: "tBNB".to_string(),
                amount: "0.5".to_string(),
                entry_price: 320.0,
                current_price: 320.45,
                pnl: 0.225,
                timestamp: chrono::Utc::now() - chrono::Duration::hours(2),
            },
        ];
        
        Ok(mock_positions)
    }
    
    pub async fn get_trading_history(&self, wallet_address: &str) -> Result<Vec<TradingPosition>> {
        // This would fetch from the database
        // For now, return mock history
        
        let mock_history = vec![
            TradingPosition {
                id: "3".to_string(),
                token: "PYUSD".to_string(),
                amount: "50.00".to_string(),
                entry_price: 1.0,
                current_price: 1.0,
                pnl: 0.0,
                timestamp: chrono::Utc::now() - chrono::Duration::days(1),
            },
        ];
        
        Ok(mock_history)
    }
    
    pub async fn calculate_portfolio_value(&self, wallet_address: &str) -> Result<f64> {
        let balances = self.bnb_service.get_all_balances(wallet_address).await?;
        
        let pyusd_value = balances.pyusd.parse::<f64>()? * 1.0; // PYUSD = $1
        let tbnb_value = balances.tbnb.parse::<f64>()? * 320.45; // tBNB ≈ $320.45
        
        Ok(pyusd_value + tbnb_value)
    }
    
    pub async fn get_market_data(&self, token: &str) -> Result<serde_json::Value> {
        // This would fetch from price oracles and market data providers
        // For now, return mock data
        
        let mock_data = match token {
            "PYUSD" => serde_json::json!({
                "price": 1.0,
                "change_24h": 0.0,
                "volume_24h": 1000000.0,
                "market_cap": 1200000000.0
            }),
            "tBNB" | "BNB" => serde_json::json!({
                "price": 320.45,
                "change_24h": 2.3,
                "volume_24h": 50000000.0,
                "market_cap": 48200000000.0
            }),
            _ => serde_json::json!({
                "price": 1.0,
                "change_24h": 0.0,
                "volume_24h": 0.0,
                "market_cap": 0.0
            }),
        };
        
        Ok(mock_data)
    }
} 