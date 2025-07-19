import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Article as ArticleIcon,
  LibraryBooks as LibraryIcon,
  Science as ScienceIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  PlayArrow as GenerateIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import researchService, { ResearchPaper, ResearchCorpus, EmergentMindsResponse } from '../../services/researchService';
import emergentMindsService from '../../services/emergentMindsService';
import type { EmergentMindsPaper } from '../../services/emergentMindsService';

interface ResearchCorpusManagerProps {
  onStrategyPromptGenerated?: (prompt: string) => void;
}

const ResearchCorpusManager: React.FC<ResearchCorpusManagerProps> = ({ onStrategyPromptGenerated }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [corpus, setCorpus] = useState<ResearchCorpus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dialog states
  const [addPaperDialog, setAddPaperDialog] = useState(false);
  const [addCorpusDialog, setAddCorpusDialog] = useState(false);
  const [emergentMindsDialog, setEmergentMindsDialog] = useState(false);
  const [generatePromptDialog, setGeneratePromptDialog] = useState(false);

  // Form states
  const [newPaper, setNewPaper] = useState({
    title: '',
    authors: '',
    abstract: '',
    summary: '',
    url: '',
    tags: [] as string[]
  });

  const [newCorpus, setNewCorpus] = useState({
    name: '',
    description: '',
    tags: [] as string[]
  });

  const [emergentMindsUrl, setEmergentMindsUrl] = useState('');
  const [emergentMindsResult, setEmergentMindsResult] = useState<EmergentMindsResponse | null>(null);
  const [emergentMindsTags, setEmergentMindsTags] = useState<string[]>([]);

  const [selectedCorpusId, setSelectedCorpusId] = useState('');
  const [strategyParams, setStrategyParams] = useState({
    coin: 'SOL',
    strategyType: 'breakout',
    timeframe: '15m',
    riskManagement: {
      stopLoss: 2,
      takeProfit: 6,
      positionSize: 100
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [filteredPapers, setFilteredPapers] = useState<ResearchPaper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [bookmarkedPapers, setBookmarkedPapers] = useState<ResearchPaper[]>([]);
  const [strategyContext, setStrategyContext] = useState('');

  const categories = [
    'all',
    'cryptocurrency',
    'trading-strategies',
    'market-analysis',
    'risk-management',
    'machine-learning',
    'behavioral-finance',
    'technical-analysis',
    'quantitative-finance'
  ];

  const timeframes = [
    'all',
    'last-week',
    'last-month',
    'last-quarter',
    'last-year'
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPapers();
  }, [papers, searchQuery, selectedCategory, selectedTimeframe]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load papers from Emergent Minds API
      const emergentMindsPapers = await emergentMindsService.searchPapers({
        query: 'cryptocurrency trading strategies',
        category: 'all',
        timeframe: 'all'
      });

      // Convert Emergent Minds papers to ResearchPaper format
      const convertedPapers = emergentMindsPapers.map((emPaper: EmergentMindsPaper) => ({
        id: emPaper.id,
        title: emPaper.title,
        authors: emPaper.authors,
        abstract: emPaper.abstract,
        summary: emPaper.summary,
        categories: emPaper.categories,
        publicationDate: emPaper.publicationDate,
        relevanceScore: emPaper.relevanceScore,
        source: emPaper.source as 'emergent_minds' | 'manual' | 'arxiv' | 'other',
        url: emPaper.url || '',
        tags: [...emPaper.categories, 'emergent_minds'],
        addedAt: new Date(emPaper.publicationDate),
        isBookmarked: false
      }));

      setPapers(convertedPapers);
      setCorpus(researchService.getAllCorpus());
    } catch (err: any) {
      console.warn('Using fallback data due to API error:', err);
      // Fallback to existing papers
      setPapers(researchService.getAllPapers());
      setCorpus(researchService.getAllCorpus());
    } finally {
      setLoading(false);
    }
  };

  const filterPapers = () => {
    let filtered = papers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(paper =>
        paper.categories?.includes(selectedCategory)
      );
    }

    // Filter by timeframe
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (selectedTimeframe) {
        case 'last-week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'last-month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'last-quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'last-year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(paper =>
        paper.publicationDate && new Date(paper.publicationDate) >= cutoffDate
      );
    }

    // Sort by relevance score
    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
    setFilteredPapers(filtered);
  };

  const handleAddPaper = () => {
    if (!newPaper.title || !newPaper.summary) {
      setError('Title and summary are required');
      return;
    }

    const paper = researchService.addPaperManually({
      title: newPaper.title,
      authors: newPaper.authors.split(',').map(a => a.trim()),
      abstract: newPaper.abstract,
      summary: newPaper.summary,
      url: newPaper.url,
      tags: newPaper.tags,
      relevanceScore: 0.8,
      source: 'manual'
    });

    setPapers(researchService.getAllPapers());
    setAddPaperDialog(false);
    setNewPaper({ title: '', authors: '', abstract: '', summary: '', url: '', tags: [] });
    setError('');
  };

  const handleAddCorpus = () => {
    if (!newCorpus.name || !newCorpus.description) {
      setError('Name and description are required');
      return;
    }

    const newCorpusItem = researchService.createCorpus(
      newCorpus.name,
      newCorpus.description,
      newCorpus.tags
    );

    setCorpus(researchService.getAllCorpus());
    setAddCorpusDialog(false);
    setNewCorpus({ name: '', description: '', tags: [] });
    setError('');
  };

  const handleEmergentMindsFetch = async () => {
    if (!emergentMindsUrl) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await researchService.fetchFromEmergentMinds(emergentMindsUrl);
      setEmergentMindsResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch from Emergent Minds');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromEmergentMinds = async () => {
    if (!emergentMindsResult) return;

    try {
      const paper = await researchService.addPaperFromEmergentMinds(
        emergentMindsUrl,
        emergentMindsTags
      );

      setPapers(researchService.getAllPapers());
      setEmergentMindsDialog(false);
      setEmergentMindsUrl('');
      setEmergentMindsResult(null);
      setEmergentMindsTags([]);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to add paper');
    }
  };

  const handleGenerateStrategyPrompt = () => {
    if (!selectedCorpusId) {
      setError('Please select a research corpus');
      return;
    }

    const prompt = researchService.generateStrategyPrompt(selectedCorpusId, strategyParams);
    
    if (onStrategyPromptGenerated) {
      onStrategyPromptGenerated(prompt);
    }
    
    setGeneratePromptDialog(false);
    setError('');
  };

  const generateStrategyPromptFromSelectedPapers = async () => {
    if (selectedPapers.size === 0) {
      setError('Please select at least one research paper');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedPaperData = papers.filter(paper => selectedPapers.has(paper.id));
      
      const prompt = `[RESEARCH-BASED STRATEGY GENERATION]

Selected Research Papers:
${selectedPaperData.map(paper => `
- ${paper.title} (Relevance: ${(paper.relevanceScore * 100).toFixed(0)}%)
  Authors: ${paper.authors.join(', ')}
  Summary: ${paper.summary}
  Categories: ${paper.categories?.join(', ') || 'Uncategorized'}
`).join('\n')}

Strategy Context: ${strategyContext || 'General cryptocurrency trading strategy'}

[INSTRUCTION]
Based on the selected research papers and their findings, generate a comprehensive trading strategy that incorporates:
1. Key insights from the research papers
2. Evidence-based approaches supported by the studies
3. Risk management techniques derived from the research
4. Technical indicators and methodologies validated by the papers
5. Behavioral finance considerations from the research
6. Quantitative models and statistical approaches mentioned
7. Specific recommendations for implementation

Please provide a detailed strategy that leverages the academic insights while remaining practical for real-world trading.`;

      if (onStrategyPromptGenerated) {
        onStrategyPromptGenerated(prompt);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate strategy prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaper = (paperId: string) => {
    researchService.deletePaper(paperId);
    setPapers(researchService.getAllPapers());
  };

  const handleDeleteCorpus = (corpusId: string) => {
    researchService.deleteCorpus(corpusId);
    setCorpus(researchService.getAllCorpus());
  };

  const togglePaperSelection = (paperId: string) => {
    const newSelected = new Set(selectedPapers);
    if (newSelected.has(paperId)) {
      newSelected.delete(paperId);
    } else {
      newSelected.add(paperId);
    }
    setSelectedPapers(newSelected);
  };

  const toggleBookmark = (paperId: string) => {
    setPapers(prev => prev.map(paper =>
      paper.id === paperId
        ? { ...paper, isBookmarked: !paper.isBookmarked }
        : paper
    ));
  };

  const getBookmarkedPapers = () => {
    return papers.filter(paper => paper.isBookmarked);
  };

  const renderPapersTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 'bold' }}>
          Research Papers ({papers.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={() => setEmergentMindsDialog(true)}
          >
            Add from Emergent Minds
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddPaperDialog(true)}
          >
            Add Paper
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Controls */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search papers by title, author, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.replace('-', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={selectedTimeframe}
                label="Timeframe"
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                {timeframes.map(timeframe => (
                  <MenuItem key={timeframe} value={timeframe}>
                    {timeframe === 'all' ? 'All Time' : timeframe.replace('-', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={loadData}
              disabled={loading}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            {filteredPapers.length} papers found
          </Typography>
          {filteredPapers.map(renderPaperCard)}
        </Box>
      )}
    </Box>
  );

  const renderCorpusTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 'bold' }}>
          Research Corpus ({corpus.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddCorpusDialog(true)}
        >
          Create Corpus
        </Button>
      </Box>

      <Grid container spacing={3}>
        {corpus.map((corpusItem) => (
          <Grid item xs={12} md={6} key={corpusItem.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                    {corpusItem.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteCorpus(corpusItem.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {corpusItem.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {corpusItem.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  Papers: {corpusItem.papers.length}
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<GenerateIcon />}
                  onClick={() => {
                    setSelectedCorpusId(corpusItem.id);
                    setGeneratePromptDialog(true);
                  }}
                  disabled={corpusItem.papers.length === 0}
                >
                  Generate Strategy Prompt
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderPaperCard = (paper: ResearchPaper) => (
    <motion.div
      key={paper.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 2,
          border: selectedPapers.has(paper.id) ? '2px solid #667eea' : '1px solid #e0e0e0',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          }
        }}
        onClick={() => togglePaperSelection(paper.id)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {paper.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {paper.authors.join(', ')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {paper.categories?.map(category => (
                  <Chip
                    key={category}
                    label={category.replace('-', ' ')}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${(paper.relevanceScore * 100).toFixed(0)}%`}
                color="primary"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(paper.id);
                }}
              >
                {paper.isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
            {paper.summary}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Published: {paper.publicationDate ? new Date(paper.publicationDate).toLocaleDateString() : 'Unknown'}
            </Typography>
            {selectedPapers.has(paper.id) && (
              <Chip
                label="Selected"
                color="primary"
                size="small"
                icon={<TrendingUpIcon />}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
              textAlign: 'center',
              mb: 3
            }}
          >
            🧠 Research Corpus Manager
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Paper elevation={3} sx={{ borderRadius: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArticleIcon />
                    Research Papers
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LibraryIcon />
                    Research Corpus
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PsychologyIcon />
                    Generate Strategy
                  </Box>
                } 
              />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && renderPapersTab()}
              {activeTab === 1 && renderCorpusTab()}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Generate Research-Driven Strategy
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Selected Papers:</strong> {selectedPapers.size} papers selected
                    </Typography>
                  </Alert>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Strategy Context (Optional)"
                    placeholder="Describe your trading goals, preferred assets, or specific requirements..."
                    value={strategyContext}
                    onChange={(e) => setStrategyContext(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      onClick={generateStrategyPromptFromSelectedPapers}
                      disabled={selectedPapers.size === 0 || loading}
                      startIcon={<TrendingUpIcon />}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {loading ? 'Generating...' : 'Generate Strategy Prompt'}
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => setSelectedPapers(new Set())}
                      disabled={selectedPapers.size === 0}
                    >
                      Clear Selection
                    </Button>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </motion.div>

      {/* Add Paper Dialog */}
      <Dialog open={addPaperDialog} onClose={() => setAddPaperDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Research Paper</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newPaper.title}
                onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Authors (comma-separated)"
                value={newPaper.authors}
                onChange={(e) => setNewPaper({ ...newPaper, authors: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Abstract"
                multiline
                rows={3}
                value={newPaper.abstract}
                onChange={(e) => setNewPaper({ ...newPaper, abstract: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Summary"
                multiline
                rows={4}
                value={newPaper.summary}
                onChange={(e) => setNewPaper({ ...newPaper, summary: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL"
                value={newPaper.url}
                onChange={(e) => setNewPaper({ ...newPaper, url: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={newPaper.tags}
                onChange={(_, newValue) => setNewPaper({ ...newPaper, tags: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Add tags..." />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPaperDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPaper} variant="contained">Add Paper</Button>
        </DialogActions>
      </Dialog>

      {/* Add Corpus Dialog */}
      <Dialog open={addCorpusDialog} onClose={() => setAddCorpusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Research Corpus</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Corpus Name"
                value={newCorpus.name}
                onChange={(e) => setNewCorpus({ ...newCorpus, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newCorpus.description}
                onChange={(e) => setNewCorpus({ ...newCorpus, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={newCorpus.tags}
                onChange={(_, newValue) => setNewCorpus({ ...newCorpus, tags: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Add tags..." />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCorpusDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCorpus} variant="contained">Create Corpus</Button>
        </DialogActions>
      </Dialog>

      {/* Emergent Minds Dialog */}
      <Dialog open={emergentMindsDialog} onClose={() => setEmergentMindsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add from Emergent Minds</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Research Paper URL"
                value={emergentMindsUrl}
                onChange={(e) => setEmergentMindsUrl(e.target.value)}
                placeholder="https://..."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleEmergentMindsFetch}
                disabled={loading || !emergentMindsUrl}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                {loading ? 'Fetching...' : 'Fetch from Emergent Minds'}
              </Button>
            </Grid>

            {emergentMindsResult && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Analysis Results
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {emergentMindsResult.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {emergentMindsResult.summary}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Key Points:
                      </Typography>
                      <ul>
                        {emergentMindsResult.key_points.map((point, index) => (
                          <li key={index}>
                            <Typography variant="body2">{point}</Typography>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={emergentMindsTags}
                    onChange={(_, newValue) => setEmergentMindsTags(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Tags" placeholder="Add tags..." />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmergentMindsDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddFromEmergentMinds} 
            variant="contained"
            disabled={!emergentMindsResult}
          >
            Add to Library
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Strategy Prompt Dialog */}
      <Dialog open={generatePromptDialog} onClose={() => setGeneratePromptDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Research-Driven Strategy Prompt</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Strategy Parameters</InputLabel>
                <Select
                  value={`${strategyParams.coin}-${strategyParams.strategyType}`}
                  onChange={(e) => {
                    const [coin, strategyType] = e.target.value.split('-');
                    setStrategyParams({ ...strategyParams, coin, strategyType });
                  }}
                >
                  <MenuItem value="SOL-breakout">SOL - Breakout Strategy</MenuItem>
                  <MenuItem value="WIF-momentum">WIF - Momentum Strategy</MenuItem>
                  <MenuItem value="PYTH-mean_reversion">PYTH - Mean Reversion</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                This will generate a comprehensive strategy prompt incorporating all research papers in the selected corpus.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGeneratePromptDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateStrategyPrompt} variant="contained">
            Generate Prompt
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ResearchCorpusManager; 