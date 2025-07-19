interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

interface StrategyAnalysis {
  strategy: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  timeframe: string;
  expectedReturn: string;
  keyMetrics: string[];
  implementation: string[];
  warnings: string[];
}

class GeminiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async generateStrategy(userInput: string): Promise<string> {
    const prompt = `
You are a professional crypto trading strategy advisor with expertise in quantitative finance, technical analysis, and risk management. 

User request: "${userInput}"

Please provide a detailed trading strategy response that includes:

1. **Strategy Overview**: A clear, concise explanation of the recommended approach
2. **Technical Indicators**: Specific indicators to use (RSI, MACD, Bollinger Bands, etc.)
3. **Entry/Exit Rules**: Clear conditions for entering and exiting positions
4. **Risk Management**: Position sizing, stop-loss, and take-profit recommendations
5. **Timeframe**: Recommended trading timeframe (1m, 5m, 1h, 4h, 1d)
6. **Expected Performance**: Realistic expectations for returns and drawdown
7. **Implementation Tips**: Practical advice for executing the strategy

Keep the response engaging, practical, and educational. Use emojis sparingly for readability. Focus on actionable advice that can be implemented in a crypto trading environment.

Format your response in a conversational but professional tone, as if you're a helpful trading mentor.
    `;

    try {
      console.log('Making API request to Gemini...');
      
      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('API Response:', data);
      
      if (data.error) {
        throw new Error(`Gemini API Error: ${data.error.message} (Code: ${data.error.code})`);
      }
      
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('No valid response from API:', data);
        throw new Error('No response generated from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Return a comprehensive fallback strategy based on user input
      const fallbackStrategy = this.generateFallbackStrategy(userInput);
      console.log('Using fallback strategy due to API error');
      return fallbackStrategy;
    }
  }

  private generateFallbackStrategy(userInput: string): string {
    const input = userInput.toLowerCase();
    
    // Determine strategy type based on input keywords
    if (input.includes('momentum') || input.includes('trend')) {
      return `
**Momentum Trading Strategy**

Based on your request: "${userInput}"

**Strategy Overview:**
This momentum strategy focuses on capturing price movements in the direction of the prevailing trend. Perfect for volatile crypto markets where strong trends can provide excellent profit opportunities.

**Technical Indicators:**
- RSI (14-period): Identify overbought/oversold conditions
- MACD (12,26,9): Confirm momentum shifts
- Moving Averages: 20-EMA and 50-EMA for trend direction
- Volume indicator: Confirm breakouts

**Entry Rules:**
- Long: RSI > 50, MACD bullish crossover, price above 20-EMA
- Short: RSI < 50, MACD bearish crossover, price below 20-EMA
- Volume confirmation: 20% above average volume

**Exit Rules:**
- Take Profit: 8-15% gain (depending on volatility)
- Stop Loss: 3-5% below entry
- Trailing stop: Move stop to breakeven after 5% profit

**Risk Management:**
- Position size: 2-3% of portfolio per trade
- Max 3 positions simultaneously
- Risk-reward ratio: Minimum 1:2

**Timeframe:** 1-4 hour charts for optimal signals

**Expected Performance:**
- Win rate: 45-60%
- Monthly target: 8-20%
- Max drawdown: <15%

**Implementation Tips:**
1. Wait for clear trend confirmation before entering
2. Use multiple timeframe analysis
3. Never risk more than 1% per trade
4. Practice on paper trading first

*Note: This is a fallback strategy as the AI service is currently unavailable.*
      `;
    } else if (input.includes('dca') || input.includes('dollar cost')) {
      return `
**Dollar Cost Averaging (DCA) Strategy**

Based on your request: "${userInput}"

**Strategy Overview:**
A systematic approach to building crypto positions over time, reducing the impact of volatility through regular, scheduled purchases regardless of price.

**Technical Setup:**
- RSI (14): Enhance entry timing
- Support/Resistance levels: Identify optimal zones
- Volume analysis: Confirm accumulation phases

**DCA Rules:**
- Regular interval: Weekly or bi-weekly purchases
- Fixed amount: Same dollar amount each period
- Enhanced entries: Increase purchase size when RSI < 30
- Reduced entries: Decrease size when RSI > 70

**Risk Management:**
- Total allocation: 10-20% of portfolio
- Time horizon: 6-12 months minimum
- Exit strategy: Partial profits at resistance levels
- Stop loss: Only for major trend breaks (-30%)

**Implementation:**
1. Choose strong assets (BTC, ETH, SOL)
2. Set automated purchases
3. Track average cost basis
4. Take profits in phases during bull runs

**Expected Performance:**
- Volatility reduction: 30-50%
- Annual target: 15-40%
- Drawdown management: Significant improvement

*Note: This is a fallback strategy as the AI service is currently unavailable.*
      `;
    } else {
      return `
**Custom Trading Strategy**

Based on your request: "${userInput}"

**Strategy Overview:**
A balanced approach combining technical analysis with risk management principles, suitable for various market conditions in the crypto space.

**Technical Indicators:**
- RSI (14): Momentum and reversal signals
- Bollinger Bands (20,2): Volatility and price extremes
- EMA (21,50): Trend direction and dynamic support/resistance
- MACD (12,26,9): Momentum confirmation

**Entry Conditions:**
- Long: Price bounces from lower Bollinger Band + RSI < 35 + MACD showing bullish divergence
- Short: Price rejected at upper Bollinger Band + RSI > 65 + MACD bearish divergence

**Exit Strategy:**
- Take Profit: Opposite Bollinger Band or 10-15% gain
- Stop Loss: 4% from entry point
- Partial profits: Scale out 50% at 7% gain

**Position Sizing:**
- Risk per trade: 1-2% of portfolio
- Position size calculation: (Account Size × Risk%) ÷ Stop Distance
- Maximum positions: 3-4 simultaneously

**Timeframe Recommendations:**
- Primary: 4-hour charts for signals
- Confirmation: Daily chart for trend
- Entry timing: 1-hour chart for precision

**Expected Results:**
- Win rate: 50-65%
- Average R:R ratio: 1:2.5
- Monthly target: 10-25%
- Maximum drawdown: <12%

**Key Rules:**
1. Never enter without confirmation from multiple indicators
2. Always define risk before entering
3. Trail stops in profitable trades
4. Review and adjust based on market conditions

*Note: This is a fallback strategy as the AI service is currently unavailable.*
      `;
    }
  }

