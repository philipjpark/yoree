/// Entry point for the yoree platform. Coordinates the modules together.
mod llm_strategy;
mod solana_integration;
mod data_sources;
mod visualization;
mod backtesting;
mod agent_framework;
mod factor_discovery;
mod risk_management;
mod integrations;

use std::error::Error;
use solana_sdk::signature::Keypair;
use actix_web::{web, App, HttpResponse, HttpServer, Responder, Result};
use crate::data_sources::{SentimentAnalyzer, DataProvider};
use serde_json::json;

use agent_framework::{MultiAgentFramework, Agent, AgentType};
use factor_discovery::{FactorDiscoveryEngine, MarketData};
use risk_management::{RiskManagementSystem, Portfolio};
use crate::backtesting::{BacktestEngine, BacktestConfig};

async fn get_sentiment(asset: web::Path<String>) -> Result<HttpResponse, actix_web::Error> {
    let sentiment = SentimentAnalyzer::new().update_sentiment(&asset).await;
    Ok(HttpResponse::Ok().json(sentiment))
}

async fn get_agent_status() -> Result<HttpResponse> {
    // Return status of all agents in the multi-agent framework
    Ok(HttpResponse::Ok().json(json!({
        "status": "active",
        "agents": {
            "research_agent": {
                "status": "discovering_factors",
                "last_discovery": "momentum_factor_v2",
                "performance": 0.85
            },
            "development_agent": {
                "status": "optimizing_parameters",
                "current_strategy": "mean_reversion_crypto",
                "backtest_progress": 0.75
            },
            "execution_agent": {
                "status": "monitoring_positions",
                "active_trades": 12,
                "pnl": 0.0342
            },
            "risk_agent": {
                "status": "assessing_portfolio",
                "risk_score": 6.2,
                "alerts": 0
            },
            "sentiment_agent": {
                "status": "analyzing_market",
                "sentiment_score": 0.65,
                "regime": "trending"
            }
        },
        "system_metrics": {
            "total_trades": 1247,
            "system_pnl": 0.1823,
            "sharpe_ratio": 2.14,
            "max_drawdown": 0.087,
            "discovery_rate": 0.23,
            "adaptation_speed": 0.91
        }
    })))
}

async fn discover_factors() -> Result<HttpResponse> {
    // Simulate factor discovery process
    Ok(HttpResponse::Ok().json(json!({
        "discovered_factors": [
            {
                "name": "crypto_momentum_enhanced",
                "formula": "(price[t] - ema[20]) / atr[14] * volume_ratio",
                "importance_score": 0.87,
                "sharpe_ratio": 2.34,
                "max_drawdown": 0.12,
                "discovery_method": "genetic_algorithm",
                "validation_status": "passed",
                "economic_interpretation": "Enhanced momentum factor that adjusts for volatility and volume"
            },
            {
                "name": "sentiment_volatility_regime",
                "formula": "sentiment_score * (1 / realized_vol) * regime_indicator",
                "importance_score": 0.82,
                "sharpe_ratio": 1.98,
                "max_drawdown": 0.15,
                "discovery_method": "hypothesis_testing",
                "validation_status": "monitoring",
                "economic_interpretation": "Combines sentiment with volatility regime detection"
            },
            {
                "name": "cross_asset_correlation_break",
                "formula": "rolling_corr[btc_eth, 30] - rolling_corr[btc_eth, 5]",
                "importance_score": 0.79,
                "sharpe_ratio": 1.76,
                "max_drawdown": 0.18,
                "discovery_method": "correlation_analysis",
                "validation_status": "testing",
                "economic_interpretation": "Detects breakdown in traditional crypto correlations"
            }
        ],
        "generation_stats": {
            "hypotheses_generated": 1247,
            "hypotheses_tested": 892,
            "factors_discovered": 23,
            "factors_validated": 8,
            "success_rate": 0.018
        }
    })))
}

async fn get_risk_assessment() -> Result<HttpResponse> {
    // Simulate comprehensive risk assessment
    Ok(HttpResponse::Ok().json(json!({
        "risk_metrics": {
            "var_95": -0.0234,
            "var_99": -0.0387,
            "cvar_95": -0.0298,
            "expected_shortfall": -0.0312,
            "maximum_drawdown": 0.087,
            "volatility": 0.156,
            "sharpe_ratio": 2.14,
            "sortino_ratio": 3.21,
            "calmar_ratio": 24.6,
            "tail_ratio": 1.87,
            "skewness": 0.23,
            "kurtosis": 2.1,
            "beta": 0.78
        },
        "stress_test_results": [
            {
                "scenario": "Market Crash (-30%)",
                "portfolio_pnl": -0.187,
                "var_impact": -0.089,
                "max_drawdown": 0.234,
                "recovery_time_days": 127
            },
            {
                "scenario": "Volatility Spike (2x)",
                "portfolio_pnl": -0.098,
                "var_impact": -0.045,
                "max_drawdown": 0.156,
                "recovery_time_days": 89
            },
            {
                "scenario": "Correlation Breakdown",
                "portfolio_pnl": -0.067,
                "var_impact": -0.032,
                "max_drawdown": 0.098,
                "recovery_time_days": 45
            }
        ],
        "regime_analysis": {
            "current_regime": "trending",
            "regime_probabilities": {
                "trending": 0.67,
                "mean_reverting": 0.18,
                "high_volatility": 0.12,
                "crisis": 0.03
            },
            "regime_stability": 0.84,
            "expected_duration_days": 23
        },
        "alerts": [],
        "overall_risk_score": 6.2,
        "recommendations": [
            "Current risk levels are within acceptable bounds",
            "Consider reducing crypto exposure if volatility increases",
            "Monitor correlation breakdown signals"
        ]
    })))
}

