import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  SkipNext as SkipNextIcon
} from '@mui/icons-material';

interface PDFUploaderProps {
  onPDFStored: (file: File | null) => void;
  storedPDF: File | null;
  onSkip: () => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({
  onPDFStored,
  storedPDF,
  onSkip
}) => {
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        onPDFStored(file);
        setError('');
      } else {
        setError('Please select a valid PDF file.');
      }
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onPDFStored(file);
      setError('');
    } else {
      setError('Please drop a valid PDF file.');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = () => {
    onPDFStored(null);
    setError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Research Document Storage
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload a research paper or document to store for later use in your strategy generation.
      </Typography>

      {/* Skip Option */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          You can skip this step if you don't have a research document to upload.
        </Typography>
        <Button
          variant="outlined"
          onClick={onSkip}
          startIcon={<SkipNextIcon />}
          size="small"
        >
          Skip This Step
        </Button>
      </Box>

      {/* File Upload Area */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              }
            }}
            onClick={() => document.getElementById('pdf-upload')?.click()}
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
          >
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {!storedPDF ? (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Research Document
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag and drop a PDF file here, or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Supported format: PDF
                </Typography>
              </Box>
            ) : (
              <Box>
                <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {storedPDF.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  PDF file stored successfully
                </Typography>
                <Chip 
                  label={`${formatFileSize(storedPDF.size)}`} 
                  size="small" 
                  color="info" 
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  Remove File
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* File Info Display */}
      {storedPDF && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stored Document
              </Typography>
              <Chip label="Ready for Strategy Generation" color="success" size="small" />
            </Box>
            
            <Paper
              sx={{
                p: 3,
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon color="primary" />
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {storedPDF.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Size: {formatFileSize(storedPDF.size)} | Type: PDF
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last modified: {new Date(storedPDF.lastModified).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              This document will be available for reference during your strategy generation process.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PDFUploader; 