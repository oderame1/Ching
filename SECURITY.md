# Security Scanning Guide

This document explains how to scan the Escrow Payment Platform for security vulnerabilities.

## Quick Start

```bash
# Run all security checks
npm run security:scan

# Or run individual checks
npm run security:audit      # npm audit
npm run security:outdated  # Check for outdated packages
npm run security:snyk      # Snyk security scan
```

## Available Security Tools

### 1. npm audit (Built-in)

Scans all workspaces for known vulnerabilities in dependencies.

```bash
# Check for vulnerabilities
npm run security:audit

# Fix automatically fixable issues
npm run security:audit-fix

# Check specific workspace
cd services/auth-service && npm audit
```

**Output Levels:**
- `low` - Low severity issues
- `moderate` - Moderate severity issues (default threshold)
- `high` - High severity issues
- `critical` - Critical issues

### 2. Snyk (Recommended)

Snyk provides comprehensive security scanning and monitoring.

#### Installation

```bash
# Install Snyk CLI globally
npm install -g snyk

# Authenticate (requires free Snyk account)
snyk auth
```

#### Usage

```bash
# Scan all projects
npm run security:snyk

# Scan specific service
cd services/auth-service
snyk test

# Monitor project (for CI/CD)
snyk monitor

# Scan with specific severity
snyk test --severity-threshold=high
```

#### Snyk Configuration

Create `.snyk` file in root or service directories for custom policies:

```yaml
# .snyk
version: v1.0.0
ignore: {}
patch: {}
```

### 3. npm outdated

Checks for outdated packages that may have security fixes.

```bash
npm run security:outdated
```

### 4. OWASP Dependency-Check

For comprehensive dependency vulnerability scanning.

#### Installation

```bash
# macOS
brew install dependency-check

# Or download from: https://owasp.org/www-project-dependency-check/
```

#### Usage

```bash
# Scan all Node.js projects
dependency-check --scan . --format HTML --out ./security-reports/

# Scan specific service
cd services/auth-service
dependency-check --scan . --format JSON --out ./security-report.json
```

### 5. Retire.js

Scans for known vulnerable JavaScript libraries.

#### Installation

```bash
npm install -g retire
```

#### Usage

```bash
# Scan all JavaScript files
retire --path .

# Scan specific directory
retire --path services/
```

## Automated Security Scanning

### Pre-commit Hook

Add security checks to git hooks:

```bash
# Install husky (if not already installed)
npm install --save-dev husky

# Create pre-commit hook
npx husky add .husky/pre-commit "npm run security:audit"
```

### CI/CD Integration

#### GitHub Actions Example

Create `.github/workflows/security.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm run security:audit
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

## Service-Specific Scanning

### Scan Individual Services

```bash
# Auth Service
cd services/auth-service
npm audit
snyk test

# Payment Service
cd services/payment-service
npm audit
snyk test

# Business Logic Service
cd services/business-logic-service
npm audit
snyk test
```

## Security Best Practices

### 1. Regular Scanning

- Run `npm run security:scan` weekly
- Before deploying to production
- After adding new dependencies
- After security advisories are published

### 2. Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update dependencies (carefully)
npm update

# Use npm-check-updates for major updates
npx npm-check-updates -u
npm install
```

### 3. Review Security Reports

- Review all `high` and `critical` vulnerabilities
- Test fixes in development before production
- Document security decisions in code comments

### 4. Use Security Headers

Services already include Helmet.js for security headers. Verify in:
- `services/api-gateway/src/index.ts`
- Other service entry points

### 5. Environment Variables

- Never commit `.env` files
- Use strong secrets for JWT and API keys
- Rotate secrets regularly
- Use secret management services in production

## Common Vulnerabilities

### Dependency Vulnerabilities

Most common issues:
- Outdated packages with known CVEs
- Packages with security advisories
- Transitive dependencies with vulnerabilities

**Fix:**
```bash
npm audit fix
# Review changes before committing
```

### Code Vulnerabilities

- SQL injection (use parameterized queries - already implemented)
- XSS attacks (validate and sanitize inputs)
- CSRF attacks (use CSRF tokens)
- Authentication bypass (verify JWT tokens - already implemented)

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: security@yourdomain.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Checklist

Before deploying to production:

- [ ] Run `npm run security:scan`
- [ ] Fix all `critical` and `high` vulnerabilities
- [ ] Review and update outdated dependencies
- [ ] Verify environment variables are secure
- [ ] Check database connection strings use SSL
- [ ] Verify JWT secrets are strong and unique
- [ ] Review API rate limiting configuration
- [ ] Check CORS settings are restrictive
- [ ] Verify input validation on all endpoints
- [ ] Review audit logs for suspicious activity

## Resources

- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [Snyk Documentation](https://docs.snyk.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

