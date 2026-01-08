// Minam service integration - uses actual Minam API structure
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

// Minam API Product structure (matches actual Minam models)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MinamApiProduct {
    pub id: Uuid,
    pub name: String,
    pub pricing: String,
    pub provider_id: Uuid,
    pub dataset_id: Uuid,
    pub model_profile_id: Uuid,
    pub version: String,
    pub status: String,
    pub human_approval_note: String,
}

// Minam Feed wrapper (maps Minam API to Signal Feed)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MinamFeed {
    pub id: String, // API ID as string
    pub api_id: Uuid, // Original API ID
    pub name: String,
    pub r#type: String, // Inferred from dataset/model or explicit
    pub description: String,
    pub provider: String,
    pub data_format: String,
    pub update_frequency: String,
    pub is_active: bool,
    pub pricing: String,
}

// Query request for Minam API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MinamQueryRequest {
    pub symbol: Option<String>,
    pub start: Option<chrono::DateTime<chrono::Utc>>,
    pub end: Option<chrono::DateTime<chrono::Utc>>,
    pub limit: Option<usize>,
}

pub struct MinamService {
    base_url: String,
    client: reqwest::Client,
    // Cache for API products
    apis_cache: Arc<RwLock<Vec<MinamApiProduct>>>,
}

impl MinamService {
    pub fn new() -> Self {
        // Default to local Minam API, can be overridden via env
        let base_url = std::env::var("MINAM_API_URL")
            .unwrap_or_else(|_| "http://localhost:8787".to_string());
        
        MinamService {
            base_url,
            client: reqwest::Client::new(),
            apis_cache: Arc::new(RwLock::new(Vec::new())),
        }
    }

    /// List all available Minam API products (these become "feeds" for signals)
    pub async fn list_feeds(&self) -> Result<Vec<MinamFeed>, String> {
        // Fetch APIs from Minam
        let apis = self.list_apis().await?;
        
        // Convert APIs to Feeds
        let feeds: Vec<MinamFeed> = apis
            .iter()
            .filter(|api| api.status == "live") // Only active APIs
            .map(|api| {
                // Infer feed type from API name/description
                let feed_type = self.infer_feed_type(&api.name, &api.pricing);
                
                MinamFeed {
                    id: api.id.to_string(),
                    api_id: api.id,
                    name: api.name.clone(),
                    r#type: feed_type,
                    description: format!("Minam API: {}", api.name),
                    provider: "Minam".to_string(),
                    data_format: "json".to_string(),
                    update_frequency: "realtime".to_string(), // Default, can be enhanced
                    is_active: api.status == "live",
                    pricing: api.pricing.clone(),
                }
            })
            .collect();
        
        // Cache APIs
        self.apis_cache.write().await.clear();
        self.apis_cache.write().await.extend(apis);
        
        Ok(feeds)
    }

    /// Get a specific feed by ID
    pub async fn get_feed(&self, feed_id: &str) -> Option<MinamFeed> {
        let feeds = self.list_feeds().await.ok()?;
        feeds.into_iter().find(|f| f.id == feed_id)
    }

    /// Query Minam API for data (this is how signals get their data)
    pub async fn query_api(
        &self,
        api_id: &str,
        query: MinamQueryRequest,
    ) -> Result<Vec<serde_json::Value>, String> {
        let url = format!("{}/v1/data/{}/query", self.base_url, api_id);
        
        let response = self
            .client
            .post(&url)
            .json(&query)
            .send()
            .await
            .map_err(|e| format!("Failed to query Minam API: {}", e))?;
        
        if !response.status().is_success() {
            return Err(format!("Minam API returned error: {}", response.status()));
        }
        
        let data: Vec<serde_json::Value> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Minam API response: {}", e))?;
        
        Ok(data)
    }

    /// Get feed data (wrapper around query_api with default params)
    pub async fn get_feed_data(
        &self,
        feed_id: &str,
    ) -> Result<serde_json::Value, String> {
        let query = MinamQueryRequest {
            symbol: None,
            start: None,
            end: None,
            limit: Some(1), // Get latest data point
        };
        
        let data = self.query_api(feed_id, query).await?;
        
        // Return the first data point, or empty object if no data
        Ok(data.into_iter().next().unwrap_or(serde_json::json!({})))
    }

    /// Internal: List APIs from Minam
    async fn list_apis(&self) -> Result<Vec<MinamApiProduct>, String> {
        let url = format!("{}/api/apis", self.base_url);
        
        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch Minam APIs: {}", e))?;
        
        if !response.status().is_success() {
            // If Minam API is not available, return empty list (graceful degradation)
            if response.status() == reqwest::StatusCode::NOT_FOUND {
                return Ok(Vec::new());
            }
            return Err(format!("Minam API returned error: {}", response.status()));
        }
        
        let apis: Vec<MinamApiProduct> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Minam API response: {}", e))?;
        
        Ok(apis)
    }

    /// Infer feed type from API name and pricing
    fn infer_feed_type(&self, name: &str, _pricing: &str) -> String {
        let name_lower = name.to_lowercase();
        
        if name_lower.contains("price") || name_lower.contains("eth") || name_lower.contains("btc") {
            "price".to_string()
        } else if name_lower.contains("sentiment") || name_lower.contains("social") {
            "sentiment".to_string()
        } else if name_lower.contains("onchain") || name_lower.contains("on-chain") || name_lower.contains("blockchain") {
            "onchain_metrics".to_string()
        } else if name_lower.contains("volume") || name_lower.contains("trading") {
            "volume".to_string()
        } else if name_lower.contains("news") || name_lower.contains("article") {
            "news".to_string()
        } else {
            "other".to_string()
        }
    }
}
