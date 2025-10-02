import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  Psychology as BrainIcon,
  School as AcademicIcon,
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import emergentMindService, { ResearchInsight } from '../../services/emergentMindService';
import researchApiService, { ResearchSummary } from '../../services/researchApiService';

interface ApiLeverageSectionProps {
  ticker: string;
  onInsightsGenerated?: (insights: ResearchInsight | ResearchSummary) => void;
  onError?: (error: string) => void;
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
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ApiLeverageSection: React.FC<ApiLeverageSectionProps> = ({
  ticker,
  onInsightsGenerated,
  onError
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emergentMindInsights, setEmergentMindInsights] = useState<ResearchInsight | null>(null);
  const [researchApiSummary, setResearchApiSummary] = useState<ResearchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const generateInsights = async (apiType: 'emergent' | 'research') => {
    setLoading(true);
    setError(null);

    try {
      if (apiType === 'emergent') {
        const insights = await emergentMindService.getMarketAnalysis(ticker);
        setEmergentMindInsights(insights);
        onInsightsGenerated?.(insights);
      } else {
        const summary = await researchApiService.getCryptoResearch(ticker);
        setResearchApiSummary(summary);
        onInsightsGenerated?.(summary);
      }
      setLastUpdated(new Date());
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate insights';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = () => {
    if (activeTab === 0) {
      generateInsights('emergent');
    } else {
      generateInsights('research');
    }
  };

  const renderEmergentMindTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            🧠 Emergent Mind AI Research
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced AI-powered market research and insights
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => generateInsights('emergent')}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <BrainIcon />}
          sx={{ borderRadius: 3 }}
        >
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </Button>
      </Box>

      {emergentMindInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    📊 Research Summary
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {emergentMindInsights.summary}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Confidence:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={emergentMindInsights.confidence}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" fontWeight={600}>
                      {emergentMindInsights.confidence.toFixed(0)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    🔍 Key Findings
                  </Typography>
                  <List dense>
                    {emergentMindInsights.keyFindings.map((finding, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={finding}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    💡 Recommendations
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {emergentMindInsights.recommendations.map((rec, index) => (
                      <Chip
                        key={index}
                        label={rec}
                        color="primary"
                        variant="outlined"
                        size="small"
                        icon={<StarIcon />}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}
    </Box>
  );

  const renderResearchApiTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            📚 Academic Research Database
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Peer-reviewed academic papers and research studies
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => generateInsights('research')}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AcademicIcon />}
          sx={{ borderRadius: 3 }}
        >
          {loading ? 'Searching...' : 'Search Papers'}
        </Button>
      </Box>

      {researchApiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    📖 Research Overview
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {researchApiSummary.overview}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Confidence:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={researchApiSummary.confidence}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" fontWeight={600}>
                      {researchApiSummary.confidence.toFixed(0)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    🔬 Key Insights
                  </Typography>
                  <List dense>
                    {researchApiSummary.keyInsights.map((insight, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={insight}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    ⚠️ Risk Factors
                  </Typography>
                  <List dense>
                    {researchApiSummary.riskFactors.map((risk, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={risk}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    🚀 Opportunities
                  </Typography>
                  <List dense>
                    {researchApiSummary.opportunities.map((opp, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <TrendingIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={opp}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    🔧 Methodology
                  </Typography>
                  <List dense>
                    {researchApiSummary.methodology.map((method, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <SecurityIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={method}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}
    </Box>
  );

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="API leverage tabs"
            sx={{ px: 3, pt: 2 }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BrainIcon fontSize="small" />
                  <span>Emergent Mind</span>
                  {emergentMindInsights && (
                    <Badge color="success" variant="dot" />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AcademicIcon fontSize="small" />
                  <span>Research API</span>
                  {researchApiSummary && (
                    <Badge color="success" variant="dot" />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {renderEmergentMindTab()}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderResearchApiTab()}
        </TabPanel>

        {error && (
          <Alert severity="error" sx={{ m: 3, mt: 0 }}>
            {error}
          </Alert>
        )}

        {lastUpdated && (
          <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
            <Tooltip title="Refresh insights">
              <IconButton size="small" onClick={refreshInsights} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiLeverageSection;

