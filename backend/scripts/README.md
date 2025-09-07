# MeFit Backend Scripts

This folder contains essential scripts for the MeFit application that align with the Software Requirements Specification (SRS).

## Scripts Overview

### Core Scripts

#### `seed.js`
- **Purpose**: Comprehensive database seeding and SRS requirement validation
- **SRS Compliance**: 
  - Implements all user roles (Regular User, Contributor, Administrator) as per FE-01
  - Creates test data for all API endpoints (API-02 to API-07)
  - Validates complete database design (DB-01, DB-03)
  - Tests authentication and authorization (SEC-01)
  - Validates all frontend requirements (FE-03 to FE-11)
- **Usage**: `node seed.js`

#### `cleanDB.js`
- **Purpose**: Clean database utility for development and testing
- **SRS Compliance**: Supports DB-01 (Complete Storage Solution)
- **Usage**: `node cleanDB.js`

#### `generate-admin-token.js`
- **Purpose**: Generate administrative and user tokens for testing and development
- **SRS Compliance**: Supports SEC-01 (User Authentication) and FE-01 (Login with admin role)
- **Features**:
  - Generates secure JWT tokens using same secret as application
  - Supports admin, contributor, and regular user token generation
  - Includes comprehensive token validation and testing instructions
  - Provides multiple output formats (browser console, curl commands)
- **Usage**: 
  - `node generate-admin-token.js` - Generate admin + user tokens
  - `node generate-admin-token.js --all` - Generate tokens for all user types
  - `node generate-admin-token.js --user email@example.com` - Generate token for specific user
  - `node generate-admin-token.js --help` - Show usage instructions

#### `setup-env.js`
- **Purpose**: Set up and validate environment configuration
- **SRS Compliance**: Supports SEC-03 (Credential Storage) and SEC-01 (JWT configuration)
- **Features**:
  - Generates cryptographically secure JWT secrets
  - Creates .env file from template
  - Validates environment configuration
  - Ensures proper security compliance
- **Usage**: 
  - `node setup-env.js` - Set up environment configuration
  - `node setup-env.js --validate` - Validate current configuration

### Utilities (`utils/`)

#### `database.js`
- **Purpose**: Database connection and management utilities
- **SRS Compliance**: Supports DB-01 and SEC-03 (secure credential storage)

#### `dataGenerator.js`
- **Purpose**: Generate realistic test data for seeding
- **SRS Compliance**: Supports comprehensive testing of all SRS requirements

#### `logger.js`
- **Purpose**: Application logging utilities
- **SRS Compliance**: Supports debugging and error tracking for PRF-02

### Backups (`backups/`)

Contains database backup files and restore utilities to support SRS requirement DB-02 (daily backups, 7-day retention).

## SRS Requirements Coverage

This streamlined script collection ensures all SRS requirements are met while maintaining simplicity:

- **Frontend Requirements (FE-01 to FE-11)**: Validated through comprehensive seed data
- **API Requirements (API-01 to API-08)**: All endpoints tested with proper data
- **Database Requirements (DB-01 to DB-03)**: Complete storage solution with backup support
- **Security Requirements (SEC-01 to SEC-04)**: Authentication, input validation, and secure storage
- **Performance Requirements (PRF-01 to PRF-02)**: Error handling and logging support

## Removed Scripts

The following redundant scripts were removed to maintain clean codebase:
- `backup-enhanced.js`, `backup.js` - Functionality integrated into seed.js
- `cleanDB-optimized.js` - Redundant with cleanDB.js
- `generate-admin-token-enhanced.js` - Redundant with generate-admin-token.js
- `script-manager.js`, `script-manager-optimized.js` - Unnecessary complexity
- `seed-optimized.js` - Redundant with seed.js
- `verify-routes.js` - Validation handled by main application
- `backupScheduler.js` - Not required by SRS
