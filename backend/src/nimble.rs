//! Nimble web corroboration — sparse Extract usage with in-memory cache.
//! SEC EDGAR uses the free SEC API (no Nimble credits).

use chrono::{DateTime, Utc};
use reqwest::header::{AUTHORIZATION, HeaderValue, USER_AGENT};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tracing::{info, warn};

const NIMBLE_EXTRACT_URL: &str = "https://sdk.nimbleway.com/v1/extract";
const SEC_TICKERS_URL: &str = "https://www.sec.gov/files/company_tickers.json";
const SEC_USER_AGENT: &str = "Greed Signals greed-signals@localhost";
const CACHE_TTL: Duration = Duration::from_secs(24 * 60 * 60);
const MARKDOWN_MAX_CHARS: usize = 2_500;

pub struct NimbleService {
    api_key: Option<String>,
    client: reqwest::Client,
    cache: ArcCache,
    sec_tickers: ArcSecTickers,
}

type ArcCache = std::sync::Arc<Mutex<HashMap<String, CacheEntry>>>;
type ArcSecTickers = std::sync::Arc<Mutex<Option<HashMap<String, u64>>>>;

#[derive(Clone)]
struct CacheEntry {
    markdown: String,
    fetched_at: DateTime<Utc>,
    stored_at: Instant,
}

#[derive(Debug, Deserialize)]
pub struct CorroborateRequest {
    pub corpus: String,
    #[serde(default = "default_max_nimble")]
    pub max_nimble_calls: u8,
}

fn default_max_nimble() -> u8 {
    std::env::var("NIMBLE_MAX_CALLS_PER_RUN")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(4)
        .min(8)
}

#[derive(Debug, Serialize, Clone)]
pub struct WebEvidence {
    pub source_type: String,
    pub title: String,
    pub url: String,
    pub snippet: String,
    pub fetched_at: String,
    pub via: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct DiscoveredWebAsset {
    pub symbol: String,
    pub name: String,
    pub asset_class: String,
    pub source_url: String,
    pub via: String,
}

#[derive(Debug, Serialize)]
pub struct CorroborateResponse {
    pub evidence: Vec<WebEvidence>,
    pub tickers: Vec<String>,
    pub discovered_assets: Vec<DiscoveredWebAsset>,
    pub nimble_calls_used: u8,
    pub cache_hits: u8,
    pub corroboration_block: String,
    pub enabled: bool,
}

impl NimbleService {
    pub fn new() -> Self {
        let api_key = std::env::var("NIMBLE_API_KEY")
            .ok()
            .filter(|k| !k.trim().is_empty());

        if api_key.is_none() {
            warn!("NIMBLE_API_KEY not set — web corroboration will use free SEC only");
        }

        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(45))
            .build()
            .expect("reqwest client");

        Self {
            api_key,
            client,
            cache: std::sync::Arc::new(Mutex::new(HashMap::new())),
            sec_tickers: std::sync::Arc::new(Mutex::new(None)),
        }
    }

    pub fn is_nimble_configured(&self) -> bool {
        self.api_key.is_some()
    }

