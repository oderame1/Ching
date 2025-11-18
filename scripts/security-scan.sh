#!/bin/bash

# Comprehensive Security Scanning Script
# Scans all services and apps for security vulnerabilities

set -e

echo "🔒 Starting Security Scan..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm audit is available
echo "📦 Running npm audit on all workspaces..."
if npm run security:audit; then
    echo -e "${GREEN}✅ npm audit completed${NC}"
else
    echo -e "${YELLOW}⚠️  npm audit found issues${NC}"
fi
echo ""

# Check for outdated packages
echo "📅 Checking for outdated packages..."
if npm run security:outdated; then
    echo -e "${GREEN}✅ Outdated packages check completed${NC}"
else
    echo -e "${YELLOW}⚠️  Some packages may be outdated${NC}"
fi
echo ""

# Check if Snyk is installed
if command -v snyk &> /dev/null; then
    echo "🔍 Running Snyk security scan..."
    if snyk test --all-projects --severity-threshold=high 2>/dev/null; then
        echo -e "${GREEN}✅ Snyk scan completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Snyk found issues${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Snyk not installed. Install with: npm install -g snyk${NC}"
    echo "   Then authenticate: snyk auth"
fi
echo ""

# Check if retire.js is installed
if command -v retire &> /dev/null; then
    echo "🔍 Running Retire.js scan..."
    if retire --path . --severity high 2>/dev/null; then
        echo -e "${GREEN}✅ Retire.js scan completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Retire.js found issues${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Retire.js not installed. Install with: npm install -g retire${NC}"
fi
echo ""

# Scan individual services
echo "🔍 Scanning individual services..."
for service in services/*/; do
    if [ -f "$service/package.json" ]; then
        echo "  Scanning $service..."
        cd "$service"
        if npm audit --audit-level=moderate > /dev/null 2>&1; then
            echo -e "    ${GREEN}✅ $service${NC}"
        else
            echo -e "    ${YELLOW}⚠️  $service has issues${NC}"
        fi
        cd - > /dev/null
    fi
done
echo ""

# Scan apps
echo "🔍 Scanning frontend applications..."
for app in apps/*/; do
    if [ -f "$app/package.json" ]; then
        echo "  Scanning $app..."
        cd "$app"
        if npm audit --audit-level=moderate > /dev/null 2>&1; then
            echo -e "    ${GREEN}✅ $app${NC}"
        else
            echo -e "    ${YELLOW}⚠️  $app has issues${NC}"
        fi
        cd - > /dev/null
    fi
done
echo ""

echo "✅ Security scan completed!"
echo ""
echo "📋 Next steps:"
echo "  1. Review any vulnerabilities found"
echo "  2. Run 'npm run security:audit-fix' to fix auto-fixable issues"
echo "  3. Update vulnerable packages manually if needed"
echo "  4. Review SECURITY.md for detailed information"
echo ""

