use serde::{Deserialize, Serialize};
use reqwest::Client;
use tokio::time::{sleep, Duration};
use std::collections::HashMap;

/// Gemma API request structure
#[derive(Debug, Serialize)]
pub struct GemmaRequest {
    pub prompt: String,
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub top_p: Option<f32>,
    pub top_k: Option<u32>,
    pub stop_sequences: Option<Vec<String>>,
}

/// Gemma API response structure
#[derive(Debug, Deserialize)]
pub struct GemmaResponse {
    pub predictions: Vec<Prediction>,
    pub metadata: Metadata,
}

#[derive(Debug, Deserialize)]
pub struct Prediction {
    pub candidates: Vec<Candidate>,
    pub safety_attributes: Option<SafetyAttributes>,
}

#[derive(Debug, Deserialize)]
pub struct Candidate {
    pub content: Content,
    pub finish_reason: Option<String>,
    pub index: u32,
    pub token_count: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct Content {
    pub parts: Vec<Part>,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct Part {
    pub text: String,
}

#[derive(Debug, Deserialize)]
pub struct SafetyAttributes {
    pub blocked: bool,
    pub categories: HashMap<String, f32>,
    pub scores: HashMap<String, f32>,
}

#[derive(Debug, Deserialize)]
pub struct Metadata {
    pub token_count: Option<u32>,
    pub model: String,
}

/// Trading strategy prompt templates
pub struct TradingPrompts;

impl TradingPrompts {
    pub fn strategy_generation(asset: &str, timeframe: &str, risk_level: &str) -> String {
        format!(
            r#"You are an expert quantitative trader and AI strategist. Generate a comprehensive trading strategy for {asset} on {timeframe} timeframe with {risk_level} risk tolerance.

Strategy Requirements:
1. Clear entry and exit rules
2. Risk management parameters
3. Position sizing guidelines
4. Technical indicators to use
5. Market conditions analysis
6. Expected performance metrics

Please provide a detailed, actionable trading strategy that can be implemented programmatically. Include specific parameters, conditions, and logic for each component.

Asset: {asset}
Timeframe: {timeframe}
Risk Level: {risk_level}

Strategy:"#
        )
    }

    pub fn market_analysis(symbol: &str, indicators: &[String]) -> String {
        format!(
            r#"Analyze the current market conditions for {symbol} using the following indicators: {}.

Provide a comprehensive market analysis including:
1. Current trend direction
2. Support and resistance levels
3. Key technical signals
4. Market sentiment
5. Risk assessment
6. Trading recommendations

Symbol: {symbol}
Indicators: {}

Analysis:"#,
            indicators.join(", "),
            indicators.join(", ")
        )
    }

    pub fn risk_assessment(portfolio: &str, market_conditions: &str) -> String {
        format!(
            r#"Assess the risk profile for the following portfolio and market conditions:

Portfolio: {portfolio}
Market Conditions: {market_conditions}

Provide a detailed risk assessment including:
1. Overall portfolio risk score (0-100)
2. Key risk factors
3. Position-specific risks
4. Market risk factors
5. Recommended risk mitigation strategies
6. Portfolio optimization suggestions

Risk Assessment:"#
        )
    }

    pub fn portfolio_optimization(current_allocation: &str, constraints: &str) -> String {
        format!(
            r#"Optimize the following portfolio allocation based on the given constraints:

Current Allocation: {current_allocation}
Constraints: {constraints}

Provide portfolio optimization recommendations including:
1. Target allocation percentages
2. Rebalancing actions needed
3. Expected performance improvement
4. Risk-adjusted return optimization
5. Diversification improvements
6. Implementation timeline

Portfolio Optimization:"#
        )
    }

    pub fn sentiment_analysis(text: &str) -> String {
        format!(
            r#"Analyze the sentiment of the following market-related text and provide insights:

Text: {text}

Provide sentiment analysis including:
1. Overall sentiment score (-1 to 1)
2. Sentiment classification (Bullish/Bearish/Neutral)
3. Key sentiment indicators
4. Confidence level
5. Market implications
6. Trading signals based on sentiment

Sentiment Analysis:"#
        )
    }

    pub fn technical_analysis(symbol: &str, data: &str) -> String {
        format!(
            r#"Perform technical analysis on {symbol} using the following market data:

Market Data: {data}

Provide comprehensive technical analysis including:
1. Trend analysis (short, medium, long term)
2. Key technical indicators
3. Support and resistance levels
4. Chart patterns identification
5. Volume analysis
6. Momentum indicators
7. Trading signals and recommendations

Technical Analysis:"#
        )
    }
}

/// Gemma integration service
pub struct GemmaIntegration {
    client: Client,
    base_url: String,
    max_retries: u32,
    retry_delay: Duration,
}

impl GemmaIntegration {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
            max_retries: 3,
            retry_delay: Duration::from_secs(2),
        }
    }

    /// Generate text using Gemma model
    pub async fn generate_text(&self, prompt: &str, max_tokens: Option<u32>) -> Result<String, Box<dyn std::error::Error>> {
        let request = GemmaRequest {
            prompt: prompt.to_string(),
            max_tokens,
            temperature: Some(0.7),
            top_p: Some(0.9),
            top_k: Some(40),
            stop_sequences: None,
        };

        let mut attempts = 0;
        loop {
            match self.make_request(&request).await {
                Ok(response) => {
                    if let Some(prediction) = response.predictions.first() {
                        if let Some(candidate) = prediction.candidates.first() {
                            return Ok(candidate.content.parts.first()
                                .map(|part| part.text.clone())
                                .unwrap_or_default());
                        }
                    }
                    return Ok("No response generated".to_string());
                }
                Err(e) => {
                    attempts += 1;
                    if attempts >= self.max_retries {
                        return Err(e);
                    }
                    sleep(self.retry_delay).await;
                }
            }
        }
    }

