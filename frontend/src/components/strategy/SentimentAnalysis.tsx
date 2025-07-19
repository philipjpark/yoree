import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Button,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Chat as ChatIcon,
  Twitter as TwitterIcon,
  Reddit as RedditIcon,
  Article as ArticleIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import sentimentService, { SentimentAnalysis as SentimentAnalysisType } from '../../services/sentimentService';

interface SentimentAnalysisProps {
  asset: string;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ asset }) => {
  const [sentiment, setSentiment] = useState<SentimentAnalysisType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const analyzeSentiment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await sentimentService.analyzeSentiment(asset);
      setSentiment(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze sentiment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (asset) {
      analyzeSentiment();
    }
  }, [asset]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUpIcon color="success" />;
      case 'bearish':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="action" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'success';
      case 'bearish':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy':
        return 'success';
      case 'sell':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <PsychologyIcon color="primary" />
            <Typography variant="h6">Market Sentiment Analysis</Typography>
          </Box>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Analyzing sentiment for {asset}...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={analyzeSentiment}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!sentiment) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PsychologyIcon color="primary" />
            <Typography variant="h6">
              Market Sentiment Analysis - {asset}
            </Typography>
          </Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={analyzeSentiment}
            size="small"
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>

        {/* Overall Sentiment Summary */}
        <Paper sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              {getSentimentIcon(sentiment.overallSentiment)}
            </Grid>
            <Grid item xs>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {sentiment.overallSentiment.toUpperCase()} Sentiment
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Confidence: {(sentiment.confidence * 100).toFixed(0)}%
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                label={`${(sentiment.sentimentScore * 100).toFixed(0)}%`}
                color={getSentimentColor(sentiment.overallSentiment) as any}
                variant="filled"
                sx={{ color: 'white', fontWeight: 'bold' }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Trading Signal */}
        <Paper sx={{ p: 2, mb: 2, border: 2, borderColor: `${getSignalColor(sentiment.tradingSignals.signal)}.main` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <ShowChartIcon color={getSignalColor(sentiment.tradingSignals.signal) as any} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Trading Signal: {sentiment.tradingSignals.signal.toUpperCase()}
            </Typography>
            <Chip
              label={`${sentiment.tradingSignals.strength.toFixed(0)}% Strength`}
              color={getSignalColor(sentiment.tradingSignals.signal) as any}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {sentiment.tradingSignals.reasoning}
          </Typography>
        </Paper>

        {/* Tabs for Detailed Analysis */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Key Insights" />
            <Tab label="Risk Factors" />
            <Tab label="Opportunities" />
            <Tab label="LLM Analysis" />
            <Tab label="Source Details" />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Key Market Insights
                </Typography>
                <List dense>
                  {sentiment.keyInsights.map((insight, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LightbulbIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={insight}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  Risk Factors
                </Typography>
                <List dense>
                  {sentiment.riskFactors.map((risk, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <WarningIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={risk}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  Opportunities
                </Typography>
                <List dense>
                  {sentiment.opportunities.map((opportunity, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <TrendingUpIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={opportunity}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {activeTab === 3 && sentiment.llmAnalysis && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  AI-Enhanced Sentiment Analysis
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Quantified Sentiment Analysis
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {sentiment.llmAnalysis.quantifiedSentiment}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Keyword Impact Analysis
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {sentiment.llmAnalysis.keywordAnalysis}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Confidence Assessment
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {sentiment.llmAnalysis.confidenceExplanation}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Market Context
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {sentiment.llmAnalysis.marketContext}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 4 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Source Analysis
                </Typography>
                
                {/* Discord Sources */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ChatIcon color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Discord Communities ({sentiment.sources.discord.length})
                    </Typography>
                  </Box>
                  <List dense>
                    {sentiment.sources.discord.map((data, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={data.source}
                          secondary={data.content}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                        <Chip
                          label={data.sentiment}
                          color={data.sentiment === 'positive' ? 'success' : data.sentiment === 'negative' ? 'error' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Social Media Sources */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TwitterIcon color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Social Media ({sentiment.sources.social.length})
                    </Typography>
                  </Box>
                  <List dense>
                    {sentiment.sources.social.map((data, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={data.source}
                          secondary={data.content}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                        <Chip
                          label={data.sentiment}
                          color={data.sentiment === 'positive' ? 'success' : data.sentiment === 'negative' ? 'error' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* News Sources */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ArticleIcon color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      News Sources ({sentiment.sources.news.length})
                    </Typography>
                  </Box>
                  <List dense>
                    {sentiment.sources.news.map((data, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={data.source}
                          secondary={data.content}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                        <Chip
                          label={data.sentiment}
                          color={data.sentiment === 'positive' ? 'success' : data.sentiment === 'negative' ? 'error' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Technical Analysis */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ShowChartIcon color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Technical Analysis ({sentiment.sources.technical.length})
                    </Typography>
                  </Box>
                  <List dense>
                    {sentiment.sources.technical.map((data, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={data.source}
                          secondary={data.content}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                        <Chip
                          label={data.sentiment}
                          color={data.sentiment === 'positive' ? 'success' : data.sentiment === 'negative' ? 'error' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Strategy Integration Note */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Strategy Integration:</strong> This sentiment analysis will be automatically incorporated into your trading strategy generation, providing evidence-based entry/exit signals and risk management recommendations.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis; 