    pub async fn corroborate(&self, req: CorroborateRequest) -> CorroborateResponse {
        let symbols = extract_market_symbols(&req.corpus);
        let tickers: Vec<String> = symbols
            .iter()
            .filter(|s| !s.starts_with("0x") && !s.starts_with("ADDR_"))
            .cloned()
            .collect();

        let max_calls = req.max_nimble_calls.max(1).min(8);
        let mut evidence = Vec::new();
        let mut nimble_calls_used = 0u8;
        let mut cache_hits = 0u8;
        let mut discovered_assets: Vec<DiscoveredWebAsset> = Vec::new();

        for sym in &symbols {
            push_discovered_asset(&mut discovered_assets, sym, "corpus", "");
        }

        // Free SEC lookups for equity-style tickers (does not consume Nimble credits).
        for sym in tickers.iter().take(6) {
            if !is_likely_equity_ticker(sym) {
                continue;
            }
            if let Some(sec) = self.fetch_sec_evidence(sym).await {
                evidence.push(sec);
            }
        }

        // Nimble Extract: rotate across symbols and deep sources (DexScreener, CoinGecko, StockTwits).
        if self.api_key.is_some() {
            let targets = build_nimble_targets(&symbols);
            for target in targets {
                if nimble_calls_used >= max_calls {
                    break;
                }
                match self
                    .fetch_nimble_extract(&target.url, &target.cache_key)
                    .await
                {
                    Ok((snippet, from_cache)) => {
                        if from_cache {
                            cache_hits += 1;
                        } else {
                            nimble_calls_used += 1;
                        }
                        for extra in extract_market_symbols(&snippet) {
                            push_discovered_asset(
                                &mut discovered_assets,
                                &extra,
                                &target.source_type,
                                &target.url,
                            );
                        }
                        evidence.push(WebEvidence {
                            source_type: target.source_type.clone(),
                            title: target.title.clone(),
                            url: target.url.clone(),
                            snippet,
                            fetched_at: Utc::now().to_rfc3339(),
                            via: if from_cache {
                                "nimble_cache".to_string()
                            } else {
                                "nimble_extract".to_string()
                            },
                        });
                    }
                    Err(e) => {
                        warn!("Nimble extract failed for {}: {}", target.url, e);
                    }
                }
            }
        }

        discovered_assets.truncate(16);
        let corroboration_block = build_corroboration_block(&evidence, &discovered_assets);
        let enabled = self.is_nimble_configured() || !evidence.is_empty();

        CorroborateResponse {
            evidence,
            tickers,
            discovered_assets,
            nimble_calls_used,
            cache_hits,
            corroboration_block,
            enabled,
        }
    }

    async fn fetch_nimble_extract(
        &self,
        url: &str,
        cache_key: &str,
    ) -> Result<(String, bool), String> {
        if let Some(cached) = self.get_cache(cache_key) {
            return Ok((cached, true));
        }

        let api_key = self
            .api_key
            .as_ref()
            .ok_or_else(|| "NIMBLE_API_KEY not configured".to_string())?;

        let auth = format!("Bearer {}", api_key);
        let body = serde_json::json!({
            "url": url,
            "render": true,
            "country": "US",
            "locale": "en-US",
            "formats": ["markdown"]
        });

        info!("Nimble extract: {}", url);

        let resp = self
            .client
            .post(NIMBLE_EXTRACT_URL)
            .header(AUTHORIZATION, HeaderValue::from_str(&auth).map_err(|e| e.to_string())?)
            .header(USER_AGENT, SEC_USER_AGENT)
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Nimble request failed: {}", e))?;

        let status = resp.status();
        let text = resp
            .text()
            .await
            .map_err(|e| format!("Nimble read body: {}", e))?;

        if !status.is_success() {
            return Err(format!("Nimble HTTP {}: {}", status, truncate(&text, 400)));
        }

        let parsed: NimbleExtractResponse = serde_json::from_str(&text)
            .map_err(|e| format!("Nimble JSON parse: {} — {}", e, truncate(&text, 200)))?;

        let markdown = parsed
            .data
            .and_then(|d| d.markdown)
            .unwrap_or_else(|| truncate(&text, MARKDOWN_MAX_CHARS));

        let snippet = truncate(&markdown, MARKDOWN_MAX_CHARS);
        self.set_cache(cache_key, snippet.clone());

        Ok((snippet, false))
    }

    fn get_cache(&self, key: &str) -> Option<String> {
        let guard = self.cache.lock().ok()?;
        let entry = guard.get(key)?;
        if entry.stored_at.elapsed() > CACHE_TTL {
            return None;
        }
        Some(entry.markdown.clone())
    }

