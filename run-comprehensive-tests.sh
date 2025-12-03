#!/bin/bash

API_URL="http://localhost:3001"
TEST_PHONE="+2348012345678"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🧪 COMPREHENSIVE TEST SUITE - AUTOMATED RUN           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📞 Test Phone: $TEST_PHONE"
echo "🌐 API URL: $API_URL"
echo ""

PASSED=0
FAILED=0
SKIPPED=0

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 1: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH=$(curl -s "$API_URL/health" 2>&1)
if echo "$HEALTH" | grep -q '"status".*"ok"'; then
    echo "✅ PASSED - Backend is healthy"
    echo "   Response: $(echo "$HEALTH" | grep -o '"status":"[^"]*"')"
    ((PASSED++))
    HEALTH_OK=true
else
    echo "❌ FAILED - Backend health check failed"
    echo "   Response: $(echo "$HEALTH" | head -1)"
    ((FAILED++))
    HEALTH_OK=false
fi
echo ""

if [ "$HEALTH_OK" = false ]; then
    echo "❌ Backend is not healthy. Stopping tests."
    exit 1
fi

# Test 2: Request OTP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Test 2: Request OTP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
OTP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\"}" 2>&1)

if echo "$OTP_RESPONSE" | grep -q '"message"'; then
    echo "✅ PASSED - OTP request successful"
    OTP=$(echo "$OTP_RESPONSE" | grep -o '"otp":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$OTP" ]; then
        echo "   📱 OTP Code: $OTP"
        echo "   ⏰ Expires in: 5 minutes"
    else
        echo "   ℹ️  OTP not in response (check backend logs for code)"
    fi
    ((PASSED++))
    OTP_OK=true
else
    echo "❌ FAILED - OTP request failed"
    ERROR_MSG=$(echo "$OTP_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo "   Error: ${ERROR_MSG:-Unknown error}"
    ((FAILED++))
    OTP_OK=false
    OTP=""
fi
echo ""

# Test 3: Verify OTP
if [ -n "$OTP" ] && [ "$OTP_OK" = true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Test 3: Verify OTP"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sleep 1
    VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/verify" \
      -H "Content-Type: application/json" \
      -d "{\"phone\":\"$TEST_PHONE\",\"otp\":\"$OTP\"}" 2>&1)
    
    if echo "$VERIFY_RESPONSE" | grep -q '"accessToken"'; then
        echo "✅ PASSED - OTP verified, user authenticated"
        TOKEN=$(echo "$VERIFY_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        USER_ID=$(echo "$VERIFY_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   🔑 Token: ${TOKEN:0:30}..."
        echo "   👤 User ID: ${USER_ID:0:8}..."
        ((PASSED++))
        AUTH_OK=true
        AUTH_TOKEN="$TOKEN"
    else
        echo "❌ FAILED - OTP verification failed"
        ERROR_MSG=$(echo "$VERIFY_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        echo "   Error: ${ERROR_MSG:-Invalid OTP}"
        ((FAILED++))
        AUTH_OK=false
    fi
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⏭️  Test 3: Verify OTP - SKIPPED (No OTP available)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ((SKIPPED++))
    AUTH_OK=false
fi
echo ""

# Test 4: Get Current User (requires auth)
if [ "$AUTH_OK" = true ] && [ -n "$AUTH_TOKEN" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Test 4: Get Current User"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    USER_RESPONSE=$(curl -s -X GET "$API_URL/api/users/me" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN" 2>&1)
    
    if echo "$USER_RESPONSE" | grep -q '"user"'; then
        echo "✅ PASSED - User data retrieved"
        USER_NAME=$(echo "$USER_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        USER_EMAIL=$(echo "$USER_RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
        echo "   👤 Name: ${USER_NAME:-N/A}"
        echo "   📧 Email: ${USER_EMAIL:-N/A}"
        ((PASSED++))
    else
        echo "❌ FAILED - Failed to get user data"
        ERROR_MSG=$(echo "$USER_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        echo "   Error: ${ERROR_MSG:-Unauthorized}"
        ((FAILED++))
    fi
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⏭️  Test 4: Get Current User - SKIPPED (Authentication required)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ((SKIPPED++))
fi
echo ""

# Final Summary
TOTAL=$((PASSED + FAILED + SKIPPED))
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    📊 TEST RESULTS SUMMARY                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "   Total Tests:  $TOTAL"
echo "   ✅ Passed:     $PASSED"
echo "   ❌ Failed:     $FAILED"
echo "   ⏭️  Skipped:    $SKIPPED"
echo ""
if [ $FAILED -eq 0 ]; then
    echo "   🎉 All tests passed!"
else
    echo "   ⚠️  Some tests failed. Check details above."
fi
echo ""
echo "╚════════════════════════════════════════════════════════════╝"

