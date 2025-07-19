import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    LinearProgress,
    Alert,
    Tab,
    Tabs,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextareaAutosize,
} from '@mui/material';
import {
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Link as LinkIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    Description as NoteIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Visibility as ViewIcon,
    Download as DownloadIcon,
    Science as ResearchIcon,
    Code as DevelopmentIcon,
    SmartToy as AgentIcon,
    TrendingUp as QuantIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ResearchItem {
    id: string;
    type: 'pdf' | 'url' | 'note' | 'image';
    title: string;
    content?: string;
    url?: string;
    fileName?: string;
    fileSize?: number;
    tags: string[];
    summary?: string;
    dateAdded: Date;
    lastModified: Date;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface Factor {
    id: number;
    name: string;
    confidence: number;
    status: string;
}

interface Agent {
    id: number;
    name: string;
    status: string;
    task: string;
}

interface Strategy {
    id: number;
    name: string;
    performance: number;
    sharpe: number;
    status: string;
}

interface Progress {
    research: number;
    development: number;
    agent: number;
    quant: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`corpus-tabpanel-${index}`}
            aria-labelledby={`corpus-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const ResearchCorpus: React.FC = () => {
    const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'url' | 'note' | 'edit'>('note');
    const [currentItem, setCurrentItem] = useState<Partial<ResearchItem>>({});
    
    // R&D Framework state
    const [progress, setProgress] = useState<Progress>({
        research: 85,
        development: 65,
        agent: 40,
        quant: 75
    });

    const [factors] = useState<Factor[]>([
        { id: 1, name: 'Momentum Factor', confidence: 0.87, status: 'validated' },
        { id: 2, name: 'Mean Reversion', confidence: 0.72, status: 'testing' },
        { id: 3, name: 'Volume Profile', confidence: 0.91, status: 'validated' },
        { id: 4, name: 'Sentiment Score', confidence: 0.68, status: 'research' }
    ]);

    const [agents] = useState<Agent[]>([
        { id: 1, name: 'Research Agent', status: 'active', task: 'Factor Discovery' },
        { id: 2, name: 'Development Agent', status: 'active', task: 'Strategy Implementation' },
        { id: 3, name: 'Risk Agent', status: 'monitoring', task: 'Risk Assessment' },
        { id: 4, name: 'Execution Agent', status: 'standby', task: 'Trade Execution' }
    ]);

    const [strategies] = useState<Strategy[]>([
        { id: 1, name: 'SOL/USDC Momentum', performance: 12.5, sharpe: 1.8, status: 'live' },
        { id: 2, name: 'Multi-Asset Mean Rev', performance: 8.3, sharpe: 1.4, status: 'testing' },
        { id: 3, name: 'Sentiment Arbitrage', performance: 15.2, sharpe: 2.1, status: 'development' }
    ]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Available tags for categorization
    const availableTags = [
        'Technical Analysis', 'Fundamental Analysis', 'Market Structure', 
        'Risk Management', 'Portfolio Theory', 'Quantitative Methods',
        'Behavioral Finance', 'Macro Economics', 'DeFi', 'NFTs',
        'Solana', 'Bitcoin', 'Ethereum', 'Altcoins', 'Trading Psychology'
    ];

    // Progress update effect
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => ({
                research: Math.min(100, prev.research + Math.random() * 2),
                development: Math.min(100, prev.development + Math.random() * 1.5),
                agent: Math.min(100, prev.agent + Math.random() * 3),
                quant: Math.min(100, prev.quant + Math.random() * 1)
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
        switch (status) {
            case 'validated':
            case 'active':
            case 'live':
                return 'success';
            case 'testing':
            case 'monitoring':
                return 'info';
            case 'research':
            case 'development':
            case 'standby':
                return 'warning';
            default:
                return 'error';
        }
    };

    const handleFileUpload = useCallback(async (files: FileList, type: 'pdf' | 'image') => {
        setIsUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Simulate upload progress
            for (let progress = 0; progress <= 100; progress += 10) {
                setUploadProgress(progress);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const newItem: ResearchItem = {
                id: `${type}_${Date.now()}_${i}`,
                type,
                title: file.name.replace(/\.[^/.]+$/, ""),
                fileName: file.name,
                fileSize: file.size,
                tags: [],
                dateAdded: new Date(),
                lastModified: new Date(),
            };

            setResearchItems(prev => [...prev, newItem]);
        }

        setIsUploading(false);
        setUploadProgress(0);
    }, []);

    const handleAddUrl = (urlData: { title: string; url: string; summary?: string; tags: string[] }) => {
        const newItem: ResearchItem = {
            id: `url_${Date.now()}`,
            type: 'url',
            title: urlData.title,
            url: urlData.url,
            summary: urlData.summary,
            tags: urlData.tags,
            dateAdded: new Date(),
            lastModified: new Date(),
        };

        setResearchItems(prev => [...prev, newItem]);
        setDialogOpen(false);
        setCurrentItem({});
    };

    const handleAddNote = (noteData: { title: string; content: string; tags: string[] }) => {
        const newItem: ResearchItem = {
            id: `note_${Date.now()}`,
            type: 'note',
            title: noteData.title,
            content: noteData.content,
            tags: noteData.tags,
            dateAdded: new Date(),
            lastModified: new Date(),
        };

        setResearchItems(prev => [...prev, newItem]);
        setDialogOpen(false);
        setCurrentItem({});
    };

    const handleEditItem = (item: ResearchItem) => {
        setCurrentItem(item);
        setDialogType('edit');
        setDialogOpen(true);
    };

    const handleDeleteItem = (id: string) => {
        setResearchItems(prev => prev.filter(item => item.id !== id));
    };

    const filteredItems = researchItems.filter(item => {
        const matchesSearch = !searchQuery || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesTags = selectedTags.length === 0 || 
            selectedTags.some(tag => item.tags.includes(tag));
        
        return matchesSearch && matchesTags;
    });

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <PdfIcon color="error" />;
            case 'image': return <ImageIcon color="primary" />;
            case 'url': return <LinkIcon color="success" />;
            case 'note': return <NoteIcon color="warning" />;
            default: return <NoteIcon />;
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Research Corpus Manager
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Organize your research materials, PDFs, URLs, and notes to build a comprehensive knowledge base for your trading strategies.
                    </Typography>

                    {/* Upload Progress */}
                    {isUploading && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="primary">
                                Uploading...
                            </Typography>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item>
                            <Button
                                variant="contained"
                                startIcon={<UploadIcon />}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                Upload PDF
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'pdf')}
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                startIcon={<ImageIcon />}
                                onClick={() => imageInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                Upload Image
                            </Button>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'image')}
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                startIcon={<LinkIcon />}
                                onClick={() => {
                                    setDialogType('url');
                                    setDialogOpen(true);
                                }}
                            >
                                Add URL
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setDialogType('note');
                                    setDialogOpen(true);
                                }}
                            >
                                Add Note
                            </Button>
                        </Grid>
                    </Grid>

                    {/* Search and Filters */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search research items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Filter by Tags</InputLabel>
                                <Select
                                    multiple
                                    value={selectedTags}
                                    onChange={(e) => setSelectedTags(e.target.value as string[])}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {availableTags.map((tag) => (
                                        <MenuItem key={tag} value={tag}>
                                            {tag}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Research Items */}
                <Paper sx={{ p: 3 }}>
                    <Tabs
                        value={currentTab}
                        onChange={(_, newValue) => setCurrentTab(newValue)}
                        sx={{ mb: 2 }}
                    >
                        <Tab label="All Items" />
                        <Tab label="PDFs" />
                        <Tab label="URLs" />
                        <Tab label="Notes" />
                        <Tab label="Images" />
                        <Tab label="Research" />
                        <Tab label="Development" />
                        <Tab label="Agent Framework" />
                        <Tab label="Quant Strategies" />
                    </Tabs>

                    <TabPanel value={currentTab} index={0}>
                        {filteredItems.length === 0 ? (
                            <Alert severity="info">
                                No research items found. Start by uploading some PDFs or adding URLs!
                            </Alert>
                        ) : (
                            <Grid container spacing={2}>
                                {filteredItems.map((item) => (
                                    <Grid item xs={12} md={6} lg={4} key={item.id}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    {getItemIcon(item.type)}
                                                    <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                                                        {item.title}
                                                    </Typography>
                                                </Box>
                                                
                                                {item.summary && (
                                                    <Typography variant="body2" color="text.secondary" paragraph>
                                                        {item.summary}
                                                    </Typography>
                                                )}
                                                
                                                {item.fileSize && (
                                                    <Typography variant="caption" display="block">
                                                        {formatFileSize(item.fileSize)}
                                                    </Typography>
                                                )}
                                                
                                                <Box sx={{ mt: 2 }}>
                                                    {item.tags.map((tag) => (
                                                        <Chip 
                                                            key={tag} 
                                                            label={tag} 
                                                            size="small" 
                                                            sx={{ mr: 0.5, mb: 0.5 }} 
                                                        />
                                                    ))}
                                                </Box>
                                                
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                    Added: {item.dateAdded.toLocaleDateString()}
                                                </Typography>
                                            </CardContent>
                                            
                                            <CardActions>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditItem(item)}
                                                    title="Edit"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    title="View"
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                                {item.url && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => window.open(item.url, '_blank')}
                                                        title="Open Link"
                                                    >
                                                        <LinkIcon />
                                                    </IconButton>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    title="Delete"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </TabPanel>

                    {/* Type-specific tabs */}
                    {[1, 2, 3, 4].map((tabIndex) => {
                        const types = ['pdf', 'url', 'note', 'image'];
                        const type = types[tabIndex - 1];
                        const typeItems = filteredItems.filter(item => item.type === type);
                        
                        return (
                            <TabPanel key={tabIndex} value={currentTab} index={tabIndex}>
                                {typeItems.length === 0 ? (
                                    <Alert severity="info">
                                        No {type} items found.
                                    </Alert>
                                ) : (
                                    <Grid container spacing={2}>
                                        {typeItems.map((item) => (
                                            <Grid item xs={12} md={6} lg={4} key={item.id}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6">{item.title}</Typography>
                                                        {item.summary && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {item.summary}
                                                            </Typography>
                                                        )}
                                                    </CardContent>
                                                    <CardActions>
                                                        <IconButton onClick={() => handleEditItem(item)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleDeleteItem(item.id)} color="error">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </TabPanel>
                        );
                    })}

                    <TabPanel value={currentTab} index={5}>
                        {/* Research Tab */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <ResearchIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="h6">
                                                Factor Discovery Engine
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Automated discovery and validation of trading factors
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {factors.map((factor) => (
                                                <Box 
                                                    key={factor.id} 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center',
                                                        p: 2,
                                                        bgcolor: 'grey.50',
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {factor.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Confidence: {(factor.confidence * 100).toFixed(1)}%
                                                        </Typography>
                                                    </Box>
                                                    <Chip 
                                                        label={factor.status} 
                                                        color={getStatusColor(factor.status)}
                                                        size="small"
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} lg={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Research Progress
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {Math.round(progress.research)}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={progress.research} 
                                            sx={{ height: 8, borderRadius: 4, mb: 3 }}
                                        />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Hypothesis Generated</Typography>
                                                <Typography variant="h5" color="primary.main">247</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Factors Validated</Typography>
                                                <Typography variant="h5" color="success.main">89</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Papers Analyzed</Typography>
                                                <Typography variant="h5" color="secondary.main">1,432</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={currentTab} index={6}>
                        {/* Development Tab */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <DevelopmentIcon sx={{ mr: 1, color: 'success.main' }} />
                                            <Typography variant="h6">
                                                Development Pipeline
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {Math.round(progress.development)}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={progress.development} 
                                            color="success"
                                            sx={{ height: 8, borderRadius: 4, mb: 3 }}
                                        />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
                                                <Typography variant="body1" fontWeight="medium">Code Generation</Typography>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    Generating strategy implementations from research findings
                                                </Typography>
                                                <LinearProgress variant="determinate" value={78} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                                            </Box>
                                            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'white' }}>
                                                <Typography variant="body1" fontWeight="medium">Backtesting</Typography>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    Running historical performance analysis
                                                </Typography>
                                                <LinearProgress variant="determinate" value={92} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} lg={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Development Stats
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Strategies Developed</Typography>
                                                <Typography variant="h5" color="primary.main">156</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Tests Completed</Typography>
                                                <Typography variant="h5" color="success.main">2,847</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Code Lines Generated</Typography>
                                                <Typography variant="h5" color="secondary.main">45.2K</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={currentTab} index={7}>
                        {/* Agent Framework Tab */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <AgentIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                            <Typography variant="h6">
                                                Multi-Agent System
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {Math.round(progress.agent)}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={progress.agent} 
                                            color="secondary"
                                            sx={{ height: 8, borderRadius: 4, mb: 3 }}
                                        />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {agents.map((agent) => (
                                                <Box 
                                                    key={agent.id} 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center',
                                                        p: 2,
                                                        bgcolor: 'grey.50',
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {agent.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {agent.task}
                                                        </Typography>
                                                    </Box>
                                                    <Chip 
                                                        label={agent.status} 
                                                        color={getStatusColor(agent.status)}
                                                        size="small"
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} lg={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Agent Performance
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Active Agents</Typography>
                                                <Typography variant="h5" color="primary.main">4/4</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Tasks Completed</Typography>
                                                <Typography variant="h5" color="success.main">1,247</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Coordination Score</Typography>
                                                <Typography variant="h5" color="secondary.main">94%</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={currentTab} index={8}>
                        {/* Quant Strategies Tab */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <QuantIcon sx={{ mr: 1, color: 'warning.main' }} />
                                            <Typography variant="h6">
                                                Active Strategies
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {Math.round(progress.quant)}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={progress.quant} 
                                            color="warning"
                                            sx={{ height: 8, borderRadius: 4, mb: 3 }}
                                        />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {strategies.map((strategy) => (
                                                <Box 
                                                    key={strategy.id} 
                                                    sx={{ 
                                                        p: 2,
                                                        bgcolor: 'grey.50',
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {strategy.name}
                                                        </Typography>
                                                        <Chip 
                                                            label={strategy.status} 
                                                            color={getStatusColor(strategy.status)}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Performance: 
                                                                <Typography component="span" color="success.main" fontWeight="medium" sx={{ ml: 1 }}>
                                                                    +{strategy.performance}%
                                                                </Typography>
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Sharpe: 
                                                                <Typography component="span" fontWeight="medium" sx={{ ml: 1 }}>
                                                                    {strategy.sharpe}
                                                                </Typography>
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} lg={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Portfolio Metrics
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Total Return</Typography>
                                                <Typography variant="h5" color="success.main">+24.7%</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Sharpe Ratio</Typography>
                                                <Typography variant="h5" color="primary.main">1.85</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Max Drawdown</Typography>
                                                <Typography variant="h5" color="error.main">-3.2%</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">Win Rate</Typography>
                                                <Typography variant="h5" color="secondary.main">72%</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>
                </Paper>
            </motion.div>

            {/* Add/Edit Dialog */}
            <AddEditDialog
                open={dialogOpen}
                type={dialogType}
                item={currentItem}
                availableTags={availableTags}
                onClose={() => {
                    setDialogOpen(false);
                    setCurrentItem({});
                }}
                onSave={(data) => {
                    if (dialogType === 'url') {
                        handleAddUrl(data);
                    } else if (dialogType === 'note') {
                        handleAddNote(data);
                    }
                }}
            />
        </Box>
    );
}

// Add/Edit Dialog Component
interface AddEditDialogProps {
    open: boolean;
    type: 'url' | 'note' | 'edit';
    item: Partial<ResearchItem>;
    availableTags: string[];
    onClose: () => void;
    onSave: (data: any) => void;
}

function AddEditDialog({ open, type, item, availableTags, onClose, onSave }: AddEditDialogProps) {
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        content: '',
        summary: '',
        tags: [] as string[],
    });

    React.useEffect(() => {
        if (item) {
            setFormData({
                title: item.title || '',
                url: item.url || '',
                content: item.content || '',
                summary: item.summary || '',
                tags: item.tags || [],
            });
        }
    }, [item]);

    const handleSave = () => {
        onSave(formData);
        setFormData({ title: '', url: '', content: '', summary: '', tags: [] });
    };

    const getDialogTitle = () => {
        switch (type) {
            case 'url': return 'Add URL';
            case 'note': return 'Add Note';
            case 'edit': return 'Edit Item';
            default: return 'Add Item';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </Grid>
                    
                    {type === 'url' && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="URL"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                required
                            />
                        </Grid>
                    )}
                    
                    {type === 'note' && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                multiline
                                rows={6}
                                required
                            />
                        </Grid>
                    )}
                    
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Summary"
                            value={formData.summary}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            multiline
                            rows={3}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Tags</InputLabel>
                            <Select
                                multiple
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value as string[] })}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {availableTags.map((tag) => (
                                    <MenuItem key={tag} value={tag}>
                                        {tag}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained"
                    disabled={!formData.title}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ResearchCorpus; 