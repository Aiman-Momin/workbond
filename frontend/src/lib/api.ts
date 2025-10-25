import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // User endpoints
  users: {
    getProfile: (wallet: string) => `/users/${wallet}`,
    updateProfile: (wallet: string) => `/users/${wallet}`,
    getPerformance: (wallet: string) => `/users/${wallet}/performance`,
    getTopFreelancers: (params?: { limit?: number; sortBy?: string }) => 
      `/users/top/freelancers${params ? `?${new URLSearchParams(safeParams(params)).toString()}` : ''}`,
    searchFreelancers: (params?: { query?: string; skills?: string; minRating?: number; limit?: number; offset?: number }) =>
      `/users/search/freelancers${params ? `?${new URLSearchParams(safeParams(params)).toString()}` : ''}`,
  },
  
  // Escrow endpoints
  escrow: {
    create: '/escrow/create',
    get: (id: string) => `/escrow/${id}`,
    deliver: (id: string) => `/escrow/${id}/deliver`,
    release: (id: string) => `/escrow/${id}/release`,
    updateRules: (id: string) => `/escrow/${id}/rules`,
    getUserEscrows: (wallet: string, params?: { status?: string; limit?: number; offset?: number }) =>
      `/escrow/user/${wallet}${params ? `?${new URLSearchParams(safeParams(params)).toString()}` : ''}`,
  },
  
  // AI endpoints
  ai: {
    getSuggestions: (wallet: string, params?: { escrowId?: string }) =>
      `/ai/suggest/${wallet}${params ? `?${new URLSearchParams(safeParams(params)).toString()}` : ''}`,
    createSuggestion: (escrowId: string) => `/ai/suggest/${escrowId}`,
    approveSuggestion: (suggestionId: string) => `/ai/suggest/${suggestionId}/approve`,
    rejectSuggestion: (suggestionId: string) => `/ai/suggest/${suggestionId}/reject`,
    getUserSuggestions: (wallet: string, params?: { status?: string }) =>
      `/ai/suggestions/${wallet}${params ? `?${new URLSearchParams(safeParams(params)).toString()}` : ''}`,
  },
  
  // Analytics endpoints
  analytics: {
    platform: (params?: { period?: string }) =>
      `/analytics/platform${params ? `?${new URLSearchParams(safeParams(params)).toString()}` : ''}`,
    user: (wallet: string, params?: { period?: string }) =>
      `/analytics/user/${wallet}${params ? `?${new URLSearchParams(safeParams(params)).toString()}` : ''}`,
    topPerformers: (params?: { limit?: number; metric?: string }) =>
      `/analytics/top-performers${params ? `?${new URLSearchParams(safeParams(params)).toString()}` : ''}`,
    aiOptimization: (params?: { period?: string }) =>
      `/analytics/ai-optimization${params ? `?${new URLSearchParams(params).toString()}` : ''}`,
    trends: (params?: { metric?: string; period?: string }) =>
      `/analytics/trends${params ? `?${new URLSearchParams(safeParams(params)).toString()}` : ''}`,
  },
};

// Convert any param values to strings so URLSearchParams accepts them
function safeParams(params?: Record<string, any>): Record<string, string> {
  if (!params) return {};
  return Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]));
}

// Helper functions
export const apiHelpers = {
  // Handle API errors
  handleError: (error: any) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.error || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
        data: null,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
        data: null,
      };
    }
  },
  
  // Format error message for display
  formatError: (error: any) => {
    const errorInfo = apiHelpers.handleError(error);
    return errorInfo.message;
  },
  
  // Check if error is network related
  isNetworkError: (error: any) => {
    return !error.response && error.request;
  },
  
  // Check if error is authentication related
  isAuthError: (error: any) => {
    return error.response?.status === 401;
  },
  
  // Check if error is validation related
  isValidationError: (error: any) => {
    return error.response?.status === 400;
  },
};

export default api;
