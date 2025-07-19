use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use reqwest::Client;
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoinGeckoPrice {
    pub id: String,
    pub symbol: String,
    pub current_price: f64,
    pub market_cap: Option<f64>,
    pub total_volume: Option<f64>,
    pub price_change_24h: Option<f64>,
    pub price_change_percentage_24h: Option<f64>,
    pub last_updated: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoinGeckoOHLCV {
    pub timestamp: i64,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoinGeckoMarketChart {
    pub prices: Vec<[f64; 2]>,
    pub market_caps: Vec<[f64; 2]>,
    pub total_volumes: Vec<[f64; 2]>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoinGeckoMarketData {
    pub id: String,
    pub symbol: String,
    pub name: String,
    pub current_price: f64,
    pub market_cap: f64,
    pub total_volume: f64,
    pub price_change_24h: f64,
    pub price_change_percentage_24h: f64,
    pub circulating_supply: f64,
    pub total_supply: Option<f64>,
    pub max_supply: Option<f64>,
    pub last_updated: String,
}

#[derive(Debug)]
pub enum CoinGeckoError {
    NetworkError(reqwest::Error),
    RateLimitExceeded,
    InvalidResponse(String),
    ApiKeyRequired,
}

impl std::fmt::Display for CoinGeckoError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CoinGeckoError::NetworkError(e) => write!(f, "Network error: {}", e),
            CoinGeckoError::RateLimitExceeded => write!(f, "Rate limit exceeded"),
            CoinGeckoError::InvalidResponse(msg) => write!(f, "Invalid response: {}", msg),
            CoinGeckoError::ApiKeyRequired => write!(f, "API key required for this endpoint"),
        }
    }
}

impl std::error::Error for CoinGeckoError {}

impl From<reqwest::Error> for CoinGeckoError {
    fn from(error: reqwest::Error) -> Self {
        CoinGeckoError::NetworkError(error)
    }
}

impl From<serde_json::Error> for CoinGeckoError {
    fn from(error: serde_json::Error) -> Self {
        CoinGeckoError::InvalidResponse(error.to_string())
    }
}

pub struct CoinGeckoClient {
    client: Client,
    api_key: Option<String>,
    base_url: String,
    rate_limit_delay: Duration,
}

impl CoinGeckoClient {
    pub fn new(api_key: Option<String>) -> Self {
        let base_url = if api_key.is_some() {
            "https://pro-api.coingecko.com/api/v3".to_string()
        } else {
            "https://api.coingecko.com/api/v3".to_string()
        };

        CoinGeckoClient {
            client: Client::new(),
            api_key,
            base_url,
            rate_limit_delay: Duration::from_millis(1200), // Free tier: 50 calls/min
        }
    }

    async fn make_request(&self, endpoint: &str) -> Result<reqwest::Response, CoinGeckoError> {
        let url = format!("{}{}", self.base_url, endpoint);
        let mut request = self.client.get(&url);

        if let Some(ref api_key) = self.api_key {
            request = request.header("x-cg-pro-api-key", api_key);
        }

        let response = request.send().await?;

        if response.status() == 429 {
            return Err(CoinGeckoError::RateLimitExceeded);
        }

        Ok(response)
    }

    pub async fn get_historical_ohlcv(
        &self,
        coin_id: &str,
        vs_currency: &str,
        days: u32,
    ) -> Result<Vec<CoinGeckoOHLCV>, CoinGeckoError> {
        let endpoint = format!(
            "/coins/{}/ohlc?vs_currency={}&days={}",
            coin_id, vs_currency, days
        );

        let response = self.make_request(&endpoint).await?;
        sleep(self.rate_limit_delay).await;

        let data: Vec<Vec<f64>> = response
            .json()
            .await
            .map_err(|e| CoinGeckoError::InvalidResponse(e.to_string()))?;

        let ohlcv_data = data
            .into_iter()
            .map(|row| {
                if row.len() >= 5 {
                    CoinGeckoOHLCV {
                        timestamp: row[0] as i64,
                        open: row[1],
                        high: row[2],
                        low: row[3],
                        close: row[4],
                        volume: row.get(5).copied().unwrap_or(0.0),
                    }
                } else {
                    CoinGeckoOHLCV {
                        timestamp: 0,
                        open: 0.0,
                        high: 0.0,
                        low: 0.0,
                        close: 0.0,
                        volume: 0.0,
                    }
                }
            })
            .collect();

        Ok(ohlcv_data)
    }

    pub async fn get_market_data(
        &self,
        coin_ids: &[String],
        vs_currency: &str,
    ) -> Result<Vec<CoinGeckoMarketData>, CoinGeckoError> {
        let ids = coin_ids.join(",");
        let endpoint = format!(
            "/coins/markets?vs_currency={}&ids={}&order=market_cap_desc&per_page=100&page=1&sparkline=false",
            vs_currency, ids
        );

        let response = self.make_request(&endpoint).await?;
        sleep(self.rate_limit_delay).await;

        let market_data: Vec<CoinGeckoMarketData> = response
            .json()
            .await
            .map_err(|e| CoinGeckoError::InvalidResponse(e.to_string()))?;

        Ok(market_data)
    }

