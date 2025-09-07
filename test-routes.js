const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple HTTP request helper
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Helper to check if file exists and read it
function checkFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      return {
        exists: true,
        isDirectory: true,
        size: 0,
        lines: 0,
        hasContent: true
      };
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      return {
        exists: true,
        isDirectory: false,
        size: stats.size,
        lines: content.split('\n').length,
        hasContent: content.trim().length > 0
      };
    }
  } catch (error) {
    return {
      exists: false,
      isDirectory: false,
      error: error.message
    };
  }
}

// Helper to scan directory for components
function scanDirectory(dirPath, extension = '.jsx') {
  try {
    const fullPath = path.resolve(dirPath);
    const files = fs.readdirSync(fullPath, { withFileTypes: true });
    const result = {
      files: [],
      directories: [],
      total: 0
    };
    
    files.forEach(file => {
      if (file.isDirectory()) {
        result.directories.push(file.name);
      } else if (!extension || file.name.endsWith(extension)) {
        result.files.push(file.name);
        result.total++;
      }
    });
    
    return result;
  } catch (error) {
    return { error: error.message, files: [], directories: [], total: 0 };
  }
}

// Helper to analyze component dependencies
function analyzeComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const analysis = {
      imports: [],
      exports: [],
      hooks: [],
      apiCalls: [],
      routes: [],
      hasTests: false,
      complexity: 'simple'
    };
    
    // Extract imports
    const importMatches = content.match(/^import\s+.*from\s+['"]([^'"]+)['"]/gm) || [];
    analysis.imports = importMatches.map(imp => imp.match(/from\s+['"]([^'"]+)['"]/)[1]);
    
    // Extract React hooks
    const hookMatches = content.match(/use[A-Z][a-zA-Z]*/g) || [];
    analysis.hooks = [...new Set(hookMatches)];
    
    // Extract API calls
    const apiMatches = content.match(/(fetch\(|axios\.|api\.)/g) || [];
    analysis.apiCalls = apiMatches.length;
    
    // Extract routes
    const routeMatches = content.match(/<Route\s+path=['"]([^'"]+)['"]/g) || [];
    analysis.routes = routeMatches.map(route => route.match(/path=['"]([^'"]+)['"]/)[1]);
    
    // Determine complexity
    const linesOfCode = content.split('\n').length;
    if (linesOfCode > 200) analysis.complexity = 'complex';
    else if (linesOfCode > 100) analysis.complexity = 'medium';
    
    return analysis;
  } catch (error) {
    return { error: error.message };
  }
}

