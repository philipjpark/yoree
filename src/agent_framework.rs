use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::gemma_integration::{GemmaIntegration, GemmaConfig};

/// Agent types for different trading functions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentType {
    StrategyGenerator,
    MarketAnalyzer,
    RiskManager,
    PortfolioOptimizer,
    SentimentAnalyzer,
    TechnicalAnalyzer,
}

/// Agent status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentStatus {
    Idle,
    Running,
    Completed,
    Failed(String),
}

/// Agent configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfig {
    pub agent_type: AgentType,
    pub name: String,
    pub description: String,
    pub parameters: HashMap<String, serde_json::Value>,
    pub google_cloud_config: GoogleCloudConfig,
}

/// Google Cloud configuration for agents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoogleCloudConfig {
    pub project_id: String,
    pub region: String,
    pub model_name: String,
    pub api_key: Option<String>,
}

/// Agent message types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentMessage {
    StartAnalysis {
        market_data: MarketData,
        strategy_params: StrategyParameters,
    },
    GenerateStrategy {
        requirements: StrategyRequirements,
        risk_profile: RiskProfile,
    },
    OptimizePortfolio {
        current_portfolio: Portfolio,
        constraints: PortfolioConstraints,
    },
    AnalyzeRisk {
        position: Position,
        market_conditions: MarketConditions,
    },
}

/// Market data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketData {
    pub symbol: String,
    pub price: f64,
    pub volume: f64,
    pub timestamp: i64,
    pub indicators: HashMap<String, f64>,
}

/// Strategy parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategyParameters {
    pub asset: String,
    pub timeframe: String,
    pub risk_level: RiskLevel,
    pub target_return: f64,
    pub max_drawdown: f64,
}

/// Strategy requirements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategyRequirements {
    pub asset_class: String,
    pub strategy_type: String,
    pub complexity: ComplexityLevel,
    pub automation_level: AutomationLevel,
}

/// Risk profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskProfile {
    pub risk_tolerance: RiskTolerance,
    pub investment_horizon: String,
    pub liquidity_needs: LiquidityNeeds,
}

/// Portfolio structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Portfolio {
    pub positions: Vec<Position>,
    pub total_value: f64,
    pub cash: f64,
}

/// Position in portfolio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub symbol: String,
    pub quantity: f64,
    pub average_price: f64,
    pub current_value: f64,
}

/// Portfolio constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortfolioConstraints {
    pub max_position_size: f64,
    pub min_diversification: f64,
    pub max_sector_exposure: f64,
}

/// Market conditions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketConditions {
    pub volatility: f64,
    pub trend: MarketTrend,
    pub sentiment: MarketSentiment,
}

/// Enums for various parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    VeryHigh,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplexityLevel {
    Simple,
    Moderate,
    Complex,
    Advanced,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AutomationLevel {
    Manual,
    SemiAutomated,
    FullyAutomated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskTolerance {
    Conservative,
    Moderate,
    Aggressive,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LiquidityNeeds {
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MarketTrend {
    Bullish,
    Bearish,
    Sideways,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MarketSentiment {
    Positive,
    Neutral,
    Negative,
}

/// Agent trait for different agent implementations
#[async_trait::async_trait]
pub trait Agent {
    async fn process_message(&mut self, message: AgentMessage) -> Result<AgentResponse, AgentError>;
    async fn get_status(&self) -> AgentStatus;
    async fn get_config(&self) -> &AgentConfig;
}

/// Agent response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentResponse {
    pub agent_id: String,
    pub response_type: AgentResponseType,
    pub data: serde_json::Value,
    pub confidence: f64,
    pub timestamp: i64,
}

/// Agent response types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentResponseType {
    StrategyGenerated(Strategy),
    MarketAnalysis(MarketAnalysis),
    RiskAssessment(RiskAssessment),
    PortfolioRecommendation(PortfolioRecommendation),
    Error(String),
}

/// Strategy output
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Strategy {
    pub name: String,
    pub description: String,
    pub entry_rules: Vec<TradingRule>,
    pub exit_rules: Vec<TradingRule>,
    pub risk_management: RiskManagementRules,
    pub expected_return: f64,
    pub max_drawdown: f64,
}

/// Trading rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingRule {
    pub condition: String,
    pub action: String,
    pub parameters: HashMap<String, f64>,
}

/// Risk management rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskManagementRules {
    pub stop_loss: f64,
    pub take_profit: f64,
    pub position_sizing: PositionSizing,
    pub max_positions: usize,
}

