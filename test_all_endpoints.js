#!/usr/bin/env node

/**
 * MeFit API Endpoint Testing Script
 * 
 * This script automatically tests all API endpoints in sequence
 * Run with: node test_all_endpoints.js
 */

const axios = require('axios');

class MeFitAPITester {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.tokens = {
      user: null,
      admin: null,
      contributor: null
    };
    this.testData = {
      userId: null,
      profileId: null,
      exerciseId: null,
      workoutId: null,
      programId: null,
      goalId: null
    };
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  // Helper method to make HTTP requests
  async makeRequest(method, url, data = null, token = null, expectStatus = 200) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${url}`,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(data && { data })
      };

      const response = await axios(config);
      
      if (response.status === expectStatus) {
        this.logSuccess(`✅ ${method.toUpperCase()} ${url} - Status: ${response.status}`);
        this.testResults.passed++;
        return response.data;
      } else {
        this.logError(`❌ ${method.toUpperCase()} ${url} - Expected: ${expectStatus}, Got: ${response.status}`);
        this.testResults.failed++;
        return null;
      }
    } catch (error) {
      if (error.response && error.response.status === expectStatus) {
        this.logSuccess(`✅ ${method.toUpperCase()} ${url} - Status: ${error.response.status} (Expected error)`);
        this.testResults.passed++;
        return error.response.data;
      } else {
        this.logError(`❌ ${method.toUpperCase()} ${url} - Error: ${error.response?.status || error.message}`);
        this.testResults.failed++;
        return null;
      }
    } finally {
      this.testResults.total++;
    }
  }

  logSuccess(message) {
    console.log(`\x1b[32m${message}\x1b[0m`);
    this.testResults.details.push({ status: 'PASS', message });
  }

  logError(message) {
    console.log(`\x1b[31m${message}\x1b[0m`);
    this.testResults.details.push({ status: 'FAIL', message });
  }

  logInfo(message) {
    console.log(`\x1b[36m${message}\x1b[0m`);
  }

  logHeader(header) {
    console.log(`\n\x1b[33m=== ${header} ===\x1b[0m`);
  }

  // Phase 1: Health Check & Authentication
  async testPhase1() {
    this.logHeader('Phase 1: Health Check & Authentication');

    // Health Check
    await this.makeRequest('GET', '/health');

    // Register new user
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User'
    };
    const registerResponse = await this.makeRequest('POST', '/api/auth/register', registerData, null, 201);
    if (registerResponse?.token) {
      this.tokens.user = registerResponse.token;
      this.testData.userId = registerResponse.user.id;
    }

    // Login with seeded user
    const loginData = {
      email: 'john.beginner@example.com',
      password: 'User123!'
    };
    const loginResponse = await this.makeRequest('POST', '/api/auth/login', loginData);
    if (loginResponse?.token) {
      this.tokens.user = loginResponse.token;
      this.testData.userId = loginResponse.user.id;
    }

    // Get current user
    await this.makeRequest('GET', '/api/auth/me', null, this.tokens.user);

    // Refresh token
    await this.makeRequest('POST', '/api/auth/refresh', null, this.tokens.user);

    // Test forgot password
    const forgotPasswordData = {
      email: 'john.beginner@example.com',
      newPassword: 'NewPassword123!'
    };
    await this.makeRequest('POST', '/api/auth/forgot-password', forgotPasswordData);
  }

  // Phase 2: User Management
  async testPhase2() {
    this.logHeader('Phase 2: User Management');

    if (!this.tokens.user) {
      this.logError('❌ No user token available for Phase 2');
      return;
    }

    // Get current user profile
    await this.makeRequest('GET', '/api/users/', null, this.tokens.user, 303);

    // Get specific user
    if (this.testData.userId) {
      await this.makeRequest('GET', `/api/users/${this.testData.userId}`, null, this.tokens.user);
    }

    // Update user information
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name'
    };
    if (this.testData.userId) {
      await this.makeRequest('PATCH', `/api/users/${this.testData.userId}`, updateData, this.tokens.user);
    }

    // Request contributor status
    if (this.testData.userId) {
      await this.makeRequest('POST', `/api/users/${this.testData.userId}/request-contributor`, null, this.tokens.user);
    }
  }

  // Phase 3: Profile Management
  async testPhase3() {
    this.logHeader('Phase 3: Profile Management');

    if (!this.tokens.user) {
      this.logError('❌ No user token available for Phase 3');
      return;
    }

    // Create user profile
    const profileData = {
      weight: 70,
      height: 175,
      dateOfBirth: '1990-01-01',
      gender: 'male',
      fitnessLevel: 'intermediate',
      activityLevel: 'moderately_active',
      fitnessGoals: ['weight_loss', 'muscle_gain'],
      preferences: {
        workoutTypes: ['strength', 'cardio'],
        workoutDuration: 60,
        workoutFrequency: 4
      }
    };
    const profileResponse = await this.makeRequest('POST', '/api/profiles', profileData, this.tokens.user, 201);
    if (profileResponse?.profile?._id) {
      this.testData.profileId = profileResponse.profile._id;
    }

    // Get profile by ID
    if (this.testData.profileId) {
      await this.makeRequest('GET', `/api/profiles/${this.testData.profileId}`, null, this.tokens.user);
    }

    // Get profile by user ID
    if (this.testData.userId) {
      await this.makeRequest('GET', `/api/profiles/user/${this.testData.userId}`, null, this.tokens.user);
    }

    // Get fitness evaluation
    await this.makeRequest('GET', '/api/profiles/me/evaluation', null, this.tokens.user);

    // Update profile
    const updateProfileData = {
      weight: 72,
      fitnessLevel: 'advanced'
    };
    if (this.testData.profileId) {
      await this.makeRequest('PATCH', `/api/profiles/${this.testData.profileId}`, updateProfileData, this.tokens.user);
    }
  }

  // Phase 4: Admin Authentication & Management
  async testPhase4() {
    this.logHeader('Phase 4: Admin Authentication & Management');

    // Admin login
    const adminLoginData = {
      email: 'admin@mefit.com',
      password: 'Admin123!'
    };
    const adminLoginResponse = await this.makeRequest('POST', '/api/admin/auth/login', adminLoginData);
    if (adminLoginResponse?.data?.token) {
      this.tokens.admin = adminLoginResponse.data.token;
    }

    if (!this.tokens.admin) {
      this.logError('❌ No admin token available for admin tests');
      return;
    }

    // Get admin profile
    await this.makeRequest('GET', '/api/admin/auth/me', null, this.tokens.admin);

    // Admin quick stats
    await this.makeRequest('GET', '/api/admin/auth/quick-stats', null, this.tokens.admin);

    // Dashboard statistics
    await this.makeRequest('GET', '/api/admin/dashboard/stats', null, this.tokens.admin);

    // Get all users
    await this.makeRequest('GET', '/api/admin/users?page=1&limit=10', null, this.tokens.admin);

    // Get contributor requests
    await this.makeRequest('GET', '/api/admin/contributor-requests', null, this.tokens.admin);

    // System analytics
    await this.makeRequest('GET', '/api/admin/analytics?period=30', null, this.tokens.admin);

    // Content statistics
    await this.makeRequest('GET', '/api/admin/content/stats', null, this.tokens.admin);
  }

  // Phase 5: Error Testing
  async testPhase5() {
    this.logHeader('Phase 5: Error Testing');

    // Invalid endpoint
    await this.makeRequest('GET', '/api/invalid-endpoint', null, null, 404);

    // Unauthorized access
    await this.makeRequest('GET', '/api/users/', null, null, 401);

    // Invalid JWT token
    await this.makeRequest('GET', '/api/users/', null, 'invalid_token', 401);

    // Admin only endpoint with user token
    if (this.tokens.user) {
      await this.makeRequest('GET', '/api/admin/users', null, this.tokens.user, 403);
    }

    // Validation errors
    const invalidRegisterData = {
      email: 'invalid-email',
      password: '123',
      firstName: '',
      lastName: ''
    };
    await this.makeRequest('POST', '/api/auth/register', invalidRegisterData, null, 400);
  }

  // Run all tests
  async runAllTests() {
    console.log('\x1b[35m🚀 Starting MeFit API Endpoint Testing...\x1b[0m\n');
    
    const startTime = Date.now();

    try {
      await this.testPhase1();
      await this.testPhase2();
      await this.testPhase3();
      await this.testPhase4();
      await this.testPhase5();
    } catch (error) {
      this.logError(`Fatal error during testing: ${error.message}`);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Print summary
    this.logHeader('Test Results Summary');
    console.log(`\n📊 Total Tests: ${this.testResults.total}`);
    console.log(`\x1b[32m✅ Passed: ${this.testResults.passed}\x1b[0m`);
    console.log(`\x1b[31m❌ Failed: ${this.testResults.failed}\x1b[0m`);
    console.log(`⏱️  Duration: ${duration}s`);
    
    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%\n`);

    if (this.testResults.failed > 0) {
      console.log('\x1b[31m❌ Failed Tests:\x1b[0m');
      this.testResults.details
        .filter(detail => detail.status === 'FAIL')
        .forEach(detail => console.log(`   ${detail.message}`));
    }

    console.log(successRate >= 90 ? 
      '\n🎉 Great! Most endpoints are working correctly!' : 
      '\n⚠️  Some endpoints need attention. Check the failures above.');
  }
}

// Check if required modules are available
try {
  require('axios');
} catch (error) {
  console.error('❌ axios module not found. Please install it with: npm install axios');
  process.exit(1);
}

// Run the tests
if (require.main === module) {
  const tester = new MeFitAPITester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = MeFitAPITester;
