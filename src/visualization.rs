/// Module: Interactive visualization of strategy performance.
use crate::backtesting::BacktestResult;

/// Display or visualize backtest results. In a real system, this might generate an HTML report 
/// or open a web dashboard for interactive charts.
pub fn show_backtest(result: &BacktestResult) {
    // For now, just print a summary to the console.
    println!("Backtest completed: {} trades, total return = {:.2}%", 
             result.total_trades, result.total_return * 100.0);
    // In practice, this function could start a web server to display charts,
    // or output a file that can be opened in a browser.
}

pub fn generate_html_report(result: &BacktestResult) -> String {
    format!(
        "<html><body><h1>Backtest Report for {}</h1>
        <p>Total Return: {:.2}%</p>
        <p>Sharpe Ratio: {:.2}</p>
        <p>Max Drawdown: {:.2}%</p>
        <p>Total Trades: {}</p>
        <p>Win Rate: {:.2}%</p>
        </body></html>",
        result.strategy_name,
        result.total_return * 100.0,
        result.sharpe_ratio,
        result.max_drawdown * 100.0,
        result.total_trades,
        result.win_rate * 100.0
    )
}