/// Position sizing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionSizing {
    pub method: SizingMethod,
    pub risk_per_trade: f64,
    pub max_portfolio_risk: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SizingMethod {
    FixedAmount(f64),
    PercentageOfPortfolio(f64),
    KellyCriterion,
    RiskBased(f64),
}

/// Market analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketAnalysis {
    pub symbol: String,
    pub analysis_type: AnalysisType,
    pub signals: Vec<Signal>,
    pub summary: String,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnalysisType {
    Technical,
    Fundamental,
    Sentiment,
    Hybrid,
}

/// Signal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Signal {
    pub signal_type: SignalType,
    pub strength: f64,
    pub description: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SignalType {
    Buy,
    Sell,
    Hold,
    StrongBuy,
    StrongSell,
}

/// Risk assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub overall_risk: RiskScore,
    pub risk_factors: Vec<RiskFactor>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskScore {
    pub score: f64,
    pub level: RiskLevel,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub factor: String,
    pub impact: f64,
    pub description: String,
}

/// Portfolio recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortfolioRecommendation {
    pub current_allocation: HashMap<String, f64>,
    pub recommended_allocation: HashMap<String, f64>,
    pub rebalancing_actions: Vec<RebalancingAction>,
    pub expected_improvement: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RebalancingAction {
    pub action_type: ActionType,
    pub symbol: String,
    pub quantity: f64,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    Buy,
    Sell,
    Hold,
}

/// Agent error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentError {
    pub error_type: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

/// Agent manager for coordinating multiple agents
pub struct AgentManager {
    agents: Arc<RwLock<HashMap<String, Box<dyn Agent + Send + Sync>>>>,
    message_tx: mpsc::Sender<(String, AgentMessage)>,
    message_rx: mpsc::Receiver<(String, AgentResponse)>,
}

impl AgentManager {
    pub fn new() -> Self {
        let (message_tx, message_rx) = mpsc::channel(100);
        Self {
            agents: Arc::new(RwLock::new(HashMap::new())),
            message_tx,
            message_rx,
        }
    }

    pub async fn register_agent(&self, agent_id: String, agent: Box<dyn Agent + Send + Sync>) {
        let mut agents = self.agents.write().await;
        agents.insert(agent_id, agent);
    }

    pub async fn send_message(&self, agent_id: String, message: AgentMessage) -> Result<(), AgentError> {
        self.message_tx
            .send((agent_id, message))
            .await
            .map_err(|e| AgentError {
                error_type: "ChannelError".to_string(),
                message: e.to_string(),
                details: None,
            })
    }

    pub async fn get_agent_status(&self, agent_id: &str) -> Option<AgentStatus> {
        let agents = self.agents.read().await;
        agents.get(agent_id).map(|agent| {
            // This would need to be implemented properly with async
            AgentStatus::Idle
        })
    }
}

/// Google Cloud AI Platform integration with Gemma
pub struct GoogleCloudAIIntegration {
    project_id: String,
    region: String,
    api_key: Option<String>,
    gemma_integration: GemmaIntegration,
}

impl GoogleCloudAIIntegration {
    pub fn new(project_id: String, region: String, api_key: Option<String>) -> Self {
        let gemma_config = GemmaConfig::default();
        let gemma_integration = GemmaIntegration::new(gemma_config.base_url);
        
        Self {
            project_id,
            region,
            api_key,
            gemma_integration,
        }
    }

    pub async fn generate_text(&self, prompt: &str, model: &str) -> Result<String, AgentError> {
        // Use Gemma for text generation
        self.gemma_integration.generate_text(prompt, Some(1024))
            .await
            .map_err(|e| AgentError {
                error_type: "GemmaError".to_string(),
                message: e.to_string(),
                details: None,
            })
    }

