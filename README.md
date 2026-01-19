# Microsoft Azure AD Login Automation with Playwright

Complete Playwright-based automation framework for testing Microsoft account login (Azure AD/Entra ID) in CRM applications.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Test Scenarios](#test-scenarios)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🎯 Overview

This framework provides comprehensive test automation for Microsoft Azure AD (Entra ID) OAuth 2.0 login flows, including:

- ✅ Valid and invalid credential testing
- ✅ Session management and timeout handling
- ✅ Logout and re-authentication flows
- ✅ OAuth redirect validation
- ✅ Cross-browser compatibility
- ✅ MFA handling strategies
- ✅ CI/CD pipeline integration

## ✨ Features

- **Page Object Model (POM)** architecture for maintainability
- **Reusable authentication helpers** for Microsoft login flows
- **Support for both popup and redirect** OAuth flows
- **Session state management** for faster test execution
- **Comprehensive error handling** and retry logic
- **Cross-browser testing** (Chromium, Firefox, WebKit)
- **CI/CD ready** with GitHub Actions workflow
- **Detailed reporting** with screenshots and videos on failure

## 📦 Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **Azure AD tenant** access for test user creation
- **CRM application** with Microsoft login configured

## 🚀 Installation

### 1. Clone or navigate to your project directory

```bash
cd /home/techstaunch/Downloads/playwright
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install
```

### 4. Install additional dependencies

```bash
npm install --save-dev dotenv
```

## ⚙️ Configuration

### 1. Create `.env` file

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

### 2. Configure environment variables

Edit `.env` with your actual values:

```env
# CRM Application
CRM_BASE_URL=https://your-crm-app.com

# Microsoft Test Account
MS_TEST_EMAIL=testuser@yourdomain.onmicrosoft.com
MS_TEST_PASSWORD=YourSecurePassword123!

# Azure AD Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id

# Test Configuration
HEADLESS=false
TIMEOUT=30000
```

### 3. Set up Azure AD test users

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **Users**
3. Create test users:
   - **Valid test user**: For successful login tests
   - **Disabled user**: For negative testing (disable after creation)
4. Assign users to your CRM application
5. **Disable MFA** for test users (see guide for details)

### 4. Update Page Object selectors

Modify selectors in `pages/` directory to match your CRM application:

- `pages/LoginPage.js` - Login page elements
- `pages/DashboardPage.js` - Dashboard elements

## 📁 Project Structure

```
playwright/
├── .env                                    # Environment variables (DO NOT commit)
├── .env.example                            # Environment template
├── .gitignore                              # Git ignore rules
├── package.json                            # Dependencies and scripts
├── playwright.config.ts                    # Playwright configuration
├── .github/
│   └── workflows/
│       └── playwright-tests.yml            # CI/CD workflow
├── pages/                                  # Page Object Models
│   ├── LoginPage.js
│   ├── MicrosoftLoginPage.js
│   └── DashboardPage.js
├── tests/
│   ├── auth/                               # Authentication tests
│   │   ├── microsoft-login.spec.js
│   │   ├── session-management.spec.js
│   │   └── logout.spec.js
│   └── helpers/                            # Helper utilities
│       └── microsoft-auth.js
└── test-results/                           # Test execution results
```

## 🧪 Running Tests

### Run all tests

```bash
npm test
```

### Run tests in headed mode (see browser)

```bash
npm run test:headed
```

### Run specific test suites

```bash
# Login tests only
npm run test:login

# Session management tests
npm run test:session

# Logout tests
npm run test:logout

# All auth tests
npm run test:auth
```

### Run tests in specific browser

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Debug mode

```bash
npm run test:debug
```

### UI mode (interactive)

```bash
npm run test:ui
```

### View test report

```bash
npm run report
```

## 📊 Test Scenarios

| Test ID | Scenario | Priority | Status |
|---------|----------|----------|--------|
| TC-001 | Successful login with valid Microsoft account | P0 | ✅ |
| TC-002 | Login with invalid Microsoft credentials | P0 | ✅ |
| TC-003 | Login with disabled Microsoft account | P1 | ✅ |
| TC-004 | User cancels Microsoft login | P1 | ✅ |
| TC-005 | Session timeout after inactivity | P1 | ✅ |
| TC-006 | Re-login after session timeout | P1 | ✅ |
| TC-007 | Logout and re-authentication | P0 | ✅ |
| TC-008 | OAuth redirect validation | P0 | ✅ |
| TC-009 | Token refresh on expiration | P2 | ✅ |
| TC-010 | Concurrent session handling | P2 | ✅ |
| TC-014 | Cross-browser compatibility | P1 | ✅ |

See the [complete guide](/.gemini/antigravity/brain/c07a9b0d-7983-4f4e-bcf5-9480b6f17759/microsoft-login-automation-guide.md) for detailed test case descriptions.

## 🔄 CI/CD Integration

### GitHub Actions

The project includes a ready-to-use GitHub Actions workflow (`.github/workflows/playwright-tests.yml`).

#### Setup GitHub Secrets

Add the following secrets in your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `CRM_BASE_URL`
   - `MS_TEST_EMAIL`
   - `MS_TEST_PASSWORD`
   - `MS_DISABLED_EMAIL`
   - `AZURE_TENANT_ID`
   - `AZURE_CLIENT_ID`

#### Workflow Features

- ✅ Runs on push to main/develop branches
- ✅ Runs on pull requests
- ✅ Daily scheduled runs (midnight UTC)
- ✅ Cross-browser matrix testing
- ✅ Automatic artifact upload (reports, videos, traces)
- ✅ Test result retention (30 days)

### Azure DevOps

See the [complete guide](/.gemini/antigravity/brain/c07a9b0d-7983-4f4e-bcf5-9480b6f17759/microsoft-login-automation-guide.md) for Azure DevOps pipeline configuration.

## 🔧 Troubleshooting

### Common Issues

#### 1. Timeout errors

**Solution**: Increase timeout in `.env`:
```env
TIMEOUT=60000
```

#### 2. Element not found

**Solution**: Update selectors in Page Object Models to match your application.

#### 3. MFA blocking tests

**Solutions**:
- Disable MFA for test users in Azure AD
- Use Conditional Access to exclude test users
- Enable "Remember MFA" and reuse browser state

#### 4. Popup not detected

**Solution**: The framework handles both popup and redirect flows automatically via `microsoft-auth.js` helper.

#### 5. Session not persisting

**Solution**: Ensure authentication state is saved correctly:
```javascript
await saveAuthState(page, '.auth/user.json');
```

### Debug Tips

1. **Run in headed mode**:
   ```bash
   npm run test:headed
   ```

2. **Enable Playwright Inspector**:
   ```bash
   PWDEBUG=1 npm test
   ```

3. **Check screenshots** in `test-results/` directory after failures

4. **View trace files**:
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

## 📚 Best Practices

### 1. Security
- ✅ Never commit `.env` file
- ✅ Use CI/CD secrets for credentials
- ✅ Rotate test account passwords regularly
- ✅ Use dedicated test users (not production accounts)

### 2. Test Maintenance
- ✅ Keep Page Object Models updated with UI changes
- ✅ Use descriptive test names
- ✅ Add comments for complex logic
- ✅ Review and update selectors regularly

### 3. Performance
- ✅ Reuse authentication state when possible
- ✅ Run tests in parallel (where applicable)
- ✅ Use appropriate timeouts
- ✅ Clean up test data after execution

### 4. Reliability
- ✅ Implement retry logic for flaky tests
- ✅ Use explicit waits instead of hard waits
- ✅ Handle both popup and redirect flows
- ✅ Validate redirects and URLs

## 📖 Additional Resources

- [Complete Automation Guide](/.gemini/antigravity/brain/c07a9b0d-7983-4f4e-bcf5-9480b6f17759/microsoft-login-automation-guide.md) - Comprehensive documentation
- [Playwright Documentation](https://playwright.dev)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [OAuth 2.0 Specification](https://oauth.net/2/)

## 📝 License

ISC

## 👤 Author

Senior QA Automation Engineer

---

**Last Updated**: 2025-12-26
