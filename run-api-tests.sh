#!/bin/bash

API_URL="http://localhost:3001"
TEST_PHONE="+2348012345678"

echo "🧪 Running Comprehensive Test Suite"
echo "===================================="
echo "📞 Test Phone: $TEST_PHONE"
echo "🌐 API URL: $API_URL"
echo ""

# Test 1: Health Check
echo "🔍 Test 1: Health Check"
HEALTH=$(curl -s "$API_URL/health" 2>&1)
if echo "$HEALTH" | grep -q '"status".*"ok"'; then
    echo "✅ PASSED - Backend is healthy"
    HEALTH_OK=true
else
    echo "❌ FAILED - Backend health check failed"
    echo "Response: $HEALTH" | head -3
    HEALTH_OK=false
fi
echo ""

if [ "$HEALTH_OK" = false ]; then
    echo "❌ Backend is not healthy. Stopping tests."
    exit 1
fi

# Test 2: Request OTP
echo "🔍 Test 2: Request OTP"
OTP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\"}" 2>&1)

if echo "$OTP_RESPONSE" | grep -q '"message"'; then
    echo "✅ PASSED - OTP request successful"
    OTP=$(echo "$OTP_RESPONSE" | grep -o '"otp":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$OTP" ]; then
        echo "   OTP Code: $OTP"
    else
        echo "   (OTP not in response - check backend logs)"
    fi
    OTP_OK=true
else
    echo "❌ FAILED - OTP request failed"
    echo "Response: $OTP_RESPONSE" | head -5
    OTP_OK=false
    OTP=""
fi
echo ""

# Test 3: Verify OTP (if available)
if [ -n "$OTP" ] && [ "$OTP_OK" = true ]; then
    echo "🔍 Test 3: Verify OTP"
    sleep 1
    VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/verify" \
      -H "Content-Type: application/json" \
      -d "{\"phone\":\"$TEST_PHONE\",\"otp\":\"$OTP\"}" 2>&1)
    
    if echo "$VERIFY_RESPONSE" | grep -q '"accessToken"'; then
        echo "✅ PASSED - OTP verified, user authenticated"
        TOKEN=$(echo "$VERIFY_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        echo "   Token received: ${TOKEN:0:20}..."
        AUTH_OK=true
    else
        echo "❌ FAILED - OTP verification failed"
        echo "Response: $VERIFY_RESPONSE" | head -5
        AUTH_OK=false
    fi
else
    echo "⏭️  Test 3: Verify OTP - SKIPPED (No OTP available)"
    AUTH_OK=false
fi
echo ""

# Summary
echo "===================================="
echo "📊 TEST RESULTS SUMMARY"
echo "===================================="
echo "✅ Health Check: $([ "$HEALTH_OK" = true ] && echo "PASSED" || echo "FAILED")"
echo "$([ "$OTP_OK" = true ] && echo "✅" || echo "❌") Request OTP: $([ "$OTP_OK" = true ] && echo "PASSED" || echo "FAILED")"
echo "$([ "$AUTH_OK" = true ] && echo "✅" || echo "⏭️") Verify OTP: $([ "$AUTH_OK" = true ] && echo "PASSED" || [ -z "$OTP" ] && echo "SKIPPED" || echo "FAILED")"
echo "===================================="