    pub async fn analyze_sentiment(&self, text: &str) -> Result<f64, AgentError> {
        // Use Gemma for sentiment analysis
        let sentiment_text = self.gemma_integration.analyze_sentiment(text).await
            .map_err(|e| AgentError {
                error_type: "GemmaError".to_string(),
                message: e.to_string(),
                details: None,
            })?;
        
        // Parse sentiment score from text (simplified)
        if sentiment_text.to_lowercase().contains("positive") {
            Ok(0.8)
        } else if sentiment_text.to_lowercase().contains("negative") {
            Ok(-0.8)
        } else {
            Ok(0.0)
        }
    }

    pub async fn predict_market_movement(&self, data: &MarketData) -> Result<f64, AgentError> {
        // Use Gemma for market prediction
        let analysis_prompt = format!(
            "Analyze this market data and predict price movement (-1 to 1): Symbol: {}, Price: {}, Volume: {}",
            data.symbol, data.price, data.volume
        );
        
        let prediction_text = self.gemma_integration.generate_text(&analysis_prompt, Some(256)).await
            .map_err(|e| AgentError {
                error_type: "GemmaError".to_string(),
                message: e.to_string(),
                details: None,
            })?;
        
        // Parse prediction from text (simplified)
        if prediction_text.to_lowercase().contains("up") || prediction_text.to_lowercase().contains("bullish") {
            Ok(0.5)
        } else if prediction_text.to_lowercase().contains("down") || prediction_text.to_lowercase().contains("bearish") {
            Ok(-0.5)
        } else {
            Ok(0.0)
        }
    }

    pub async fn test_gemma_connection(&self) -> Result<bool, AgentError> {
        self.gemma_integration.test_connection().await
            .map_err(|e| AgentError {
                error_type: "GemmaError".to_string(),
                message: e.to_string(),
                details: None,
            })
    }
}

/// Strategy Generator Agent
pub struct StrategyGeneratorAgent {
    config: AgentConfig,
    ai_integration: GoogleCloudAIIntegration,
    status: AgentStatus,
}

impl StrategyGeneratorAgent {
    pub fn new(config: AgentConfig) -> Self {
        let ai_integration = GoogleCloudAIIntegration::new(
            config.google_cloud_config.project_id.clone(),
            config.google_cloud_config.region.clone(),
            config.google_cloud_config.api_key.clone(),
        );

        Self {
            config,
            ai_integration,
            status: AgentStatus::Idle,
        }
    }
}

#[async_trait::async_trait]
impl Agent for StrategyGeneratorAgent {
    async fn process_message(&mut self, message: AgentMessage) -> Result<AgentResponse, AgentError> {
        self.status = AgentStatus::Running;

        match message {
            AgentMessage::GenerateStrategy { requirements, risk_profile } => {
                let prompt = self.build_strategy_prompt(&requirements, &risk_profile);
                let generated_text = self.ai_integration.generate_text(&prompt, "text-bison").await?;
                
                // Parse the generated text into a strategy
                let strategy = self.parse_strategy_from_text(&generated_text)?;
                
                self.status = AgentStatus::Completed;
                
                Ok(AgentResponse {
                    agent_id: self.config.name.clone(),
                    response_type: AgentResponseType::StrategyGenerated(strategy),
                    data: serde_json::json!({}),
                    confidence: 0.85,
                    timestamp: chrono::Utc::now().timestamp(),
                })
            }
            _ => Err(AgentError {
                error_type: "UnsupportedMessage".to_string(),
                message: "Strategy generator only supports GenerateStrategy messages".to_string(),
                details: None,
            }),
        }
    }

    async fn get_status(&self) -> AgentStatus {
        self.status.clone()
    }

    async fn get_config(&self) -> &AgentConfig {
        &self.config
    }
}

impl StrategyGeneratorAgent {
    fn build_strategy_prompt(&self, requirements: &StrategyRequirements, risk_profile: &RiskProfile) -> String {
        format!(
            "Generate a trading strategy for {} with {} complexity and {} automation level. \
             Risk tolerance: {:?}, Investment horizon: {}, Liquidity needs: {:?}. \
             Provide a complete strategy with entry/exit rules and risk management.",
            requirements.asset_class,
            requirements.strategy_type,
            requirements.complexity,
            risk_profile.risk_tolerance,
            risk_profile.investment_horizon,
            risk_profile.liquidity_needs
        )
    }

