import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Rating,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { TraditionalStrategy } from '../../services/traditionalFinanceStrategies';
import traditionalFinanceStrategiesService from '../../services/traditionalFinanceStrategies';

interface TraditionalStrategySelectorProps {
  onStrategySelect: (strategy: TraditionalStrategy | null) => void;
  selectedStrategy: TraditionalStrategy | null;
  onSkip?: () => void;
}

const TraditionalStrategySelector: React.FC<TraditionalStrategySelectorProps> = ({
  onStrategySelect,
  selectedStrategy,
  onSkip
}) => {
  const [strategies, setStrategies] = useState<TraditionalStrategy[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<TraditionalStrategy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  useEffect(() => {
    const loadStrategies = async () => {
      const allStrategies = await traditionalFinanceStrategiesService.getAllStrategies();
      setStrategies(allStrategies);
      setFilteredStrategies(allStrategies);
    };
    loadStrategies();
  }, []);

  useEffect(() => {
    let filtered = strategies;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(strategy =>
        strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.traditionalAsset.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(strategy => strategy.category === selectedCategory);
    }

    // Filter by complexity
    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(strategy => strategy.complexity === selectedComplexity);
    }

    setFilteredStrategies(filtered);
  }, [strategies, searchQuery, selectedCategory, selectedComplexity]);

  const handleStrategySelect = (strategy: TraditionalStrategy) => {
    // If the strategy is already selected, deselect it
    if (selectedStrategy?.id === strategy.id) {
      onStrategySelect(null);
    } else {
      // Otherwise, select the new strategy
      onStrategySelect(strategy);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Momentum': return <TrendingUpIcon />;
      case 'Mean Reversion': return <PsychologyIcon />;
      case 'Trend Following': return <TrendingUpIcon />;
      case 'Volatility': return <SecurityIcon />;
      case 'Arbitrage': return <ScienceIcon />;
      default: return <ScienceIcon />;
    }
  };

  const categories = traditionalFinanceStrategiesService.getCategories();
  const complexityLevels = traditionalFinanceStrategiesService.getComplexityLevels();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SchoolIcon color="primary" />
          <Typography variant="h5">
            Traditional Finance Strategies
          </Typography>
          <Chip
            label={`${strategies.length} Strategies Available`}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Select a proven traditional finance strategy as the foundation for your crypto trading approach. 
          Each strategy has been adapted for cryptocurrency markets with academic backing.
        </Typography>
        
        {/* Skip Option */}
        {onSkip && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onSkip}
              sx={{ 
                textTransform: 'none',
                borderColor: '#9c27b0',
                color: '#9c27b0',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#f3e5f5',
                  borderColor: '#7b1fa2',
                  color: '#7b1fa2',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(156, 39, 176, 0.2)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
              startIcon={<span style={{ fontSize: '1.2rem' }}>⏭️</span>}
            >
              Skip this step -No foundational strategy
            </Button>
          </Box>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FilterIcon color="primary" />
            <Typography variant="h6">Filters</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Strategies"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category: string) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Complexity</InputLabel>
                <Select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  label="Complexity"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  {complexityLevels.map((level: string) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Available Strategies ({filteredStrategies.length})
        </Typography>
      </Box>

      {filteredStrategies.length === 0 ? (
        <Alert severity="info">
          No strategies match your current filters. Try adjusting your search criteria.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredStrategies.map((strategy) => (
            <Grid item xs={12} key={strategy.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedStrategy?.id === strategy.id ? '2px solid #9c27b0' : '1px solid #e0e0e0',
                  backgroundColor: selectedStrategy?.id === strategy.id ? '#f3e5f5' : 'transparent',
                  '&:hover': { 
                    borderColor: '#9c27b0',
                    backgroundColor: selectedStrategy?.id === strategy.id ? '#f3e5f5' : '#fafafa'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => handleStrategySelect(strategy)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="h3"
                          sx={{ 
                            color: selectedStrategy?.id === strategy.id ? '#9c27b0' : 'inherit',
                            fontWeight: selectedStrategy?.id === strategy.id ? 'bold' : 'normal'
                          }}
                        >
                          {strategy.name}
                        </Typography>
                        {selectedStrategy?.id === strategy.id && (
                          <CheckCircleIcon sx={{ color: '#9c27b0' }} />
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={getCategoryIcon(strategy.category)}
                          label={strategy.category}
                          size="small"
                          sx={{
                            backgroundColor: selectedStrategy?.id === strategy.id ? '#9c27b0' : undefined,
                            color: selectedStrategy?.id === strategy.id ? 'white' : undefined
                          }}
                          variant="outlined"
                        />
                        <Chip
                          label={strategy.complexity}
                          size="small"
                          color={getComplexityColor(strategy.complexity) as any}
                          variant="outlined"
                        />
                        <Chip
                          label={`Volatility: ${strategy.volatility}`}
                          size="small"
                          color={getVolatilityColor(strategy.volatility) as any}
                          variant="outlined"
                        />
                        <Chip
                          label={strategy.traditionalAsset}
                          size="small"
                          variant="outlined"
                        />
                        {selectedStrategy?.id === strategy.id && (
                          <Chip 
                            label="Selected" 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#9c27b0',
                              color: 'white'
                            }}
                          />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {strategy.description}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Crypto Adaptation:</strong> {strategy.cryptoAdaptation}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Academic Basis:</strong> {strategy.academicBasis}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                      <Button
                        variant={selectedStrategy?.id === strategy.id ? "contained" : "outlined"}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStrategySelect(strategy);
                        }}
                        startIcon={selectedStrategy?.id === strategy.id ? <CheckCircleIcon /> : undefined}
                        sx={{
                          backgroundColor: selectedStrategy?.id === strategy.id ? '#9c27b0' : undefined,
                          '&:hover': {
                            backgroundColor: selectedStrategy?.id === strategy.id ? '#7b1fa2' : undefined
                          }
                        }}
                      >
                        {selectedStrategy?.id === strategy.id ? 'Selected' : 'Select Strategy'}
                      </Button>
                      
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedStrategy(
                              expandedStrategy === strategy.id ? null : strategy.id
                            );
                          }}
                        >
                          <ExpandMoreIcon 
                            sx={{ 
                              transform: expandedStrategy === strategy.id ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s'
                            }} 
                          />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Expanded Details */}
                  {expandedStrategy === strategy.id && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Key Indicators
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {strategy.keyIndicators.map((indicator, index) => (
                              <Chip key={index} label={indicator} size="small" variant="outlined" />
                            ))}
                          </Box>

                          <Typography variant="subtitle2" gutterBottom>
                            Entry Rules
                          </Typography>
                          <List dense>
                            {strategy.entryRules.map((rule, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemText primary={rule} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Exit Rules
                          </Typography>
                          <List dense>
                            {strategy.exitRules.map((rule, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemText primary={rule} />
                              </ListItem>
                            ))}
                          </List>

                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Risk Management
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2">
                              Stop Loss: {strategy.riskManagement.stopLoss}
                            </Typography>
                            <Typography variant="body2">
                              Take Profit: {strategy.riskManagement.takeProfit}
                            </Typography>
                            <Typography variant="body2">
                              Position Sizing: {strategy.riskManagement.positionSizing}
                            </Typography>
                            <Typography variant="body2">
                              Max Drawdown: {strategy.riskManagement.maxDrawdown}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Advantages
                              </Typography>
                              <List dense>
                                {strategy.advantages.map((advantage, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemText primary={advantage} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Disadvantages
                              </Typography>
                              <List dense>
                                {strategy.disadvantages.map((disadvantage, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemText primary={disadvantage} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </Box>

                          <Typography variant="subtitle2" gutterBottom>
                            Academic Papers
                          </Typography>
                          <List dense>
                            {strategy.papers.map((paper, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemText primary={paper} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TraditionalStrategySelector; 