import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  ListItemSecondaryAction,
  Paper,
  Avatar,
  Stack,
  Divider,
  Menu,
  MenuItem,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Storage as StorageIcon,
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Cloud as CloudIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  FolderOpen as FolderOpenIcon,
  CloudSync as CloudSyncIcon,
  AccountTree as AccountTreeIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface VaultItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'url' | 'text';
  size?: number;
  mimeType?: string;
  url?: string;
  content?: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  connectedTo?: {
    cloud: string[];
    accounts: string[];
    directories: string[];
  };
}

interface CloudConnection {
  id: string;
  name: string;
  type: 'google_drive' | 'dropbox' | 'ipfs' | 'arweave' | 's3';
  status: 'connected' | 'disconnected';
  lastSync?: string;
}

const DataVault: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [cloudConnections, setCloudConnections] = useState<CloudConnection[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<VaultItem | null>(null);

  useEffect(() => {
    loadVaultData();
    loadCloudConnections();
  }, []);

  const loadVaultData = () => {
    // Mock vault data
    const mockItems: VaultItem[] = [
      {
        id: '1',
        name: 'ETH Research Notes.pdf',
        type: 'file',
        size: 2456789,
        mimeType: 'application/pdf',
        path: '/',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['research', 'eth', 'fundamental'],
        connectedTo: {
          cloud: ['google_drive'],
          accounts: [],
          directories: ['/Documents/Crypto'],
        },
      },
      {
        id: '2',
        name: 'BTC Sentiment Analysis',
        type: 'text',
        content: 'Bitcoin sentiment analysis from Twitter and Reddit...',
        path: '/',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sentiment', 'btc', 'social'],
      },
      {
        id: '3',
        name: 'DeFi Protocols Data',
        type: 'folder',
        path: '/',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['defi', 'data'],
      },
      {
        id: '4',
        name: 'https://example.com/crypto-news',
        type: 'url',
        url: 'https://example.com/crypto-news',
        path: '/',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['url', 'news'],
      },
    ];
    setItems(mockItems);
  };

  const loadCloudConnections = () => {
    const mockConnections: CloudConnection[] = [
      {
        id: '1',
        name: 'Google Drive',
        type: 'google_drive',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        name: 'IPFS',
        type: 'ipfs',
        status: 'connected',
        lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        name: 'Local Directory',
        type: 's3',
        status: 'disconnected',
      },
    ];
    setCloudConnections(mockConnections);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const newItem: VaultItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'file',
          size: file.size,
          mimeType: file.type,
          path: currentPath.join('/') || '/',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
        };
        setItems(prev => [...prev, newItem]);
      });
    }
    setShowUploadDialog(false);
  };

  const handleFolderSelect = () => {
    // In a real implementation, this would use the File System Access API
    alert('Folder selection will be implemented with File System Access API');
  };

  const handleItemClick = (item: VaultItem) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.name]);
    } else {
      setSelectedItem(item);
      setShowViewDialog(true);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: VaultItem) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  const handleDelete = (item: VaultItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    handleMenuClose();
  };

  const getFileIcon = (item: VaultItem) => {
    if (item.type === 'folder') return <FolderIcon />;
    if (item.type === 'url') return <LinkIcon />;
    if (item.mimeType?.includes('pdf')) return <DescriptionIcon />;
    if (item.mimeType?.includes('image')) return <ImageIcon />;
    if (item.mimeType?.includes('json') || item.mimeType?.includes('csv')) return <TableChartIcon />;
    if (item.mimeType?.includes('text')) return <CodeIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFilteredItems = () => {
    let filtered = items.filter(item => {
      const path = currentPath.join('/');
      return item.path === (path || '/');
    });

    if (activeTab === 1) {
      filtered = filtered.filter(item => item.type === 'file');
    } else if (activeTab === 2) {
      filtered = filtered.filter(item => item.type === 'folder');
    } else if (activeTab === 3) {
      filtered = filtered.filter(item => item.type === 'url');
    }

    return filtered;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  mb: 1,
                }}
              >
                Data Vault
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                Store, organize, and connect your signal corpus
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FolderOpenIcon />}
                onClick={handleFolderSelect}
                sx={{ borderRadius: '12px' }}
              >
                Connect Folder
              </Button>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Upload Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </Stack>
          </Box>
        </motion.div>

        {/* Cloud Connections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            sx={{
              mb: 4,
              p: 3,
              borderRadius: '16px',
              background: theme.palette.mode === 'dark'
                ? 'rgba(26, 31, 58, 0.6)'
                : 'rgba(255, 255, 255, 0.8)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Cloud Connections
              </Typography>
              <Button
                size="small"
                startIcon={<CloudSyncIcon />}
                sx={{ borderRadius: '12px' }}
              >
                Sync All
              </Button>
            </Box>
            <Grid container spacing={2}>
              {cloudConnections.map((connection) => (
                <Grid item xs={12} sm={6} md={4} key={connection.id}>
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(26, 31, 58, 0.4)'
                        : 'rgba(255, 255, 255, 0.6)',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: connection.status === 'connected' ? '#00FF8820' : '#94A3B820',
                        }}
                      >
                        <CloudIcon sx={{ color: connection.status === 'connected' ? '#00FF88' : theme.palette.text.secondary }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {connection.name}
                        </Typography>
                        <Chip
                          label={connection.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            backgroundColor: connection.status === 'connected' ? '#00FF8820' : '#FF444420',
                            color: connection.status === 'connected' ? '#00FF88' : '#FF4444',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                    {connection.lastSync && (
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block' }}>
                        Last sync: {new Date(connection.lastSync).toLocaleString()}
                      </Typography>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </motion.div>

        {/* Breadcrumb */}
        {currentPath.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              onClick={() => setCurrentPath([])}
              sx={{ color: theme.palette.text.secondary }}
            >
              Root
            </Button>
            {currentPath.map((path, index) => (
              <React.Fragment key={index}>
                <Typography sx={{ color: theme.palette.text.secondary }}>/</Typography>
                <Button
                  size="small"
                  onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {path}
                </Button>
              </React.Fragment>
            ))}
          </Box>
        )}

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px 12px 0 0',
              },
            }}
          >
            <Tab label="All Items" />
            <Tab label="Files" />
            <Tab label="Folders" />
            <Tab label="URLs" />
          </Tabs>
        </Box>

        {/* Items Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Grid container spacing={2}>
            {getFilteredItems().map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    onClick={() => handleItemClick(item)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: '16px',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(26, 31, 58, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
                        transform: 'translateY(-4px)',
                        borderColor: '#667eea',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            mr: 2,
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(102, 126, 234, 0.2)'
                              : 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea',
                          }}
                        >
                          {getFileIcon(item)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.name}
                          </Typography>
                          {item.size && (
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {formatFileSize(item.size)}
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, item);
                          }}
                        >
                          <MoreVertIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Box>

                      {item.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                          {item.tags.slice(0, 2).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                backgroundColor: `${theme.palette.primary.main}20`,
                                color: theme.palette.primary.main,
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      {item.connectedTo && (
                        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                            Connected to:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {item.connectedTo.cloud.length > 0 && (
                              <Chip
                                icon={<CloudIcon sx={{ fontSize: 14 }} />}
                                label={`${item.connectedTo.cloud.length} cloud`}
                                size="small"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                            {item.connectedTo.directories.length > 0 && (
                              <Chip
                                icon={<FolderIcon sx={{ fontSize: 14 }} />}
                                label={`${item.connectedTo.directories.length} dirs`}
                                size="small"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 1 }}>
                        Updated {new Date(item.updatedAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {getFilteredItems().length === 0 && (
            <Card
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: '16px',
                background: theme.palette.mode === 'dark'
                  ? 'rgba(26, 31, 58, 0.6)'
                  : 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <StorageIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                No items found
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                Upload files or connect folders to start building your data vault
              </Typography>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Upload Files
              </Button>
            </Card>
          )}
        </motion.div>

        {/* View Dialog */}
        <Dialog
          open={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              background: theme.palette.mode === 'dark'
                ? 'rgba(26, 31, 58, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          {selectedItem && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(102, 126, 234, 0.2)'
                        : 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                    }}
                  >
                    {getFileIcon(selectedItem)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      {selectedItem.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {selectedItem.type} • {selectedItem.size ? formatFileSize(selectedItem.size) : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    {selectedItem.type === 'text' && selectedItem.content && (
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(0, 0, 0, 0.2)'
                            : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary, whiteSpace: 'pre-wrap' }}>
                          {selectedItem.content}
                        </Typography>
                      </Paper>
                    )}
                    {selectedItem.type === 'url' && selectedItem.url && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                          URL
                        </Typography>
                        <Button
                          href={selectedItem.url}
                          target="_blank"
                          startIcon={<LinkIcon />}
                          sx={{ textTransform: 'none' }}
                        >
                          {selectedItem.url}
                        </Button>
                      </Box>
                    )}
                    {selectedItem.type === 'file' && (
                      <Alert severity="info" sx={{ borderRadius: '12px' }}>
                        File preview will be available for supported file types
                      </Alert>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedItem.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      Created
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                      {new Date(selectedItem.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>

                  {selectedItem.connectedTo && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Connections
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedItem.connectedTo.cloud.length > 0 && (
                          <Grid item xs={12} sm={4}>
                            <Card
                              sx={{
                                p: 2,
                                borderRadius: '12px',
                                background: theme.palette.mode === 'dark'
                                  ? 'rgba(0, 0, 0, 0.2)'
                                  : 'rgba(0, 0, 0, 0.02)',
                              }}
                            >
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                                Cloud Storage
                              </Typography>
                              {selectedItem.connectedTo.cloud.map((cloud) => (
                                <Chip
                                  key={cloud}
                                  label={cloud}
                                  size="small"
                                  icon={<CloudIcon />}
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Card>
                          </Grid>
                        )}
                        {selectedItem.connectedTo.directories.length > 0 && (
                          <Grid item xs={12} sm={4}>
                            <Card
                              sx={{
                                p: 2,
                                borderRadius: '12px',
                                background: theme.palette.mode === 'dark'
                                  ? 'rgba(0, 0, 0, 0.2)'
                                  : 'rgba(0, 0, 0, 0.02)',
                              }}
                            >
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                                Local Directories
                              </Typography>
                              {selectedItem.connectedTo.directories.map((dir) => (
                                <Chip
                                  key={dir}
                                  label={dir}
                                  size="small"
                                  icon={<FolderIcon />}
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={() => setShowViewDialog(false)} sx={{ borderRadius: '12px' }}>
                  Close
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{ borderRadius: '12px' }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  sx={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Download
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              background: theme.palette.mode === 'dark'
                ? 'rgba(26, 31, 58, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          {menuItem && (
            <>
              <MenuItem onClick={() => {
                setSelectedItem(menuItem);
                setShowViewDialog(true);
                handleMenuClose();
              }}>
                <ListItemIcon>
                  <ViewIcon fontSize="small" />
                </ListItemIcon>
                View
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                Edit
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                Download
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  if (menuItem) handleDelete(menuItem);
                }}
                sx={{ color: theme.palette.error.main }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                </ListItemIcon>
                Delete
              </MenuItem>
            </>
          )}
        </Menu>
      </Container>
    </Box>
  );
};

export default DataVault;
