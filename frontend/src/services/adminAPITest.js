// Admin API Test Script
// This file can be used to verify the admin API is working correctly

import { adminApiService, adminTokenManager } from './adminAPI.js';

// Test function to verify admin API connectivity
export const testAdminAPI = async () => {
  try {
    console.log('🔍 Testing Admin API Configuration...');
    
    // Test 1: Check API URL configuration
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    console.log('✅ API URL:', apiUrl);
    
    // Test 2: Check if admin login endpoint is accessible
    try {
      await adminApiService.auth.login({ email: 'test', password: 'test' });
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        console.log('✅ Admin login endpoint is accessible');
      } else {
        throw error;
      }
    }
    
    // Test 3: Check token management functions
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.test';
    adminTokenManager.setToken(testToken);
    const retrievedToken = adminTokenManager.getToken();
    adminTokenManager.removeToken();
    
    if (retrievedToken === testToken) {
      console.log('✅ Token management working correctly');
    } else {
      throw new Error('Token management failed');
    }
    
    console.log('🎉 All Admin API tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Admin API test failed:', error);
    return false;
  }
};

// Development helper to test admin features
export const devAdminUtils = {
  // Test admin login with default credentials
  testLogin: async () => {
    try {
      const response = await adminApiService.auth.login({
        email: 'admin@mefit.com',
        password: 'admin123'
      });
      console.log('✅ Admin login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin login failed:', error);
      throw error;
    }
  },
  
  // Test dashboard stats
  testDashboard: async () => {
    try {
      const response = await adminApiService.dashboard.getStats();
      console.log('✅ Dashboard stats retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Dashboard stats failed:', error);
      throw error;
    }
  },
  
  // Clear admin tokens
  clearTokens: () => {
    adminTokenManager.removeToken();
    console.log('✅ Admin tokens cleared');
  }
};

// Export for console testing
if (typeof window !== 'undefined') {
  window.adminAPITest = testAdminAPI;
  window.devAdminUtils = devAdminUtils;
}