    fn set_cache(&self, key: &str, markdown: String) {
        if let Ok(mut guard) = self.cache.lock() {
            guard.insert(
                key.to_string(),
                CacheEntry {
                    markdown,
                    fetched_at: Utc::now(),
                    stored_at: Instant::now(),
                },
            );
        }
    }

    async fn fetch_sec_evidence(&self, ticker: &str) -> Option<WebEvidence> {
        let cik = self.resolve_cik(ticker).await?;
        let cik_padded = format!("{:010}", cik);
        let url = format!("https://data.sec.gov/submissions/CIK{}.json", cik_padded);

        let resp = self
            .client
            .get(&url)
            .header(USER_AGENT, SEC_USER_AGENT)
            .header("Accept", "application/json")
            .send()
            .await
            .ok()?;

        if !resp.status().is_success() {
            return None;
        }

        let body: SecSubmissions = resp.json().await.ok()?;
        let recent = body.filings?.recent?;
        let form = recent
            .form
            .as_ref()
            .and_then(|f| f.first())
            .cloned()
            .unwrap_or_default();
        let filing_date = recent
            .filing_date
            .as_ref()
            .and_then(|f| f.first())
            .cloned()
            .unwrap_or_default();
        let primary_doc = recent
            .primary_document
            .as_ref()
            .and_then(|f| f.first())
            .cloned();
        let accession = recent
            .accession_number
            .as_ref()
            .and_then(|f| f.first())
            .cloned();

        let filing_url = match (accession, primary_doc.as_ref()) {
            (Some(acc), Some(doc)) => {
                let acc_no_dash = acc.replace('-', "");
                Some(format!(
                    "https://www.sec.gov/Archives/edgar/data/{}/{}/{}",
                    cik, acc_no_dash, doc
                ))
            }
            _ => Some(format!(
                "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={}&type=&dateb=&owner=include&count=10",
                cik
            )),
        };

        let name = body.name.unwrap_or_else(|| ticker.to_string());
        let snippet = format!(
            "SEC EDGAR — {} ({}) latest filing: {} filed {}. Review official filing before trading.",
            name, ticker.to_uppercase(), form, filing_date
        );

        Some(WebEvidence {
            source_type: "sec_edgar".to_string(),
            title: format!("SEC filings — {}", ticker.to_uppercase()),
            url: filing_url.unwrap_or_else(|| {
                format!(
                    "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={}",
                    cik
                )
            }),
            snippet,
            fetched_at: Utc::now().to_rfc3339(),
            via: "sec_api_free".to_string(),
        })
    }

    async fn resolve_cik(&self, ticker: &str) -> Option<u64> {
        let upper = ticker.to_uppercase();
        {
            let guard = self.sec_tickers.lock().ok()?;
            if let Some(map) = guard.as_ref() {
                return map.get(&upper).copied();
            }
        }

        let resp = self
            .client
            .get(SEC_TICKERS_URL)
            .header(USER_AGENT, SEC_USER_AGENT)
            .send()
            .await
            .ok()?;

        if !resp.status().is_success() {
            return None;
        }

        let raw: serde_json::Value = resp.json().await.ok()?;
        let mut map = HashMap::new();
        if let Some(obj) = raw.as_object() {
            for (_k, v) in obj {
                if let (Some(t), Some(cik)) = (
                    v.get("ticker").and_then(|t| t.as_str()),
                    v.get("cik_str").and_then(|c| c.as_u64()),
                ) {
                    map.insert(t.to_uppercase(), cik);
                }
            }
        }

        let cik = map.get(&upper).copied();
        if let Ok(mut guard) = self.sec_tickers.lock() {
            *guard = Some(map);
        }
        cik
    }
}

struct NimbleTarget {
    url: String,
    cache_key: String,
    source_type: String,
    title: String,
}