    /// Generate trading strategy
    pub async fn generate_strategy(&self, asset: &str, timeframe: &str, risk_level: &str) -> Result<String, Box<dyn std::error::Error>> {
        let prompt = TradingPrompts::strategy_generation(asset, timeframe, risk_level);
        self.generate_text(&prompt, Some(1024)).await
    }

    /// Analyze market conditions
    pub async fn analyze_market(&self, symbol: &str, indicators: &[String]) -> Result<String, Box<dyn std::error::Error>> {
        let prompt = TradingPrompts::market_analysis(symbol, indicators);
        self.generate_text(&prompt, Some(768)).await
    }

    /// Assess portfolio risk
    pub async fn assess_risk(&self, portfolio: &str, market_conditions: &str) -> Result<String, Box<dyn std::error::Error>> {
        let prompt = TradingPrompts::risk_assessment(portfolio, market_conditions);
        self.generate_text(&prompt, Some(512)).await
    }

    /// Optimize portfolio
    pub async fn optimize_portfolio(&self, current_allocation: &str, constraints: &str) -> Result<String, Box<dyn std::error::Error>> {
        let prompt = TradingPrompts::portfolio_optimization(current_allocation, constraints);
        self.generate_text(&prompt, Some(768)).await
    }

    /// Analyze sentiment
    pub async fn analyze_sentiment(&self, text: &str) -> Result<String, Box<dyn std::error::Error>> {
        let prompt = TradingPrompts::sentiment_analysis(text);
        self.generate_text(&prompt, Some(256)).await
    }

    /// Perform technical analysis
    pub async fn technical_analysis(&self, symbol: &str, data: &str) -> Result<String, Box<dyn std::error::Error>> {
        let prompt = TradingPrompts::technical_analysis(symbol, data);
        self.generate_text(&prompt, Some(1024)).await
    }

    /// Make HTTP request to Gemma API
    async fn make_request(&self, request: &GemmaRequest) -> Result<GemmaResponse, Box<dyn std::error::Error>> {
        let response = self.client
            .post(&format!("{}/v1/models/gemma-3-4b:generateContent", self.base_url))
            .json(request)
            .send()
            .await?;

        if response.status().is_success() {
            let gemma_response: GemmaResponse = response.json().await?;
            Ok(gemma_response)
        } else {
            let error_text = response.text().await?;
            Err(format!("Gemma API error: {}", error_text).into())
        }
    }

    /// Test connection to Gemma service
    pub async fn test_connection(&self) -> Result<bool, Box<dyn std::error::Error>> {
        let test_prompt = "Hello, this is a test message. Please respond with 'OK' if you can see this.";
        
        match self.generate_text(test_prompt, Some(10)).await {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }

    /// Get model information
    pub async fn get_model_info(&self) -> Result<HashMap<String, serde_json::Value>, Box<dyn std::error::Error>> {
        let response = self.client
            .get(&format!("{}/v1/models/gemma-3-4b", self.base_url))
            .send()
            .await?;

        if response.status().is_success() {
            let model_info: HashMap<String, serde_json::Value> = response.json().await?;
            Ok(model_info)
        } else {
            Err("Failed to get model information".into())
        }
    }
}

/// Configuration for Gemma integration
#[derive(Debug, Clone)]
pub struct GemmaConfig {
    pub base_url: String,
    pub max_retries: u32,
    pub retry_delay_seconds: u64,
    pub default_max_tokens: u32,
    pub default_temperature: f32,
}

impl Default for GemmaConfig {
    fn default() -> Self {
        Self {
            base_url: "https://yoree-gemma-827561407333.europe-west1.run.app".to_string(),
            max_retries: 3,
            retry_delay_seconds: 2,
            default_max_tokens: 1024,
            default_temperature: 0.7,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_gemma_integration() {
        let gemma = GemmaIntegration::new("https://yoree-gemma-827561407333.europe-west1.run.app".to_string());
        
        // Test connection
        let is_connected = gemma.test_connection().await.unwrap_or(false);
        assert!(is_connected, "Gemma service should be accessible");
    }

    #[tokio::test]
    async fn test_strategy_generation() {
        let gemma = GemmaIntegration::new("https://yoree-gemma-827561407333.europe-west1.run.app".to_string());
        
        let strategy = gemma.generate_strategy("BTC/USD", "1h", "moderate").await;
        assert!(strategy.is_ok(), "Strategy generation should succeed");
        
        let strategy_text = strategy.unwrap();
        assert!(!strategy_text.is_empty(), "Strategy should not be empty");
    }

    #[tokio::test]
    async fn test_market_analysis() {
        let gemma = GemmaIntegration::new("https://yoree-gemma-827561407333.europe-west1.run.app".to_string());
        
        let indicators = vec!["RSI".to_string(), "MACD".to_string(), "Bollinger Bands".to_string()];
        let analysis = gemma.analyze_market("ETH/USD", &indicators).await;
        assert!(analysis.is_ok(), "Market analysis should succeed");
    }
} 