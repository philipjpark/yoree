import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Send as SendIcon,
  Restaurant as RestaurantIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  Lightbulb as LightbulbIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import geminiService, { StrategyAnalysis } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: StrategyAnalysis;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`strategy-tabpanel-${index}`}
      aria-labelledby={`strategy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LLMStrategyChef: React.FC = () => {
  // Debug logging
  console.log('🔍 LLMStrategyChef component is rendering!');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Strategy Chef!',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<StrategyAnalysis | null>(null);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [backtestDialogOpen, setBacktestDialogOpen] = useState(false);
  const [backtestCode, setBacktestCode] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Debug state logging
  console.log('🔍 Current state:', {
    messagesCount: messages.length,
    isLoading,
    error,
    apiTestResult,
    tabValue
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Create a momentum-based strategy for SOL/USDC",
    "Design a DCA strategy with technical indicators",
    "Build a mean reversion strategy for volatile altcoins",
    "Develop a breakout strategy for SOL",
    "Create a grid trading strategy for sideways markets",
    "Design a multi-timeframe analysis strategy"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customInput?: string) => {
    const messageContent = customInput || userInput.trim();
    if (!messageContent) return;

    const newMessage: Message = { 
      id: Date.now().toString(),
      role: 'user', 
      content: messageContent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('=== STRATEGY GENERATION REQUEST ===');
      console.log('User input:', messageContent);
      
      // Generate strategy response
      const response = await geminiService.generateStrategy(messageContent);
      console.log('Generated strategy:', response);
      
      // Analyze the strategy
      const analysis = await geminiService.analyzeStrategy(response);
      console.log('Strategy analysis:', analysis);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        analysis: analysis
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setStrategy(analysis);
    } catch (err) {
      console.error('=== STRATEGY GENERATION ERROR ===');
      console.error('Error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      // Provide a fallback strategy for testing
      const fallbackStrategy = `
I apologize, but I'm having trouble connecting to the AI service right now. Here's a basic trading strategy to get you started:

**Simple Moving Average Crossover Strategy**

**Strategy Overview:**
This is a classic trend-following strategy that uses two moving averages to identify entry and exit points.

**Technical Indicators:**
- Short MA: 20-period Simple Moving Average
- Long MA: 50-period Simple Moving Average
- RSI: 14-period for additional confirmation

**Entry Rules:**
- **Buy Signal**: When 20-MA crosses above 50-MA AND RSI > 50
- **Sell Signal**: When 20-MA crosses below 50-MA OR RSI < 30

**Risk Management:**
- Position Size: 2-3% of portfolio per trade
- Stop Loss: 5% below entry price
- Take Profit: 10% above entry price (2:1 risk-reward ratio)

**Timeframe:** 1-hour charts for swing trading

**Expected Performance:**
- Expected win rate: 45-55%
- Risk-reward ratio: 1:2
- Monthly return target: 5-15%

**Implementation Tips:**
1. Always wait for both conditions before entering
2. Use proper position sizing
3. Keep a trading journal
4. Test thoroughly on historical data first

Please note: This is a fallback strategy. The AI service will provide more sophisticated strategies once the connection is restored.

**Error Details:** ${errorMessage}
      `;
      
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fallbackStrategy,
        timestamp: new Date(),
        analysis: {
          strategy: "Simple MA Crossover",
          riskLevel: "Medium",
          timeframe: "1h",
          expectedReturn: "5-15% monthly",
          keyMetrics: ["Win Rate: 45-55%", "Risk-Reward: 1:2", "Max Drawdown: <10%"],
          implementation: [
            "Set up 20-period and 50-period MAs",
            "Add RSI indicator for confirmation", 
            "Define entry/exit rules",
            "Implement stop-loss and take-profit"
          ],
          warnings: [
            "This is a fallback strategy due to API issues",
            "Test thoroughly before live trading",
            "Market conditions can affect performance"
          ]
        }
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setStrategy(fallbackMessage.analysis!);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async (strategy: string) => {
    try {
      setIsLoading(true);
      const code = await geminiService.generateBacktestCode(strategy);
      setBacktestCode(code);
      setBacktestDialogOpen(true);
    } catch (err) {
      setError('Failed to generate backtest code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const testApiConnection = async () => {
    setIsLoading(true);
    setError(null);
    setApiTestResult(null);
    
    try {
      const isWorking = await geminiService.testConnection();
      if (isWorking) {
        setApiTestResult('✅ API connection successful! Gemini is working correctly.');
      } else {
        setApiTestResult('❌ API connection failed. Check console for details.');
      }
    } catch (err) {
      setApiTestResult(`❌ API test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: '20px',
        background: 'white',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* DEBUG: Very Obvious Test Button - Remove after testing */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'red', 
        color: 'white', 
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          🚨 DEBUG MODE: If you can see this red box, the component is working! 🚨
        </Typography>
        <Button
          variant="contained"
          color="warning"
          size="large"
          onClick={() => {
            console.log('🚨 EMERGENCY TEST BUTTON CLICKED!');
            testApiConnection();
          }}
          sx={{ 
            minWidth: '200px',
            fontSize: '16px',
            fontWeight: 'bold',
            bgcolor: 'yellow',
            color: 'black',
            '&:hover': { bgcolor: 'orange' }
          }}
        >
          🚨 EMERGENCY API TEST 🚨
        </Button>
      </Box>

      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <RestaurantIcon />
            </Avatar>
            <Typography variant="h5" sx={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
              Strategy Chef
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            onClick={() => {
              console.log('🧪 Original Test API button clicked!');
              testApiConnection();
            }}
            disabled={isLoading}
            startIcon={<AssessmentIcon />}
            sx={{ 
              minWidth: '120px',
              fontWeight: 'bold',
              boxShadow: 2
            }}
          >
            🧪 Test API
          </Button>
        </Box>
        
        {/* API Test Result */}
        {apiTestResult && (
          <Alert 
            severity={apiTestResult.includes('✅') ? 'success' : 'error'} 
            sx={{ mb: 2 }}
            onClose={() => setApiTestResult(null)}
          >
            {apiTestResult}
          </Alert>
        )}
        
        {/* Quick Prompts */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Quick Strategy Ideas:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {quickPrompts.slice(0, 3).map((prompt, index) => (
              <Chip
                key={index}
                label={prompt}
                size="small"
                clickable
                onClick={() => handleSend(prompt)}
                sx={{ fontSize: '0.75rem' }}
                icon={<LightbulbIcon />}
              />
            ))}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Chat" icon={<RestaurantIcon />} />
          <Tab label="Analysis" icon={<AssessmentIcon />} disabled={!strategy} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TabPanel value={tabValue} index={0}>
          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 3, maxHeight: '400px' }}>
            <List>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListItem alignItems="flex-start" sx={{ mb: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: message.role === 'assistant' ? 'primary.main' : 'secondary.main',
                          width: 40,
                          height: 40
                        }}>
                          {message.role === 'assistant' ? <RestaurantIcon /> : <PsychologyIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontFamily: '"Noto Sans KR", sans-serif',
                                color: message.role === 'assistant' ? 'primary.main' : 'text.primary',
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.6
                              }}
                            >
                              {message.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              {message.timestamp.toLocaleTimeString()}
                            </Typography>
                            
                            {/* Action buttons for assistant messages */}
                            {message.role === 'assistant' && (
                              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Tooltip title="Copy Strategy">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => copyToClipboard(message.content)}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Generate Backtest Code">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleGenerateCode(message.content)}
                                    disabled={isLoading}
                                  >
                                    <CodeIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {message.analysis && (
                                  <Button
                                    size="small"
                                    startIcon={<AssessmentIcon />}
                                    onClick={() => {
                                      setStrategy(message.analysis!);
                                      setTabValue(1);
                                    }}
                                  >
                                    View Analysis
                                  </Button>
                                )}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <RestaurantIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Cooking up your strategy...
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </motion.div>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tell me about your trading strategy..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              multiline
              maxRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white'
                }
              }}
            />
            <Button
              variant="contained"
              onClick={() => handleSend()}
              disabled={isLoading || !userInput.trim()}
              sx={{
                borderRadius: '12px',
                minWidth: '48px',
                height: '48px'
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {strategy && (
            <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
              <Grid container spacing={3}>
                {/* Strategy Overview */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Strategy Overview
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <Chip 
                          label={strategy.strategy} 
                          color="primary" 
                          icon={<TrendingUpIcon />}
                        />
                        <Chip 
                          label={`Risk: ${strategy.riskLevel}`} 
                          color={getRiskColor(strategy.riskLevel) as any}
                          icon={<SecurityIcon />}
                        />
                        <Chip 
                          label={strategy.timeframe} 
                          color="secondary"
                          icon={<TimelineIcon />}
                        />
                        <Chip 
                          label={strategy.expectedReturn} 
                          color="success"
                          icon={<SpeedIcon />}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Key Metrics */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Key Metrics
                      </Typography>
                      <List dense>
                        {strategy.keyMetrics.map((metric, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={metric} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Implementation Steps */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Implementation
                      </Typography>
                      <List dense>
                        {strategy.implementation.map((step, index) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={`${index + 1}. ${step}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Warnings */}
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <Typography variant="subtitle2" gutterBottom>
                      Important Considerations:
                    </Typography>
                    <List dense>
                      {strategy.warnings.map((warning, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={warning} />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </TabPanel>
      </Box>

      {/* Code Generation Dialog */}
      <Dialog 
        open={backtestDialogOpen} 
        onClose={() => setBacktestDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Generated Backtest Code
        </DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative' }}>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '400px',
              fontSize: '14px'
            }}>
              {backtestCode}
            </pre>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={() => copyToClipboard(backtestCode)}
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBacktestDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              const blob = new Blob([backtestCode], { type: 'text/python' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'strategy_backtest.py';
              a.click();
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LLMStrategyChef; 