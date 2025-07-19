import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Settings,
  Psychology,
  TrendingUp,
  Security,
  AccountBalance,
  SentimentSatisfied,
  Analytics,
  CheckCircle,
  Error,
  Warning,
  Info,
  AutoAwesome,
  SmartToy,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  description: string;
  confidence: number;
  lastUpdate: string;
  performance: {
    accuracy: number;
    speed: number;
    efficiency: number;
  };
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

interface AgentResponse {
  agentId: string;
  responseType: string;
  data: any;
  confidence: number;
  timestamp: string;
}

const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agentResponses, setAgentResponses] = useState<AgentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock agent data - replace with real API calls
  useEffect(() => {
    const mockAgents: Agent[] = [
      {
        id: 'strategy-generator',
        name: 'YOREE Strategy Generator',
        type: 'Strategy Generation',
        status: 'running',
        description: 'AI-powered trading strategy generation using Google Cloud AI',
        confidence: 0.85,
        lastUpdate: new Date().toISOString(),
        performance: {
          accuracy: 0.78,
          speed: 0.92,
          efficiency: 0.88,
        },
        config: {
          model: 'text-bison',
          temperature: 0.7,
          maxTokens: 1024,
        },
      },
      {
        id: 'market-analyzer',
        name: 'YOREE Market Analyzer',
        type: 'Market Analysis',
        status: 'completed',
        description: 'Real-time market analysis and signal generation',
        confidence: 0.80,
        lastUpdate: new Date(Date.now() - 300000).toISOString(),
        performance: {
          accuracy: 0.82,
          speed: 0.95,
          efficiency: 0.90,
        },
        config: {
          model: 'text-bison',
          temperature: 0.5,
          maxTokens: 512,
        },
      },
      {
        id: 'risk-manager',
        name: 'YOREE Risk Manager',
        type: 'Risk Management',
        status: 'idle',
        description: 'Automated risk assessment and management',
        confidence: 0.90,
        lastUpdate: new Date(Date.now() - 600000).toISOString(),
        performance: {
          accuracy: 0.95,
          speed: 0.88,
          efficiency: 0.92,
        },
        config: {
          model: 'text-bison',
          temperature: 0.3,
          maxTokens: 256,
        },
      },
      {
        id: 'portfolio-optimizer',
        name: 'YOREE Portfolio Optimizer',
        type: 'Portfolio Optimization',
        status: 'completed',
        description: 'Dynamic portfolio optimization and rebalancing',
        confidence: 0.87,
        lastUpdate: new Date(Date.now() - 1800000).toISOString(),
        performance: {
          accuracy: 0.89,
          speed: 0.85,
          efficiency: 0.94,
        },
        config: {
          model: 'text-bison',
          temperature: 0.4,
          maxTokens: 768,
        },
      },
      {
        id: 'sentiment-analyzer',
        name: 'YOREE Sentiment Analyzer',
        type: 'Sentiment Analysis',
        status: 'running',
        description: 'Market sentiment analysis using NLP',
        confidence: 0.75,
        lastUpdate: new Date().toISOString(),
        performance: {
          accuracy: 0.76,
          speed: 0.90,
          efficiency: 0.85,
        },
        config: {
          model: 'text-bison',
          temperature: 0.6,
          maxTokens: 512,
        },
      },
      {
        id: 'technical-analyzer',
        name: 'YOREE Technical Analyzer',
        type: 'Technical Analysis',
        status: 'idle',
        description: 'Technical analysis and indicator calculation',
        confidence: 0.88,
        lastUpdate: new Date(Date.now() - 900000).toISOString(),
        performance: {
          accuracy: 0.91,
          speed: 0.96,
          efficiency: 0.89,
        },
        config: {
          model: 'text-bison',
          temperature: 0.2,
          maxTokens: 1024,
        },
      },
    ];

    setAgents(mockAgents);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'idle':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayArrow />;
      case 'completed':
        return <CheckCircle />;
      case 'failed':
        return <Error />;
      case 'idle':
        return <Info />;
      default:
        return <Info />;
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'Strategy Generation':
        return <Psychology />;
      case 'Market Analysis':
        return <TrendingUp />;
      case 'Risk Management':
        return <Security />;
      case 'Portfolio Optimization':
        return <AccountBalance />;
      case 'Sentiment Analysis':
        return <SentimentSatisfied />;
      case 'Technical Analysis':
        return <Analytics />;
      default:
        return <SmartToy />;
    }
  };

  const handleStartAgent = async (agentId: string) => {
    setLoading(true);
    try {
      // API call to start agent
      console.log(`Starting agent: ${agentId}`);
      
      // Update agent status
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'running' as const }
          : agent
      ));
      
      // Simulate API response
      setTimeout(() => {
        setAgentResponses(prev => [...prev, {
          agentId,
          responseType: 'agent_started',
          data: { message: 'Agent started successfully' },
          confidence: 1.0,
          timestamp: new Date().toISOString(),
        }]);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error starting agent:', error);
      setLoading(false);
    }
  };

  const handleStopAgent = async (agentId: string) => {
    setLoading(true);
    try {
      // API call to stop agent
      console.log(`Stopping agent: ${agentId}`);
      
      // Update agent status
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'idle' as const }
          : agent
      ));
      
      setLoading(false);
    } catch (error) {
      console.error('Error stopping agent:', error);
      setLoading(false);
    }
  };

  const handleConfigureAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const handleSaveConfiguration = () => {
    // Save agent configuration
    console.log('Saving configuration for:', selectedAgent?.id);
    setDialogOpen(false);
    setSelectedAgent(null);
  };

  const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              {getAgentIcon(agent.type)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                {agent.name}
              </Typography>
              <Chip
                icon={getStatusIcon(agent.status)}
                label={agent.status}
                color={getStatusColor(agent.status)}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {agent.description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Confidence: {Math.round(agent.confidence * 100)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={agent.confidence * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="caption" display="block">
                  Accuracy
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {Math.round(agent.performance.accuracy * 100)}%
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" display="block">
                  Speed
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {Math.round(agent.performance.speed * 100)}%
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" display="block">
                  Efficiency
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {Math.round(agent.performance.efficiency * 100)}%
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Last update: {new Date(agent.lastUpdate).toLocaleString()}
          </Typography>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Box>
            {agent.status === 'running' ? (
              <Button
                size="small"
                startIcon={<Stop />}
                onClick={() => handleStopAgent(agent.id)}
                disabled={loading}
                color="error"
                variant="outlined"
              >
                Stop
              </Button>
            ) : (
              <Button
                size="small"
                startIcon={<PlayArrow />}
                onClick={() => handleStartAgent(agent.id)}
                disabled={loading}
                color="primary"
                variant="contained"
              >
                Start
              </Button>
            )}
          </Box>
          
          <Box>
            <Tooltip title="Refresh">
              <IconButton size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Configure">
              <IconButton 
                size="small"
                onClick={() => handleConfigureAgent(agent)}
              >
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <AutoAwesome sx={{ mr: 2, verticalAlign: 'middle' }} />
            YOREE Agent Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            AI-Powered Trading Agents powered by Google Cloud
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Chip
              icon={<CheckCircle />}
              label={`${agents.filter(a => a.status === 'completed').length} Completed`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<PlayArrow />}
              label={`${agents.filter(a => a.status === 'running').length} Running`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<Info />}
              label={`${agents.filter(a => a.status === 'idle').length} Idle`}
              color="default"
              variant="outlined"
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {agents.map((agent) => (
            <Grid item xs={12} sm={6} md={4} key={agent.id}>
              <AgentCard agent={agent} />
            </Grid>
          ))}
        </Grid>

        {/* Agent Responses Section */}
        {agentResponses.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Recent Agent Responses
            </Typography>
            <Grid container spacing={2}>
              {agentResponses.slice(-3).map((response, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {agents.find(a => a.id === response.agentId)?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {response.responseType}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Confidence: {Math.round(response.confidence * 100)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(response.timestamp).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </motion.div>

      {/* Configuration Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Configure Agent: {selectedAgent?.name}
        </DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    value={selectedAgent.config.model}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Temperature"
                    type="number"
                    value={selectedAgent.config.temperature}
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Tokens"
                    type="number"
                    value={selectedAgent.config.maxTokens}
                    inputProps={{ min: 1, max: 2048 }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={selectedAgent.description}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveConfiguration} variant="contained">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AgentDashboard; 