    pub async fn get_current_price(
        &self,
        coin_ids: &[String],
        vs_currencies: &[String],
    ) -> Result<HashMap<String, HashMap<String, f64>>, CoinGeckoError> {
        let ids = coin_ids.join(",");
        let currencies = vs_currencies.join(",");
        let endpoint = format!(
            "/simple/price?ids={}&vs_currencies={}&include_24hr_change=true",
            ids, currencies
        );

        let response = self.make_request(&endpoint).await?;
        sleep(self.rate_limit_delay).await;

        let prices: HashMap<String, HashMap<String, f64>> = response
            .json()
            .await
            .map_err(|e| CoinGeckoError::InvalidResponse(e.to_string()))?;

        Ok(prices)
    }

    pub async fn get_supported_coins(&self) -> Result<Vec<CoinInfo>, CoinGeckoError> {
        let endpoint = "/coins/list";
        let response = self.make_request(endpoint).await?;
        sleep(self.rate_limit_delay).await;

        let coins: Vec<CoinInfo> = response
            .json()
            .await
            .map_err(|e| CoinGeckoError::InvalidResponse(e.to_string()))?;

        Ok(coins)
    }

    pub async fn get_market_chart(
        &self,
        coin_id: &str,
        vs_currency: &str,
        days: u32,
    ) -> Result<CoinGeckoMarketChart, CoinGeckoError> {
        let url = format!(
            "{}/coins/{}/market_chart?vs_currency={}&days={}&interval=daily",
            self.base_url, coin_id, vs_currency, days
        );

        let mut request = self.client.get(&url);
        
        if let Some(ref api_key) = self.api_key {
            request = request.header("x-cg-pro-api-key", api_key);
        }

        let response = request.send().await?;
        
        if !response.status().is_success() {
            return Err(CoinGeckoError::InvalidResponse(format!(
                "API request failed with status: {}",
                response.status()
            )));
        }

        let data: CoinGeckoMarketChart = response.json().await?;
        Ok(data)
    }

    pub async fn get_coins_list(&self) -> Result<Vec<CoinInfo>, CoinGeckoError> {
        let endpoint = "/coins/list";
        let response = self.make_request(endpoint).await?;
        sleep(self.rate_limit_delay).await;

        let coins: Vec<CoinInfo> = response
            .json()
            .await
            .map_err(|e| CoinGeckoError::InvalidResponse(e.to_string()))?;

        Ok(coins)
    }

    pub async fn get_trending(&self) -> Result<serde_json::Value, CoinGeckoError> {
        let endpoint = "/search/trending";
        let response = self.make_request(endpoint).await?;
        sleep(self.rate_limit_delay).await;

        let data: serde_json::Value = response.json().await?;
        Ok(data)
    }

    pub async fn get_global_data(&self) -> Result<serde_json::Value, CoinGeckoError> {
        let endpoint = "/global";
        let response = self.make_request(endpoint).await?;
        sleep(self.rate_limit_delay).await;

        let data: serde_json::Value = response.json().await?;
        Ok(data)
    }

    pub async fn get_coins_markets(
        &self,
        vs_currency: &str,
        coin_ids: Option<&[String]>,
        order: Option<&str>,
        per_page: Option<u32>,
        page: Option<u32>,
        sparkline: bool,
        price_change_percentage: Option<&str>,
    ) -> Result<Vec<CoinGeckoPrice>, CoinGeckoError> {
        let mut url = format!(
            "{}/coins/markets?vs_currency={}&sparkline={}",
            self.base_url, vs_currency, sparkline
        );

        if let Some(ids) = coin_ids {
            url.push_str(&format!("&ids={}", ids.join(",")));
        }

        if let Some(order) = order {
            url.push_str(&format!("&order={}", order));
        }

        if let Some(per_page) = per_page {
            url.push_str(&format!("&per_page={}", per_page));
        }

        if let Some(page) = page {
            url.push_str(&format!("&page={}", page));
        }

        if let Some(percentage) = price_change_percentage {
            url.push_str(&format!("&price_change_percentage={}", percentage));
        }

        let mut request = self.client.get(&url);
        
        if let Some(ref api_key) = self.api_key {
            request = request.header("x-cg-pro-api-key", api_key);
        }

        let response = request.send().await?;
        
        if !response.status().is_success() {
            return Err(CoinGeckoError::InvalidResponse(format!(
                "API request failed with status: {}",
                response.status()
            )));
        }

        let data: Vec<CoinGeckoPrice> = response.json().await?;
        Ok(data)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoinInfo {
    pub id: String,
    pub symbol: String,
    pub name: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_coingecko_client_creation() {
        let client = CoinGeckoClient::new(None);
        assert_eq!(client.base_url, "https://api.coingecko.com/api/v3");
    }

    #[tokio::test]
    async fn test_coingecko_pro_client_creation() {
        let client = CoinGeckoClient::new(Some("test_key".to_string()));
        assert_eq!(client.base_url, "https://pro-api.coingecko.com/api/v3");
    }

    #[tokio::test]
    async fn test_get_current_price() {
        let client = CoinGeckoClient::new(None);
        let coin_ids = vec!["bitcoin".to_string(), "ethereum".to_string()];
        let vs_currencies = vec!["usd".to_string()];
        
        let result = client.get_current_price(&coin_ids, &vs_currencies).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_get_market_chart() {
        let client = CoinGeckoClient::new(None);
        let result = client.get_market_chart("bitcoin", "usd", 7).await;
        assert!(result.is_ok());
    }
} 