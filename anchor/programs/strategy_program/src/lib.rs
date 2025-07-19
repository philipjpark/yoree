use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint, MintTo, Burn};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Strategy111111111111111111111111111111111111111");

#[program]
pub mod strategy_program {
    use super::*;

    /// Initialize a new trading strategy
    pub fn initialize_strategy(
        ctx: Context<InitializeStrategy>,
        strategy_name: String,
        strategy_config: StrategyConfig,
    ) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        strategy.authority = ctx.accounts.authority.key();
        strategy.strategy_name = strategy_name;
        strategy.config = strategy_config;
        strategy.is_active = false;
        strategy.total_trades = 0;
        strategy.total_pnl = 0;
        strategy.bump = *ctx.bumps.get("strategy").unwrap();
        
        msg!("Strategy initialized: {}", strategy.strategy_name);
        Ok(())
    }

    /// Activate a strategy for trading
    pub fn activate_strategy(ctx: Context<ActivateStrategy>) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        require!(strategy.authority == ctx.accounts.authority.key(), ErrorCode::Unauthorized);
        
        strategy.is_active = true;
        msg!("Strategy activated: {}", strategy.strategy_name);
        Ok(())
    }

    /// Execute a trade based on strategy signals
    pub fn execute_trade(
        ctx: Context<ExecuteTrade>,
        trade_type: TradeType,
        amount: u64,
        price: u64,
    ) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        require!(strategy.is_active, ErrorCode::StrategyInactive);
        require!(strategy.authority == ctx.accounts.authority.key(), ErrorCode::Unauthorized);

        // Execute the trade
        let trade_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from_token_account.to_account_info(),
                to: ctx.accounts.to_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::transfer(trade_ctx, amount)?;

        // Update strategy statistics
        strategy.total_trades = strategy.total_trades.checked_add(1).unwrap();
        
        // Calculate PnL (simplified)
        let pnl = match trade_type {
            TradeType::Buy => -(amount as i64),
            TradeType::Sell => amount as i64,
        };
        strategy.total_pnl = strategy.total_pnl.checked_add(pnl).unwrap();

        msg!("Trade executed: {:?} {} tokens at price {}", trade_type, amount, price);
        Ok(())
    }

    /// Update strategy configuration
    pub fn update_strategy_config(
        ctx: Context<UpdateStrategy>,
        new_config: StrategyConfig,
    ) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        require!(strategy.authority == ctx.accounts.authority.key(), ErrorCode::Unauthorized);
        
        strategy.config = new_config;
        msg!("Strategy config updated: {}", strategy.strategy_name);
        Ok(())
    }

    /// Deactivate a strategy
    pub fn deactivate_strategy(ctx: Context<ActivateStrategy>) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        require!(strategy.authority == ctx.accounts.authority.key(), ErrorCode::Unauthorized);
        
        strategy.is_active = false;
        msg!("Strategy deactivated: {}", strategy.strategy_name);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeStrategy<'info> {
    #[account(
        init,
        payer = authority,
        space = Strategy::LEN,
        seeds = [b"strategy", authority.key().as_ref()],
        bump
    )]
    pub strategy: Account<'info, Strategy>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ActivateStrategy<'info> {
    #[account(mut)]
    pub strategy: Account<'info, Strategy>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteTrade<'info> {
    #[account(mut)]
    pub strategy: Account<'info, Strategy>,
    
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateStrategy<'info> {
    #[account(mut)]
    pub strategy: Account<'info, Strategy>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct Strategy {
    pub authority: Pubkey,
    pub strategy_name: String,
    pub config: StrategyConfig,
    pub is_active: bool,
    pub total_trades: u64,
    pub total_pnl: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct StrategyConfig {
    pub asset: String,
    pub strategy_type: String,
    pub timeframe: String,
    pub stop_loss: u64,
    pub take_profit: u64,
    pub position_size: u64,
    pub volume_condition: String,
    pub breakout_condition: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TradeType {
    Buy,
    Sell,
}

impl Strategy {
    pub const LEN: usize = 8 + 32 + 4 + 100 + 200 + 1 + 8 + 8 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Strategy is not active")]
    StrategyInactive,
    #[msg("Invalid trade parameters")]
    InvalidTrade,
} 