fn build_nimble_targets(symbols: &[String]) -> Vec<NimbleTarget> {
    let mut targets = Vec::new();
    let mut seen_urls = std::collections::HashSet::new();

    for sym in symbols.iter().take(8) {
        if sym.starts_with("ADDR_") || sym.starts_with("0x") {
            let q = if sym.starts_with("0x") {
                sym.clone()
            } else {
                sym.replacen("ADDR_", "0x", 1)
            };
            let url = format!("https://dexscreener.com/search?q={}", q);
            push_target(
                &mut targets,
                &mut seen_urls,
                url,
                format!("dexscreener:{}", q),
                "dexscreener",
                format!("Contract {} on DexScreener", &q[..q.len().min(12)]),
            );
            continue;
        }

        let upper = sym.to_uppercase();
        let dex_url = format!("https://dexscreener.com/search?q={}", upper);
        push_target(
            &mut targets,
            &mut seen_urls,
            dex_url,
            format!("dexscreener:{}", upper),
            "dexscreener",
            format!("{} on DexScreener (incl. low-cap pairs)", upper),
        );

        let cg_url = format!("https://www.coingecko.com/en/search?query={}", upper);
        push_target(
            &mut targets,
            &mut seen_urls,
            cg_url,
            format!("coingecko:{}", upper),
            "coingecko",
            format!("{} on CoinGecko search", upper),
        );

        if is_likely_equity_ticker(&upper) {
            let st_url = format!("https://stocktwits.com/symbol/{}", upper);
            push_target(
                &mut targets,
                &mut seen_urls,
                st_url,
                format!("stocktwits:{}", upper),
                "stocktwits",
                format!("${} on StockTwits", upper),
            );
        }
    }

    targets
}

fn push_target(
    targets: &mut Vec<NimbleTarget>,
    seen_urls: &mut std::collections::HashSet<String>,
    url: String,
    cache_key: String,
    source_type: &str,
    title: String,
) {
    if seen_urls.insert(url.clone()) {
        targets.push(NimbleTarget {
            url,
            cache_key,
            source_type: source_type.to_string(),
            title,
        });
    }
}

fn is_likely_equity_ticker(sym: &str) -> bool {
    sym.len() >= 1
        && sym.len() <= 5
        && sym.chars().all(|c| c.is_ascii_alphanumeric())
        && !is_crypto_l1(sym)
}

fn is_crypto_l1(sym: &str) -> bool {
    matches!(
        sym,
        "BTC" | "ETH" | "SOL" | "BNB" | "USDC" | "USDT" | "MON" | "AVAX" | "LINK" | "DOGE" | "XRP"
    )
}

fn extract_market_symbols(corpus: &str) -> Vec<String> {
    let mut seen = std::collections::HashSet::new();
    let mut out = Vec::new();

    let mut push = |raw: String| {
        let t = raw.trim().to_uppercase();
        if t.is_empty() || is_noise_symbol(&t) {
            return;
        }
        if seen.insert(t.clone()) {
            out.push(t);
        }
    };

    for cap in regex_lite(corpus) {
        push(cap);
    }

    for m in corpus.match_indices("0x") {
        let start = m.0;
        let bytes = corpus.as_bytes();
        let mut j = start + 2;
        while j < corpus.len() {
            let b = bytes[j];
            if (b'A'..=b'F').contains(&b)
                || (b'a'..=b'f').contains(&b)
                || (b'0'..=b'9').contains(&b)
            {
                j += 1;
            } else {
                break;
            }
        }
        if j - start >= 10 {
            push(corpus[start..j].to_string());
        }
    }

    const KEYWORD_MAP: &[(&str, &str)] = &[
        ("bitcoin", "BTC"),
        ("ethereum", "ETH"),
        ("solana", "SOL"),
        ("circle", "CRCL"),
        ("coinbase", "COIN"),
    ];
    let lower = corpus.to_lowercase();
    for (kw, sym) in KEYWORD_MAP {
        if lower.contains(kw) {
            push(sym.to_string());
        }
    }

    out.truncate(12);
    out
}

