use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use crate::agent_framework::{MarketRegime, AgentState};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskManagementSystem {
    pub portfolio_optimizer: PortfolioOptimizer,
    pub risk_models: Vec<RiskModel>,
    pub stress_tester: StressTester,
    pub position_sizer: PositionSizer,
    pub drawdown_controller: DrawdownController,
    pub regime_detector: RegimeDetector,
    pub risk_metrics: RiskMetrics,
    pub alerts: Vec<RiskAlert>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortfolioOptimizer {
    pub optimization_method: OptimizationMethod,
    pub constraints: Vec<PortfolioConstraint>,
    pub objective_function: ObjectiveFunction,
    pub rebalancing_frequency: RebalancingFrequency,
    pub transaction_costs: TransactionCosts,
    pub optimization_history: Vec<OptimizationResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OptimizationMethod {
    MeanVariance,
    BlackLitterman,
    RiskParity,
    MaximumDiversification,
    MinimumVariance,
    HierarchicalRiskParity,
    RobustOptimization,
    BayesianOptimization,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortfolioConstraint {
    pub constraint_type: ConstraintType,
    pub value: f64,
    pub assets: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConstraintType {
    MaxWeight,
    MinWeight,
    MaxSectorExposure,
    MaxCorrelation,
    MaxTurnover,
    MaxLeverage,
    MinDiversification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectiveFunction {
    pub primary_objective: Objective,
    pub secondary_objectives: Vec<(Objective, f64)>, // (objective, weight)
    pub risk_aversion: f64,
    pub return_target: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Objective {
    MaximizeReturn,
    MinimizeRisk,
    MaximizeSharpe,
    MaximizeUtility,
    MinimizeTrackingError,
    MaximizeInformationRatio,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RebalancingFrequency {
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Threshold(f64), // Rebalance when drift exceeds threshold
    Adaptive,       // Based on market conditions
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionCosts {
    pub fixed_cost: f64,
    pub proportional_cost: f64,
    pub market_impact: MarketImpactModel,
    pub bid_ask_spread: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MarketImpactModel {
    Linear { coefficient: f64 },
    SquareRoot { coefficient: f64 },
    Almgren { temporary: f64, permanent: f64 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationResult {
    pub timestamp: DateTime<Utc>,
    pub weights: HashMap<String, f64>,
    pub expected_return: f64,
    pub expected_risk: f64,
    pub sharpe_ratio: f64,
    pub turnover: f64,
    pub transaction_costs: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskModel {
    pub model_type: RiskModelType,
    pub factors: Vec<RiskFactor>,
    pub covariance_matrix: HashMap<String, HashMap<String, f64>>,
    pub specific_risks: HashMap<String, f64>,
    pub model_confidence: f64,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskModelType {
    FactorModel,
    HistoricalSimulation,
    MonteCarloSimulation,
    GARCH,
    DCC_GARCH,
    CopulaModel,
    RegimeSwitching,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub name: String,
    pub factor_type: FactorType,
    pub exposures: HashMap<String, f64>,
    pub volatility: f64,
    pub half_life: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FactorType {
    Market,
    Size,
    Value,
    Momentum,
    Quality,
    LowVolatility,
    Sector,
    Country,
    Currency,
    Commodity,
    MacroEconomic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StressTester {
    pub stress_scenarios: Vec<StressScenario>,
    pub historical_scenarios: Vec<HistoricalScenario>,
    pub monte_carlo_config: MonteCarloConfig,
    pub stress_results: Vec<StressTestResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StressScenario {
    pub name: String,
    pub description: String,
    pub factor_shocks: HashMap<String, f64>,
    pub correlation_changes: HashMap<String, HashMap<String, f64>>,
    pub probability: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoricalScenario {
    pub name: String,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub description: String,
    pub severity: ScenarioSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScenarioSeverity {
    Mild,
    Moderate,
    Severe,
    Extreme,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonteCarloConfig {
    pub num_simulations: u32,
    pub time_horizon: u32,
    pub confidence_levels: Vec<f64>,
    pub random_seed: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StressTestResult {
    pub scenario_name: String,
    pub portfolio_pnl: f64,
    pub var_impact: f64,
    pub max_drawdown: f64,
    pub time_to_recovery: Option<u32>,
    pub factor_contributions: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionSizer {
    pub sizing_method: SizingMethod,
    pub risk_budget: f64,
    pub max_position_size: f64,
    pub correlation_adjustment: bool,
    pub volatility_scaling: bool,
    pub kelly_fraction: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SizingMethod {
    FixedFractional,
    VolatilityTargeting,
    KellyCriterion,
    OptimalF,
    RiskParity,
    EqualWeight,
    InverseVolatility,
    MaximumDiversification,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DrawdownController {
    pub max_drawdown_limit: f64,
    pub current_drawdown: f64,
    pub peak_value: f64,
    pub drawdown_history: Vec<DrawdownEvent>,
    pub recovery_strategy: RecoveryStrategy,
    pub position_scaling: PositionScaling,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DrawdownEvent {
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
    pub peak_value: f64,
    pub trough_value: f64,
    pub max_drawdown: f64,
    pub duration: Option<u32>,
    pub recovery_time: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecoveryStrategy {
    ReduceRisk,
    DiversifyMore,
    SwitchStrategy,
    PauseTrading,
    GradualIncrease,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionScaling {
    pub scaling_factor: f64,
    pub min_scaling: f64,
    pub max_scaling: f64,
    pub scaling_speed: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegimeDetector {
    pub detection_methods: Vec<DetectionMethod>,
    pub current_regime: MarketRegime,
    pub regime_probabilities: HashMap<MarketRegime, f64>,
    pub regime_history: Vec<RegimeChange>,
    pub regime_indicators: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DetectionMethod {
    HiddenMarkovModel,
    ThresholdModel,
    MarkovSwitching,
    ChangePointDetection,
    MachineLearning,
    TechnicalIndicators,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegimeChange {
    pub timestamp: DateTime<Utc>,
    pub from_regime: MarketRegime,
    pub to_regime: MarketRegime,
    pub confidence: f64,
    pub trigger_indicators: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskMetrics {
    pub var_95: f64,
    pub var_99: f64,
    pub cvar_95: f64,
    pub cvar_99: f64,
    pub expected_shortfall: f64,
    pub maximum_drawdown: f64,
    pub volatility: f64,
    pub sharpe_ratio: f64,
    pub sortino_ratio: f64,
    pub calmar_ratio: f64,
    pub tail_ratio: f64,
    pub skewness: f64,
    pub kurtosis: f64,
    pub beta: f64,
    pub tracking_error: f64,
    pub information_ratio: f64,
    pub treynor_ratio: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAlert {
    pub alert_type: AlertType,
    pub severity: AlertSeverity,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub affected_positions: Vec<String>,
    pub recommended_action: String,
    pub auto_execute: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertType {
    VaRBreach,
    DrawdownLimit,
    ConcentrationRisk,
    LiquidityRisk,
    CorrelationSpike,
    VolatilitySpike,
    RegimeChange,
    ModelDrift,
    PositionLimit,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AlertSeverity {
    Low,
    Medium,
    High,
    Critical,
}

impl RiskManagementSystem {
    pub fn new() -> Self {
        RiskManagementSystem {
            portfolio_optimizer: PortfolioOptimizer::new(),
            risk_models: vec![RiskModel::new()],
            stress_tester: StressTester::new(),
            position_sizer: PositionSizer::new(),
            drawdown_controller: DrawdownController::new(),
            regime_detector: RegimeDetector::new(),
            risk_metrics: RiskMetrics::default(),
            alerts: Vec::new(),
        }
    }

    pub async fn assess_portfolio_risk(&mut self, portfolio: &Portfolio) -> Result<RiskAssessment, Box<dyn std::error::Error>> {
        // 1. Update risk models
        self.update_risk_models(portfolio).await?;

        // 2. Calculate risk metrics
        let risk_metrics = self.calculate_risk_metrics(portfolio).await?;

        // 3. Run stress tests
        let stress_results = self.stress_tester.run_stress_tests(portfolio).await?;

        // 4. Detect regime changes
        let regime_analysis = self.regime_detector.analyze_regime().await?;

        // 5. Check risk limits
        let limit_breaches = self.check_risk_limits(&risk_metrics).await?;

        // 6. Generate alerts
        self.generate_risk_alerts(&risk_metrics, &stress_results, &limit_breaches).await?;

        Ok(RiskAssessment {
            risk_metrics,
            stress_results,
            regime_analysis,
            limit_breaches,
            overall_risk_score: self.calculate_overall_risk_score(),
            recommendations: self.generate_recommendations(),
        })
    }

    pub async fn optimize_portfolio(&mut self, current_portfolio: &Portfolio, expected_returns: &HashMap<String, f64>) -> Result<OptimizationResult, Box<dyn std::error::Error>> {
        // 1. Prepare optimization inputs
        let covariance_matrix = self.get_covariance_matrix();
        let constraints = self.portfolio_optimizer.constraints.clone();

        // 2. Run optimization
        let optimal_weights = self.portfolio_optimizer.optimize(
            expected_returns,
            &covariance_matrix,
            &constraints,
        ).await?;

        // 3. Calculate expected metrics
        let expected_return = self.calculate_expected_return(&optimal_weights, expected_returns);
        let expected_risk = self.calculate_expected_risk(&optimal_weights, &covariance_matrix);
        let turnover = self.calculate_turnover(current_portfolio, &optimal_weights);

        let result = OptimizationResult {
            timestamp: Utc::now(),
            weights: optimal_weights,
            expected_return,
            expected_risk,
            sharpe_ratio: if expected_risk > 0.0 { expected_return / expected_risk } else { 0.0 },
            turnover,
            transaction_costs: self.calculate_transaction_costs(turnover),
        };

        self.portfolio_optimizer.optimization_history.push(result.clone());
        Ok(result)
    }

    pub async fn size_position(&self, signal_strength: f64, asset: &str, current_portfolio: &Portfolio) -> Result<f64, Box<dyn std::error::Error>> {
        let position_size = match self.position_sizer.sizing_method {
            SizingMethod::FixedFractional => {
                self.position_sizer.risk_budget * signal_strength
            },
            SizingMethod::VolatilityTargeting => {
                let asset_volatility = self.get_asset_volatility(asset).await?;
                let target_volatility = 0.15; // 15% target volatility
                (target_volatility / asset_volatility) * signal_strength
            },
            SizingMethod::KellyCriterion => {
                if let Some(kelly_fraction) = self.position_sizer.kelly_fraction {
                    kelly_fraction * signal_strength
                } else {
                    self.calculate_kelly_fraction(asset, signal_strength).await?
                }
            },
            _ => self.position_sizer.risk_budget * signal_strength,
        };

        // Apply position limits
        let max_position = self.position_sizer.max_position_size;
        let final_size = position_size.min(max_position).max(-max_position);

        // Apply drawdown scaling
        let scaling_factor = self.drawdown_controller.position_scaling.scaling_factor;
        Ok(final_size * scaling_factor)
    }

    async fn update_risk_models(&mut self, portfolio: &Portfolio) -> Result<(), Box<dyn std::error::Error>> {
        for risk_model in &mut self.risk_models {
            risk_model.update(portfolio).await?;
        }
        Ok(())
    }

    async fn calculate_risk_metrics(&self, portfolio: &Portfolio) -> Result<RiskMetrics, Box<dyn std::error::Error>> {
        let returns = portfolio.get_historical_returns();
        
        Ok(RiskMetrics {
            var_95: self.calculate_var(&returns, 0.95),
            var_99: self.calculate_var(&returns, 0.99),
            cvar_95: self.calculate_cvar(&returns, 0.95),
            cvar_99: self.calculate_cvar(&returns, 0.99),
            expected_shortfall: self.calculate_expected_shortfall(&returns),
            maximum_drawdown: self.calculate_maximum_drawdown(&returns),
            volatility: self.calculate_volatility(&returns),
            sharpe_ratio: self.calculate_sharpe_ratio(&returns),
            sortino_ratio: self.calculate_sortino_ratio(&returns),
            calmar_ratio: self.calculate_calmar_ratio(&returns),
            tail_ratio: self.calculate_tail_ratio(&returns),
            skewness: self.calculate_skewness(&returns),
            kurtosis: self.calculate_kurtosis(&returns),
            beta: self.calculate_beta(&returns),
            tracking_error: self.calculate_tracking_error(&returns),
            information_ratio: self.calculate_information_ratio(&returns),
            treynor_ratio: self.calculate_treynor_ratio(&returns),
        })
    }

    fn calculate_var(&self, returns: &[f64], confidence: f64) -> f64 {
        if returns.is_empty() {
            return 0.0;
        }
        
        let mut sorted_returns = returns.to_vec();
        sorted_returns.sort_by(|a, b| a.partial_cmp(b).unwrap());
        
        let index = ((1.0 - confidence) * returns.len() as f64) as usize;
        sorted_returns[index.min(returns.len() - 1)]
    }

    fn calculate_cvar(&self, returns: &[f64], confidence: f64) -> f64 {
        if returns.is_empty() {
            return 0.0;
        }
        
        let var = self.calculate_var(returns, confidence);
        let tail_returns: Vec<f64> = returns.iter()
            .filter(|&&r| r <= var)
            .cloned()
            .collect();
        
        if tail_returns.is_empty() {
            var
        } else {
            tail_returns.iter().sum::<f64>() / tail_returns.len() as f64
        }
    }

    fn calculate_expected_shortfall(&self, returns: &[f64]) -> f64 {
        self.calculate_cvar(returns, 0.95)
    }

    fn calculate_maximum_drawdown(&self, returns: &[f64]) -> f64 {
        if returns.is_empty() {
            return 0.0;
        }

        let mut cumulative = 1.0;
        let mut peak = 1.0;
        let mut max_dd = 0.0;

        for &ret in returns {
            cumulative *= 1.0 + ret;
            if cumulative > peak {
                peak = cumulative;
            }
            let drawdown = (peak - cumulative) / peak;
            if drawdown > max_dd {
                max_dd = drawdown;
            }
        }

        max_dd
    }

    fn calculate_volatility(&self, returns: &[f64]) -> f64 {
        if returns.len() < 2 {
            return 0.0;
        }

        let mean = returns.iter().sum::<f64>() / returns.len() as f64;
        let variance = returns.iter()
            .map(|r| (r - mean).powi(2))
            .sum::<f64>() / (returns.len() - 1) as f64;
        
        variance.sqrt()
    }

    fn calculate_sharpe_ratio(&self, returns: &[f64]) -> f64 {
        if returns.is_empty() {
            return 0.0;
        }

        let mean_return = returns.iter().sum::<f64>() / returns.len() as f64;
        let volatility = self.calculate_volatility(returns);
        
        if volatility == 0.0 { 0.0 } else { mean_return / volatility }
    }

    fn calculate_sortino_ratio(&self, returns: &[f64]) -> f64 {
        if returns.is_empty() {
            return 0.0;
        }

        let mean_return = returns.iter().sum::<f64>() / returns.len() as f64;
        let downside_returns: Vec<f64> = returns.iter()
            .filter(|&&r| r < 0.0)
            .cloned()
            .collect();
        
        if downside_returns.is_empty() {
            return f64::INFINITY;
        }

        let downside_deviation = self.calculate_volatility(&downside_returns);
        if downside_deviation == 0.0 { 0.0 } else { mean_return / downside_deviation }
    }

    fn calculate_calmar_ratio(&self, returns: &[f64]) -> f64 {
        let mean_return = returns.iter().sum::<f64>() / returns.len() as f64;
        let max_drawdown = self.calculate_maximum_drawdown(returns);
        
        if max_drawdown == 0.0 { 0.0 } else { mean_return / max_drawdown }
    }

    fn calculate_tail_ratio(&self, returns: &[f64]) -> f64 {
        let percentile_95 = self.calculate_percentile(returns, 0.95);
        let percentile_5 = self.calculate_percentile(returns, 0.05);
        
        if percentile_5 == 0.0 { 0.0 } else { percentile_95 / percentile_5.abs() }
    }

    fn calculate_percentile(&self, returns: &[f64], percentile: f64) -> f64 {
        if returns.is_empty() {
            return 0.0;
        }
        
        let mut sorted_returns = returns.to_vec();
        sorted_returns.sort_by(|a, b| a.partial_cmp(b).unwrap());
        
        let index = (percentile * (returns.len() - 1) as f64) as usize;
        sorted_returns[index.min(returns.len() - 1)]
    }

    fn calculate_skewness(&self, returns: &[f64]) -> f64 {
        if returns.len() < 3 {
            return 0.0;
        }

        let mean = returns.iter().sum::<f64>() / returns.len() as f64;
        let variance = returns.iter()
            .map(|r| (r - mean).powi(2))
            .sum::<f64>() / returns.len() as f64;
        let std_dev = variance.sqrt();

        if std_dev == 0.0 {
            return 0.0;
        }

        let skewness = returns.iter()
            .map(|r| ((r - mean) / std_dev).powi(3))
            .sum::<f64>() / returns.len() as f64;

        skewness
    }

    fn calculate_kurtosis(&self, returns: &[f64]) -> f64 {
        if returns.len() < 4 {
            return 0.0;
        }

        let mean = returns.iter().sum::<f64>() / returns.len() as f64;
        let variance = returns.iter()
            .map(|r| (r - mean).powi(2))
            .sum::<f64>() / returns.len() as f64;
        let std_dev = variance.sqrt();

        if std_dev == 0.0 {
            return 0.0;
        }

        let kurtosis = returns.iter()
            .map(|r| ((r - mean) / std_dev).powi(4))
            .sum::<f64>() / returns.len() as f64;

        kurtosis - 3.0 // Excess kurtosis
    }

    fn calculate_beta(&self, returns: &[f64]) -> f64 {
        // Placeholder - would calculate beta vs market benchmark
        1.0
    }

    fn calculate_tracking_error(&self, returns: &[f64]) -> f64 {
        // Placeholder - would calculate tracking error vs benchmark
        self.calculate_volatility(returns)
    }

    fn calculate_information_ratio(&self, returns: &[f64]) -> f64 {
        // Placeholder - would calculate information ratio vs benchmark
        self.calculate_sharpe_ratio(returns)
    }

    fn calculate_treynor_ratio(&self, returns: &[f64]) -> f64 {
        let mean_return = returns.iter().sum::<f64>() / returns.len() as f64;
        let beta = self.calculate_beta(returns);
        
        if beta == 0.0 { 0.0 } else { mean_return / beta }
    }

    async fn check_risk_limits(&self, risk_metrics: &RiskMetrics) -> Result<Vec<LimitBreach>, Box<dyn std::error::Error>> {
        let mut breaches = Vec::new();

        // Check VaR limits
        if risk_metrics.var_95 < -0.05 { // 5% daily VaR limit
            breaches.push(LimitBreach {
                limit_type: "VaR_95".to_string(),
                current_value: risk_metrics.var_95,
                limit_value: -0.05,
                severity: if risk_metrics.var_95 < -0.10 { AlertSeverity::Critical } else { AlertSeverity::High },
            });
        }

        // Check drawdown limits
        if risk_metrics.maximum_drawdown > self.drawdown_controller.max_drawdown_limit {
            breaches.push(LimitBreach {
                limit_type: "MaxDrawdown".to_string(),
                current_value: risk_metrics.maximum_drawdown,
                limit_value: self.drawdown_controller.max_drawdown_limit,
                severity: AlertSeverity::Critical,
            });
        }

        Ok(breaches)
    }

    async fn generate_risk_alerts(&mut self, risk_metrics: &RiskMetrics, stress_results: &[StressTestResult], limit_breaches: &[LimitBreach]) -> Result<(), Box<dyn std::error::Error>> {
        // Generate alerts based on risk metrics and limit breaches
        for breach in limit_breaches {
            let alert = RiskAlert {
                alert_type: match breach.limit_type.as_str() {
                    "VaR_95" => AlertType::VaRBreach,
                    "MaxDrawdown" => AlertType::DrawdownLimit,
                    _ => AlertType::PositionLimit,
                },
                severity: breach.severity.clone(),
                message: format!("{} limit breached: {} vs limit {}", 
                    breach.limit_type, breach.current_value, breach.limit_value),
                timestamp: Utc::now(),
                affected_positions: Vec::new(), // Would be populated with actual positions
                recommended_action: self.get_recommended_action(&breach.limit_type),
                auto_execute: breach.severity == AlertSeverity::Critical,
            };
            self.alerts.push(alert);
        }

        Ok(())
    }

    fn get_recommended_action(&self, limit_type: &str) -> String {
        match limit_type {
            "VaR_95" => "Reduce position sizes or hedge exposure".to_string(),
            "MaxDrawdown" => "Implement stop-loss or reduce risk".to_string(),
            _ => "Review and adjust positions".to_string(),
        }
    }

    fn calculate_overall_risk_score(&self) -> f64 {
        // Combine various risk metrics into overall score
        let var_score = (self.risk_metrics.var_95.abs() * 10.0).min(10.0);
        let drawdown_score = (self.risk_metrics.maximum_drawdown * 10.0).min(10.0);
        let volatility_score = (self.risk_metrics.volatility * 5.0).min(10.0);
        
        (var_score + drawdown_score + volatility_score) / 3.0
    }

    fn generate_recommendations(&self) -> Vec<String> {
        let mut recommendations = Vec::new();
        
        if self.risk_metrics.var_95 < -0.03 {
            recommendations.push("Consider reducing position sizes".to_string());
        }
        
        if self.risk_metrics.maximum_drawdown > 0.15 {
            recommendations.push("Implement stricter stop-loss rules".to_string());
        }
        
        if self.risk_metrics.sharpe_ratio < 1.0 {
            recommendations.push("Review strategy performance and consider optimization".to_string());
        }
        
        recommendations
    }

    fn get_covariance_matrix(&self) -> HashMap<String, HashMap<String, f64>> {
        // Return covariance matrix from risk models
        if let Some(risk_model) = self.risk_models.first() {
            risk_model.covariance_matrix.clone()
        } else {
            HashMap::new()
        }
    }

    fn calculate_expected_return(&self, weights: &HashMap<String, f64>, expected_returns: &HashMap<String, f64>) -> f64 {
        weights.iter()
            .map(|(asset, &weight)| {
                weight * expected_returns.get(asset).unwrap_or(&0.0)
            })
            .sum()
    }

    fn calculate_expected_risk(&self, weights: &HashMap<String, f64>, covariance_matrix: &HashMap<String, HashMap<String, f64>>) -> f64 {
        let mut risk = 0.0;
        
        for (asset1, &weight1) in weights {
            for (asset2, &weight2) in weights {
                if let Some(row) = covariance_matrix.get(asset1) {
                    if let Some(&covariance) = row.get(asset2) {
                        risk += weight1 * weight2 * covariance;
                    }
                }
            }
        }
        
        risk.sqrt()
    }

    fn calculate_turnover(&self, current_portfolio: &Portfolio, new_weights: &HashMap<String, f64>) -> f64 {
        let current_weights = current_portfolio.get_weights();
        
        new_weights.iter()
            .map(|(asset, &new_weight)| {
                let current_weight = current_weights.get(asset).unwrap_or(&0.0);
                (new_weight - current_weight).abs()
            })
            .sum::<f64>() / 2.0
    }

    fn calculate_transaction_costs(&self, turnover: f64) -> f64 {
        let costs = &self.portfolio_optimizer.transaction_costs;
        costs.fixed_cost + costs.proportional_cost * turnover
    }

    async fn get_asset_volatility(&self, asset: &str) -> Result<f64, Box<dyn std::error::Error>> {
        // Get asset volatility from risk models
        if let Some(risk_model) = self.risk_models.first() {
            Ok(risk_model.specific_risks.get(asset).unwrap_or(&0.15).clone())
        } else {
            Ok(0.15) // Default 15% volatility
        }
    }

    async fn calculate_kelly_fraction(&self, asset: &str, signal_strength: f64) -> Result<f64, Box<dyn std::error::Error>> {
        // Calculate Kelly fraction based on expected return and volatility
        let expected_return = signal_strength * 0.1; // Assume 10% base expected return
        let volatility = self.get_asset_volatility(asset).await?;
        
        if volatility == 0.0 {
            Ok(0.0)
        } else {
            Ok((expected_return / (volatility * volatility)).min(0.25)) // Cap at 25%
        }
    }
}

// Additional structs for the risk management system
#[derive(Debug, Clone)]
pub struct Portfolio {
    pub positions: HashMap<String, f64>,
    pub cash: f64,
    pub total_value: f64,
    pub historical_values: Vec<f64>,
}

impl Portfolio {
    pub fn get_weights(&self) -> HashMap<String, f64> {
        self.positions.iter()
            .map(|(asset, &position)| (asset.clone(), position / self.total_value))
            .collect()
    }

    pub fn get_historical_returns(&self) -> Vec<f64> {
        if self.historical_values.len() < 2 {
            return Vec::new();
        }

        self.historical_values.windows(2)
            .map(|window| (window[1] - window[0]) / window[0])
            .collect()
    }
}

#[derive(Debug, Clone)]
pub struct RiskAssessment {
    pub risk_metrics: RiskMetrics,
    pub stress_results: Vec<StressTestResult>,
    pub regime_analysis: RegimeAnalysis,
    pub limit_breaches: Vec<LimitBreach>,
    pub overall_risk_score: f64,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct RegimeAnalysis {
    pub current_regime: MarketRegime,
    pub regime_probabilities: HashMap<MarketRegime, f64>,
    pub regime_stability: f64,
    pub expected_regime_duration: f64,
}

#[derive(Debug, Clone)]
pub struct LimitBreach {
    pub limit_type: String,
    pub current_value: f64,
    pub limit_value: f64,
    pub severity: AlertSeverity,
}

// Implement default and new methods for various structs
impl Default for RiskMetrics {
    fn default() -> Self {
        RiskMetrics {
            var_95: 0.0,
            var_99: 0.0,
            cvar_95: 0.0,
            cvar_99: 0.0,
            expected_shortfall: 0.0,
            maximum_drawdown: 0.0,
            volatility: 0.0,
            sharpe_ratio: 0.0,
            sortino_ratio: 0.0,
            calmar_ratio: 0.0,
            tail_ratio: 0.0,
            skewness: 0.0,
            kurtosis: 0.0,
            beta: 1.0,
            tracking_error: 0.0,
            information_ratio: 0.0,
            treynor_ratio: 0.0,
        }
    }
}

impl PortfolioOptimizer {
    pub fn new() -> Self {
        PortfolioOptimizer {
            optimization_method: OptimizationMethod::MeanVariance,
            constraints: Vec::new(),
            objective_function: ObjectiveFunction {
                primary_objective: Objective::MaximizeSharpe,
                secondary_objectives: Vec::new(),
                risk_aversion: 1.0,
                return_target: None,
            },
            rebalancing_frequency: RebalancingFrequency::Monthly,
            transaction_costs: TransactionCosts {
                fixed_cost: 0.0,
                proportional_cost: 0.001,
                market_impact: MarketImpactModel::Linear { coefficient: 0.1 },
                bid_ask_spread: 0.001,
            },
            optimization_history: Vec::new(),
        }
    }

    pub async fn optimize(&mut self, expected_returns: &HashMap<String, f64>, covariance_matrix: &HashMap<String, HashMap<String, f64>>, constraints: &[PortfolioConstraint]) -> Result<HashMap<String, f64>, Box<dyn std::error::Error>> {
        // Placeholder optimization implementation
        // In practice, this would use numerical optimization libraries
        let mut weights = HashMap::new();
        let num_assets = expected_returns.len();
        let equal_weight = 1.0 / num_assets as f64;
        
        for asset in expected_returns.keys() {
            weights.insert(asset.clone(), equal_weight);
        }
        
        Ok(weights)
    }
}

impl RiskModel {
    pub fn new() -> Self {
        RiskModel {
            model_type: RiskModelType::FactorModel,
            factors: Vec::new(),
            covariance_matrix: HashMap::new(),
            specific_risks: HashMap::new(),
            model_confidence: 0.8,
            last_updated: Utc::now(),
        }
    }

    pub async fn update(&mut self, portfolio: &Portfolio) -> Result<(), Box<dyn std::error::Error>> {
        // Update risk model with new data
        self.last_updated = Utc::now();
        Ok(())
    }
}

impl StressTester {
    pub fn new() -> Self {
        StressTester {
            stress_scenarios: Self::create_default_scenarios(),
            historical_scenarios: Vec::new(),
            monte_carlo_config: MonteCarloConfig {
                num_simulations: 10000,
                time_horizon: 252, // 1 year
                confidence_levels: vec![0.95, 0.99],
                random_seed: None,
            },
            stress_results: Vec::new(),
        }
    }

    fn create_default_scenarios() -> Vec<StressScenario> {
        vec![
            StressScenario {
                name: "Market Crash".to_string(),
                description: "Severe market downturn".to_string(),
                factor_shocks: [("market".to_string(), -0.30)].iter().cloned().collect(),
                correlation_changes: HashMap::new(),
                probability: 0.05,
            },
            StressScenario {
                name: "Volatility Spike".to_string(),
                description: "Sudden increase in volatility".to_string(),
                factor_shocks: [("volatility".to_string(), 2.0)].iter().cloned().collect(),
                correlation_changes: HashMap::new(),
                probability: 0.10,
            },
        ]
    }

    pub async fn run_stress_tests(&mut self, portfolio: &Portfolio) -> Result<Vec<StressTestResult>, Box<dyn std::error::Error>> {
        let mut results = Vec::new();
        
        for scenario in &self.stress_scenarios {
            let result = self.run_scenario(portfolio, scenario).await?;
            results.push(result);
        }
        
        self.stress_results = results.clone();
        Ok(results)
    }

    async fn run_scenario(&self, portfolio: &Portfolio, scenario: &StressScenario) -> Result<StressTestResult, Box<dyn std::error::Error>> {
        // Placeholder stress test implementation
        Ok(StressTestResult {
            scenario_name: scenario.name.clone(),
            portfolio_pnl: -0.15 * portfolio.total_value, // Assume 15% loss
            var_impact: -0.05,
            max_drawdown: 0.20,
            time_to_recovery: Some(180), // 180 days
            factor_contributions: HashMap::new(),
        })
    }
}

impl PositionSizer {
    pub fn new() -> Self {
        PositionSizer {
            sizing_method: SizingMethod::VolatilityTargeting,
            risk_budget: 0.02, // 2% risk per position
            max_position_size: 0.10, // 10% max position
            correlation_adjustment: true,
            volatility_scaling: true,
            kelly_fraction: None,
        }
    }
}

impl DrawdownController {
    pub fn new() -> Self {
        DrawdownController {
            max_drawdown_limit: 0.20, // 20% max drawdown
            current_drawdown: 0.0,
            peak_value: 0.0,
            drawdown_history: Vec::new(),
            recovery_strategy: RecoveryStrategy::ReduceRisk,
            position_scaling: PositionScaling {
                scaling_factor: 1.0,
                min_scaling: 0.5,
                max_scaling: 1.5,
                scaling_speed: 0.1,
            },
        }
    }
}

impl RegimeDetector {
    pub fn new() -> Self {
        RegimeDetector {
            detection_methods: vec![DetectionMethod::HiddenMarkovModel, DetectionMethod::TechnicalIndicators],
            current_regime: MarketRegime::Trending,
            regime_probabilities: HashMap::new(),
            regime_history: Vec::new(),
            regime_indicators: HashMap::new(),
        }
    }

    pub async fn analyze_regime(&mut self) -> Result<RegimeAnalysis, Box<dyn std::error::Error>> {
        // Placeholder regime analysis
        Ok(RegimeAnalysis {
            current_regime: self.current_regime.clone(),
            regime_probabilities: self.regime_probabilities.clone(),
            regime_stability: 0.8,
            expected_regime_duration: 30.0, // 30 days
        })
    }
} 