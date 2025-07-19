use serde::Deserialize;
use std::env;

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub blockchain: BlockchainConfig,
    pub ai: AIConfig,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseConfig {
    pub url: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct BlockchainConfig {
    pub rpc_url: String,
    pub chain_id: u64,
    pub pyusd_contract: String,
    pub tbnb_contract: String,
    pub private_key: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AIConfig {
    pub model_endpoint: String,
    pub api_key: Option<String>,
    pub max_concurrent_requests: usize,
}

impl Config {
    pub fn from_env() -> Result<Self, env::VarError> {
        dotenv::dotenv().ok();
        
        let config = Config {
            server: ServerConfig {
                host: env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
                port: env::var("SERVER_PORT")
                    .unwrap_or_else(|_| "3001".to_string())
                    .parse()
                    .expect("SERVER_PORT must be a valid port number"),
            },
            database: DatabaseConfig {
                url: env::var("DATABASE_URL")
                    .unwrap_or_else(|_| "postgresql://localhost/yoree".to_string()),
            },
            blockchain: BlockchainConfig {
                rpc_url: env::var("BSC_RPC_URL")
                    .unwrap_or_else(|_| "https://data-seed-prebsc-1-s1.binance.org:8545".to_string()),
                chain_id: env::var("BSC_CHAIN_ID")
                    .unwrap_or_else(|_| "97".to_string())
                    .parse()
                    .expect("BSC_CHAIN_ID must be a valid number"),
                pyusd_contract: env::var("PYUSD_CONTRACT_ADDRESS")
                    .unwrap_or_else(|_| "0x0000000000000000000000000000000000000000".to_string()),
                tbnb_contract: env::var("TBNB_CONTRACT_ADDRESS")
                    .unwrap_or_else(|_| "0x0000000000000000000000000000000000000000".to_string()),
                private_key: env::var("PRIVATE_KEY").ok(),
            },
            ai: AIConfig {
                model_endpoint: env::var("AI_MODEL_ENDPOINT")
                    .unwrap_or_else(|_| "http://localhost:8000/predict".to_string()),
                api_key: env::var("AI_API_KEY").ok(),
                max_concurrent_requests: env::var("AI_MAX_CONCURRENT_REQUESTS")
                    .unwrap_or_else(|_| "10".to_string())
                    .parse()
                    .expect("AI_MAX_CONCURRENT_REQUESTS must be a valid number"),
            },
        };
        
        Ok(config)
    }
    
    pub fn validate(&self) -> Result<(), String> {
        // Validate server config
        if self.server.port == 0 {
            return Err("Server port cannot be 0".to_string());
        }
        
        // Validate database config
        if self.database.url.is_empty() {
            return Err("Database URL cannot be empty".to_string());
        }
        
        // Validate blockchain config
        if self.blockchain.rpc_url.is_empty() {
            return Err("BSC RPC URL cannot be empty".to_string());
        }
        
        if self.blockchain.chain_id == 0 {
            return Err("Chain ID cannot be 0".to_string());
        }
        
        // Validate AI config
        if self.ai.model_endpoint.is_empty() {
            return Err("AI model endpoint cannot be empty".to_string());
        }
        
        if self.ai.max_concurrent_requests == 0 {
            return Err("Max concurrent requests cannot be 0".to_string());
        }
        
        Ok(())
    }
    
    pub fn is_development(&self) -> bool {
        env::var("RUST_ENV").unwrap_or_else(|_| "development".to_string()) == "development"
    }
    
    pub fn is_production(&self) -> bool {
        env::var("RUST_ENV").unwrap_or_else(|_| "development".to_string()) == "production"
    }
} 