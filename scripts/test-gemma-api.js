const axios = require('axios');

async function testGemmaAPI() {
  console.log('🧪 Testing Gemma API...');
  
  const endpoint = 'https://yoree-gemma-827561407333.europe-west1.run.app/v1beta/models/gemma3:4b:generateContent';
  
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
    console.log('📡 Making request to:', endpoint);
    console.log('📝 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(endpoint, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'yoree-test/1.0'
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
    console.error('❌ Error testing Gemma API:');
    console.error('Message:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Full Error:', error);
  }
}

testGemmaAPI(); 