    fn parse_strategy_from_text(&self, text: &str) -> Result<Strategy, AgentError> {
        // Implementation to parse generated text into Strategy struct
        // This would use NLP or structured parsing
        Ok(Strategy {
            name: "AI Generated Strategy".to_string(),
            description: text.to_string(),
            entry_rules: vec![],
            exit_rules: vec![],
            risk_management: RiskManagementRules {
                stop_loss: 0.05,
                take_profit: 0.15,
                position_sizing: PositionSizing {
                    method: SizingMethod::RiskBased(0.02),
                    risk_per_trade: 0.02,
                    max_portfolio_risk: 0.10,
                },
                max_positions: 5,
            },
            expected_return: 0.12,
            max_drawdown: 0.08,
        })
    }
}

/// Market Analyzer Agent
pub struct MarketAnalyzerAgent {
    config: AgentConfig,
    ai_integration: GoogleCloudAIIntegration,
    status: AgentStatus,
}

impl MarketAnalyzerAgent {
    pub fn new(config: AgentConfig) -> Self {
        let ai_integration = GoogleCloudAIIntegration::new(
            config.google_cloud_config.project_id.clone(),
            config.google_cloud_config.region.clone(),
            config.google_cloud_config.api_key.clone(),
        );

        Self {
            config,
            ai_integration,
            status: AgentStatus::Idle,
        }
    }
}

#[async_trait::async_trait]
impl Agent for MarketAnalyzerAgent {
    async fn process_message(&mut self, message: AgentMessage) -> Result<AgentResponse, AgentError> {
        self.status = AgentStatus::Running;

        match message {
            AgentMessage::StartAnalysis { market_data, strategy_params } => {
                let analysis = self.analyze_market(&market_data, &strategy_params).await?;
                
                self.status = AgentStatus::Completed;
                
                Ok(AgentResponse {
                    agent_id: self.config.name.clone(),
                    response_type: AgentResponseType::MarketAnalysis(analysis),
                    data: serde_json::json!({}),
                    confidence: 0.80,
                    timestamp: chrono::Utc::now().timestamp(),
                })
            }
            _ => Err(AgentError {
                error_type: "UnsupportedMessage".to_string(),
                message: "Market analyzer only supports StartAnalysis messages".to_string(),
                details: None,
            }),
        }
    }

    async fn get_status(&self) -> AgentStatus {
        self.status.clone()
    }

    async fn get_config(&self) -> &AgentConfig {
        &self.config
    }
}

impl MarketAnalyzerAgent {
    async fn analyze_market(&self, market_data: &MarketData, strategy_params: &StrategyParameters) -> Result<MarketAnalysis, AgentError> {
        // Implement market analysis logic
        let sentiment = self.ai_integration.analyze_sentiment("Market analysis text").await?;
        let prediction = self.ai_integration.predict_market_movement(market_data).await?;

        Ok(MarketAnalysis {
            symbol: market_data.symbol.clone(),
            analysis_type: AnalysisType::Hybrid,
            signals: vec![
                Signal {
                    signal_type: if prediction > 0.1 { SignalType::Buy } else if prediction < -0.1 { SignalType::Sell } else { SignalType::Hold },
                    strength: prediction.abs(),
                    description: "AI-generated market signal".to_string(),
                    timestamp: chrono::Utc::now().timestamp(),
                }
            ],
            summary: format!("Market analysis for {}: Sentiment {:.2}, Prediction {:.2}", market_data.symbol, sentiment, prediction),
            confidence: 0.80,
        })
    }
}

/// Risk Manager Agent
pub struct RiskManagerAgent {
    config: AgentConfig,
    status: AgentStatus,
}

impl RiskManagerAgent {
    pub fn new(config: AgentConfig) -> Self {
        Self {
            config,
            status: AgentStatus::Idle,
        }
    }
}

