const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for Gemma API
app.post('/api/gemma', async (req, res) => {
  try {
    console.log('🔄 Proxying request to Gemma API...');
    
    const gemmaUrl = 'https://yoree-gemma-827561407333.europe-west1.run.app/v1beta/models/gemma3:4b:generateContent';
    
    const response = await axios.post(gemmaUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'yoree-proxy/1.0',
        'Authorization': `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`
      },
      timeout: 30000
    });
    
    console.log('✅ Gemma API response received:', response.status);
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({
      error: 'Failed to proxy request to Gemma API',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'YOREE Proxy Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 YOREE Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to Gemma API`);
  console.log(`🔑 API key: ${process.env.GOOGLE_CLOUD_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
}); 