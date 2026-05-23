//! Live market quotes for pipeline asset enrichment (crypto + equities).

use reqwest::header::USER_AGENT;
use serde::{Deserialize, Serialize};
use tracing::warn;

const COINGECKO_SIMPLE: &str = "https://api.coingecko.com/api/v3/simple/price";
const YAHOO_CHART: &str = "https://query1.finance.yahoo.com/v8/finance/chart";
const UA: &str = "Greed-Pipeline/1.0";

#[derive(Debug, Deserialize)]
pub struct EnrichAssetInput {
    pub symbol: String,
    #[serde(default)]
    pub asset_class: String,
}

#[derive(Debug, Deserialize)]
pub struct EnrichMarketsRequest {
    pub assets: Vec<EnrichAssetInput>,
}

#[derive(Debug, Clone, Serialize)]
pub struct AssetQuote {
    pub symbol: String,
    pub price: Option<f64>,
    pub change24h: Option<f64>,
    pub change24h_percent: Option<f64>,
    pub currency: String,
    pub market_source: String,
    pub fetched_at: String,
}

#[derive(Debug, Serialize)]
pub struct EnrichMarketsResponse {
    pub quotes: Vec<AssetQuote>,
}

fn is_crypto_class(asset_class: &str) -> bool {
    let c = asset_class.to_lowercase();
    c.contains("crypto") || c.contains("defi")
}

fn is_equity_class(asset_class: &str) -> bool {
    let c = asset_class.to_lowercase();
    c.contains("stock") || c.contains("etf") || c == "equities"
}

fn coingecko_id(symbol: &str) -> Option<&'static str> {
    match symbol.to_uppercase().as_str() {
        "BTC" => Some("bitcoin"),
        "ETH" => Some("ethereum"),
        "SOL" => Some("solana"),
        "BNB" => Some("binancecoin"),
        "AVAX" => Some("avalanche-2"),
        "LINK" => Some("chainlink"),
        "DOGE" => Some("dogecoin"),
        "XRP" => Some("ripple"),
        "ADA" => Some("cardano"),
        "MATIC" | "POL" => Some("matic-network"),
        "USDC" => Some("usd-coin"),
        "USDT" => Some("tether"),
        "CRCL" => None,
        _ => None,
    }
}

pub async fn enrich_market_quotes(req: EnrichMarketsRequest) -> EnrichMarketsResponse {
    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(12))
        .build()
    {
        Ok(c) => c,
        Err(_) => return EnrichMarketsResponse { quotes: vec![] },
    };

    let mut crypto_ids: Vec<(String, String)> = Vec::new();
    let mut stock_symbols: Vec<String> = Vec::new();

    for a in &req.assets {
        let sym = a.symbol.trim().to_uppercase();
        if sym.is_empty() {
            continue;
        }
        if is_crypto_class(&a.asset_class) {
            if let Some(id) = coingecko_id(&sym) {
                crypto_ids.push((sym.clone(), id.to_string()));
            }
        } else if is_equity_class(&a.asset_class) || sym.len() <= 5 && sym.chars().all(|c| c.is_ascii_alphanumeric()) {
            stock_symbols.push(sym);
        } else if coingecko_id(&sym).is_some() {
            if let Some(id) = coingecko_id(&sym) {
                crypto_ids.push((sym.clone(), id.to_string()));
            }
        }
    }

    let mut quotes: Vec<AssetQuote> = Vec::new();
    let fetched_at = chrono::Utc::now().to_rfc3339();

    if !crypto_ids.is_empty() {
        quotes.extend(fetch_coingecko(&client, &crypto_ids, &fetched_at).await);
    }

    let quoted: std::collections::HashSet<String> =
        quotes.iter().map(|q| q.symbol.clone()).collect();
    for sym in stock_symbols {
        if quoted.contains(&sym) {
            continue;
        }
        if let Some(q) = fetch_yahoo_equity(&client, &sym, &fetched_at).await {
            quotes.push(q);
        }
    }

    EnrichMarketsResponse { quotes }
}

async fn fetch_coingecko(
    client: &reqwest::Client,
    pairs: &[(String, String)],
    fetched_at: &str,
) -> Vec<AssetQuote> {
    let ids: Vec<&str> = pairs.iter().map(|(_, id)| id.as_str()).collect();
    let url = format!(
        "{}?ids={}&vs_currencies=usd&include_24hr_change=true",
        COINGECKO_SIMPLE,
        ids.join(",")
    );

    let resp = match client.get(&url).header(USER_AGENT, UA).send().await {
        Ok(r) if r.status().is_success() => r,
        Ok(r) => {
            warn!("CoinGecko status {}", r.status());
            return vec![];
        }
        Err(e) => {
            warn!("CoinGecko error: {}", e);
            return vec![];
        }
    };

    let body: serde_json::Value = match resp.json().await {
        Ok(v) => v,
        Err(_) => return vec![],
    };

    let mut out = Vec::new();
    for (symbol, id) in pairs {
        let node = body.get(id);
        let price = node.and_then(|n| n.get("usd")).and_then(|v| v.as_f64());
        let change_pct = node
            .and_then(|n| n.get("usd_24h_change"))
            .and_then(|v| v.as_f64());
        let change_abs = match (price, change_pct) {
            (Some(p), Some(pct)) if p > 0.0 => Some(p * (pct / 100.0)),
            _ => None,
        };
        out.push(AssetQuote {
            symbol: symbol.clone(),
            price,
            change24h: change_abs,
            change24h_percent: change_pct,
            currency: "USD".to_string(),
            market_source: "coingecko".to_string(),
            fetched_at: fetched_at.to_string(),
        });
    }
    out
}

async fn fetch_yahoo_equity(
    client: &reqwest::Client,
    symbol: &str,
    fetched_at: &str,
) -> Option<AssetQuote> {
    let url = format!("{}/{}?interval=1d&range=2d", YAHOO_CHART, symbol);
    let resp = client.get(&url).header(USER_AGENT, UA).send().await.ok()?;
    if !resp.status().is_success() {
        return None;
    }
    let body: serde_json::Value = resp.json().await.ok()?;
    let meta = body
        .pointer("/chart/result/0/meta")
        .or_else(|| body.pointer("/chart/result/0/indicators/quote/0"))?;

    let price = meta
        .get("regularMarketPrice")
        .and_then(|v| v.as_f64())
        .or_else(|| {
            body.pointer("/chart/result/0/indicators/quote/0/close")
                .and_then(|arr| arr.as_array())
                .and_then(|a| a.last())
                .and_then(|v| v.as_f64())
        });

    let prev = meta
        .get("chartPreviousClose")
        .or_else(|| meta.get("previousClose"))
        .and_then(|v| v.as_f64());

    let (change_abs, change_pct) = match (price, prev) {
        (Some(p), Some(pr)) if pr > 0.0 => {
            let d = p - pr;
            (Some(d), Some((d / pr) * 100.0))
        }
        _ => (None, None),
    };

    Some(AssetQuote {
        symbol: symbol.to_string(),
        price,
        change24h: change_abs,
        change24h_percent: change_pct,
        currency: "USD".to_string(),
        market_source: "yahoo_finance".to_string(),
        fetched_at: fetched_at.to_string(),
    })
}
