use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Vault111111111111111111111111111111111111111");

#[program]
pub mod vault_program {
    use super::*;

    /// Initialize a new vault
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        vault_name: String,
        fee_rate: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.vault_name = vault_name;
        vault.fee_rate = fee_rate;
        vault.total_shares = 0;
        vault.total_value = 0;
        vault.bump = *ctx.bumps.get("vault").unwrap();
        
        msg!("Vault initialized: {}", vault.vault_name);
        Ok(())
    }

    /// Deposit funds into the vault
    pub fn deposit(
        ctx: Context<Deposit>,
        amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let user_token_account = &ctx.accounts.user_token_account;
        let vault_token_account = &ctx.accounts.vault_token_account;

        // Calculate shares to mint
        let shares_to_mint = if vault.total_shares == 0 {
            amount
        } else {
            (amount * vault.total_shares) / vault.total_value
        };

        // Transfer tokens from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: user_token_account.to_account_info(),
                to: vault_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Mint shares to user
        let mint_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.share_mint.to_account_info(),
                to: ctx.accounts.user_share_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
        );
        token::mint_to(mint_ctx, shares_to_mint)?;

        // Update vault state
        vault.total_shares = vault.total_shares.checked_add(shares_to_mint).unwrap();
        vault.total_value = vault.total_value.checked_add(amount).unwrap();

        msg!("Deposited {} tokens, received {} shares", amount, shares_to_mint);
        Ok(())
    }

    /// Withdraw funds from the vault
    pub fn withdraw(
        ctx: Context<Withdraw>,
        shares_to_burn: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let user_token_account = &ctx.accounts.user_token_account;
        let vault_token_account = &ctx.accounts.vault_token_account;

        // Calculate tokens to withdraw
        let tokens_to_withdraw = (shares_to_burn * vault.total_value) / vault.total_shares;

        // Burn user shares
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Burn {
                mint: ctx.accounts.share_mint.to_account_info(),
                from: ctx.accounts.user_share_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::burn(burn_ctx, shares_to_burn)?;

        // Transfer tokens from vault to user
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: vault_token_account.to_account_info(),
                to: user_token_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, tokens_to_withdraw)?;

        // Update vault state
        vault.total_shares = vault.total_shares.checked_sub(shares_to_burn).unwrap();
        vault.total_value = vault.total_value.checked_sub(tokens_to_withdraw).unwrap();

        msg!("Withdrew {} tokens, burned {} shares", tokens_to_withdraw, shares_to_burn);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = Vault::LEN,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub share_mint: Account<'info, token::Mint>,
    
    #[account(mut)]
    pub user_share_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub share_mint: Account<'info, token::Mint>,
    
    #[account(mut)]
    pub user_share_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub vault_name: String,
    pub fee_rate: u64,
    pub total_shares: u64,
    pub total_value: u64,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 8 + 32 + 4 + 50 + 8 + 8 + 8 + 1;
} 