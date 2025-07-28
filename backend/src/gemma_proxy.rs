use axum::{Json, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Deserialize, Serialize)]
pub struct GemmaRequest {
    pub contents: Vec<Content>,
}

#[derive(Deserialize, Serialize)]
pub struct Content {
    pub parts: Vec<Part>,
}

#[derive(Deserialize, Serialize)]
pub struct Part {
    pub text: String,
}

#[derive(Serialize)]
pub struct GemmaResponse {
    pub candidates: Vec<Candidate>,
}

#[derive(Serialize)]
pub struct Candidate {
    pub index: i32,
    pub content: Content,
    pub finish_reason: String,
}

pub async fn proxy_gemma(request: Json<GemmaRequest>) -> impl IntoResponse {
    let client = Client::new();
    let gemma_url = "https://yoree-gemma-827561407333.europe-west1.run.app/v1beta/models/gemma3:4b:generateContent";
    
    match client
        .post(gemma_url)
        .json(&request.0)
        .header("Content-Type", "application/json")
        .header("User-Agent", "yoree-backend/1.0")
        .send()
        .await
    {
        Ok(response) => {
            match response.json::<serde_json::Value>().await {
                Ok(data) => {
                    (
                        StatusCode::OK,
                        [("Access-Control-Allow-Origin", "*")],
                        Json(data)
                    ).into_response()
                }
                Err(e) => {
                    eprintln!("Error parsing Gemma response: {}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(serde_json::json!({
                            "error": "Failed to parse Gemma response"
                        }))
                    ).into_response()
                }
            }
        }
        Err(e) => {
            eprintln!("Error calling Gemma API: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({
                    "error": "Failed to call Gemma API"
                }))
            ).into_response()
        }
    }
}

pub async fn handle_options() -> impl IntoResponse {
    (
        StatusCode::OK,
        [
            ("Access-Control-Allow-Origin", "*"),
            ("Access-Control-Allow-Methods", "POST, OPTIONS"),
            ("Access-Control-Allow-Headers", "Content-Type"),
        ]
    ).into_response()
} 