#[async_trait::async_trait]
impl Agent for RiskManagerAgent {
    async fn process_message(&mut self, message: AgentMessage) -> Result<AgentResponse, AgentError> {
        self.status = AgentStatus::Running;

        match message {
            AgentMessage::AnalyzeRisk { position, market_conditions } => {
                let risk_assessment = self.assess_risk(&position, &market_conditions).await?;
                
                self.status = AgentStatus::Completed;
                
                Ok(AgentResponse {
                    agent_id: self.config.name.clone(),
                    response_type: AgentResponseType::RiskAssessment(risk_assessment),
                    data: serde_json::json!({}),
                    confidence: 0.90,
                    timestamp: chrono::Utc::now().timestamp(),
                })
            }
            _ => Err(AgentError {
                error_type: "UnsupportedMessage".to_string(),
                message: "Risk manager only supports AnalyzeRisk messages".to_string(),
                details: None,
            }),
        }
    }

    async fn get_status(&self) -> AgentStatus {
        self.status.clone()
    }

    async fn get_config(&self) -> &AgentConfig {
        &self.config
    }
}

impl RiskManagerAgent {
    async fn assess_risk(&self, position: &Position, market_conditions: &MarketConditions) -> Result<RiskAssessment, AgentError> {
        // Implement risk assessment logic
        let risk_score = self.calculate_risk_score(position, market_conditions);
        
        Ok(RiskAssessment {
            overall_risk: RiskScore {
                score: risk_score,
                level: if risk_score < 0.3 { RiskLevel::Low } else if risk_score < 0.6 { RiskLevel::Medium } else { RiskLevel::High },
                description: "AI-calculated risk assessment".to_string(),
            },
            risk_factors: vec![
                RiskFactor {
                    factor: "Market Volatility".to_string(),
                    impact: market_conditions.volatility,
                    description: "Current market volatility level".to_string(),
                }
            ],
            recommendations: vec![
                "Consider reducing position size".to_string(),
                "Implement stop-loss orders".to_string(),
            ],
        })
    }

    fn calculate_risk_score(&self, position: &Position, market_conditions: &MarketConditions) -> f64 {
        // Simple risk calculation
        let position_risk = position.current_value / 10000.0; // Normalize by portfolio size
        let volatility_risk = market_conditions.volatility;
        
        (position_risk + volatility_risk) / 2.0
    }
}

/// Portfolio Optimizer Agent
pub struct PortfolioOptimizerAgent {
    config: AgentConfig,
    status: AgentStatus,
}

impl PortfolioOptimizerAgent {
    pub fn new(config: AgentConfig) -> Self {
        Self {
            config,
            status: AgentStatus::Idle,
        }
    }
}

#[async_trait::async_trait]
impl Agent for PortfolioOptimizerAgent {
    async fn process_message(&mut self, message: AgentMessage) -> Result<AgentResponse, AgentError> {
        self.status = AgentStatus::Running;

        match message {
            AgentMessage::OptimizePortfolio { current_portfolio, constraints } => {
                let recommendation = self.optimize_portfolio(&current_portfolio, &constraints).await?;
                
                self.status = AgentStatus::Completed;
                
                Ok(AgentResponse {
                    agent_id: self.config.name.clone(),
                    response_type: AgentResponseType::PortfolioRecommendation(recommendation),
                    data: serde_json::json!({}),
                    confidence: 0.85,
                    timestamp: chrono::Utc::now().timestamp(),
                })
            }
            _ => Err(AgentError {
                error_type: "UnsupportedMessage".to_string(),
                message: "Portfolio optimizer only supports OptimizePortfolio messages".to_string(),
                details: None,
            }),
        }
    }

    async fn get_status(&self) -> AgentStatus {
        self.status.clone()
    }

    async fn get_config(&self) -> &AgentConfig {
        &self.config
    }
}

impl PortfolioOptimizerAgent {
    async fn optimize_portfolio(&self, portfolio: &Portfolio, constraints: &PortfolioConstraints) -> Result<PortfolioRecommendation, AgentError> {
        // Implement portfolio optimization logic
        let current_allocation = self.calculate_allocation(portfolio);
        let recommended_allocation = self.generate_recommendations(&current_allocation, constraints);
        let rebalancing_actions = self.calculate_rebalancing_actions(portfolio, &recommended_allocation);

        Ok(PortfolioRecommendation {
            current_allocation,
            recommended_allocation,
            rebalancing_actions,
            expected_improvement: 0.05, // 5% expected improvement
        })
    }

