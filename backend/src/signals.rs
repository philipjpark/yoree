// Signal service for Yoree Signal Markets
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use uuid::Uuid;

// Mock database for MVP (will be replaced with PostgreSQL)
pub type SignalStore = Arc<RwLock<HashMap<String, Signal>>>;
pub type MarketStore = Arc<RwLock<HashMap<String, SignalMarket>>>;
pub type PerformanceStore = Arc<RwLock<Vec<SignalPerformanceHistory>>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Signal {
    pub id: String,
    pub underlying_asset: String,
    pub hypothesis: String,
    pub data_bindings: Vec<DataBinding>,
    pub strategy: Option<StrategyLogic>,
    pub score: SignalIndex,
    pub quality: f64,
    pub creator: SignalCreator,
    pub instances: Vec<SignalInstance>,
    pub status: SignalStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataBinding {
    pub feed_id: String,
    pub feed_name: String,
    pub feed_type: String,
    pub binding_config: BindingConfig,
    pub last_update: Option<DateTime<Utc>>,
    pub current_value: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BindingConfig {
    pub normalization: String,
    pub weight: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategyLogic {
    pub id: Option<String>,
    pub name: Option<String>,
    pub entry_conditions: Option<Vec<String>>,
    pub exit_conditions: Option<Vec<String>>,
    pub risk_management: Option<RiskManagement>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskManagement {
    pub stop_loss: Option<f64>,
    pub take_profit: Option<f64>,
    pub position_size: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignalIndex {
    pub accuracy: f64,
    pub performance: f64,
    pub consensus: f64,
    pub composite: f64,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignalCreator {
    pub r#type: String, // "human" or "agent"
    pub id: String,
    pub name: Option<String>,
    pub is_agent_announced: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignalInstance {
    pub id: String,
    pub signal_id: String,
    pub version_number: u32,
    pub score_snapshot: SignalIndex,
    pub quality_snapshot: f64,
    pub data_snapshot: DataSnapshot,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSnapshot {
    pub feed1_value: Option<serde_json::Value>,
    pub feed2_value: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SignalStatus {
    Active,
    Deprecated,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignalMarket {
    pub signal_id: String,
    pub pricing_model: String,
    pub current_price: f64,
    pub total_volume: f64,
    pub buy_volume: f64,
    pub sell_volume: f64,
    pub total_shares: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignalPerformanceHistory {
    pub signal_id: String,
    pub timestamp: DateTime<Utc>,
    pub score: SignalIndex,
    pub quality: f64,
    pub accuracy: f64,
    pub performance: f64,
    pub consensus: f64,
    pub feed1_value: Option<serde_json::Value>,
    pub feed2_value: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoringWeights {
    pub accuracy: f64,
    pub performance: f64,
    pub consensus: f64,
    pub composite: f64,
}

impl Default for ScoringWeights {
    fn default() -> Self {
        ScoringWeights {
            accuracy: 0.25,
            performance: 0.35,
            consensus: 0.20,
            composite: 0.20,
        }
    }
}

pub struct SignalService {
    signals: SignalStore,
    markets: MarketStore,
    performance: PerformanceStore,
    scoring_weights: Arc<RwLock<HashMap<String, ScoringWeights>>>,
}

impl SignalService {
    pub fn new() -> Self {
        SignalService {
            signals: Arc::new(RwLock::new(HashMap::new())),
            markets: Arc::new(RwLock::new(HashMap::new())),
            performance: Arc::new(RwLock::new(Vec::new())),
            scoring_weights: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn create_signal(
        &self,
        underlying_asset: String,
        hypothesis: String,
        feed1_id: String,
        feed2_id: String,
        creator: SignalCreator,
        strategy: Option<StrategyLogic>,
        weights: Option<ScoringWeights>,
    ) -> Result<Signal, String> {
        // Validate agent announcement
        if creator.r#type == "agent" && !creator.is_agent_announced {
            return Err("Agents must announce they are agents".to_string());
        }

        // Validate exactly 2 feeds
        if feed1_id == feed2_id {
            return Err("Must bind to 2 different feeds".to_string());
        }

        let signal_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        // Create initial score (will be updated by scoring engine)
        let initial_score = SignalIndex {
            accuracy: 50.0,
            performance: 50.0,
            consensus: 0.0,
            composite: 50.0,
            last_updated: now,
        };

        let signal = Signal {
            id: signal_id.clone(),
            underlying_asset,
            hypothesis,
            data_bindings: vec![
                DataBinding {
                    feed_id: feed1_id.clone(),
                    feed_name: format!("Feed {}", feed1_id),
                    feed_type: "unknown".to_string(),
                    binding_config: BindingConfig {
                        normalization: "standard".to_string(),
                        weight: 0.5,
                    },
                    last_update: None,
                    current_value: None,
                },
                DataBinding {
                    feed_id: feed2_id.clone(),
                    feed_name: format!("Feed {}", feed2_id),
                    feed_type: "unknown".to_string(),
                    binding_config: BindingConfig {
                        normalization: "standard".to_string(),
                        weight: 0.5,
                    },
                    last_update: None,
                    current_value: None,
                },
            ],
            strategy,
            score: initial_score.clone(),
            quality: 50.0, // Initial quality
            creator,
            instances: Vec::new(),
            status: SignalStatus::Active,
            created_at: now,
            updated_at: now,
        };

        // Store signal
        self.signals.write().await.insert(signal_id.clone(), signal.clone());

        // Store scoring weights if provided
        if let Some(w) = weights {
            self.scoring_weights.write().await.insert(signal_id.clone(), w);
        } else {
            self.scoring_weights.write().await.insert(signal_id.clone(), ScoringWeights::default());
        }

        // Create initial market with bonding curve
        let market = SignalMarket {
            signal_id: signal_id.clone(),
            pricing_model: "bonding_curve".to_string(),
            current_price: 0.10, // Initial price
            total_volume: 0.0,
            buy_volume: 0.0,
            sell_volume: 0.0,
            total_shares: 0.0,
            created_at: now,
        };
        self.markets.write().await.insert(signal_id, market);

        Ok(signal)
    }

    pub async fn get_signal(&self, signal_id: &str) -> Option<Signal> {
        self.signals.read().await.get(signal_id).cloned()
    }

    pub async fn list_signals(&self) -> Vec<Signal> {
        self.signals.read().await.values().cloned().collect()
    }

    pub async fn update_signal_score(
        &self,
        signal_id: &str,
        new_score: SignalIndex,
        quality: f64,
    ) -> Result<(), String> {
        let mut signals = self.signals.write().await;
        
        if let Some(signal) = signals.get_mut(signal_id) {
            // Create instance snapshot before update
            let instance = SignalInstance {
                id: Uuid::new_v4().to_string(),
                signal_id: signal_id.to_string(),
                version_number: signal.instances.len() as u32 + 1,
                score_snapshot: signal.score.clone(),
                quality_snapshot: signal.quality,
                data_snapshot: DataSnapshot {
                    feed1_value: signal.data_bindings.get(0).and_then(|b| b.current_value.clone()),
                    feed2_value: signal.data_bindings.get(1).and_then(|b| b.current_value.clone()),
                },
                created_at: Utc::now(),
            };

            signal.instances.push(instance);
            signal.score = new_score;
            signal.quality = quality;
            signal.updated_at = Utc::now();

            // Store performance history
            let perf = SignalPerformanceHistory {
                signal_id: signal_id.to_string(),
                timestamp: Utc::now(),
                score: new_score.clone(),
                quality,
                accuracy: new_score.accuracy,
                performance: new_score.performance,
                consensus: new_score.consensus,
                feed1_value: signal.data_bindings.get(0).and_then(|b| b.current_value.clone()),
                feed2_value: signal.data_bindings.get(1).and_then(|b| b.current_value.clone()),
            };
            self.performance.write().await.push(perf);

            Ok(())
        } else {
            Err("Signal not found".to_string())
        }
    }

    pub async fn get_market(&self, signal_id: &str) -> Option<SignalMarket> {
        self.markets.read().await.get(signal_id).cloned()
    }

    pub async fn get_performance_history(&self, signal_id: &str) -> Vec<SignalPerformanceHistory> {
        self.performance
            .read()
            .await
            .iter()
            .filter(|p| p.signal_id == signal_id)
            .cloned()
            .collect()
    }

    pub async fn calculate_composite_score(
        &self,
        signal_id: &str,
        accuracy: f64,
        performance: f64,
        consensus: f64,
    ) -> f64 {
        let weights = self.scoring_weights
            .read()
            .await
            .get(signal_id)
            .cloned()
            .unwrap_or_default();

        weights.accuracy * accuracy
            + weights.performance * performance
            + weights.consensus * consensus
            + weights.composite * ((accuracy + performance + consensus) / 3.0)
    }
}
