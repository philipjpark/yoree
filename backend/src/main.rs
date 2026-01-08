use axum::{
    routing::{get, post},
    Router,
    Json,
    extract::{State, Path},
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
mod signals;
mod minam;
mod syuzhet;

use blockchain::BNBChainService;
use trading::TradingService;
use ai_strategies::AIStrategyService;
use database::DatabaseService;
use signals::{SignalService, Signal, SignalIndex, SignalCreator, StrategyLogic, ScoringWeights};
use minam::{MinamService, MinamFeed};
use syuzhet::{SyuzhetService, ThesisResponse};

#[derive(Clone)]
struct AppState {
    bnb_service: Arc<BNBChainService>,
    trading_service: Arc<TradingService>,
    ai_service: Arc<AIStrategyService>,
    db: Arc<DatabaseService>,
    signal_service: Arc<SignalService>,
    minam_service: Arc<MinamService>,
    syuzhet_service: Arc<SyuzhetService>,
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

#[derive(Deserialize)]
struct CreateSignalRequest {
    underlying_asset: String,
    hypothesis: Option<String>,
    raw_input: Option<String>,
    feed1_id: String,
    feed2_id: String,
    creator: SignalCreator,
    strategy: Option<StrategyLogic>,
    scoring_weights: Option<ScoringWeights>,
}

#[derive(Serialize)]
struct CreateSignalResponse {
    success: bool,
    signal: Option<Signal>,
    error: Option<String>,
}

#[derive(Deserialize)]
struct UpdateScoreRequest {
    accuracy: f64,
    performance: f64,
    consensus: f64,
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

// Signal Markets API Endpoints
async fn create_signal(
    State(state): State<AppState>,
    Json(request): Json<CreateSignalRequest>,
) -> Result<Json<CreateSignalResponse>, StatusCode> {
    info!("Creating signal for asset: {}", request.underlying_asset);

    // If raw_input provided but no hypothesis, generate thesis using Syuzhet
    let hypothesis = if let Some(hyp) = request.hypothesis {
        hyp
    } else if let Some(raw) = request.raw_input {
        match state.syuzhet_service.generate_thesis(
            syuzhet::ThesisRequest {
                raw_input: raw.clone(),
                corpus_summary: Some(raw),
                user_notes: None,
                preferences: None,
            }
        ).await {
            Ok(thesis) => thesis.hypothesis,
            Err(e) => {
                error!("Failed to generate thesis: {}", e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }
    } else {
        return Err(StatusCode::BAD_REQUEST);
    };

    match state.signal_service.create_signal(
        request.underlying_asset,
        hypothesis,
        request.feed1_id,
        request.feed2_id,
        request.creator,
        request.strategy,
        request.scoring_weights,
    ).await {
        Ok(signal) => Ok(Json(CreateSignalResponse {
            success: true,
            signal: Some(signal),
            error: None,
        })),
        Err(e) => {
            error!("Signal creation failed: {}", e);
            Ok(Json(CreateSignalResponse {
                success: false,
                signal: None,
                error: Some(e),
            }))
        }
    }
}

async fn list_signals(
    State(state): State<AppState>,
) -> Json<Vec<Signal>> {
    let signals = state.signal_service.list_signals().await;
    Json(signals)
}

async fn get_signal(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Signal>, StatusCode> {
    match state.signal_service.get_signal(&id).await {
        Some(signal) => Ok(Json(signal)),
        None => Err(StatusCode::NOT_FOUND),
    }
}

async fn update_signal_score(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(request): Json<UpdateScoreRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let composite = state.signal_service.calculate_composite_score(
        &id,
        request.accuracy,
        request.performance,
        request.consensus,
    ).await;

    // Calculate quality (1-day profit gain confidence)
    let quality = (request.performance * 0.4 + request.accuracy * 0.3 + request.consensus * 0.3).min(100.0);

    let new_score = SignalIndex {
        accuracy: request.accuracy,
        performance: request.performance,
        consensus: request.consensus,
        composite,
        last_updated: chrono::Utc::now(),
    };

    match state.signal_service.update_signal_score(&id, new_score, quality).await {
        Ok(_) => Ok(Json(serde_json::json!({
            "success": true,
            "message": "Score updated"
        }))),
        Err(e) => {
            error!("Failed to update score: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_signal_performance(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Json<serde_json::Value> {
    let history = state.signal_service.get_performance_history(&id).await;
    Json(serde_json::json!(history))
}

async fn get_signal_market(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    match state.signal_service.get_market(&id).await {
        Some(market) => Ok(Json(serde_json::json!(market))),
        None => Err(StatusCode::NOT_FOUND),
    }
}

// Minam API Endpoints
async fn list_minam_feeds(
    State(state): State<AppState>,
) -> Result<Json<Vec<MinamFeed>>, StatusCode> {
    match state.minam_service.list_feeds().await {
        Ok(feeds) => Ok(Json(feeds)),
        Err(e) => {
            error!("Failed to list Minam feeds: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_minam_feed(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<MinamFeed>, StatusCode> {
    match state.minam_service.get_feed(&id).await {
        Ok(Some(feed)) => Ok(Json(feed)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            error!("Failed to get Minam feed: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_minam_feed_data(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    match state.minam_service.get_feed_data(&id).await {
        Ok(data) => Ok(Json(data)),
        Err(e) => {
            error!("Failed to get feed data: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// Syuzhet API Endpoints
async fn generate_thesis(
    State(state): State<AppState>,
    Json(request): Json<syuzhet::ThesisRequest>,
) -> Result<Json<ThesisResponse>, StatusCode> {
    match state.syuzhet_service.generate_thesis(request).await {
        Ok(thesis) => Ok(Json(thesis)),
        Err(e) => {
            error!("Failed to generate thesis: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    info!("🚀 Starting YOREE Rust Backend with Signal Markets...");
    
    // Load configuration
    dotenv::dotenv().ok();
    let config = config::Config::from_env()?;
    
    // Initialize services
    let bnb_service = Arc::new(BNBChainService::new(&config).await?);
    let trading_service = Arc::new(TradingService::new(Arc::clone(&bnb_service)).await?);
    let ai_service = Arc::new(AIStrategyService::new().await?);
    let db = Arc::new(DatabaseService::new(&config.database.url).await?);
    let signal_service = Arc::new(SignalService::new());
    let minam_service = Arc::new(MinamService::new());
    let syuzhet_service = Arc::new(SyuzhetService::new());
    
    let state = AppState {
        bnb_service,
        trading_service,
        ai_service,
        db,
        signal_service,
        minam_service,
        syuzhet_service,
    };
    
    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/balances", post(get_balances))
        .route("/api/swap", post(execute_swap))
        .route("/api/strategy", post(create_strategy))
        .route("/api/ai-signals", get(get_ai_signals))
        .route("/api/gemma", post(gemma_proxy::proxy_gemma))
        // Signal Markets API
        .route("/api/signals", post(create_signal))
        .route("/api/signals", get(list_signals))
        .route("/api/signals/:id", get(get_signal))
        .route("/api/signals/:id/score", post(update_signal_score))
        .route("/api/signals/:id/performance", get(get_signal_performance))
        .route("/api/signals/:id/market", get(get_signal_market))
        // Minam API
        .route("/api/minam/feeds", get(list_minam_feeds))
        .route("/api/minam/feeds/:id", get(get_minam_feed))
        .route("/api/minam/feeds/:id/data", get(get_minam_feed_data))
        // Syuzhet API
        .route("/api/thesis/generate", post(generate_thesis))
        .with_state(state);
    
    // Start server
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001").await?;
    info!("🌐 Server running on http://127.0.0.1:3001");
    
    axum::serve(listener, app).await?;
    
    Ok(())
}
