// Syuzhet service integration - uses actual Syuzhet prediction generation
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

// Matches Syuzhet's GeneratedPrediction structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedPrediction {
    pub title: String,
    pub thesis: String,
    pub time_horizon: String,
    pub event_type: String, // "binary" | "range" | "multi"
    pub suggested_probability: f64, // 0-1
    pub reasoning_bullets: Vec<String>,
    pub parameters: PredictionParameters,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionParameters {
    pub expiry_timestamp: i64, // Unix timestamp in seconds
    pub initial_yes_price: f64, // 0-1
    pub initial_liquidity_usdc: f64,
}

// Request structure matching Syuzhet's API
#[derive(Debug, Clone, Deserialize)]
pub struct ThesisRequest {
    pub raw_input: String,
    pub corpus_summary: Option<String>,
    pub user_notes: Option<String>,
    pub preferences: Option<serde_json::Value>,
}

// Response structure
#[derive(Debug, Clone, Serialize)]
pub struct ThesisResponse {
    pub hypothesis: String, // Extracted from thesis field
    pub probability: f64,
    pub parameters: ThesisParameters,
    pub generated_by: String,
    pub full_prediction: Option<GeneratedPrediction>, // Full prediction if available
}

#[derive(Debug, Clone, Serialize)]
pub struct ThesisParameters {
    pub timeframe: Option<String>,
    pub target_price: Option<f64>,
    pub confidence: Option<f64>,
    pub reasoning: Option<String>,
}

pub struct SyuzhetService {
    openai_api_key: Arc<RwLock<Option<String>>>,
    syuzhet_api_url: String,
    client: reqwest::Client,
}

impl SyuzhetService {
    pub fn new() -> Self {
        let api_key = std::env::var("OPENAI_API_KEY").ok();
        let syuzhet_url = std::env::var("SYUZHET_API_URL")
            .unwrap_or_else(|_| "http://localhost:3000".to_string());
        
        SyuzhetService {
            openai_api_key: Arc::new(RwLock::new(api_key)),
            syuzhet_api_url: syuzhet_url,
            client: reqwest::Client::new(),
        }
    }

    /// Generate thesis using Syuzhet's actual prediction generation
    /// This can either call Syuzhet API or use OpenAI directly (matching Syuzhet's logic)
    pub async fn generate_thesis(&self, request: ThesisRequest) -> Result<ThesisResponse, String> {
        // Try to use Syuzhet API first (if available)
        if let Ok(response) = self.call_syuzhet_api(&request).await {
            return Ok(response);
        }
        
        // Fallback to direct OpenAI call (matching Syuzhet's implementation)
        let api_key = self.openai_api_key.read().await.clone();
        
        if let Some(key) = api_key {
            self.generate_with_openai(&request, &key).await
        } else {
            Err("OpenAI API key not configured".to_string())
        }
    }

    /// Call Syuzhet API endpoint
    async fn call_syuzhet_api(&self, request: &ThesisRequest) -> Result<ThesisResponse, String> {
        let url = format!("{}/api/predictions", self.syuzhet_api_url);
        
        let body = serde_json::json!({
            "corpusSummary": request.raw_input.clone(),
            "userNotes": request.user_notes.clone(),
            "preferences": request.preferences.clone(),
        });
        
        let response = self
            .client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Failed to call Syuzhet API: {}", e))?;
        
        if !response.status().is_success() {
            return Err(format!("Syuzhet API returned error: {}", response.status()));
        }
        
        let result: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Syuzhet response: {}", e))?;
        
        // Parse Syuzhet's GeneratedPrediction format
        let prediction: GeneratedPrediction = serde_json::from_value(
            result.get("prediction")
                .ok_or("No prediction in response")?
                .clone()
        ).map_err(|e| format!("Failed to parse prediction: {}", e))?;
        
        Ok(ThesisResponse {
            hypothesis: prediction.thesis.clone(),
            probability: prediction.suggested_probability * 100.0, // Convert to percentage
            parameters: ThesisParameters {
                timeframe: Some(prediction.time_horizon.clone()),
                target_price: Some(prediction.parameters.initial_yes_price),
                confidence: Some(prediction.suggested_probability),
                reasoning: Some(prediction.reasoning_bullets.join("; ")),
            },
            generated_by: "ai".to_string(),
            full_prediction: Some(prediction),
        })
    }

