# MeFit API Testing PowerShell Script
# This script helps you test all API endpoints step by step

Write-Host "🚀 MeFit API Endpoint Testing Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "📡 Checking if server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Status: $($healthCheck.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server is not running or not accessible!" -ForegroundColor Red
    Write-Host "   Please ensure the backend server is running on http://localhost:5000" -ForegroundColor Yellow
    Write-Host "   Run: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Menu for testing options
function Show-Menu {
    Write-Host "🔧 Testing Options:" -ForegroundColor Cyan
    Write-Host "1. Quick Health Check" -ForegroundColor White
    Write-Host "2. Test Authentication" -ForegroundColor White
    Write-Host "3. Test User Management" -ForegroundColor White
    Write-Host "4. Test Admin Features" -ForegroundColor White
    Write-Host "5. Run Automated Test Script" -ForegroundColor White
    Write-Host "6. Manual Testing with Postman Collection" -ForegroundColor White
    Write-Host "7. Show Test Credentials" -ForegroundColor White
    Write-Host "8. Exit" -ForegroundColor White
    Write-Host ""
}

function Test-HealthCheck {
    Write-Host "🔍 Testing Health Check..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
        Write-Host "✅ Health Check Passed" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Health Check Failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-Authentication {
    Write-Host "🔐 Testing Authentication..." -ForegroundColor Yellow
    
    # Test user login
    $loginData = @{
        email = "john.beginner@example.com"
        password = "User123!"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "✅ User Login Successful" -ForegroundColor Green
        Write-Host "   User: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Gray
        Write-Host "   Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
        
        # Store token for further tests
        $global:userToken = $response.token
        
        # Test getting current user
        $headers = @{
            "Authorization" = "Bearer $($response.token)"
        }
        $meResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
        Write-Host "✅ Get Current User Successful" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Authentication Test Failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-UserManagement {
    Write-Host "👤 Testing User Management..." -ForegroundColor Yellow
    
    if (-not $global:userToken) {
        Write-Host "⚠️  No user token available. Running authentication first..." -ForegroundColor Yellow
        Test-Authentication
    }
    
    if ($global:userToken) {
        $headers = @{
            "Authorization" = "Bearer $global:userToken"
            "Content-Type" = "application/json"
        }
        
        try {
            # Test getting users endpoint
            $response = Invoke-RestMethod -Uri "http://localhost:5000/api/users/" -Method GET -Headers $headers
            Write-Host "✅ User Management Access Successful" -ForegroundColor Green
        } catch {
            if ($_.Exception.Response.StatusCode -eq 303) {
                Write-Host "✅ User Management Redirect (Expected)" -ForegroundColor Green
            } else {
                Write-Host "❌ User Management Test Failed" -ForegroundColor Red
                Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

function Test-AdminFeatures {
    Write-Host "👑 Testing Admin Features..." -ForegroundColor Yellow
    
    # Test admin login
    $adminLoginData = @{
        email = "admin@mefit.com"
        password = "Admin123!"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json"
        Write-Host "✅ Admin Login Successful" -ForegroundColor Green
        Write-Host "   Admin: $($response.data.user.firstName) $($response.data.user.lastName)" -ForegroundColor Gray
        
        $adminHeaders = @{
            "Authorization" = "Bearer $($response.data.token)"
        }
        
        # Test admin dashboard
        $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dashboard/stats" -Method GET -Headers $adminHeaders
        Write-Host "✅ Admin Dashboard Access Successful" -ForegroundColor Green
        Write-Host "   Total Users: $($dashboardResponse.data.overview.totalUsers)" -ForegroundColor Gray
        Write-Host "   Active Users: $($dashboardResponse.data.overview.activeUsers)" -ForegroundColor Gray
        
    } catch {
        Write-Host "❌ Admin Test Failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Run-AutomatedTests {
    Write-Host "🤖 Running Automated Test Script..." -ForegroundColor Yellow
    
    # Check if Node.js is available
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js not found!" -ForegroundColor Red
        Write-Host "   Please install Node.js to run automated tests" -ForegroundColor Yellow
        return
    }
    
    # Check if axios is available
    try {
        npm list axios --depth=0 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "📦 Installing axios..." -ForegroundColor Yellow
            npm install axios
        }
    } catch {
        Write-Host "📦 Installing axios..." -ForegroundColor Yellow
        npm install axios
    }
    
    # Run the automated test script
    if (Test-Path "test_all_endpoints.js") {
        Write-Host "🚀 Starting automated tests..." -ForegroundColor Green
        node test_all_endpoints.js
    } else {
        Write-Host "❌ test_all_endpoints.js not found!" -ForegroundColor Red
    }
}

function Show-PostmanInfo {
    Write-Host "📮 Postman Collection Information" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "A Postman collection has been created: MeFit_API_Testing_Collection.postman_collection.json" -ForegroundColor Green
    Write-Host ""
    Write-Host "To use it:" -ForegroundColor White
    Write-Host "1. Open Postman" -ForegroundColor Gray
    Write-Host "2. Click 'Import' button" -ForegroundColor Gray
    Write-Host "3. Select the JSON file: MeFit_API_Testing_Collection.postman_collection.json" -ForegroundColor Gray
    Write-Host "4. The collection will be imported with all test endpoints" -ForegroundColor Gray
    Write-Host "5. Use the 'Run Collection' feature to test all endpoints" -ForegroundColor Gray
    Write-Host ""
    Write-Host "The collection includes:" -ForegroundColor White
    Write-Host "• Automated token management" -ForegroundColor Gray
    Write-Host "• Test assertions" -ForegroundColor Gray
    Write-Host "• Environment variables" -ForegroundColor Gray
    Write-Host "• Error testing scenarios" -ForegroundColor Gray
}

function Show-TestCredentials {
    Write-Host "🔑 Test Credentials from Seeded Database" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 ADMIN ACCOUNT:" -ForegroundColor Cyan
    Write-Host "   Email:    admin@mefit.com" -ForegroundColor White
    Write-Host "   Password: Admin123!" -ForegroundColor White
    Write-Host ""
    Write-Host "👨‍💼 CONTRIBUTOR ACCOUNTS:" -ForegroundColor Cyan
    Write-Host "   Email:    mike.trainer@mefit.com" -ForegroundColor White
    Write-Host "   Password: Trainer123!" -ForegroundColor White
    Write-Host "   Email:    sarah.fitness@mefit.com" -ForegroundColor White
    Write-Host "   Password: Fitness123!" -ForegroundColor White
    Write-Host ""
    Write-Host "👤 REGULAR USER ACCOUNTS:" -ForegroundColor Cyan
    Write-Host "   Email:    john.beginner@example.com" -ForegroundColor White
    Write-Host "   Password: User123!" -ForegroundColor White
    Write-Host "   Email:    jane.intermediate@example.com" -ForegroundColor White
    Write-Host "   Password: User123!" -ForegroundColor White
    Write-Host "   Email:    alex.advanced@example.com" -ForegroundColor White
    Write-Host "   Password: User123!" -ForegroundColor White
    Write-Host "   Email:    emily.yoga@example.com (2FA enabled)" -ForegroundColor White
    Write-Host "   Password: User123!" -ForegroundColor White
    Write-Host ""
}

# Main execution loop
$global:userToken = $null

do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-8)"
    
    switch ($choice) {
        "1" { Test-HealthCheck }
        "2" { Test-Authentication }
        "3" { Test-UserManagement }
        "4" { Test-AdminFeatures }
        "5" { Run-AutomatedTests }
        "6" { Show-PostmanInfo }
        "7" { Show-TestCredentials }
        "8" { 
            Write-Host "👋 Goodbye!" -ForegroundColor Green
            exit 
        }
        default { 
            Write-Host "❌ Invalid choice. Please select 1-8." -ForegroundColor Red 
        }
    }
    
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Clear-Host
} while ($true)
