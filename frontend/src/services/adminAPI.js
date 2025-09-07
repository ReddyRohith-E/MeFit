import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create admin axios instance
const adminAPI = axios.create({
  baseURL: `${API_URL}/admin`,
  timeout: 30000,
});

// Create auth axios instance
const adminAuthAPI = axios.create({
  baseURL: `${API_URL}/admin/auth`,
  timeout: 15000,
});

// Add token to requests
const addTokenInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    console.log('AdminAPI: Adding token to request', token ? 'Token found' : 'No token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('AdminAPI: Request URL:', config.url);
    console.log('AdminAPI: Request headers:', config.headers);
    return config;
  });
};

// Handle responses and token expiration
const addResponseInterceptor = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => {
      console.log('AdminAPI: Response received', response.status, response.data);
      return response;
    },
    (error) => {
      console.error('AdminAPI: Error response', error.response?.status, error.response?.data);
      if (error.response?.status === 401) {
        console.log('AdminAPI: Unauthorized - removing token and redirecting');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        // Don't auto-redirect here, let the component handle it
        // window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
addTokenInterceptor(adminAPI);
addTokenInterceptor(adminAuthAPI);
addResponseInterceptor(adminAPI);
addResponseInterceptor(adminAuthAPI);

export const adminApiService = {
  // ============= AUTHENTICATION =============
  auth: {
    login: async (credentials) => {
      try {
        const response = await adminAuthAPI.post('/login', credentials);
        if (response.data.success && response.data.data.token) {
          adminTokenManager.setToken(response.data.data.token);
          if (response.data.data.user) {
            adminTokenManager.setUserData(response.data.data.user);
          }
        }
        return response;
      } catch (error) {
        console.error('Admin login error:', error);
        throw error;
      }
    },
    
    getMe: () => 
      adminAuthAPI.get('/me'),
    
    logout: async () => {
      try {
        await adminAuthAPI.post('/logout');
      } finally {
        adminTokenManager.removeToken();
      }
    },
    
    changePassword: (passwordData) => 
      adminAuthAPI.patch('/change-password', passwordData),

    getQuickStats: () =>
      adminAuthAPI.get('/quick-stats'),

    // Add a test connection method
    testConnection: async () => {
      try {
        const response = await adminAPI.get('/dashboard/stats');
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  // ============= DASHBOARD =============
  dashboard: {
    getStats: () => 
      adminAPI.get('/dashboard/stats'),
  },

  // ============= USER MANAGEMENT =============
  users: {
    getAll: (params = {}) => 
      adminAPI.get('/users', { params }),
    
    getById: (userId) => 
      adminAPI.get(`/users/${userId}`),
    
    updateStatus: (userId, statusData) => 
      adminAPI.patch(`/users/${userId}/status`, statusData),
    
    updateRole: (userId, roleData) => 
      adminAPI.patch(`/users/${userId}/role`, roleData),
    
    delete: (userId) => 
      adminAPI.delete(`/users/${userId}`),

    search: (searchTerm, filters = {}) =>
      adminAPI.get('/users', { 
        params: { 
          search: searchTerm, 
          ...filters 
        } 
      }),
  },

  // ============= CONTRIBUTOR MANAGEMENT =============
  contributors: {
    getRequests: () => 
      adminAPI.get('/contributor-requests'),
    
    processRequest: (userId, action) => 
      adminAPI.patch(`/contributor-requests/${userId}/${action}`),

    approve: (userId) =>
      adminAPI.patch(`/contributor-requests/${userId}/approve`),

    deny: (userId) =>
      adminAPI.patch(`/contributor-requests/${userId}/deny`),
  },

  // ============= ANALYTICS =============
  analytics: {
    get: (period = 30) => 
      adminAPI.get('/analytics', { params: { period } }),

    getUserGrowth: (period = 90) =>
      adminAPI.get('/analytics', { params: { period, type: 'user-growth' } }),

    getGoalTrends: (period = 30) =>
      adminAPI.get('/analytics', { params: { period, type: 'goal-trends' } }),
  },

  // ============= CONTENT MANAGEMENT =============
  content: {
    getStats: () =>
      adminAPI.get('/content/stats'),
  },

  // ============= UTILITY FUNCTIONS =============
  utils: {
    // Bulk operations
    bulkUpdateUsers: (userIds, updateData) =>
      adminAPI.patch('/users/bulk-update', { userIds, updateData }),

    // Export data
    exportUsers: (filters = {}) =>
      adminAPI.get('/export/users', { 
        params: filters,
        responseType: 'blob' 
      }),

    exportAnalytics: (period = 30) =>
      adminAPI.get('/export/analytics', { 
        params: { period },
        responseType: 'blob' 
      }),

    // System health
    getSystemHealth: () =>
      adminAPI.get('/system/health'),
  }
};

// Helper functions for token management
export const adminTokenManager = {
  getToken: () => localStorage.getItem('adminToken'),
  
  setToken: (token) => {
    localStorage.setItem('adminToken', token);
  },
  
  removeToken: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;
    
    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  getUserData: () => {
    try {
      return JSON.parse(localStorage.getItem('adminUser') || '{}');
    } catch (error) {
      return {};
    }
  },

  setUserData: (userData) => {
    localStorage.setItem('adminUser', JSON.stringify(userData));
  }
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access denied. Insufficient permissions.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return data.message || 'An unexpected error occurred.';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
};

// Request retry utility
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

export default adminApiService;