    fn calculate_allocation(&self, portfolio: &Portfolio) -> HashMap<String, f64> {
        let mut allocation = HashMap::new();
        let total_value = portfolio.total_value;

        for position in &portfolio.positions {
            let percentage = position.current_value / total_value;
            allocation.insert(position.symbol.clone(), percentage);
        }

        allocation
    }

    fn generate_recommendations(&self, current: &HashMap<String, f64>, constraints: &PortfolioConstraints) -> HashMap<String, f64> {
        // Simple optimization - equal weight allocation
        let num_positions = current.len().max(1);
        let equal_weight = 1.0 / num_positions as f64;

        let mut recommended = HashMap::new();
        for (symbol, _) in current {
            recommended.insert(symbol.clone(), equal_weight.min(constraints.max_position_size));
        }

        recommended
    }

    fn calculate_rebalancing_actions(&self, portfolio: &Portfolio, target_allocation: &HashMap<String, f64>) -> Vec<RebalancingAction> {
        let mut actions = Vec::new();
        let total_value = portfolio.total_value;

        for (symbol, target_percentage) in target_allocation {
            let current_position = portfolio.positions.iter().find(|p| &p.symbol == symbol);
            let current_value = current_position.map(|p| p.current_value).unwrap_or(0.0);
            let target_value = total_value * target_percentage;

            if (target_value - current_value).abs() > total_value * 0.01 { // 1% threshold
                let action = if target_value > current_value {
                    RebalancingAction {
                        action_type: ActionType::Buy,
                        symbol: symbol.clone(),
                        quantity: (target_value - current_value) / portfolio.positions.iter().find(|p| &p.symbol == symbol).map(|p| p.average_price).unwrap_or(1.0),
                        reason: "Rebalancing to target allocation".to_string(),
                    }
                } else {
                    RebalancingAction {
                        action_type: ActionType::Sell,
                        symbol: symbol.clone(),
                        quantity: (current_value - target_value) / portfolio.positions.iter().find(|p| &p.symbol == symbol).map(|p| p.average_price).unwrap_or(1.0),
                        reason: "Rebalancing to target allocation".to_string(),
                    }
                };
                actions.push(action);
            }
        }

        actions
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_strategy_generator_agent() {
        let config = AgentConfig {
            agent_type: AgentType::StrategyGenerator,
            name: "test_strategy_generator".to_string(),
            description: "Test strategy generator".to_string(),
            parameters: HashMap::new(),
            google_cloud_config: GoogleCloudConfig {
                project_id: "test-project".to_string(),
                region: "us-central1".to_string(),
                model_name: "text-bison".to_string(),
                api_key: None,
            },
        };

        let mut agent = StrategyGeneratorAgent::new(config);
        let requirements = StrategyRequirements {
            asset_class: "crypto".to_string(),
            strategy_type: "momentum".to_string(),
            complexity: ComplexityLevel::Moderate,
            automation_level: AutomationLevel::SemiAutomated,
        };

        let risk_profile = RiskProfile {
            risk_tolerance: RiskTolerance::Moderate,
            investment_horizon: "1 year".to_string(),
            liquidity_needs: LiquidityNeeds::Medium,
        };

        let message = AgentMessage::GenerateStrategy { requirements, risk_profile };
        let response = agent.process_message(message).await;

        assert!(response.is_ok());
    }

    #[tokio::test]
    async fn test_agent_manager() {
        let manager = AgentManager::new();
        
        let config = AgentConfig {
            agent_type: AgentType::StrategyGenerator,
            name: "test_agent".to_string(),
            description: "Test agent".to_string(),
            parameters: HashMap::new(),
            google_cloud_config: GoogleCloudConfig {
                project_id: "test-project".to_string(),
                region: "us-central1".to_string(),
                model_name: "text-bison".to_string(),
                api_key: None,
            },
        };

        let agent = Box::new(StrategyGeneratorAgent::new(config));
        manager.register_agent("test_agent".to_string(), agent).await;

        let status = manager.get_agent_status("test_agent").await;
        assert!(status.is_some());
    }
} 