fn is_noise_symbol(sym: &str) -> bool {
    matches!(
        sym,
        "THE" | "AND" | "FOR" | "YOU" | "ALL" | "NOT" | "BUT" | "USD" | "USA" | "API" | "URL"
    )
}

fn push_discovered_asset(
    assets: &mut Vec<DiscoveredWebAsset>,
    sym: &str,
    via: &str,
    source_url: &str,
) {
    let upper = sym.to_uppercase();
    if is_noise_symbol(&upper) {
        return;
    }
    if assets.iter().any(|a| a.symbol.eq_ignore_ascii_case(&upper)) {
        return;
    }

    let (asset_class, name, url) = if upper.starts_with("0x") {
        (
            "crypto".to_string(),
            format!("Token {}", &upper[..upper.len().min(10)]),
            format!("https://dexscreener.com/search?q={}", upper),
        )
    } else if is_likely_equity_ticker(&upper) && !is_crypto_l1(&upper) {
        (
            "stocks".to_string(),
            upper.clone(),
            format!("https://stocktwits.com/symbol/{}", upper),
        )
    } else {
        (
            "crypto".to_string(),
            upper.clone(),
            format!("https://dexscreener.com/search?q={}", upper),
        )
    };

    assets.push(DiscoveredWebAsset {
        symbol: upper,
        name,
        asset_class,
        source_url: if source_url.is_empty() {
            url.clone()
        } else {
            source_url.to_string()
        },
        via: via.to_string(),
    });
}

fn regex_lite(corpus: &str) -> Vec<String> {
    let mut tickers = Vec::new();
    let bytes = corpus.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        if bytes[i] == b'$' {
            let start = i + 1;
            let mut j = start;
            while j < len {
                let b = bytes[j];
                if b >= b'A' && b <= b'Z' {
                    j += 1;
                } else {
                    break;
                }
            }
            if j > start && j - start <= 5 {
                if let Ok(s) = std::str::from_utf8(&bytes[start..j]) {
                    tickers.push(s.to_string());
                }
            }
            i = j;
        } else {
            i += 1;
        }
    }
    tickers
}

fn build_corroboration_block(evidence: &[WebEvidence], discovered: &[DiscoveredWebAsset]) -> String {
    if evidence.is_empty() && discovered.is_empty() {
        return String::new();
    }
    let mut lines = vec![
        "WEB_CORROBORATION (validate corpus; prioritize non-major / low-cap names when evidence supports them):".to_string(),
    ];

    if !discovered.is_empty() {
        lines.push("\nDISCOVERED_WEB_ASSETS (from corpus + Nimble deep search — include in asset output when relevant):".to_string());
        for a in discovered.iter().take(12) {
            lines.push(format!(
                "- {} ({}) via {} — {}",
                a.symbol, a.asset_class, a.via, a.source_url
            ));
        }
    }

    for (i, e) in evidence.iter().enumerate() {
        lines.push(format!(
            "\n[{}] {} ({}) — {}\nURL: {}\nSnippet:\n{}",
            i + 1,
            e.title,
            e.source_type,
            e.via,
            e.url,
            e.snippet
        ));
    }
    lines.join("\n")
}

fn truncate(s: &str, max: usize) -> String {
    if s.chars().count() <= max {
        return s.to_string();
    }
    s.chars().take(max).collect::<String>() + "…"
}

#[derive(Debug, Deserialize)]
struct NimbleExtractResponse {
    data: Option<NimbleExtractData>,
}

#[derive(Debug, Deserialize)]
struct NimbleExtractData {
    markdown: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SecSubmissions {
    name: Option<String>,
    filings: Option<SecFilings>,
}

#[derive(Debug, Deserialize)]
struct SecFilings {
    recent: Option<SecRecent>,
}

#[derive(Debug, Deserialize)]
struct SecRecent {
    form: Option<Vec<String>>,
    filing_date: Option<Vec<String>>,
    primary_document: Option<Vec<String>>,
    accession_number: Option<Vec<String>>,
}
