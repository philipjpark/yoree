const axios = require('axios');

async function testProxy() {
  console.log('🧪 Testing Gemma proxy...');
  
  const payload = {
    contents: [
      {
        parts: [
          {
            text: "Hello! Please respond with a simple greeting in Vietnamese."
          }
        ]
      }
    ]
  };
  
  try {
    console.log('📡 Making request to proxy...');
    console.log('📝 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/gemma', payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response status:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        console.log('🎯 Generated text:', candidate.content.parts[0].text);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing proxy:');
    console.error('Message:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
  }
}

testProxy(); 