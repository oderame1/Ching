// Script to run tests programmatically
import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';
const TEST_PHONE = '+2348012345678';

const results = [];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthCheck() {
  try {
    console.log('🔍 Running Health Check...');
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.status === 'ok') {
      console.log('✅ Health Check: PASSED');
      results.push({ name: 'Health Check', status: 'passed', message: 'Backend is healthy' });
      return true;
    }
    throw new Error('Invalid health check response');
  } catch (error) {
    console.log('❌ Health Check: FAILED -', error.message);
    results.push({ name: 'Health Check', status: 'failed', message: error.message });
    return false;
  }
}

async function testRequestOTP() {
  try {
    console.log('🔍 Running Request OTP...');
    const response = await axios.post(`${API_URL}/api/auth/request-otp`, {
      phone: TEST_PHONE
    });
    console.log('✅ Request OTP: PASSED');
    results.push({ name: 'Request OTP', status: 'passed', message: 'OTP sent successfully', data: response.data });
    return response.data.otp || null;
  } catch (error) {
    console.log('❌ Request OTP: FAILED -', error.response?.data?.message || error.message);
    results.push({ name: 'Request OTP', status: 'failed', message: error.response?.data?.message || error.message });
    return null;
  }
}

async function testVerifyOTP(otp) {
  if (!otp) {
    console.log('⏭️  Verify OTP: SKIPPED - No OTP available');
    results.push({ name: 'Verify OTP', status: 'pending', message: 'Skipped - OTP not returned' });
    return null;
  }
  
  try {
    console.log('🔍 Running Verify OTP...');
    const response = await axios.post(`${API_URL}/api/auth/verify`, {
      phone: TEST_PHONE,
      otp
    });
    if (response.data.accessToken) {
      console.log('✅ Verify OTP: PASSED');
      results.push({ name: 'Verify OTP', status: 'passed', message: 'OTP verified, user authenticated', token: '***' });
      return response.data.accessToken;
    }
    throw new Error('No access token received');
  } catch (error) {
    console.log('❌ Verify OTP: FAILED -', error.response?.data?.message || error.message);
    results.push({ name: 'Verify OTP', status: 'failed', message: error.response?.data?.message || error.message });
    return null;
  }
}

async function runAllTests() {
  console.log('\n🧪 Starting Comprehensive Test Suite...\n');
  console.log(`📞 Test Phone: ${TEST_PHONE}`);
  console.log(`🌐 API URL: ${API_URL}\n`);
  
  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Backend is not healthy. Stopping tests.');
    return;
  }
  await sleep(500);
  
  // Test 2: Request OTP
  const otp = await testRequestOTP();
  await sleep(1000);
  
  // Test 3: Verify OTP
  const token = await testVerifyOTP(otp);
  await sleep(500);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
    console.log(`${icon} ${result.name}: ${result.status.toUpperCase()}`);
    if (result.message) {
      console.log(`   ${result.message}`);
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(50) + '\n');
}

runAllTests().catch(console.error);

