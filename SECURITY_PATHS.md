# Security Scanning File Paths

## Main Security Files

### Documentation
- **`/Users/pro/Ching/SECURITY.md`** - Complete security scanning guide and documentation
- **`/Users/pro/Ching/README.md`** - Main README (contains security section)

### Configuration Files
- **`/Users/pro/Ching/.snyk`** - Snyk security policy configuration
- **`/Users/pro/Ching/package.json`** - Contains security scanning scripts (lines 20-26)

### Scripts
- **`/Users/pro/Ching/scripts/security-scan.sh`** - Comprehensive security scanning script

## Quick Reference

### Run Security Scans

```bash
# From project root (/Users/pro/Ching)

# Quick scan (npm audit + outdated + snyk)
npm run security:scan

# Individual scans
npm run security:audit      # npm audit on all workspaces
npm run security:audit-fix  # Auto-fix vulnerabilities
npm run security:outdated   # Check outdated packages
npm run security:snyk       # Snyk scan (if installed)

# Comprehensive script
./scripts/security-scan.sh
```

### File Locations Summary

```
/Users/pro/Ching/
├── SECURITY.md                    # Security documentation
├── .snyk                          # Snyk configuration
├── package.json                   # Security scripts (lines 20-26)
└── scripts/
    └── security-scan.sh          # Security scanning script
```

## Service-Specific Scanning

Each service can be scanned individually:

```
/Users/pro/Ching/services/
├── api-gateway/package.json
├── auth-service/package.json
├── business-logic-service/package.json
├── payment-service/package.json
├── webhook-listener-service/package.json
├── notification-service/package.json
├── fraud-service/package.json
└── audit-service/package.json
```

Scan individual service:
```bash
cd /Users/pro/Ching/services/auth-service
npm audit
```

## Frontend App Scanning

```
/Users/pro/Ching/apps/
├── buyer-app/package.json
├── seller-app/package.json
└── admin-dashboard/package.json
```

Scan individual app:
```bash
cd /Users/pro/Ching/apps/buyer-app
npm audit
```

