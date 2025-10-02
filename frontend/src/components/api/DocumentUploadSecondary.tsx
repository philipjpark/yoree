import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Paper
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  FileCopy as FileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentUploadSecondaryProps {
  onDocumentProcessed?: (summary: string) => void;
  onError?: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  summary?: string;
  error?: string;
}

const DocumentUploadSecondary: React.FC<DocumentUploadSecondaryProps> = ({
  onDocumentProcessed,
  onError,
  maxFileSize = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt']
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > maxFileSize * 1024 * 1024) {
        onError?.(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        return;
      }

      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        onError?.(`File type ${fileExtension} is not supported.`);
        return;
      }

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, newFile]);
      processFile(newFile);
    });
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    // Simulate file processing
    setUploadedFiles(prev => 
      prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'processing' } : f)
    );

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { ...f, progress } : f)
      );
    }

    // Simulate document analysis
    const summary = await generateDocumentSummary(uploadedFile.file);
    
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'completed', progress: 100, summary }
          : f
      )
    );

    onDocumentProcessed?.(summary);
  };

  const generateDocumentSummary = async (file: File): Promise<string> => {
    // Simulate AI document analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSummaries = [
      "This research paper discusses advanced trading strategies using machine learning algorithms. Key findings include improved risk management through dynamic position sizing and enhanced market timing using sentiment analysis.",
      "The document presents a comprehensive analysis of cryptocurrency market volatility patterns. Main insights focus on correlation structures between different digital assets and their impact on portfolio diversification strategies.",
      "This study examines the effectiveness of technical indicators in predicting short-term price movements. Results show that combining multiple indicators with machine learning models significantly improves prediction accuracy.",
      "The research explores behavioral finance principles applied to cryptocurrency trading. Key recommendations include implementing systematic approaches to overcome cognitive biases and emotional decision-making."
    ];

    return mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <LinearProgress sx={{ width: 20, height: 20, borderRadius: '50%' }} />;
      case 'completed':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <FileIcon />;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            📄 Document Upload (Optional)
          </Typography>
          <Chip 
            label="Secondary" 
            size="small" 
            color="secondary" 
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload research documents for additional context. This supplements the API-powered insights above.
        </Typography>

        <Paper
          sx={{
            border: `2px dashed ${isDragOver ? 'primary.main' : 'grey.300'}`,
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            backgroundColor: isDragOver ? 'action.hover' : 'transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drop files here or click to browse
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Supported formats: {acceptedTypes.join(', ')} (max {maxFileSize}MB)
          </Typography>
          <Button variant="outlined" size="small">
            Choose Files
          </Button>
        </Paper>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />

        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Uploaded Documents
              </Typography>
              <List>
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListItem
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: 'background.paper'
                      }}
                    >
                      <ListItemIcon>
                        {getStatusIcon(file.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.file.name}
                        secondary={
                          file.status === 'processing' ? (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Processing... {file.progress}%
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={file.progress} 
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          ) : file.status === 'completed' ? (
                            <Typography variant="caption" color="success.main">
                              Analysis complete
                            </Typography>
                          ) : file.status === 'error' ? (
                            <Typography variant="caption" color="error.main">
                              {file.error || 'Processing failed'}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          )
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeFile(file.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>

                    {file.status === 'completed' && file.summary && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            mt: 1,
                            backgroundColor: 'success.light',
                            color: 'success.contrastText',
                            borderRadius: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Document Analysis Summary
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {file.summary}
                          </Typography>
                        </Paper>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </List>
            </motion.div>
          )}
        </AnimatePresence>

        {uploadedFiles.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> Document upload is optional. The API-powered research above provides comprehensive insights. 
              Upload documents only if you have specific research papers or reports you'd like to include.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUploadSecondary;

