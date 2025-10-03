import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import openaiCodexService from '../../services/openaiCodexService';

const ApiKeyTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiKey = async () => {
    setIsLoading(true);
    setTestResult('Testing API key...');
    
    try {
      const result = await openaiCodexService.testConnection();
      
      if (result.success) {
        setTestResult('✅ API key is working correctly!');
      } else {
        setTestResult(`❌ API key test failed: ${result.error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Error testing API key: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        OpenAI API Key Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testApiKey}
        disabled={isLoading}
        sx={{ mb: 2 }}
      >
        {isLoading ? 'Testing...' : 'Test API Key'}
      </Button>
      
      {testResult && (
        <Alert 
          severity={testResult.includes('✅') ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          {testResult}
        </Alert>
      )}
      
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        This will test if your OpenAI API key is valid and working.
      </Typography>
    </Paper>
  );
};

export default ApiKeyTest;
