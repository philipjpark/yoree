use sqlx::{PgPool, Row};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

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
    pool: PgPool,
}

impl DatabaseService {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = PgPool::connect(database_url).await?;
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await?;
        
        Ok(Self { pool })
    }
    
    pub async fn create_user(&self, wallet_address: &str) -> Result<User> {
        let user = sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (wallet_address, created_at, updated_at)
            VALUES ($1, $2, $3)
            RETURNING id, wallet_address, username, created_at, updated_at
            "#,
            wallet_address,
            Utc::now(),
            Utc::now()
        )
        .fetch_one(&self.pool)
        .await?;
        
        Ok(user)
    }
    
    pub async fn get_user(&self, wallet_address: &str) -> Result<Option<User>> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT id, wallet_address, username, created_at, updated_at
            FROM users
            WHERE wallet_address = $1
            "#,
            wallet_address
        )
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(user)
    }
    
    pub async fn save_transaction(&self, transaction: &Transaction) -> Result<()> {
        sqlx::query!(
            r#"
            INSERT INTO transactions (id, wallet_address, transaction_hash, from_token, to_token, amount, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            "#,
            transaction.id,
            transaction.wallet_address,
            transaction.transaction_hash,
            transaction.from_token,
            transaction.to_token,
            transaction.amount,
            transaction.status,
            transaction.created_at
        )
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    pub async fn get_user_transactions(&self, wallet_address: &str) -> Result<Vec<Transaction>> {
        let transactions = sqlx::query_as!(
            Transaction,
            r#"
            SELECT id, wallet_address, transaction_hash, from_token, to_token, amount, status, created_at
            FROM transactions
            WHERE wallet_address = $1
            ORDER BY created_at DESC
            LIMIT 50
            "#,
            wallet_address
        )
        .fetch_all(&self.pool)
        .await?;
        
        Ok(transactions)
    }
    
    pub async fn save_strategy(&self, strategy: &crate::ai_strategies::Strategy) -> Result<()> {
        sqlx::query!(
            r#"
            INSERT INTO strategies (id, name, description, target_token, stop_loss, take_profit, position_size, creator_address, is_active, total_return, total_trades, win_rate, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            "#,
            strategy.id,
            strategy.name,
            strategy.description,
            strategy.target_token,
            strategy.stop_loss,
            strategy.take_profit,
            strategy.position_size,
            strategy.creator_address,
            strategy.is_active,
            strategy.total_return,
            strategy.total_trades,
            strategy.win_rate,
            strategy.created_at,
            strategy.updated_at
        )
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    pub async fn get_user_strategies(&self, wallet_address: &str) -> Result<Vec<crate::ai_strategies::Strategy>> {
        let strategies = sqlx::query_as!(
            crate::ai_strategies::Strategy,
            r#"
            SELECT id, name, description, target_token, stop_loss, take_profit, position_size, creator_address, is_active, total_return, total_trades, win_rate, created_at, updated_at
            FROM strategies
            WHERE creator_address = $1
            ORDER BY created_at DESC
            "#,
            wallet_address
        )
        .fetch_all(&self.pool)
        .await?;
        
        Ok(strategies)
    }
    
    pub async fn update_strategy_performance(&self, strategy_id: &str, total_return: f64, total_trades: u32, win_rate: f64) -> Result<()> {
        sqlx::query!(
            r#"
            UPDATE strategies
            SET total_return = $1, total_trades = $2, win_rate = $3, updated_at = $4
            WHERE id = $5
            "#,
            total_return,
            total_trades,
            win_rate,
            Utc::now(),
            strategy_id
        )
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    pub async fn get_portfolio_stats(&self, wallet_address: &str) -> Result<serde_json::Value> {
        // Get total transactions
        let total_transactions: i64 = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM transactions WHERE wallet_address = $1",
            wallet_address
        )
        .fetch_one(&self.pool)
        .await?;
        
        // Get total strategies
        let total_strategies: i64 = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM strategies WHERE creator_address = $1",
            wallet_address
        )
        .fetch_one(&self.pool)
        .await?;
        
        // Get recent activity
        let recent_transactions = sqlx::query!(
            r#"
            SELECT from_token, to_token, amount, created_at
            FROM transactions
            WHERE wallet_address = $1
            ORDER BY created_at DESC
            LIMIT 5
            "#,
            wallet_address
        )
        .fetch_all(&self.pool)
        .await?;
        
        let stats = serde_json::json!({
            "total_transactions": total_transactions,
            "total_strategies": total_strategies,
            "recent_activity": recent_transactions,
            "last_updated": Utc::now()
        });
        
        Ok(stats)
    }
} 