use axum::{
    routing::{get, post},
    Router,
    Json,
    extract::{State, Path, Query},
    http::{Method, StatusCode},
};
use tower_http::cors::{Any, CorsLayer};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex, OnceLock};
use std::time::{Duration, Instant};

use tracing::{info, error, warn};

mod blockchain;
mod trading;
mod ai_strategies;
mod database;
mod config;
mod gemma_proxy;
mod signals;
mod minam;
mod syuzhet;
mod nimble;
mod markets;

use blockchain::BNBChainService;
use trading::TradingService;
use ai_strategies::AIStrategyService;
use database::DatabaseService;
use signals::{SignalService, Signal, SignalIndex, SignalCreator, StrategyLogic, ScoringWeights};
use minam::{MinamService, MinamFeed};
use syuzhet::{SyuzhetService, ThesisResponse};
use nimble::{NimbleService, CorroborateRequest, CorroborateResponse};
use markets::{EnrichMarketsRequest, EnrichMarketsResponse, enrich_market_quotes};

#[derive(Clone)]
struct AppState {
    bnb_service: Arc<BNBChainService>,
    trading_service: Arc<TradingService>,
    ai_service: Arc<AIStrategyService>,
    db: Arc<DatabaseService>,
    signal_service: Arc<SignalService>,
    minam_service: Arc<MinamService>,
    syuzhet_service: Arc<SyuzhetService>,
    nimble_service: Arc<NimbleService>,
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

#[derive(Deserialize)]
struct XCorpusQuery {
    handle: String,
}

#[derive(Serialize)]
struct XCorpusResponse {
    corpus: String,
    sourceCount: usize,
    /// True only when corpus was fetched from the X API (not an error placeholder).
    live: bool,
    /// True when X_BEARER_TOKEN is set to a real value on the server.
    tokenConfigured: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

#[derive(Serialize)]
struct XStatusResponse {
    tokenConfigured: bool,
}

fn x_corpus_live(corpus: String, source_count: usize) -> XCorpusResponse {
    XCorpusResponse {
        live: source_count > 0 && !corpus.trim().is_empty(),
        tokenConfigured: true,
        message: None,
        corpus,
        sourceCount: source_count,
    }
}

fn x_corpus_error(message: impl Into<String>, token_configured: bool) -> XCorpusResponse {
    XCorpusResponse {
        corpus: String::new(),
        sourceCount: 0,
        live: false,
        tokenConfigured: token_configured,
        message: Some(message.into()),
    }
}

async fn get_x_status() -> Json<XStatusResponse> {
    Json(XStatusResponse {
        tokenConfigured: x_bearer_token_configured().is_some(),
    })
}

#[derive(Deserialize)]
struct XUser {
    id: String,
    username: String,
}

#[derive(Deserialize)]
struct XUsersResponse {
    data: Option<Vec<XUser>>,
}

#[derive(Deserialize)]
struct XUserLookupResponse {
    data: Option<XUser>,
}

#[derive(Deserialize)]
struct XTweet {
    text: String,
}

#[derive(Deserialize)]
struct XTweetsResponse {
    data: Option<Vec<XTweet>>,
}

#[derive(Deserialize)]
struct RedditListing {
    data: RedditListingData,
}

#[derive(Deserialize)]
struct RedditListingData {
    children: Vec<RedditChild>,
}

#[derive(Deserialize)]
struct RedditChild {
    data: RedditPostData,
}

#[derive(Deserialize)]
struct RedditPostData {
    subreddit: String,
    title: String,
    selftext: String,
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
        Some(feed) => Ok(Json(feed)),
        None => Err(StatusCode::NOT_FOUND),
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

fn x_bearer_token_configured() -> Option<String> {
    let token = std::env::var("X_BEARER_TOKEN")
        .or_else(|_| std::env::var("X_API_BEARER_TOKEN"))
        .ok()?
        .trim()
        .to_string();
    if token.is_empty()
        || token == "your_x_bearer_token_here"
        || token == "paste_your_x_bearer_token_here"
    {
        return None;
    }
    Some(token)
}

struct XGraphBudget {
    max_followers: u32,
    max_following: u32,
    max_accounts: usize,
    tweets_per_account: usize,
    max_lines: usize,
}

impl XGraphBudget {
    fn from_env() -> Self {
        Self {
            max_followers: env_u32("X_GRAPH_MAX_FOLLOWERS", 5).clamp(1, 100),
            max_following: env_u32("X_GRAPH_MAX_FOLLOWING", 5).clamp(1, 100),
            max_accounts: env_usize("X_GRAPH_MAX_ACCOUNTS", 5).clamp(1, 20),
            tweets_per_account: env_usize("X_GRAPH_TWEETS_PER_ACCOUNT", 1).clamp(1, 5),
            max_lines: env_usize("X_GRAPH_MAX_LINES", 5).clamp(3, 80),
        }
    }
}

fn x_graph_cache_ttl() -> Duration {
    let secs = env_u64("X_GRAPH_CACHE_SECONDS", 3600).clamp(60, 86_400);
    Duration::from_secs(secs)
}

fn env_u32(key: &str, default: u32) -> u32 {
    std::env::var(key)
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(default)
}

fn env_usize(key: &str, default: usize) -> usize {
    std::env::var(key)
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(default)
}

fn env_u64(key: &str, default: u64) -> u64 {
    std::env::var(key)
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(default)
}

struct XCorpusCacheEntry {
    corpus: String,
    source_count: usize,
    stored_at: Instant,
}

fn x_corpus_cache() -> &'static Mutex<HashMap<String, XCorpusCacheEntry>> {
    static CACHE: OnceLock<Mutex<HashMap<String, XCorpusCacheEntry>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

fn get_cached_x_corpus(handle: &str) -> Option<(String, usize)> {
    let ttl = x_graph_cache_ttl();
    let cache = x_corpus_cache().lock().ok()?;
    let entry = cache.get(handle)?;
    if entry.stored_at.elapsed() > ttl {
        return None;
    }
    Some((entry.corpus.clone(), entry.source_count))
}

fn set_cached_x_corpus(handle: &str, corpus: String, source_count: usize) {
    if let Ok(mut cache) = x_corpus_cache().lock() {
        cache.insert(
            handle.to_string(),
            XCorpusCacheEntry {
                corpus,
                source_count,
                stored_at: Instant::now(),
            },
        );
    }
}

async fn get_x_corpus(
    Query(query): Query<XCorpusQuery>,
) -> Json<XCorpusResponse> {
    let handle = query.handle.trim().trim_start_matches('@').to_string();
    if handle.is_empty() {
        return Json(x_corpus_error("No handle provided.", false));
    }

    if let Some((corpus, source_count)) = get_cached_x_corpus(&handle) {
        info!("X corpus cache hit for @{} ({} sources)", handle, source_count);
        return Json(x_corpus_live(corpus, source_count));
    }

    let Some(token) = x_bearer_token_configured() else {
        return Json(x_corpus_error(
            format!(
                "Set X_BEARER_TOKEN in backend/.env (replace paste_your_x_bearer_token_here) to load live data for @{}.",
                handle
            ),
            false,
        ));
    };

    let budget = XGraphBudget::from_env();
    match fetch_x_graph_corpus(&handle, &token, &budget).await {
        Ok((corpus, source_count)) => {
            set_cached_x_corpus(&handle, corpus.clone(), source_count);
            info!(
                "X corpus fetched for @{} — {} sources, {} lines (budget: {} accounts, cache {}s)",
                handle,
                source_count,
                corpus.lines().count(),
                budget.max_accounts,
                x_graph_cache_ttl().as_secs()
            );
            Json(x_corpus_live(corpus, source_count))
        }
        Err(e) => {
            error!("Failed to fetch X corpus: {}", e);
            Json(x_corpus_error(
                format!(
                    "Unable to fetch live X graph for @{}. Check token, scopes, and API tier. {}",
                    handle, e
                ),
                true,
            ))
        }
    }
}

async fn get_reddit_corpus() -> Json<XCorpusResponse> {
    match fetch_reddit_public_corpus().await {
        Ok((corpus, source_count)) => Json(x_corpus_live(corpus, source_count)),
        Err(e) => {
            error!("Failed to fetch Reddit corpus: {}", e);
            Json(x_corpus_error(
                format!("Unable to fetch Reddit corpus from public subreddits. {}", e),
                false,
            ))
        }
    }
}

async fn web_corroborate(
    State(_state): State<AppState>,
    Json(req): Json<CorroborateRequest>,
) -> Result<Json<CorroborateResponse>, StatusCode> {
    if req.corpus.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }
    let response = _state.nimble_service.corroborate(req).await;
    Ok(Json(response))
}

async fn enrich_markets(
    Json(req): Json<EnrichMarketsRequest>,
) -> Result<Json<EnrichMarketsResponse>, StatusCode> {
    if req.assets.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }
    Ok(Json(enrich_market_quotes(req).await))
}

async fn fetch_reddit_public_corpus() -> Result<(String, usize), String> {
    let client = reqwest::Client::new();
    let subreddits = [
        "CryptoCurrency",
        "Bitcoin",
        "stocks",
        "investing",
        "wallstreetbets",
        "PredictionMarkets",
        "sportsbook",
    ];

    let mut corpus_lines: Vec<String> = Vec::new();
    let mut source_count = 0usize;

    for sub in subreddits {
        let url = format!("https://www.reddit.com/r/{}/hot.json?limit=8", sub);
        let resp = client
            .get(&url)
            .header("User-Agent", "greed-signal-ingestion/1.0")
            .send()
            .await
            .map_err(|e| format!("reddit request failed for r/{}: {}", sub, e))?;

        if !resp.status().is_success() {
            continue;
        }

        let listing: RedditListing = match resp.json().await {
            Ok(v) => v,
            Err(_) => continue,
        };

        let mut added_for_sub = 0usize;
        for child in listing.data.children.into_iter().take(6) {
            let title = child.data.title.trim();
            if title.is_empty() {
                continue;
            }
            let body = child.data.selftext.replace('\n', " ").trim().to_string();
            if body.is_empty() {
                corpus_lines.push(format!("r/{}: {}", child.data.subreddit, title));
            } else {
                corpus_lines.push(format!("r/{}: {} | {}", child.data.subreddit, title, body));
            }
            added_for_sub += 1;
        }
        if added_for_sub > 0 {
            source_count += 1;
        }
    }

    if corpus_lines.is_empty() {
        return Err("no public subreddit posts available".to_string());
    }

    Ok((corpus_lines.join("\n"), source_count))
}

async fn fetch_x_graph_corpus(
    handle: &str,
    bearer_token: &str,
    budget: &XGraphBudget,
) -> Result<(String, usize), String> {
    let client = reqwest::Client::new();
    let auth = format!("Bearer {}", bearer_token);

    warn!(
        "X live fetch for @{} — up to {} API calls (1 lookup + followers + following + up to {} tweet pulls)",
        handle,
        3 + budget.max_accounts,
        budget.max_accounts
    );

    let lookup_url = format!(
        "https://api.x.com/2/users/by/username/{}?user.fields=username",
        handle
    );
    let lookup = client
        .get(&lookup_url)
        .header("Authorization", &auth)
        .send()
        .await
        .map_err(|e| format!("user lookup request failed: {}", e))?;
    if !lookup.status().is_success() {
        return Err(format!("user lookup failed with status {}", lookup.status()));
    }
    let lookup_json: XUserLookupResponse = lookup
        .json()
        .await
        .map_err(|e| format!("user lookup parse failed: {}", e))?;
    let Some(user) = lookup_json.data else {
        return Err("user not found".to_string());
    };

    let followers_url = format!(
        "https://api.x.com/2/users/{}/followers?max_results={}&user.fields=username",
        user.id, budget.max_followers
    );
    let following_url = format!(
        "https://api.x.com/2/users/{}/following?max_results={}&user.fields=username",
        user.id, budget.max_following
    );

    let followers_resp = client
        .get(&followers_url)
        .header("Authorization", &auth)
        .send()
        .await
        .map_err(|e| format!("followers request failed: {}", e))?;
    if !followers_resp.status().is_success() {
        return Err(format!("followers request failed with status {}", followers_resp.status()));
    }
    let followers_json: XUsersResponse = followers_resp
        .json()
        .await
        .map_err(|e| format!("followers parse failed: {}", e))?;

    let following_resp = client
        .get(&following_url)
        .header("Authorization", &auth)
        .send()
        .await
        .map_err(|e| format!("following request failed: {}", e))?;
    if !following_resp.status().is_success() {
        return Err(format!("following request failed with status {}", following_resp.status()));
    }
    let following_json: XUsersResponse = following_resp
        .json()
        .await
        .map_err(|e| format!("following parse failed: {}", e))?;

    let mut unique_users: Vec<XUser> = Vec::new();
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    for u in followers_json
        .data
        .unwrap_or_default()
        .into_iter()
        .chain(following_json.data.unwrap_or_default())
    {
        if seen.insert(u.id.clone()) {
            unique_users.push(u);
        }
    }

    let mut corpus_lines: Vec<String> = Vec::new();
    let mut source_count = 0usize;
    let tweet_max_results = budget.tweets_per_account.max(5) as u32;

    for account in unique_users.into_iter().take(budget.max_accounts) {
        let tweets_url = format!(
            "https://api.x.com/2/users/{}/tweets?max_results={}&exclude=retweets,replies&tweet.fields=created_at",
            account.id, tweet_max_results
        );
        let tweets_resp = client
            .get(&tweets_url)
            .header("Authorization", &auth)
            .send()
            .await
            .map_err(|e| format!("tweets request failed for {}: {}", account.username, e))?;
        if !tweets_resp.status().is_success() {
            continue;
        }
        let tweets_json: XTweetsResponse = match tweets_resp.json().await {
            Ok(v) => v,
            Err(_) => continue,
        };
        let tweets = tweets_json.data.unwrap_or_default();
        if tweets.is_empty() {
            continue;
        }

        source_count += 1;
        for t in tweets.into_iter().take(budget.tweets_per_account) {
            let clean = t.text.replace('\n', " ").trim().to_string();
            if !clean.is_empty() {
                corpus_lines.push(format!("@{}: {}", account.username, clean));
            }
        }
        if corpus_lines.len() >= budget.max_lines {
            break;
        }
    }

    if corpus_lines.is_empty() {
        return Err("no accessible tweets found from followers/following".to_string());
    }

    corpus_lines.truncate(budget.max_lines);
    Ok((corpus_lines.join("\n"), source_count))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    info!("🚀 Starting YOREE Rust Backend with Signal Markets...");
    
    // Load configuration (.env in cwd or backend/.env when run from repo root)
    dotenv::dotenv().ok();
    let _ = dotenv::from_filename("backend/.env");
    let config = config::Config::from_env()?;
    
    // Initialize services
    let bnb_service = Arc::new(BNBChainService::new(&config).await?);
    let trading_service = Arc::new(TradingService::new(Arc::clone(&bnb_service)).await?);
    let ai_service = Arc::new(AIStrategyService::new().await?);
    let db = Arc::new(DatabaseService::new(&config.database.url).await?);
    let signal_service = Arc::new(SignalService::new());
    let minam_service = Arc::new(MinamService::new());
    let syuzhet_service = Arc::new(SyuzhetService::new());
    let nimble_service = Arc::new(NimbleService::new());
    
    let state = AppState {
        bnb_service,
        trading_service,
        ai_service,
        db,
        signal_service,
        minam_service,
        syuzhet_service,
        nimble_service,
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
        // Social ingestion API
        .route("/api/social/x/status", get(get_x_status))
        .route("/api/social/x/corpus", get(get_x_corpus))
        .route("/api/social/reddit/corpus", get(get_reddit_corpus))
        // Web corroboration (Nimble + SEC)
        .route("/api/web/corroborate", post(web_corroborate))
        .route("/api/markets/enrich", post(enrich_markets))
        // Syuzhet API
        .route("/api/thesis/generate", post(generate_thesis))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([
                    Method::GET,
                    Method::POST,
                    Method::PUT,
                    Method::PATCH,
                    Method::DELETE,
                    Method::OPTIONS,
                ])
                .allow_headers(Any),
        )
        .with_state(state);
    
    // Start server
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001").await?;
    info!("🌐 Server running on http://127.0.0.1:3001");
    
    axum::serve(listener, app).await?;
    
    Ok(())
}
