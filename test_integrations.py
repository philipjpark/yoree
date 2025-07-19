#!/usr/bin/env python3
"""
Test script for yoree Platform API endpoints
Tests the new CoinGecko integration and backtesting functionality
"""

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8080"

def test_endpoint(endpoint, description):
    """Test a single API endpoint and display results"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"Endpoint: {endpoint}")
    print('='*60)
    
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            print(f"Response: {json.dumps(data, indent=2)[:500]}...")
            if len(json.dumps(data)) > 500:
                print("[Response truncated]")
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CONNECTION ERROR: {e}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def main():
    print("🚀 yoree Platform Integration Tests")
    print("====================================")
    
    # Test basic health check
    test_endpoint("/health", "Health Check")
    
    # Test CoinGecko integration endpoints
    test_endpoint("/api/data/current_price/bitcoin", "Current Bitcoin Price")
    test_endpoint("/api/data/current_price/ethereum", "Current Ethereum Price") 
    test_endpoint("/api/data/market_overview", "Market Overview")
    test_endpoint("/api/data/historical/bitcoin/30", "Historical Bitcoin Data (30 days)")
    
    # Test enhanced backtesting
    test_endpoint("/api/backtest/bitcoin/90", "Backtest Bitcoin (90 days)")
    
    # Test existing endpoints to ensure compatibility
    test_endpoint("/api/agents/status", "Agent Status")
    test_endpoint("/api/risk/assessment", "Risk Assessment")
    test_endpoint("/api/sentiment/bitcoin", "Sentiment Analysis")
    
    print(f"\n{'='*60}")
    print("🎉 Integration Tests Complete!")
    print("Check the results above to verify functionality")
    print('='*60)

if __name__ == "__main__":
    main() 