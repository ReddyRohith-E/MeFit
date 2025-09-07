import { adminApiService } from '../services/adminAPI';
import { authAPI, usersAPI, profilesAPI, goalsAPI, exercisesAPI, workoutsAPI, programsAPI } from '../utils/api';

export const verifyFrontendRoutes = async () => {
  console.log('\n🔍 FRONTEND ROUTE VERIFICATION\n');
  console.log('=====================================');
  
  const routes = [
    // ============= PUBLIC ROUTES =============
    { 
      section: 'PUBLIC ROUTES',
      routes: [
        { path: '/', name: 'Landing Page', public: true },
        { path: '/login', name: 'Login Page', public: true },
        { path: '/register', name: 'Register Page', public: true },
        { path: '/forgot-password', name: 'Forgot Password', public: true },
        { path: '/theme-showcase', name: 'Theme Showcase', public: true },
        { path: '/admin/login', name: 'Admin Login Page', public: true },
      ]
    },
    
    // ============= PROTECTED APP ROUTES =============
    { 
      section: 'PROTECTED APP ROUTES',
      routes: [
        { path: '/app', name: 'App Root (redirects to dashboard)', protected: true },
        { path: '/app/dashboard', name: 'Dashboard', protected: true },
        { path: '/app/profile', name: 'Profile', protected: true },
        { path: '/app/profile/create', name: 'Create Profile', protected: true },
        { path: '/app/profile/settings', name: 'Profile Settings', protected: true },
        { path: '/app/goals', name: 'Goals', protected: true },
        { path: '/app/goals/create', name: 'Create Goal', protected: true },
        { path: '/app/workouts', name: 'Workouts', protected: true },
        { path: '/app/workouts/manage', name: 'Workout Management', protected: true },
        { path: '/app/exercises', name: 'Exercises', protected: true },
        { path: '/app/exercises/manage', name: 'Exercise Management', protected: true },
        { path: '/app/programs', name: 'Programs', protected: true },
        { path: '/app/contributor', name: 'Contributor Area', protected: true },
      ]
    },
    
    // ============= ADMIN ROUTES =============
    { 
      section: 'ADMIN ROUTES',
      routes: [
        { path: '/admin', name: 'Admin Root (redirects to dashboard)', admin: true },
        { path: '/admin/dashboard', name: 'Admin Dashboard', admin: true },
        { path: '/admin/users', name: 'User Management', admin: true },
        { path: '/admin/contributors', name: 'Contributor Management', admin: true },
        { path: '/admin/content', name: 'Content Management', admin: true },
        { path: '/admin/analytics', name: 'Analytics', admin: true },
        { path: '/admin/settings', name: 'Admin Settings', admin: true },
        { path: '/admin/notifications', name: 'Admin Notifications', admin: true },
      ]
    }
  ];
  
  // Print route structure
  for (const section of routes) {
    console.log(`\n📍 ${section.section}`);
    console.log('─'.repeat(50));
    
    section.routes.forEach(route => {
      const status = route.public ? '🌐 Public' : 
                    route.protected ? '🔒 Protected' :
                    route.admin ? '👑 Admin' : '❓ Unknown';
      console.log(`${route.path.padEnd(30)} - ${status} - ${route.name}`);
    });
  }
  
  // Test API endpoints
  console.log('\n🔌 API ENDPOINT TESTS');
  console.log('=====================================');
  
  const apiTests = [
    { 
      name: 'Auth API - Login (should fail without credentials)', 
      test: () => authAPI.login({ email: 'test', password: 'test' }),
      expectStatus: [400, 401]
    },
    { 
      name: 'Users API - Get Me (should require auth)', 
      test: () => usersAPI.getMe(),
      expectStatus: [401, 403]
    },
    { 
      name: 'Profiles API - Get My Profile (should require auth)', 
      test: () => profilesAPI.getMyProfile(),
      expectStatus: [401, 403]
    },
    { 
      name: 'Admin API - Test Connection (should require admin auth)', 
      test: () => adminApiService.auth.testConnection(),
      expectStatus: [401, 403]
    },
    { 
      name: 'Goals API - Get Goals (should require auth)', 
      test: () => goalsAPI.getGoals(),
      expectStatus: [401, 403]
    },
    { 
      name: 'Workouts API - Get Workouts (should require auth)', 
      test: () => workoutsAPI.getWorkouts(),
      expectStatus: [401, 403]
    },
    { 
      name: 'Exercises API - Get Exercises (should require auth)', 
      test: () => exercisesAPI.getExercises(),
      expectStatus: [401, 403]
    },
    { 
      name: 'Programs API - Get Programs (should require auth)', 
      test: () => programsAPI.getPrograms(),
      expectStatus: [401, 403]
    }
  ];
  
  for (const test of apiTests) {
    try {
      await test.test();
      console.log(`✅ ${test.name} - Accessible`);
    } catch (error) {
      const status = error.response?.status;
      const expectedStatuses = test.expectStatus || [401, 403];
      
      if (expectedStatuses.includes(status)) {
        console.log(`🔒 ${test.name} - Properly Protected (${status})`);
      } else if (status === 400) {
        console.log(`⚠️ ${test.name} - Validation Working (400)`);
      } else if (status === 404) {
        console.log(`❌ ${test.name} - Not Found (404)`);
      } else {
        console.log(`⚠️ ${test.name} - Unexpected Status (${status || 'Network Error'})`);
      }
    }
  }

  // Test authentication flows
  console.log('\n🔐 AUTHENTICATION FLOW TESTS');
  console.log('=====================================');
  
  // Check current auth state
  const userToken = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  
  console.log(`User Token Present: ${userToken ? '✅ Yes' : '❌ No'}`);
  console.log(`Admin Token Present: ${adminToken ? '✅ Yes' : '❌ No'}`);
  
  // Test token validity
  if (userToken) {
    try {
      const response = await authAPI.getMe();
      console.log('✅ User Token Valid - User authenticated');
    } catch (error) {
      console.log(`❌ User Token Invalid - Status: ${error.response?.status}`);
    }
  }
  
  if (adminToken) {
    try {
      const response = await adminApiService.auth.getMe();
      console.log('✅ Admin Token Valid - Admin authenticated');
    } catch (error) {
      console.log(`❌ Admin Token Invalid - Status: ${error.response?.status}`);
    }
  }
  
  // Navigation test
  console.log('\n🧭 NAVIGATION SUGGESTIONS');
  console.log('=====================================');
  
  if (!userToken && !adminToken) {
    console.log('📌 Start here: Visit /login or /admin/login to authenticate');
  } else if (userToken && !adminToken) {
    console.log('📌 User authenticated: Try visiting /app/dashboard');
  } else if (adminToken) {
    console.log('📌 Admin authenticated: Try visiting /admin/dashboard');
  }
  
  console.log('\n💡 QUICK SETUP COMMANDS');
  console.log('=====================================');
  console.log('// Generate admin token:');
  console.log('// In backend: node scripts/generate-admin-token.js');
  console.log('// Then copy token and run in browser console:');
  console.log('// localStorage.setItem("adminToken", "YOUR_TOKEN_HERE");');
  console.log('');
  console.log('// Test seeded credentials:');
  console.log('// Admin: admin@mefit.com / Admin123!');
  console.log('// User: user@mefit.com / User123!');
  
  return {
    routesConfigured: routes.reduce((total, section) => total + section.routes.length, 0),
    apiEndpointsTested: apiTests.length,
    userAuthenticated: !!userToken,
    adminAuthenticated: !!adminToken
  };
};

// Make it available in browser console
if (typeof window !== 'undefined') {
  window.verifyFrontendRoutes = verifyFrontendRoutes;
  window.adminApiService = adminApiService;
  
  // Helper functions for testing
  window.testAdmin = async () => {
    try {
      const response = await adminApiService.auth.testConnection();
      console.log('Admin connection test:', response);
    } catch (error) {
      console.log('Admin connection failed:', error.message);
    }
  };
  
  window.clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    console.log('🧹 All auth tokens cleared');
  };
  
  window.setTestTokens = () => {
    console.log('🔧 Use the generate-admin-token.js script to get valid tokens');
    console.log('Then run: localStorage.setItem("adminToken", "YOUR_TOKEN")');
  };
}

export default verifyFrontendRoutes;
