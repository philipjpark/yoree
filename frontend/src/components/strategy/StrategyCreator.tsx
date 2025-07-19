import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Add as AddIcon,
  PhotoCamera as CameraIcon,
  AutoAwesome as AIIcon,
  Psychology as BrainIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  LocalFireDepartment as FireIcon,
  Diamond as DiamondIcon,
  Star as StarIcon,
  Psychology as StoryIcon,
  Palette as PaletteIcon,
  Restaurant as BowlIcon,
  LocalDining as DiningIcon,
  LocalPizza as PizzaIcon,
  Cake as CakeIcon,
  LocalBar as BarIcon,
  LocalCafe as CafeIcon,
  Book as BookIcon,
  Bolt as LightningIcon,
  Diamond as OreIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useWallet } from '@solana/wallet-adapter-react';

interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  personality: string;
  riskProfile: 'Conservative' | 'Balanced' | 'Aggressive';
  timeHorizon: 'Short-term' | 'Medium-term' | 'Long-term';
  focus: 'Momentum' | 'Mean Reversion' | 'Breakout' | 'Arbitrage' | 'Sentiment';
  baseParameters: any;
  storyElements: string[];
  visualStyle: string;
}

const StrategyCreator: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingStory, setGeneratingStory] = useState(false);
  
  const [strategyData, setStrategyData] = useState({
    name: '',
    description: '',
    avatar: '',
    story: '',
    personality: '',
    riskProfile: 'Balanced' as 'Conservative' | 'Balanced' | 'Aggressive',
    timeHorizon: 'Medium-term' as 'Short-term' | 'Medium-term' | 'Long-term',
    focus: 'Momentum' as 'Momentum' | 'Mean Reversion' | 'Breakout' | 'Arbitrage' | 'Sentiment',
    customParameters: {},
    visualStyle: 'Modern',
    isPublic: false
  });

  const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplate | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showStoryDialog, setShowStoryDialog] = useState(false);

  // Strategy templates with organic personalities
  const strategyTemplates: StrategyTemplate[] = [
    {
      id: 'phoenix',
      name: 'Phoenix Rising',
      description: 'A strategy that rises from market ashes, specializing in recovery plays and oversold bounces',
      personality: 'Resilient and opportunistic, Phoenix Rising waits for the perfect moment to strike when others fear to tread. It thrives in chaos and finds beauty in market destruction.',
      riskProfile: 'Aggressive',
      timeHorizon: 'Short-term',
      focus: 'Momentum',
      baseParameters: {
        entryCondition: 'Oversold RSI + Volume Spike',
        stopLoss: 3,
        takeProfit: 8,
        positionSize: 5
      },
      storyElements: ['Rebirth', 'Fire', 'Opportunity', 'Transformation'],
      visualStyle: 'Fiery and dramatic'
    },
    {
      id: 'sage',
      name: 'The Sage',
      description: 'Wisdom-based strategy that learns from market patterns and adapts to changing conditions',
      personality: 'Ancient wisdom meets modern markets. The Sage has seen countless cycles and knows that patience is the ultimate weapon. It speaks in riddles but trades with precision.',
      riskProfile: 'Conservative',
      timeHorizon: 'Long-term',
      focus: 'Mean Reversion',
      baseParameters: {
        entryCondition: 'Extreme Sentiment + Historical Pattern',
        stopLoss: 2,
        takeProfit: 6,
        positionSize: 3
      },
      storyElements: ['Wisdom', 'Patience', 'Knowledge', 'Adaptation'],
      visualStyle: 'Mystical and ethereal'
    },
    {
      id: 'alchemist',
      name: 'The Alchemist',
      description: 'Transforms market data into golden opportunities through complex pattern recognition',
      personality: 'Part scientist, part mystic, The Alchemist sees patterns where others see chaos. It turns base market movements into profitable trades through its unique formula.',
      riskProfile: 'Aggressive',
      timeHorizon: 'Short-term',
      focus: 'Arbitrage',
      baseParameters: {
        entryCondition: 'Pattern Recognition + Statistical Edge',
        stopLoss: 4,
        takeProfit: 10,
        positionSize: 6
      },
      storyElements: ['Transformation', 'Science', 'Magic', 'Discovery'],
      visualStyle: 'Alchemical and mystical'
    },
    {
      id: 'storm',
      name: 'Storm Chaser',
      description: 'Thrives in market volatility, capturing explosive moves during high-impact events',
      personality: 'Wild and untamed, Storm Chaser rides the market\'s most violent storms. It doesn\'t predict the weather—it becomes the weather, harnessing chaos for profit.',
      riskProfile: 'Aggressive',
      timeHorizon: 'Short-term',
      focus: 'Sentiment',
      baseParameters: {
        entryCondition: 'Volatility Spike + News Catalyst',
        stopLoss: 5,
        takeProfit: 15,
        positionSize: 7
      },
      storyElements: ['Chaos', 'Power', 'Freedom', 'Adventure'],
      visualStyle: 'Dynamic and powerful'
    }
  ];

  const handleTemplateSelect = (template: StrategyTemplate) => {
    setSelectedTemplate(template);
    setStrategyData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      personality: template.personality,
      riskProfile: template.riskProfile,
      timeHorizon: template.timeHorizon,
      focus: template.focus,
      customParameters: template.baseParameters,
      visualStyle: template.visualStyle
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setStrategyData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIAvatar = async () => {
    if (!strategyData.name || !strategyData.personality) {
      alert('Please provide a strategy name and personality first');
      return;
    }

    setGeneratingImage(true);
    try {
      // Simulate AI image generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate placeholder based on strategy characteristics
      const colors = {
        'Phoenix Rising': 'ff6b35',
        'The Sage': '667eea',
        'The Alchemist': 'f39c12',
        'Storm Chaser': '3498db'
      };
      
      const color = colors[strategyData.name as keyof typeof colors] || '667eea';
      const generatedImage = `https://via.placeholder.com/300x300/${color}/ffffff?text=${encodeURIComponent(strategyData.name)}`;
      
      setStrategyData(prev => ({
        ...prev,
        avatar: generatedImage
      }));
    } catch (error) {
      console.error('Error generating avatar:', error);
      alert('Failed to generate avatar. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const generateAIStory = async () => {
    if (!strategyData.name || !strategyData.personality) {
      alert('Please provide a strategy name and personality first');
      return;
    }

    setGeneratingStory(true);
    try {
      // Simulate AI story generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const storyTemplates = {
        'Phoenix Rising': `In the depths of market despair, ${strategyData.name} emerges like a mythical phoenix from the ashes of broken charts. Born from the fires of countless market cycles, this strategy doesn't just survive chaos—it thrives in it. When others flee in panic, ${strategyData.name} spreads its wings and soars above the destruction, finding golden opportunities in the most unlikely places. Its creator, a trader who has seen markets rise and fall like the tides, crafted this strategy to embody the eternal cycle of death and rebirth that defines the crypto markets.`,
        
        'The Sage': `Ancient wisdom whispers through the digital corridors of ${strategyData.name}. Like a master who has meditated for centuries on the nature of markets, this strategy speaks in riddles but trades with surgical precision. Its creator, a student of both traditional finance and the chaotic beauty of crypto, designed ${strategyData.name} to be the voice of reason in a world of noise. It doesn't chase trends—it understands them. It doesn't predict the future—it learns from the past. In a market where everyone wants to be the fastest, ${strategyData.name} chooses to be the wisest.`,
        
        'The Alchemist': `In the mystical laboratory of ${strategyData.name}, market data transforms into golden opportunities through the ancient art of pattern alchemy. Its creator, a trader who sees the hidden connections between seemingly unrelated market movements, designed this strategy to turn base market chaos into profitable order. ${strategyData.name} doesn't just analyze patterns—it creates them. It doesn't follow the crowd—it leads them. Like the alchemists of old who sought to turn lead into gold, ${strategyData.name} transforms market noise into trading signals, turning the impossible into the inevitable.`,
        
        'Storm Chaser': `Wild and untamed, ${strategyData.name} rides the most violent storms that rage through the crypto markets. Its creator, a thrill-seeker who found their calling in the chaos of high-frequency trading, designed this strategy to not just survive market volatility—but to thrive in it. ${strategyData.name} doesn't predict storms—it becomes the storm. It harnesses the raw power of market chaos, channeling the energy of panic and euphoria into profitable trades. In a world that fears volatility, ${strategyData.name} embraces it, finding beauty in the chaos and profit in the destruction.`
      };
      
      const story = storyTemplates[strategyData.name as keyof typeof storyTemplates] || 
        `In the vast digital wilderness of the crypto markets, ${strategyData.name} stands as a testament to its creator's vision. Born from countless hours of analysis, refined through market cycles, and perfected through trial and error, this strategy represents more than just a trading algorithm—it represents a philosophy. Its creator, a trader who has seen both the heights of euphoria and the depths of despair, crafted ${strategyData.name} to be not just profitable, but meaningful. It's not just about making money—it's about making a statement.`;
      
      setStrategyData(prev => ({
        ...prev,
        story
      }));
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setGeneratingStory(false);
    }
  };

  const handleSaveStrategy = async () => {
    if (!connected) {
      alert('Please connect your wallet to save your strategy');
      return;
    }

    if (!strategyData.name || !strategyData.description) {
      alert('Please provide a strategy name and description');
      return;
    }

    setLoading(true);
    try {
      // Simulate saving strategy
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Strategy saved:', strategyData);
      alert('Strategy created successfully! Your strategy is now live on the marketplace.');
      
      // Reset form
      setStrategyData({
        name: '',
        description: '',
        avatar: '',
        story: '',
        personality: '',
        riskProfile: 'Balanced',
        timeHorizon: 'Medium-term',
        focus: 'Momentum',
        customParameters: {},
        visualStyle: 'Modern',
        isPublic: false
      });
      setSelectedTemplate(null);
      setActiveStep(0);
    } catch (error) {
      console.error('Error saving strategy:', error);
      alert('Failed to save strategy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Choose Foundation',
    'Craft Identity',
    'Define Personality',
    'Create Story',
    'Review & Deploy'
  ];

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <BowlIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                🍜 Mix Your Strategy Bowl
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Choose your base ingredients and let's create something delicious
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {strategyTemplates.map((template) => (
                <Grid item xs={12} md={6} lg={4} key={template.id}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      onClick={() => handleTemplateSelect(template)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '20px',
                        background: selectedTemplate?.id === template.id 
                          ? 'linear-gradient(45deg, rgba(102, 126, 234, 0.15) 30%, rgba(118, 75, 162, 0.15) 90%)'
                          : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: selectedTemplate?.id === template.id 
                          ? '3px solid #667eea'
                          : '2px solid rgba(255, 255, 255, 0.3)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                          transform: 'translateY(-4px)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          opacity: selectedTemplate?.id === template.id ? 1 : 0.3,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              mr: 2,
                              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                              fontSize: '1.8rem',
                              border: '3px solid rgba(255, 255, 255, 0.3)'
                            }}
                          >
                            {getStrategyIcon(template.id)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                              {template.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {template.focus} • {template.riskProfile}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                          {template.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {template.storyElements.map((element, index) => (
                            <Chip
                              key={index}
                              label={element}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.7rem',
                                borderColor: '#667eea',
                                color: '#667eea',
                                '&:hover': {
                                  background: 'rgba(102, 126, 234, 0.1)'
                                }
                              }}
                            />
                          ))}
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          "{template.personality.substring(0, 100)}..."
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <DiningIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                🥢 Craft Your Strategy Identity
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Give your strategy a unique flavor and personality
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                    Strategy Name
                  </Typography>
                  <TextField
                    fullWidth
                    value={strategyData.name}
                    onChange={(e) => setStrategyData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a unique name for your strategy"
                    variant="outlined"
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      }
                    }}
                  />
                  
                  <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                    Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={strategyData.description}
                    onChange={(e) => setStrategyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what makes your strategy unique..."
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      }
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                    Strategy Bowl Avatar
                  </Typography>
                  
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                    <Avatar
                      src={strategyData.avatar}
                      sx={{
                        width: 140,
                        height: 140,
                        fontSize: '3.5rem',
                        background: strategyData.avatar ? 'transparent' : 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        border: '4px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '50%',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      {strategyData.name.charAt(0) || '🍜'}
                    </Avatar>
                    
                    <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                      <IconButton
                        onClick={() => setShowImageDialog(true)}
                        sx={{
                          background: 'rgba(102, 126, 234, 0.9)',
                          color: 'white',
                          '&:hover': { 
                            background: 'rgba(102, 126, 234, 1)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AIIcon />}
                      onClick={generateAIAvatar}
                      disabled={generatingImage}
                    >
                      {generatingImage ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Define Your Strategy's Personality
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Personality Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={strategyData.personality}
                    onChange={(e) => setStrategyData(prev => ({ ...prev, personality: e.target.value }))}
                    placeholder="Describe your strategy's personality, quirks, and character..."
                    variant="outlined"
                    helperText="This will help generate a unique story and visual style"
                  />
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Visual Style
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={strategyData.visualStyle}
                      onChange={(e) => setStrategyData(prev => ({ ...prev, visualStyle: e.target.value }))}
                    >
                      <MenuItem value="Modern">Modern & Clean</MenuItem>
                      <MenuItem value="Mystical">Mystical & Ethereal</MenuItem>
                      <MenuItem value="Dark">Dark & Mysterious</MenuItem>
                      <MenuItem value="Fiery">Fiery & Dramatic</MenuItem>
                      <MenuItem value="Alchemical">Alchemical & Complex</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Risk Profile
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Select
                      value={strategyData.riskProfile}
                      onChange={(e) => setStrategyData(prev => ({ ...prev, riskProfile: e.target.value as any }))}
                    >
                      <MenuItem value="Conservative">Conservative</MenuItem>
                      <MenuItem value="Balanced">Balanced</MenuItem>
                      <MenuItem value="Aggressive">Aggressive</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="h6" gutterBottom>
                    Time Horizon
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Select
                      value={strategyData.timeHorizon}
                      onChange={(e) => setStrategyData(prev => ({ ...prev, timeHorizon: e.target.value as any }))}
                    >
                      <MenuItem value="Short-term">Short-term</MenuItem>
                      <MenuItem value="Medium-term">Medium-term</MenuItem>
                      <MenuItem value="Long-term">Long-term</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="h6" gutterBottom>
                    Trading Focus
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={strategyData.focus}
                      onChange={(e) => setStrategyData(prev => ({ ...prev, focus: e.target.value as any }))}
                    >
                      <MenuItem value="Momentum">Momentum</MenuItem>
                      <MenuItem value="Mean Reversion">Mean Reversion</MenuItem>
                      <MenuItem value="Breakout">Breakout</MenuItem>
                      <MenuItem value="Arbitrage">Arbitrage</MenuItem>
                      <MenuItem value="Sentiment">Sentiment</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Create Your Strategy's Story
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Origin Story
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AIIcon />}
                  onClick={generateAIStory}
                  disabled={generatingStory}
                >
                  {generatingStory ? 'Generating...' : 'AI Generate Story'}
                </Button>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={8}
                value={strategyData.story}
                onChange={(e) => setStrategyData(prev => ({ ...prev, story: e.target.value }))}
                placeholder="Tell the story of how your strategy came to be... What makes it unique? What drives it? What is its purpose in the market?"
                variant="outlined"
                helperText="This story will be displayed on your strategy's profile and help others understand its philosophy"
              />
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> Make your story personal and authentic. Include details about your trading philosophy, 
                what inspired you to create this strategy, and what makes it special to you.
              </Typography>
            </Alert>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Review & Deploy Your Strategy
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: '16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={strategyData.avatar}
                      sx={{
                        width: 80,
                        height: 80,
                        mr: 3,
                        fontSize: '2rem',
                        background: strategyData.avatar ? 'transparent' : 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                      }}
                    >
                      {strategyData.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {strategyData.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {strategyData.focus} • {strategyData.riskProfile} • {strategyData.timeHorizon}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {strategyData.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    <Chip label={strategyData.focus} color="primary" />
                    <Chip label={strategyData.riskProfile} variant="outlined" />
                    <Chip label={strategyData.timeHorizon} variant="outlined" />
                    <Chip label={strategyData.visualStyle} variant="outlined" />
                  </Box>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Strategy Story
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, fontStyle: 'italic' }}>
                    {strategyData.story || 'No story provided yet...'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={strategyData.isPublic}
                    onChange={(e) => setStrategyData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                }
                label="Make strategy public on marketplace"
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const getStrategyIcon = (strategyId: string) => {
    switch (strategyId) {
      case 'phoenix':
        return <FireIcon sx={{ fontSize: '1.8rem' }} />;
      case 'sage':
        return <PersonIcon sx={{ fontSize: '1.8rem' }} />;
      case 'alchemist':
        return <OreIcon sx={{ fontSize: '1.8rem' }} />;
      case 'storm':
        return <LightningIcon sx={{ fontSize: '1.8rem' }} />;
      default:
        return <BowlIcon sx={{ fontSize: '1.8rem' }} />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="🍽️ Strategy Creator"
            color="primary"
            sx={{ 
              mb: 2,
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              color: 'white'
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 800,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Craft Your Strategy
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
          >
            Create a unique, personalized trading strategy with its own identity, story, and visual style
          </Typography>
        </Box>
      </motion.div>

      {/* Progress Steps */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {steps.map((step, index) => (
            <Grid item xs key={index}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: '12px',
                  background: index <= activeStep 
                    ? 'linear-gradient(45deg, rgba(102, 126, 234, 0.1) 30%, rgba(118, 75, 162, 0.1) 90%)'
                    : 'rgba(255, 255, 255, 0.5)',
                  border: index <= activeStep 
                    ? '1px solid #667eea'
                    : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {index + 1}. {step}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Step Content */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minHeight: '400px'
          }}
        >
          {renderStepContent()}
        </Paper>
      </motion.div>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
          disabled={activeStep === 0}
          sx={{ borderRadius: '12px', px: 4 }}
        >
          Previous
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setActiveStep(prev => prev + 1)}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                borderRadius: '12px',
                px: 4,
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                }
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSaveStrategy}
              disabled={loading}
              startIcon={loading ? <LinearProgress /> : <SaveIcon />}
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                borderRadius: '12px',
                px: 4,
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
                }
              }}
            >
              {loading ? 'Creating Strategy...' : 'Deploy Strategy'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Image Generation Dialog */}
      <Dialog
        open={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Customize Strategy Avatar</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose how you want to create your strategy's avatar
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => {
                fileInputRef.current?.click();
                setShowImageDialog(false);
              }}
            >
              Upload Image
            </Button>
            <Button
              variant="outlined"
              startIcon={<AIIcon />}
              onClick={() => {
                generateAIAvatar();
                setShowImageDialog(false);
              }}
            >
              AI Generate
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImageDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StrategyCreator; 