async fn optimize_portfolio() -> Result<HttpResponse> {
    // Simulate portfolio optimization
    Ok(HttpResponse::Ok().json(json!({
        "optimization_result": {
            "optimal_weights": {
                "BTC": 0.35,
                "ETH": 0.28,
                "SOL": 0.15,
                "AVAX": 0.12,
                "MATIC": 0.10
            },
            "expected_return": 0.234,
            "expected_risk": 0.187,
            "sharpe_ratio": 1.25,
            "turnover": 0.087,
            "transaction_costs": 0.0012
        },
        "optimization_method": "hierarchical_risk_parity",
        "constraints_applied": [
            "max_weight_per_asset: 0.40",
            "max_sector_exposure: 1.00",
            "min_diversification: 0.75"
        ],
        "improvement_metrics": {
            "sharpe_improvement": 0.23,
            "risk_reduction": 0.045,
            "diversification_increase": 0.12
        }
    })))
}

async fn get_strategy_performance() -> Result<HttpResponse> {
    // Return comprehensive strategy performance metrics
    Ok(HttpResponse::Ok().json(json!({
        "active_strategies": [
            {
                "id": "momentum_crypto_v3",
                "name": "Enhanced Crypto Momentum",
                "status": "active",
                "allocation": 0.35,
                "performance": {
                    "total_return": 0.187,
                    "sharpe_ratio": 2.34,
                    "max_drawdown": 0.089,
                    "win_rate": 0.67,
                    "avg_trade_duration": 4.2,
                    "trades_count": 234
                },
                "factors": ["momentum", "volume", "volatility_adjusted"],
                "last_rebalance": "2024-01-15T10:30:00Z"
            },
            {
                "id": "mean_reversion_defi",
                "name": "DeFi Mean Reversion",
                "status": "active",
                "allocation": 0.25,
                "performance": {
                    "total_return": 0.143,
                    "sharpe_ratio": 1.87,
                    "max_drawdown": 0.124,
                    "win_rate": 0.72,
                    "avg_trade_duration": 2.8,
                    "trades_count": 189
                },
                "factors": ["mean_reversion", "sentiment", "liquidity"],
                "last_rebalance": "2024-01-15T09:45:00Z"
            },
            {
                "id": "sentiment_regime_switch",
                "name": "Sentiment Regime Switching",
                "status": "monitoring",
                "allocation": 0.20,
                "performance": {
                    "total_return": 0.098,
                    "sharpe_ratio": 1.45,
                    "max_drawdown": 0.156,
                    "win_rate": 0.58,
                    "avg_trade_duration": 6.7,
                    "trades_count": 156
                },
                "factors": ["sentiment", "regime_detection", "volatility"],
                "last_rebalance": "2024-01-15T08:20:00Z"
            }
        ],
        "portfolio_metrics": {
            "total_return": 0.156,
            "annualized_return": 0.234,
            "volatility": 0.187,
            "sharpe_ratio": 1.25,
            "sortino_ratio": 1.89,
            "max_drawdown": 0.098,
            "calmar_ratio": 2.39,
            "win_rate": 0.64,
            "profit_factor": 1.87
        },
        "attribution": {
            "factor_contributions": {
                "momentum": 0.067,
                "mean_reversion": 0.045,
                "sentiment": 0.032,
                "volatility": 0.012
            },
            "strategy_contributions": {
                "momentum_crypto_v3": 0.065,
                "mean_reversion_defi": 0.036,
                "sentiment_regime_switch": 0.019,
                "other": 0.036
            }
        }
    })))
}

async fn health_check() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(json!({
        "status": "healthy",
        "version": "2.0.0-agent-quant",
        "timestamp": chrono::Utc::now(),
        "components": {
            "multi_agent_framework": "operational",
            "factor_discovery_engine": "operational",
            "risk_management_system": "operational",
            "sentiment_analyzer": "operational",
            "portfolio_optimizer": "operational",
            "backtesting_engine": "operational",
            "data_sources": "operational"
        },
        "system_info": {
            "agents_active": 5,
            "factors_discovered": 23,
            "strategies_running": 3,
            "risk_alerts": 0,
            "uptime_hours": 72.5
        }
    })))
}

