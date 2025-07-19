pub mod coingecko;
pub mod binance;  // Future module
pub mod messari;  // Future module

pub use coingecko::{
    CoinGeckoClient, 
    CoinGeckoOHLCV, 
    CoinGeckoPrice,
    CoinGeckoMarketChart,
    CoinGeckoError, 
    CoinInfo
};

// Re-export common types for convenience
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedOHLCV {
    pub timestamp: DateTime<Utc>,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedMarketData {
    pub symbol: String,
    pub price: f64,
    pub volume_24h: f64,
    pub change_24h: f64,
    pub change_24h_pct: f64,
    pub market_cap: Option<f64>,
    pub timestamp: DateTime<Utc>,
    pub source: String,
}

pub trait DataProvider {
    type Error;
    
    async fn get_historical_data(
        &self,
        symbol: &str,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<UnifiedOHLCV>, Self::Error>;
    
    async fn get_current_price(&self, symbol: &str) -> Result<f64, Self::Error>;
} 