    /// Generate prediction directly using OpenAI (matching Syuzhet's logic)
    async fn generate_with_openai(
        &self,
        request: &ThesisRequest,
        api_key: &str,
    ) -> Result<ThesisResponse, String> {
        // Use GPT-4o-mini like Syuzhet does
        let model = "gpt-4o-mini";
        
        // Build prompt similar to Syuzhet's SYSTEM_PROMPT_PREDICTION
        let system_prompt = r#"You are SYUZHET, an advanced AI agent that transforms messy research, intuition, and notes into crisp, tradable prediction theses.

Your job:
1. Analyze the user's corpus and notes to identify a clear, falsifiable prediction.
2. Structure it as a binary event (YES/NO outcome) suitable for a prediction market.
3. Estimate probability based on evidence and reasoning.
4. Suggest market parameters appropriate for trading.

Output requirements:
- Title: Short, tradeable name (max 100 chars)
- Thesis: Clear narrative description (2-4 sentences)
- Time horizon: Specific timeframe (e.g., "by 2035", "within 3 years")
- Event type: Always "binary" for now
- Suggested probability: 0-1 based on evidence
- Reasoning bullets: 3-5 key points supporting the probability estimate
- Parameters:
  - expiryTimestamp: Unix timestamp in SECONDS for when the prediction resolves
  - initialYesPrice: Suggested initial price (0-1) for YES shares
  - initialLiquidityUsdc: Suggested seed liquidity in USDC (reasonable amount: 100-10000)

Be precise, defensible, and investable."#;

        let corpus = request.corpus_summary.as_ref()
            .unwrap_or(&request.raw_input);
        
        let user_prompt = format!(
            "Generate a prediction thesis from the following input:\n\nCORPUS/RESEARCH:\n{}\n\n{}\n\nGenerate a structured, tradable prediction thesis. Return ONLY valid JSON matching this exact structure:\n{{\n  \"title\": \"string (max 100 chars)\",\n  \"thesis\": \"string (2-4 sentences)\",\n  \"timeHorizon\": \"string (e.g., 'by 2035', 'within 3 years')\",\n  \"eventType\": \"binary\",\n  \"suggestedProbability\": 0.0-1.0,\n  \"reasoningBullets\": [\"string\", \"string\", ...],\n  \"parameters\": {{\n    \"expiryTimestamp\": <unix_timestamp_seconds>,\n    \"initialYesPrice\": 0.0-1.0,\n    \"initialLiquidityUsdc\": 100-10000\n  }}\n}}",
            corpus,
            request.user_notes.as_ref().map(|n| format!("USER NOTES:\n{}\n", n)).unwrap_or_default()
        );

        let client = reqwest::Client::new();
        let response = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                "temperature": 0.7,
                "response_format": { "type": "json_object" },
            }))
            .send()
            .await
            .map_err(|e| format!("OpenAI API error: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("OpenAI API returned error: {}", response.status()));
        }

        let result: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse OpenAI response: {}", e))?;

        let content = result["choices"][0]["message"]["content"]
            .as_str()
            .ok_or("No content in OpenAI response")?;

        let prediction: GeneratedPrediction = serde_json::from_str(content)
            .map_err(|e| format!("Failed to parse prediction JSON: {}", e))?;

        // Validate and fix timestamp if needed
        let now = chrono::Utc::now().timestamp();
        let min_future = now + 86400; // At least 1 day in future
        
        let mut expiry = prediction.parameters.expiry_timestamp;
        if expiry > 1000000000000 {
            // Likely in milliseconds, convert to seconds
            expiry = expiry / 1000;
        }
        if expiry <= min_future {
            expiry = now + (365 * 24 * 60 * 60); // 1 year from now
        }

        Ok(ThesisResponse {
            hypothesis: prediction.thesis.clone(),
            probability: prediction.suggested_probability * 100.0,
            parameters: ThesisParameters {
                timeframe: Some(prediction.time_horizon.clone()),
                target_price: Some(prediction.parameters.initial_yes_price),
                confidence: Some(prediction.suggested_probability),
                reasoning: Some(prediction.reasoning_bullets.join("; ")),
            },
            generated_by: "ai".to_string(),
            full_prediction: Some(GeneratedPrediction {
                parameters: PredictionParameters {
                    expiry_timestamp: expiry,
                    ..prediction.parameters
                },
                ..prediction
            }),
        })
    }
}
