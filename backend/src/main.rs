use axum::{
    routing::{get, post},
    Router,
    Json,
    extract::State,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use tracing::{info, error};

mod blockchain;
mod trading;
mod ai_strategies;
mod database;
mod config;
mod gemma_proxy;

use blockchain::BNBChainService;
use trading::TradingService;
use ai_strategies::AIStrategyService;
use database::DatabaseService;

#[derive(Clone)]
struct AppState {
    bnb_service: Arc<BNBChainService>,
    trading_service: Arc<TradingService>,
    ai_service: Arc<AIStrategyService>,
    db: Arc<DatabaseService>,
}

#[derive(Deserialize)]
struct SwapRequest {
    from_token: String,
    to_token: String,
    amount: String,
    wallet_address: String,
}

#[derive(Serialize)]
struct SwapResponse {
    success: bool,
    transaction_hash: Option<String>,
    new_balances: Option<Balances>,
    error: Option<String>,
}

#[derive(Serialize)]
struct Balances {
    pyusd: String,
    tbnb: String,
    bnb: String,
}

#[derive(Deserialize)]
struct StrategyRequest {
    name: String,
    description: String,
    target_token: String,
    stop_loss: f64,
    take_profit: f64,
    position_size: f64,
    wallet_address: String,
}

#[derive(Serialize)]
struct StrategyResponse {
    success: bool,
    strategy_id: Option<u64>,
    error: Option<String>,
}

async fn health_check() -> StatusCode {
    StatusCode::OK
}

async fn get_balances(
    State(state): State<AppState>,
    Json(request): Json<SwapRequest>,
) -> Json<Balances> {
    info!("Getting balances for wallet: {}", request.wallet_address);
    
    match state.bnb_service.get_all_balances(&request.wallet_address).await {
        Ok(balances) => Json(Balances {
            pyusd: balances.pyusd,
            tbnb: balances.tbnb,
            bnb: balances.bnb,
        }),
        Err(e) => {
            error!("Failed to get balances: {}", e);
            Json(Balances {
                pyusd: "0.00".to_string(),
                tbnb: "0.00".to_string(),
                bnb: "0.00".to_string(),
            })
        }
    }
}

async fn execute_swap(
    State(state): State<AppState>,
    Json(request): Json<SwapRequest>,
) -> Json<SwapResponse> {
    info!("Executing swap: {} {} → {}", request.amount, request.from_token, request.to_token);
    
    match state.trading_service.execute_swap(
        &request.from_token,
        &request.to_token,
        &request.amount,
        &request.wallet_address,
    ).await {
        Ok(result) => Json(SwapResponse {
            success: true,
            transaction_hash: Some(result.transaction_hash),
            new_balances: Some(Balances {
                pyusd: result.new_balances.pyusd,
                tbnb: result.new_balances.tbnb,
                bnb: result.new_balances.bnb,
            }),
            error: None,
        }),
        Err(e) => {
            error!("Swap failed: {}", e);
            Json(SwapResponse {
                success: false,
                transaction_hash: None,
                new_balances: None,
                error: Some(e.to_string()),
            })
        }
    }
}

async fn create_strategy(
    State(state): State<AppState>,
    Json(request): Json<StrategyRequest>,
) -> Json<StrategyResponse> {
    info!("Creating strategy: {}", request.name);
    
    match state.ai_service.create_strategy(
        &request.name,
        &request.description,
        &request.target_token,
        request.stop_loss,
        request.take_profit,
        request.position_size,
        &request.wallet_address,
    ).await {
        Ok(strategy_id) => Json(StrategyResponse {
            success: true,
            strategy_id: Some(strategy_id),
            error: None,
        }),
        Err(e) => {
            error!("Strategy creation failed: {}", e);
            Json(StrategyResponse {
                success: false,
                strategy_id: None,
                error: Some(e.to_string()),
            })
        }
    }
}

async fn get_ai_signals(
    State(state): State<AppState>,
) -> Json<serde_json::Value> {
    info!("Getting AI trading signals");
    
    match state.ai_service.get_trading_signals().await {
        Ok(signals) => Json(signals),
        Err(e) => {
            error!("Failed to get AI signals: {}", e);
            Json(serde_json::json!({
                "error": e.to_string()
            }))
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    info!("🚀 Starting YOREE Rust Backend...");
    
    // Load configuration
    dotenv::dotenv().ok();
    let config = config::Config::from_env()?;
    
    // Initialize services
    let bnb_service = Arc::new(BNBChainService::new(&config).await?);
    let trading_service = Arc::new(TradingService::new(Arc::clone(&bnb_service)).await?);
    let ai_service = Arc::new(AIStrategyService::new().await?);
    let db = Arc::new(DatabaseService::new(&config.database_url).await?);
    
    let state = AppState {
        bnb_service,
        trading_service,
        ai_service,
        db,
    };
    
    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/balances", post(get_balances))
        .route("/api/swap", post(execute_swap))
        .route("/api/strategy", post(create_strategy))
        .route("/api/ai-signals", get(get_ai_signals))
        .route("/api/gemma", post(gemma_proxy::proxy_gemma))
        .with_state(state);
    
    // Start server
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001").await?;
    info!("🌐 Server running on http://127.0.0.1:3001");
    
    axum::serve(listener, app).await?;
    
    Ok(())
} 