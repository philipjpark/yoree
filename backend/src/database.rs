use anyhow::Result;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::sync::Mutex;
use std::sync::Arc;

#[derive(Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub wallet_address: String,
    pub username: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub wallet_address: String,
    pub transaction_hash: String,
    pub from_token: String,
    pub to_token: String,
    pub amount: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

pub struct DatabaseService {
    // Mock database using in-memory storage
    users: Arc<Mutex<HashMap<String, User>>>,
    transactions: Arc<Mutex<HashMap<String, Transaction>>>,
    strategies: Arc<Mutex<HashMap<String, crate::ai_strategies::Strategy>>>,
}

impl DatabaseService {
    pub async fn new(_database_url: &str) -> Result<Self> {
        // Mock database - no real connection needed
        Ok(Self {
            users: Arc::new(Mutex::new(HashMap::new())),
            transactions: Arc::new(Mutex::new(HashMap::new())),
            strategies: Arc::new(Mutex::new(HashMap::new())),
        })
    }
    
    pub async fn create_user(&self, wallet_address: &str) -> Result<User> {
        let user = User {
            id: uuid::Uuid::new_v4().to_string(),
            wallet_address: wallet_address.to_string(),
            username: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        
        let mut users = self.users.lock().unwrap();
        users.insert(user.id.clone(), user.clone());
        
        Ok(user)
    }
    
    pub async fn get_user(&self, wallet_address: &str) -> Result<Option<User>> {
        let users = self.users.lock().unwrap();
        let user = users.values().find(|u| u.wallet_address == wallet_address).cloned();
        
        Ok(user)
    }
    
    pub async fn save_transaction(&self, transaction: &Transaction) -> Result<()> {
        let mut transactions = self.transactions.lock().unwrap();
        transactions.insert(transaction.id.clone(), transaction.clone());
        
        Ok(())
    }
    
    pub async fn get_user_transactions(&self, wallet_address: &str) -> Result<Vec<Transaction>> {
        let transactions = self.transactions.lock().unwrap();
        let user_transactions: Vec<Transaction> = transactions
            .values()
            .filter(|t| t.wallet_address == wallet_address)
            .cloned()
            .collect();
        
        Ok(user_transactions)
    }
    
    pub async fn save_strategy(&self, strategy: &crate::ai_strategies::Strategy) -> Result<()> {
        let mut strategies = self.strategies.lock().unwrap();
        strategies.insert(strategy.id.clone(), strategy.clone());
        
        Ok(())
    }
    
    pub async fn get_user_strategies(&self, wallet_address: &str) -> Result<Vec<crate::ai_strategies::Strategy>> {
        let strategies = self.strategies.lock().unwrap();
        let user_strategies: Vec<crate::ai_strategies::Strategy> = strategies
            .values()
            .filter(|s| s.creator_address == wallet_address)
            .cloned()
            .collect();
        
        Ok(user_strategies)
    }
    
    pub async fn update_strategy_performance(&self, strategy_id: &str, total_return: f64, total_trades: u32, win_rate: f64) -> Result<()> {
        let mut strategies = self.strategies.lock().unwrap();
        if let Some(strategy) = strategies.get_mut(strategy_id) {
            strategy.total_return = total_return;
            strategy.total_trades = total_trades;
            strategy.win_rate = win_rate;
            strategy.updated_at = Utc::now();
        }
        
        Ok(())
    }
    
    pub async fn get_portfolio_stats(&self, wallet_address: &str) -> Result<serde_json::Value> {
        let transactions = self.transactions.lock().unwrap();
        let strategies = self.strategies.lock().unwrap();
        
        // Get total transactions
        let total_transactions = transactions
            .values()
            .filter(|t| t.wallet_address == wallet_address)
            .count() as i64;
        
        // Get total strategies
        let total_strategies = strategies
            .values()
            .filter(|s| s.creator_address == wallet_address)
            .count() as i64;
        
        // Get recent activity (mock data for now)
        let recent_activity = vec![
            serde_json::json!({
                "from_token": "BNB",
                "to_token": "PYUSD",
                "amount": "0.1",
                "created_at": Utc::now()
            })
        ];
        
        let stats = serde_json::json!({
            "total_transactions": total_transactions,
            "total_strategies": total_strategies,
            "recent_activity": recent_activity,
            "last_updated": Utc::now()
        });
        
        Ok(stats)
    }
} 