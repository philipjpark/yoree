#!/usr/bin/env node

/**
 * Test script for YOREE Gemma 3-4B integration
 * Tests the deployed Gemma model on Google Cloud Run
 */

const https = require('https');

const GEMMA_URL = 'https://yoree-gemma-827561407333.europe-west1.run.app';

// Test prompt for trading strategy generation
const testPrompt = {
  prompt: "You are an expert quantitative trader. Generate a simple trading strategy for Bitcoin (BTC) with moderate risk tolerance. Include entry/exit rules and risk management.",
  max_tokens: 256,
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40
};

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: url.replace('https://', ''),
      port: 443,
      path: '/v1/models/gemma-3-4b:generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testGemmaConnection() {
  console.log('🧪 Testing YOREE Gemma 3-4B Integration...');
  console.log(`🌐 Gemma URL: ${GEMMA_URL}`);
  console.log('');

  try {
    console.log('📡 Sending test request to Gemma...');
    const response = await makeRequest(GEMMA_URL, testPrompt);
    
    console.log('✅ Gemma connection successful!');
    console.log('');
    
    if (response.predictions && response.predictions.length > 0) {
      const prediction = response.predictions[0];
      if (prediction.candidates && prediction.candidates.length > 0) {
        const candidate = prediction.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          const generatedText = candidate.content.parts[0].text;
          console.log('🤖 Generated Trading Strategy:');
          console.log('─'.repeat(50));
          console.log(generatedText);
          console.log('─'.repeat(50));
          console.log('');
          
          console.log('📊 Response Metadata:');
          console.log(`- Model: ${response.metadata?.model || 'Unknown'}`);
          console.log(`- Token Count: ${response.metadata?.token_count || 'Unknown'}`);
          console.log(`- Finish Reason: ${candidate.finish_reason || 'Unknown'}`);
          console.log('');
          
          console.log('🎉 YOREE Gemma integration is working perfectly!');
          console.log('🚀 Your AI agents can now use this powerful model for strategy generation.');
        } else {
          console.log('⚠️  No content generated in response');
        }
      } else {
        console.log('⚠️  No candidates in response');
      }
    } else {
      console.log('⚠️  No predictions in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing Gemma connection:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting tips:');
    console.log('1. Check if the Gemma service is running');
    console.log('2. Verify the URL is correct');
    console.log('3. Check Google Cloud Run service status');
    console.log('4. Ensure the service allows unauthenticated access');
  }
}

async function testTradingPrompts() {
  console.log('📈 Testing Trading-Specific Prompts...');
  console.log('');

  const tradingPrompts = [
    {
      name: 'Market Analysis',
      prompt: 'Analyze the current market conditions for Bitcoin (BTC). Provide a brief analysis of trend, support/resistance, and trading recommendations.',
      max_tokens: 200
    },
    {
      name: 'Risk Assessment',
      prompt: 'Assess the risk profile for a portfolio with 60% Bitcoin, 30% Ethereum, and 10% cash. Provide a risk score (0-100) and key risk factors.',
      max_tokens: 150
    },
    {
      name: 'Portfolio Optimization',
      prompt: 'Suggest portfolio optimization for a crypto portfolio with moderate risk tolerance. Include target allocations and rebalancing recommendations.',
      max_tokens: 200
    }
  ];

  for (const promptData of tradingPrompts) {
    try {
      console.log(`🔍 Testing: ${promptData.name}`);
      const response = await makeRequest(GEMMA_URL, {
        prompt: promptData.prompt,
        max_tokens: promptData.max_tokens,
        temperature: 0.7
      });
      
      if (response.predictions?.[0]?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = response.predictions[0].candidates[0].content.parts[0].text;
        console.log(`✅ ${promptData.name} - Generated response (${text.length} characters)`);
      } else {
        console.log(`⚠️  ${promptData.name} - No response generated`);
      }
      
    } catch (error) {
      console.log(`❌ ${promptData.name} - Error: ${error.message}`);
    }
    
    console.log('');
  }
}

async function main() {
  console.log('🚀 YOREE Gemma 3-4B Integration Test');
  console.log('='.repeat(50));
  console.log('');

  await testGemmaConnection();
  console.log('');
  
  await testTradingPrompts();
  
  console.log('='.repeat(50));
  console.log('✨ Test completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testGemmaConnection, testTradingPrompts }; 