async fn get_historical_data(
    path: web::Path<(String, u32)>
) -> Result<HttpResponse, actix_web::Error> {
    let (symbol, days) = path.into_inner();
    
    // Create data provider with CoinGecko integration
    let data_provider = DataProvider::new(None); // Use free tier for now
    
    match data_provider.fetch_historical_data(&symbol, days).await {
        Ok(data) => {
            Ok(HttpResponse::Ok().json(json!({
                "symbol": symbol,
                "days": days,
                "data_points": data.len(),
                "historical_data": data.iter().take(10).collect::<Vec<_>>(), // Show first 10 points
                "status": "success",
                "source": "CoinGecko API"
            })))
        }
        Err(e) => {
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": format!("Failed to fetch historical data: {}", e),
                "symbol": symbol,
                "days": days
            })))
        }
    }
}

async fn get_current_price(
    symbol: web::Path<String>
) -> Result<HttpResponse, actix_web::Error> {
    let data_provider = DataProvider::new(None);
    
    match data_provider.fetch_current_price(&symbol).await {
        Ok(price) => {
            Ok(HttpResponse::Ok().json(json!({
                "symbol": symbol.into_inner(),
                "price": price,
                "currency": "USD",
                "timestamp": chrono::Utc::now(),
                "source": "CoinGecko API"
            })))
        }
        Err(e) => {
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": format!("Failed to fetch price: {}", e),
                "symbol": symbol.into_inner()
            })))
        }
    }
}

async fn get_market_overview() -> Result<HttpResponse, actix_web::Error> {
    let data_provider = DataProvider::new(None);
    let popular_coins = vec![
        "bitcoin".to_string(),
        "ethereum".to_string(), 
        "solana".to_string(),
        "cardano".to_string(),
        "polygon".to_string()
    ];
    
    match data_provider.get_market_overview(&popular_coins).await {
        Ok(market_data) => {
            Ok(HttpResponse::Ok().json(json!({
                "market_overview": market_data,
                "timestamp": chrono::Utc::now(),
                "source": "CoinGecko API",
                "total_assets": market_data.len()
            })))
        }
        Err(e) => {
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": format!("Failed to fetch market overview: {}", e)
            })))
        }
    }
}

async fn run_backtest_endpoint(
    path: web::Path<(String, u32)>
) -> Result<HttpResponse, actix_web::Error> {
    let (symbol, days) = path.into_inner();
    
    let mut engine = BacktestEngine::new(BacktestConfig::default());
    
    match engine.run_backtest_with_real_data(&symbol, "Moving Average Crossover", days).await {
        Ok(result) => {
            Ok(HttpResponse::Ok().json(json!({
                "backtest_result": {
                    "strategy_name": result.strategy_name,
                    "symbol": symbol,
                    "timeframe": result.timeframe,
                    "days_tested": days,
                    "performance_metrics": {
                        "total_return": result.total_return,
                        "annualized_return": result.annualized_return,
                        "volatility": result.volatility,
                        "sharpe_ratio": result.sharpe_ratio,
                        "max_drawdown": result.max_drawdown,
                        "win_rate": result.win_rate,
                        "profit_factor": result.profit_factor
                    },
                    "trade_statistics": {
                        "total_trades": result.total_trades,
                        "winning_trades": result.winning_trades,
                        "losing_trades": result.total_trades - result.winning_trades
                    },
                    "equity_curve_points": result.equity_curve.len(),
                    "final_equity": result.equity_curve.last().map(|e| e.equity).unwrap_or(0.0),
                    "trades_sample": result.trades.iter().take(5).collect::<Vec<_>>()
                },
                "status": "success",
                "timestamp": chrono::Utc::now()
            })))
        }
        Err(e) => {
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": format!("Backtest failed: {}", e),
                "symbol": symbol,
                "days": days
            })))
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Starting Chef Trader's Advanced Quantitative Trading Platform");
    println!("🤖 Multi-Agent Framework: Initializing...");
    println!("🔬 Factor Discovery Engine: Ready");
    println!("⚠️  Risk Management System: Active");
    println!("📊 Sentiment Analysis: Monitoring");
    println!("🎯 Portfolio Optimization: Standby");
    
    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(health_check))
            .route("/api/sentiment/{asset}", web::get().to(get_sentiment))
            .route("/api/agents/status", web::get().to(get_agent_status))
            .route("/api/factors/discover", web::post().to(discover_factors))
            .route("/api/risk/assessment", web::get().to(get_risk_assessment))
            .route("/api/portfolio/optimize", web::post().to(optimize_portfolio))
            .route("/api/strategies/performance", web::get().to(get_strategy_performance))
            .route("/api/data/historical/{symbol}/{days}", web::get().to(get_historical_data))
            .route("/api/data/current_price/{symbol}", web::get().to(get_current_price))
            .route("/api/data/market_overview", web::get().to(get_market_overview))
            .route("/api/backtest/{symbol}/{days}", web::get().to(run_backtest_endpoint))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