async function verifyRoutes() {
  console.log('\n🔍 MEFIT COMPREHENSIVE VERIFICATION');
  console.log('=====================================\n');

  const baseURL = 'http://localhost:5000';
  const frontendURL = 'http://localhost:5173';
  
  // Test backend API endpoints
  console.log('📡 BACKEND API ENDPOINTS');
  console.log('─'.repeat(50));
  
  const apiEndpoints = [
    { path: '/', name: 'API Root', expectStatus: [200] },
    { path: '/health', name: 'Health Check', expectStatus: [200] },
    { path: '/api', name: 'API Info', expectStatus: [200] },
    { path: '/auth/me', name: 'Auth - Get Me', expectStatus: [401] },
    { path: '/user', name: 'User Routes', expectStatus: [401] },
    { path: '/profile/me', name: 'Profile - Get My Profile', expectStatus: [401] },
    { path: '/admin/dashboard/stats', name: 'Admin Dashboard', expectStatus: [401] },
    { path: '/admin/auth/me', name: 'Admin Auth', expectStatus: [401] },
    { path: '/goal', name: 'Goals List', expectStatus: [401] },
    { path: '/workout', name: 'Workouts List', expectStatus: [401] },
    { path: '/exercises', name: 'Exercises List', expectStatus: [401] },
    { path: '/program', name: 'Programs', expectStatus: [401] }
  ];
  
  let backendRunning = false;
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await makeRequest(baseURL + endpoint.path);
      const status = response.status;
      const expected = endpoint.expectStatus;
      backendRunning = true;
      
      if (expected.includes(status)) {
        if (status === 200) {
          console.log(`✅ ${endpoint.name.padEnd(20)} - Status: ${status} (Accessible)`);
        } else if (status === 401) {
          console.log(`🔒 ${endpoint.name.padEnd(20)} - Status: ${status} (Protected)`);
        } else if (status === 404) {
          console.log(`⚠️ ${endpoint.name.padEnd(20)} - Status: ${status} (Not Found)`);
        }
      } else {
        console.log(`❌ ${endpoint.name.padEnd(20)} - Status: ${status} (Unexpected)`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${endpoint.name.padEnd(20)} - Backend server not running`);
      } else {
        console.log(`❌ ${endpoint.name.padEnd(20)} - Error: ${error.message}`);
      }
    }
  }

  console.log('\n🌐 FRONTEND SERVER TEST');
  console.log('─'.repeat(50));
  
  // Test frontend server
  const frontendRoutes = [
    { path: '/', name: 'Landing Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/register', name: 'Register Page' },
    { path: '/admin/login', name: 'Admin Login' },
    { path: '/theme-showcase', name: 'Theme Showcase' }
  ];
  
  let frontendRunning = false;
  
  for (const route of frontendRoutes) {
    try {
      const response = await makeRequest(frontendURL + route.path);
      frontendRunning = true;
      if (response.status === 200) {
        console.log(`✅ ${route.name.padEnd(20)} - Accessible`);
      } else {
        console.log(`⚠️ ${route.name.padEnd(20)} - Status: ${response.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${route.name.padEnd(20)} - Frontend server not running`);
      } else {
        console.log(`❌ ${route.name.padEnd(20)} - Error: ${error.message}`);
      }
    }
  }

  console.log('\n🗂️ PROJECT STRUCTURE ANALYSIS');
  console.log('─'.repeat(50));
  
  // Check key files and directories
  const projectStructure = [
    { path: 'package.json', name: 'Root Package.json', type: 'file' },
    { path: 'README.md', name: 'Documentation', type: 'file' },
    { path: 'backend/package.json', name: 'Backend Package.json', type: 'file' },
    { path: 'backend/server.js', name: 'Backend Server', type: 'file' },
    { path: 'frontend/package.json', name: 'Frontend Package.json', type: 'file' },
    { path: 'frontend/src/App.jsx', name: 'Frontend App', type: 'file' },
    { path: 'backend/models', name: 'Backend Models', type: 'directory' },
    { path: 'backend/routes', name: 'Backend Routes', type: 'directory' },
    { path: 'backend/middleware', name: 'Backend Middleware', type: 'directory' },
    { path: 'frontend/src/components', name: 'Frontend Components', type: 'directory' },
    { path: 'frontend/src/pages', name: 'Frontend Pages', type: 'directory' },
    { path: 'frontend/src/utils', name: 'Frontend Utils', type: 'directory' }
  ];
  
  for (const item of projectStructure) {
    const result = checkFile(item.path);
    if (result.exists) {
      if (item.type === 'file') {
        console.log(`✅ ${item.name.padEnd(25)} - ${result.lines} lines, ${(result.size / 1024).toFixed(1)}KB`);
      } else {
        const scan = scanDirectory(item.path, '');
        console.log(`✅ ${item.name.padEnd(25)} - ${scan.total} files, ${scan.directories.length} subdirs`);
      }
    } else {
      console.log(`❌ ${item.name.padEnd(25)} - ${result.error || 'Missing'}`);
    }
  }

  console.log('\n🧩 FRONTEND COMPONENTS ANALYSIS');
  console.log('─'.repeat(50));
  
  // Analyze major component directories
  const componentDirs = [
    { path: 'frontend/src/components/Admin', name: 'Admin Components' },
    { path: 'frontend/src/components/Common', name: 'Common Components' },
    { path: 'frontend/src/components/Dashboard', name: 'Dashboard Components' },
    { path: 'frontend/src/components/Goals', name: 'Goals Components' },
    { path: 'frontend/src/components/Profile', name: 'Profile Components' },
    { path: 'frontend/src/pages/Auth', name: 'Auth Pages' },
    { path: 'frontend/src/pages/Admin', name: 'Admin Pages' },
    { path: 'frontend/src/pages/Goals', name: 'Goals Pages' },
    { path: 'frontend/src/pages/Profile', name: 'Profile Pages' }
  ];
  
  let totalComponents = 0;
  let complexComponents = 0;
  
  for (const dir of componentDirs) {
    const scan = scanDirectory(dir.path, '.jsx');
    if (scan.total > 0) {
      console.log(`📁 ${dir.name.padEnd(25)} - ${scan.total} components`);
      totalComponents += scan.total;
      
      // Analyze a few key components for complexity
      scan.files.slice(0, 3).forEach(file => {
        const analysis = analyzeComponent(path.join(dir.path, file));
        if (analysis.complexity === 'complex') complexComponents++;
        
        const hooks = analysis.hooks.length > 0 ? `${analysis.hooks.length} hooks` : 'no hooks';
        const apis = analysis.apiCalls > 0 ? `${analysis.apiCalls} API calls` : 'no API calls';
        console.log(`   └─ ${file.padEnd(20)} - ${analysis.complexity}, ${hooks}, ${apis}`);
      });
    } else if (scan.error) {
      console.log(`❌ ${dir.name.padEnd(25)} - ${scan.error}`);
    } else {
      console.log(`⚠️ ${dir.name.padEnd(25)} - Empty`);
    }
  }

  console.log('\n🔌 API INTEGRATION ANALYSIS');
  console.log('─'.repeat(50));
  
  // Check API service files
  const apiFiles = [
    { path: 'frontend/src/utils/api.js', name: 'Main API Service' },
    { path: 'frontend/src/services/adminAPI.js', name: 'Admin API Service' },
    { path: 'frontend/src/utils/verify-routes.js', name: 'Route Verification' }
  ];
  
  for (const apiFile of apiFiles) {
    const result = checkFile(apiFile.path);
    if (result.exists) {
      const analysis = analyzeComponent(apiFile.path);
      console.log(`✅ ${apiFile.name.padEnd(25)} - ${analysis.apiCalls} API endpoints`);
    } else {
      console.log(`❌ ${apiFile.name.padEnd(25)} - Missing`);
    }
  }

  console.log('\n🛡️ SECURITY & MIDDLEWARE ANALYSIS');
  console.log('─'.repeat(50));
  
  // Check security components
  const securityFiles = [
    { path: 'backend/middleware/auth.js', name: 'Authentication Middleware' },
    { path: 'backend/middleware/adminAuth.js', name: 'Admin Auth Middleware' },
    { path: 'backend/middleware/validation.js', name: 'Validation Middleware' },
    { path: 'backend/middleware/sanitization.js', name: 'Sanitization Middleware' },
    { path: 'frontend/src/components/ProtectedRoute.jsx', name: 'Protected Route Component' },
    { path: 'frontend/src/components/Admin/AdminProtectedRoute.jsx', name: 'Admin Protected Route' }
  ];
  
  for (const secFile of securityFiles) {
    const result = checkFile(secFile.path);
    if (result.exists) {
      console.log(`✅ ${secFile.name.padEnd(30)} - ${result.lines} lines`);
    } else {
      console.log(`❌ ${secFile.name.padEnd(30)} - Missing`);
    }
  }

  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Backend Server: ${backendRunning ? '✅ Running' : '❌ Not Running'} (http://localhost:5000)`);
  console.log(`Frontend Server: ${frontendRunning ? '✅ Running' : '❌ Not Running'} (http://localhost:5173)`);
  console.log(`Total Components: ${totalComponents}`);
  console.log(`Complex Components: ${complexComponents}`);
  console.log(`API Endpoints Tested: ${apiEndpoints.length}`);
  console.log(`Frontend Routes Tested: ${frontendRoutes.length}`);
  
  console.log('\n💡 RECOMMENDATIONS');
  console.log('─'.repeat(50));
  
  if (!backendRunning) {
    console.log('🔧 Start backend: cd backend && npm start');
  }
  
  if (!frontendRunning) {
    console.log('🔧 Start frontend: cd frontend && npm run dev');
  }
  
  if (complexComponents > totalComponents * 0.3) {
    console.log('📈 Consider refactoring complex components for better maintainability');
  }
  
  console.log('🔐 Generate admin token: node backend/scripts/generate-admin-token.js');
  console.log('🧪 Test authentication flows at frontend URLs');
  console.log('📝 Run component tests with: npm test (if configured)');
  
  return {
    backendRunning,
    frontendRunning,
    totalComponents,
    complexComponents,
    apiEndpointsTested: apiEndpoints.length,
    frontendRoutesTested: frontendRoutes.length
  };
}

// Run the verification
if (require.main === module) {
  verifyRoutes()
    .then(result => {
      console.log('\n🎉 Comprehensive verification completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = { verifyRoutes };
