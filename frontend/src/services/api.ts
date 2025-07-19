import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Strategy API
export const strategyApi = {
  createStrategy: (data: any) => api.post('/strategies', data),
  getStrategies: () => api.get('/strategies'),
  getStrategy: (id: string) => api.get(`/strategies/${id}`),
  updateStrategy: (id: string, data: any) => api.put(`/strategies/${id}`, data),
  deleteStrategy: (id: string) => api.delete(`/strategies/${id}`),
  runBacktest: (id: string, params: any) => api.post(`/strategies/${id}/backtest`, params),
};

// Market Data API
export const marketDataApi = {
  getPriceData: (symbol: string, timeframe: string) => 
    api.get(`/market-data/price/${symbol}`, { params: { timeframe } }),
  getMarketOverview: () => api.get('/market-data/overview'),
  getVolumeData: (symbol: string) => api.get(`/market-data/volume/${symbol}`),
};

// Sentiment Analysis API
export const sentimentApi = {
  getSentiment: (symbol: string) => api.get(`/sentiment/${symbol}`),
  getNewsSentiment: (symbol: string) => api.get(`/sentiment/news/${symbol}`),
  getSocialSentiment: (symbol: string) => api.get(`/sentiment/social/${symbol}`),
};

// LLM API
export const llmApi = {
  generateStrategy: (prompt: string) => api.post('/llm/generate-strategy', { prompt }),
  optimizeStrategy: (strategyId: string, feedback: string) => 
    api.post(`/llm/optimize-strategy/${strategyId}`, { feedback }),
  getStrategyInsights: (strategyId: string) => 
    api.get(`/llm/strategy-insights/${strategyId}`),
};

// User API
export const userApi = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  getPortfolio: () => api.get('/user/portfolio'),
};

export default api; 