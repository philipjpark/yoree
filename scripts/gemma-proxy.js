const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for Gemma API
app.post('/api/gemma', async (req, res) => {
  try {
    console.log('📡 Proxying request to Gemma API...');
    
    const gemmaEndpoint = 'https://yoree-gemma-827561407333.europe-west1.run.app/v1beta/models/gemma3:4b:generateContent';
    
    const response = await axios.post(gemmaEndpoint, req.body, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'yoree-proxy/1.0'
      }
    });
    
    console.log('✅ Gemma API response received:', response.status);
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error proxying to Gemma API:', error.message);
    res.status(500).json({
      error: 'Failed to call Gemma API',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gemma proxy is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Gemma proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxy endpoint: http://localhost:${PORT}/api/gemma`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
}); 