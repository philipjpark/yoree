use ethers::{
    providers::{Http, Provider},
    types::{Address, U256},
    prelude::*,
};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use anyhow::Result;

use crate::config::Config;

#[derive(Clone, Serialize, Deserialize)]
pub struct Balances {
    pub pyusd: String,
    pub tbnb: String,
    pub bnb: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct SwapResult {
    pub transaction_hash: String,
    pub new_balances: Balances,
}

pub struct BNBChainService {
    provider: Provider<Http>,
    pyusd_address: Address,
    strategy_manager_address: Address,
    network: String,
}

impl BNBChainService {
    pub async fn new(config: &Config) -> Result<Self> {
        let provider = Provider::<Http>::try_from(&config.bnb_rpc_url)?;
        let pyusd_address = Address::from_str(&config.pyusd_address)?;
        let strategy_manager_address = Address::from_str(&config.strategy_manager_address)?;
        
        Ok(Self {
            provider,
            pyusd_address,
            strategy_manager_address,
            network: config.network.clone(),
        })
    }
    
    pub async fn get_all_balances(&self, wallet_address: &str) -> Result<Balances> {
        let address = Address::from_str(wallet_address)?;
        
        // Get BNB balance
        let bnb_balance = self.provider.get_balance(address, None).await?;
        let bnb_balance_str = format!("{:.6}", ethers::utils::format_units(bnb_balance, 18)?);
        
        // Get PYUSD balance
        let pyusd_balance = self.get_pyusd_balance(&address).await?;
        
        // For testnet, tBNB is the same as BNB
        let tbnb_balance = bnb_balance_str.clone();
        
        Ok(Balances {
            pyusd: pyusd_balance,
            tbnb: tbnb_balance,
            bnb: bnb_balance_str,
        })
    }
    
    pub async fn get_pyusd_balance(&self, address: &Address) -> Result<String> {
        // PYUSD ERC20 contract ABI (simplified)
        let abi = r#"[
            {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},
            {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"}
        ]"#;
        
        let contract = Contract::new(self.pyusd_address, abi.parse()?, self.provider.clone());
        
        // Get balance
        let balance: U256 = contract.method("balanceOf", address)??.call().await?;
        
        // Get decimals
        let decimals: u8 = contract.method("decimals", ())??.call().await?;
        
        // Format balance
        let balance_str = format!("{:.6}", ethers::utils::format_units(balance, decimals)?);
        
        Ok(balance_str)
    }
    
    pub async fn execute_swap(
        &self,
        from_token: &str,
        to_token: &str,
        amount: &str,
        wallet_address: &str,
    ) -> Result<SwapResult> {
        // This would integrate with PancakeSwap or similar DEX
        // For now, we'll simulate the swap
        
        let address = Address::from_str(wallet_address)?;
        let current_balances = self.get_all_balances(wallet_address).await?;
        
        // Simulate swap calculation
        let amount_f64 = amount.parse::<f64>()?;
        let rate = if from_token == "PYUSD" && to_token == "tBNB" {
            0.003125 // 1 PYUSD ≈ 0.003125 tBNB
        } else {
            320.0 // 1 tBNB ≈ 320 PYUSD
        };
        
        let output_amount = amount_f64 * rate;
        
        // Calculate new balances
        let new_balances = if from_token == "PYUSD" && to_token == "tBNB" {
            let new_pyusd = current_balances.pyusd.parse::<f64>()? - amount_f64;
            let new_tbnb = current_balances.tbnb.parse::<f64>()? + output_amount;
            
            Balances {
                pyusd: format!("{:.6}", new_pyusd),
                tbnb: format!("{:.6}", new_tbnb),
                bnb: current_balances.bnb,
            }
        } else {
            let new_tbnb = current_balances.tbnb.parse::<f64>()? - amount_f64;
            let new_pyusd = current_balances.pyusd.parse::<f64>()? + output_amount;
            
            Balances {
                pyusd: format!("{:.6}", new_pyusd),
                tbnb: format!("{:.6}", new_tbnb),
                bnb: current_balances.bnb,
            }
        };
        
        // Generate mock transaction hash
        let tx_hash = format!("0x{}", hex::encode(rand::random::<[u8; 32]>()));
        
        Ok(SwapResult {
            transaction_hash: tx_hash,
            new_balances,
        })
    }
    
    pub async fn create_strategy(
        &self,
        name: &str,
        description: &str,
        target_token: &str,
        stop_loss: f64,
        take_profit: f64,
        position_size: f64,
        wallet_address: &str,
    ) -> Result<String> {
        // This would interact with the StrategyManager smart contract
        // For now, we'll simulate the transaction
        
        let tx_hash = format!("0x{}", hex::encode(rand::random::<[u8; 32]>()));
        
        tracing::info!(
            "Created strategy: {} for token {} with SL: {}, TP: {}, Size: {}",
            name, target_token, stop_loss, take_profit, position_size
        );
        
        Ok(tx_hash)
    }
    
    pub async fn get_current_price(&self, token_address: &str) -> Result<f64> {
        // This would fetch from price oracles like Pyth Network
        // For now, return mock prices
        
        let mock_prices = [
            ("0x6c3ea9036406852006290770BEdFcAbA0e23A0e8", 1.0), // PYUSD
            ("0x0000000000000000000000000000000000000000", 320.45), // BNB
        ];
        
        for (addr, price) in mock_prices {
            if addr.to_lowercase() == token_address.to_lowercase() {
                return Ok(*price);
            }
        }
        
        Ok(1.0) // Default price
    }
} 