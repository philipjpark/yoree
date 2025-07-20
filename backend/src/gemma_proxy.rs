use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Deserialize)]
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

pub async fn proxy_gemma(request: web::Json<GemmaRequest>) -> Result<HttpResponse> {
    let client = Client::new();
    let gemma_url = "https://yoree-gemma-827561407333.europe-west1.run.app/v1beta/models/gemma3:4b:generateContent";
    
    match client
        .post(gemma_url)
        .json(&request.into_inner())
        .header("Content-Type", "application/json")
        .header("User-Agent", "yoree-backend/1.0")
        .send()
        .await
    {
        Ok(response) => {
            match response.json::<serde_json::Value>().await {
                Ok(data) => {
                    Ok(HttpResponse::Ok()
                        .header("Access-Control-Allow-Origin", "*")
                        .header("Access-Control-Allow-Methods", "POST, OPTIONS")
                        .header("Access-Control-Allow-Headers", "Content-Type")
                        .json(data))
                }
                Err(e) => {
                    eprintln!("Error parsing Gemma response: {}", e);
                    Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Failed to parse Gemma response"
                    })))
                }
            }
        }
        Err(e) => {
            eprintln!("Error calling Gemma API: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to call Gemma API"
            })))
        }
    }
}

pub async fn handle_options() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok()
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Methods", "POST, OPTIONS")
        .header("Access-Control-Allow-Headers", "Content-Type")
        .finish())
} 