  async analyzeStrategy(strategyText: string): Promise<StrategyAnalysis> {
    const prompt = `
Analyze the following trading strategy and provide a structured analysis:

Strategy: "${strategyText}"

Please respond with a JSON object containing:
{
  "strategy": "Brief strategy name/type",
  "riskLevel": "Low/Medium/High",
  "timeframe": "Recommended timeframe",
  "expectedReturn": "Expected return range",
  "keyMetrics": ["metric1", "metric2", "metric3"],
  "implementation": ["step1", "step2", "step3"],
  "warnings": ["warning1", "warning2"]
}

Ensure the response is valid JSON.
    `;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const responseText = data.candidates[0].content.parts[0].text;
        // Extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      throw new Error('No valid analysis generated');
    } catch (error) {
      console.error('Error analyzing strategy:', error);
      // Return default analysis if API fails
      return {
        strategy: "Custom Strategy",
        riskLevel: "Medium",
        timeframe: "1h",
        expectedReturn: "5-15% monthly",
        keyMetrics: ["Sharpe Ratio", "Win Rate", "Max Drawdown"],
        implementation: ["Set up indicators", "Define entry rules", "Implement risk management"],
        warnings: ["Past performance doesn't guarantee future results", "Always use proper risk management"]
      };
    }
  }

  async generateBacktestCode(strategy: string): Promise<string> {
    const prompt = `
Generate Python backtesting code for the following trading strategy:

Strategy: "${strategy}"

Please provide a complete Python script using backtesting.py library that includes:

1. Import statements
2. Strategy class definition with buy/sell logic
3. Data loading and preprocessing
4. Backtest execution
5. Results analysis and visualization

Make the code production-ready and well-commented. Include realistic parameters and proper error handling.

Format the response as a code block.
    `;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No code generated');
      }
    } catch (error) {
      console.error('Error generating backtest code:', error);
      throw new Error('Failed to generate backtest code. Please try again.');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('=== GEMINI API DEBUG TEST ===');
      console.log('API Key (first 10 chars):', this.apiKey.substring(0, 10) + '...');
      console.log('Base URL:', this.baseUrl);
      
      const testPrompt = "Say 'Hello, API test successful!' if you can read this message.";
      
      const requestBody = {
        contents: [{
          parts: [{ text: testPrompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        }
      };

      console.log('Request URL:', `${this.baseUrl}?key=${this.apiKey.substring(0, 10)}...`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('=== RESPONSE DEBUG ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('=== API ERROR ===');
        console.error('Status:', response.status);
        console.error('Response:', responseText);
        
        // Parse error details
        try {
          const errorData = JSON.parse(responseText);
          console.error('Parsed error:', errorData);
          if (errorData.error) {
            console.error('Error message:', errorData.error.message);
            console.error('Error code:', errorData.error.code);
          }
        } catch (parseError) {
          console.error('Could not parse error response as JSON');
        }
        
        return false;
      }

      // Parse successful response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('=== SUCCESSFUL RESPONSE ===');
        console.log('Parsed response:', data);
      } catch (parseError) {
        console.error('Could not parse successful response as JSON:', parseError);
        return false;
      }
      
      if (data.error) {
        console.error('API returned error:', data.error);
        return false;
      }
      
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
        console.log('✅ SUCCESS! API response:', data.candidates[0].content.parts[0].text);
        return true;
      } else {
        console.error('❌ No valid content in response');
        console.error('Candidates:', data.candidates);
        return false;
      }
      
    } catch (error) {
      console.error('=== CONNECTION ERROR ===');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('This is likely a CORS or network connectivity issue');
        console.error('Possible causes:');
        console.error('1. CORS policy blocking the request');
        console.error('2. Network connectivity issues');
        console.error('3. API endpoint is down');
      }
      
      return false;
    }
  }
}

export default new GeminiService();
export type { StrategyAnalysis }; 