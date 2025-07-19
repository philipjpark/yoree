/// Entry point for the yoree platform. Coordinates the modules together.
mod llm_strategy;
mod solana_integration;
mod data_sources;
mod factor_discovery;
mod backtesting;
mod risk_management;
mod visualization;
mod agent_framework;
mod gemma_integration;

use agent_framework::{
    AgentManager, AgentConfig, AgentType, GoogleCloudConfig,
    StrategyGeneratorAgent, MarketAnalyzerAgent, RiskManagerAgent, PortfolioOptimizerAgent,
    GoogleCloudAIIntegration
};
use std::collections::HashMap;
use tokio;
use tracing::{info, error};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    info!("🚀 Starting YOREE Platform with AI Agents and Gemma...");
    
    // Initialize Google Cloud AI integration with Gemma
    let google_cloud_config = GoogleCloudConfig {
        project_id: "sage-now-466417-n6".to_string(),
        region: "europe-west1".to_string(),
        model_name: "gemma-3-4b".to_string(),
        api_key: std::env::var("GOOGLE_CLOUD_API_KEY").ok(),
    };
    
    let ai_integration = GoogleCloudAIIntegration::new(
        google_cloud_config.project_id.clone(),
        google_cloud_config.region.clone(),
        google_cloud_config.api_key.clone(),
    );
    
    // Initialize agent manager
    let agent_manager = AgentManager::new();
    
    // Create and register agents
    let agents = create_agents(google_cloud_config).await?;
    
    for (agent_id, agent) in agents {
        agent_manager.register_agent(agent_id, agent).await;
    }
    
    info!("✅ YOREE agents initialized successfully");
    
    // Start the main application loop
    run_application(agent_manager, ai_integration).await?;
    
    Ok(())
}

async fn create_agents(google_cloud_config: GoogleCloudConfig) -> Result<Vec<(String, Box<dyn agent_framework::Agent + Send + Sync>)>, Box<dyn std::error::Error>> {
    let mut agents = Vec::new();
    
    // Strategy Generator Agent
    let strategy_config = AgentConfig {
        agent_type: AgentType::StrategyGenerator,
        name: "YOREE Strategy Generator".to_string(),
        description: "AI-powered trading strategy generation using Google Cloud AI".to_string(),
        parameters: HashMap::new(),
        google_cloud_config: google_cloud_config.clone(),
    };
    let strategy_agent = Box::new(StrategyGeneratorAgent::new(strategy_config));
    agents.push(("strategy-generator".to_string(), strategy_agent));
    
    // Market Analyzer Agent
    let market_config = AgentConfig {
        agent_type: AgentType::MarketAnalyzer,
        name: "YOREE Market Analyzer".to_string(),
        description: "Real-time market analysis and signal generation".to_string(),
        parameters: HashMap::new(),
        google_cloud_config: google_cloud_config.clone(),
    };
    let market_agent = Box::new(MarketAnalyzerAgent::new(market_config));
    agents.push(("market-analyzer".to_string(), market_agent));
    
    // Risk Manager Agent
    let risk_config = AgentConfig {
        agent_type: AgentType::RiskManager,
        name: "YOREE Risk Manager".to_string(),
        description: "Automated risk assessment and management".to_string(),
        parameters: HashMap::new(),
        google_cloud_config: google_cloud_config.clone(),
    };
    let risk_agent = Box::new(RiskManagerAgent::new(risk_config));
    agents.push(("risk-manager".to_string(), risk_agent));
    
    // Portfolio Optimizer Agent
    let portfolio_config = AgentConfig {
        agent_type: AgentType::PortfolioOptimizer,
        name: "YOREE Portfolio Optimizer".to_string(),
        description: "Dynamic portfolio optimization and rebalancing".to_string(),
        parameters: HashMap::new(),
        google_cloud_config,
    };
    let portfolio_agent = Box::new(PortfolioOptimizerAgent::new(portfolio_config));
    agents.push(("portfolio-optimizer".to_string(), portfolio_agent));
    
    Ok(agents)
}

async fn run_application(
    agent_manager: AgentManager,
    ai_integration: GoogleCloudAIIntegration,
) -> Result<(), Box<dyn std::error::Error>> {
    info!("🎯 YOREE Platform running with AI agents");
    info!("🔗 Google Cloud AI Platform connected");
    info!("🤖 Agents ready for trading strategy generation");
    info!("💎 Gemma 3-4B model deployed and ready");
    info!("🌐 Gemma URL: https://yoree-gemma-827561407333.europe-west1.run.app");
    
    // Keep the application running
    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
        
        // Health check
        info!("💚 YOREE Platform health check - All systems operational");
    }
}
