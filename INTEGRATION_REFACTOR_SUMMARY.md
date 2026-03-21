# Greed - Integration Refactor Summary

## Overview

The codebase has been refactored to properly integrate with the **actual** Minam and Syuzhet repositories (now added as submodules). This document summarizes the changes made to align with the real implementations.

## Key Changes

### 1. Minam Integration (Backend: `backend/src/minam.rs`)

**Previous**: Mock feeds with hardcoded data  
**Now**: Actual Minam API integration

#### What Changed:
- **Uses Real Minam API Structure**: Now queries `/api/apis` endpoint to get actual API products
- **API Products as Feeds**: Minam API products are mapped to "feeds" for signals
- **Real Data Queries**: Uses `/v1/data/:api_id/query` endpoint to fetch actual data
- **Feed Type Inference**: Automatically infers feed type (price, sentiment, onchain, etc.) from API name
- **Graceful Degradation**: Falls back gracefully if Minam API is unavailable

#### API Integration:
```rust
// List all Minam APIs (these become feeds)
GET /api/apis → Returns Vec<ApiProduct>

// Query Minam API for data
POST /v1/data/:api_id/query → Returns Vec<serde_json::Value>
```

#### Configuration:
- `MINAM_API_URL` environment variable (defaults to `http://localhost:8787`)

### 2. Syuzhet Integration (Backend: `backend/src/syuzhet.rs`)

**Previous**: Simple mock thesis generation  
**Now**: Actual Syuzhet prediction generation

#### What Changed:
- **Uses Real Syuzhet API**: Calls `/api/predictions` endpoint with proper structure
- **OpenAI GPT-4o-mini**: Falls back to direct OpenAI calls matching Syuzhet's implementation
- **Proper Prediction Structure**: Uses `GeneratedPrediction` format matching Syuzhet
- **Timestamp Handling**: Properly handles Unix timestamps (seconds, not milliseconds)
- **Validation**: Validates and fixes timestamps to ensure they're in the future

#### API Integration:
```rust
// Generate prediction via Syuzhet API
POST /api/predictions → Returns GeneratedPrediction

// Or direct OpenAI call (matching Syuzhet's logic)
POST https://api.openai.com/v1/chat/completions
```

#### Configuration:
- `SYUZHET_API_URL` environment variable (defaults to `http://localhost:3000`)
- `OPENAI_API_KEY` environment variable (required for thesis generation)

### 3. Frontend Services Updated

#### Minam Service (`frontend/src/services/minamService.ts`)
- Now queries actual Minam API products
- Supports direct Minam API queries via `/v1/data/:api_id/query`
- Handles Minam API structure properly

#### Syuzhet Service (`frontend/src/services/syuzhetService.ts`)
- Uses actual Syuzhet prediction generation
- Matches `GeneratedPrediction` structure
- Falls back between Yoree backend and Syuzhet API directly

### 4. Backend API Endpoints

#### New/Updated Endpoints:
- `GET /api/minam/feeds` - Lists Minam APIs as feeds (queries Minam API)
- `GET /api/minam/feeds/:id` - Get specific feed details
- `GET /api/minam/feeds/:id/data` - Get feed data (queries Minam API)
- `POST /api/thesis/generate` - Generate thesis (uses Syuzhet logic)

## Data Flow

### Signal Creation Flow (Updated):
```
1. User Input → Syuzhet Service
   ↓
2. Syuzhet API (/api/predictions) OR OpenAI GPT-4o-mini
   ↓
3. GeneratedPrediction → Converted to Signal Hypothesis
   ↓
4. User Selects 2 Minam API Products (from /api/apis)
   ↓
5. Signal Created with Minam API IDs as feed bindings
   ↓
6. Signal Scoring Engine queries Minam APIs via /v1/data/:api_id/query
```

### Minam Feed Selection:
```
1. Backend queries Minam: GET /api/apis
   ↓
2. Filters for "live" APIs
   ↓
3. Maps ApiProduct → MinamFeed
   ↓
4. Frontend displays as selectable feeds
   ↓
5. User selects 2 feeds
   ↓
6. Signal binds to Minam API IDs
```

## Environment Variables

### Backend:
```env
# Minam Integration
MINAM_API_URL=http://localhost:8787  # Minam API base URL

# Syuzhet Integration
SYUZHET_API_URL=http://localhost:3000  # Syuzhet API base URL
OPENAI_API_KEY=sk-...  # Required for thesis generation
```

### Frontend:
```env
REACT_APP_API_URL=http://127.0.0.1:3001  # Yoree backend
REACT_APP_MINAM_API_URL=http://localhost:8787  # Optional: direct Minam access
REACT_APP_SYUZHET_API_URL=http://localhost:3000  # Optional: direct Syuzhet access
```

## Architecture Alignment

### Minam Structure:
- **Providers** → Create data providers
- **Datasets** → Store data rows
- **Model Profiles** → Define data schemas
- **APIs** → Published API products (these become "feeds")
- **Query Endpoint** → `/v1/data/:api_id/query` for data access

### Syuzhet Structure:
- **Prediction Generation** → `/api/predictions` endpoint
- **OpenAI Integration** → GPT-4o-mini with structured prompts
- **GeneratedPrediction** → Structured prediction format
- **Market Creation** → `/api/markets/create` (for on-chain markets)

## Testing the Integration

### 1. Start Minam API:
```bash
cd minam/apps/api
cargo run
# Runs on http://localhost:8787
```

### 2. Start Syuzhet (optional, for direct API):
```bash
cd syuzhet
npm run dev
# Runs on http://localhost:3000
```

### 3. Start Yoree Backend:
```bash
cd backend
cargo run
# Runs on http://127.0.0.1:3001
```

### 4. Test Signal Creation:
- Navigate to `/create-signal`
- Enter hypothesis or raw input
- Select 2 Minam API feeds
- Create signal

## Key Improvements

1. **Real Data Integration**: Now uses actual Minam APIs instead of mocks
2. **Proper Thesis Generation**: Uses Syuzhet's actual OpenAI integration
3. **Type Safety**: Matches actual data structures from both repos
4. **Error Handling**: Graceful degradation if services unavailable
5. **Configuration**: Environment-based configuration for flexibility

## Next Steps

1. **Create Sample Minam APIs**: Set up some Minam API products for testing
2. **Test End-to-End**: Create signals with real Minam data
3. **Implement Real-time Updates**: WebSocket integration for live data
4. **Add ML Feed Selection**: Implement agent-based feed selection
5. **Production Deployment**: Configure production URLs for all services

## Notes

- Minam APIs must be "live" status to appear as feeds
- Syuzhet API is optional - backend can use OpenAI directly
- All integrations have fallback mechanisms for development
- Timestamps are properly handled (seconds, not milliseconds)
