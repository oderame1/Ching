import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleApiError } from '@/lib/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const IS_DEV = import.meta.env.MODE === 'development' || import.meta.env.DEV;

type Step = 'phone' | 'otp' | 'success';

export default function TestOTPPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setReceivedOtp(null);
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/request-otp`, { phone });
      
      // Log response for debugging
      console.log('OTP Response:', response.data);
      
      // In development, the API returns the OTP
      if (response.data.otp) {
        setReceivedOtp(response.data.otp);
        setSuccess('✅ OTP sent successfully! Check the yellow box below for your code.');
      } else {
        setSuccess('✅ OTP sent successfully! Check your backend console logs for the OTP code.');
        console.warn('OTP not in response. Backend NODE_ENV might not be "development". Check backend console logs.');
      }
      
      setStep('otp');
    } catch (error: any) {
      console.error('OTP Request Error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to send OTP')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/verify`, { phone, otp });
      
      setSuccess('✅ OTP verified successfully! You are now logged in.');
      setStep('success');
      
      // Store tokens if needed
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error: any) {
      console.error('OTP Verify Error:', error);
      setError(`❌ ${handleApiError(error, 'Invalid OTP')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhone('');
    setOtp('');
    setReceivedOtp(null);
    setStep('phone');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🔐 OTP Testing Tool
            </h1>
            <p className="text-gray-600">
              Simple tool to test OTP functionality
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 How to use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Enter your phone number (e.g., +2348012345678 or 08012345678)</li>
              <li>Click "Send OTP" button</li>
              {IS_DEV && (
                <li className="font-semibold">The OTP will appear below (dev mode only)</li>
              )}
              <li>Enter the 6-digit OTP code</li>
              <li>Click "Verify OTP" to complete</li>
            </ol>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          )}

          {/* OTP Display (Dev Mode) */}
          {receivedOtp && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6 text-center">
              <p className="text-sm text-yellow-800 mb-2 font-semibold">
                🧪 Development Mode - Your OTP Code:
              </p>
              <div className="bg-white border-2 border-yellow-400 rounded-lg p-4 inline-block">
                <p className="text-4xl font-bold text-gray-900 tracking-widest">
                  {receivedOtp}
                </p>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                This code expires in 5 minutes
              </p>
            </div>
          )}

          {/* Help message if OTP not received */}
          {step === 'otp' && !receivedOtp && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                💡 OTP Not Displayed?
              </p>
              <p className="text-xs text-blue-700 mb-2">
                The OTP code has been generated and logged in the backend console.
              </p>
              <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
                <li>Open your backend terminal/console</li>
                <li>Look for a log message like: <code className="bg-blue-100 px-1 rounded">OTP for {phone}: XXXXXX</code></li>
                <li>Use that 6-digit code to verify</li>
              </ol>
              <p className="text-xs text-blue-600 mt-2 font-semibold">
                Or check the browser console (F12) for the API response.
              </p>
            </div>
          )}

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <Label htmlFor="phone" className="text-base font-semibold mb-2 block">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+2348012345678 or 08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-12 text-lg"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Nigerian phone number format required
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold" 
                disabled={loading || !phone}
              >
                {loading ? '⏳ Sending OTP...' : '📱 Send OTP'}
              </Button>
            </form>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <Label htmlFor="otp" className="text-base font-semibold mb-2 block">
                  Enter OTP Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  required
                  maxLength={6}
                  className="h-12 text-lg text-center text-2xl tracking-widest font-mono"
                  disabled={loading}
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the 6-digit code you received
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => setStep('phone')}
                    disabled={loading}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 h-12"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    🔄 Start Over
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Success!
              </h2>
              <p className="text-gray-600">
                Your OTP has been verified successfully.
              </p>
              <Button
                onClick={handleReset}
                className="w-full h-12 text-lg font-semibold"
              >
                🔄 Test Again
              </Button>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              API Endpoint: {API_URL}/api/auth
            </p>
            {IS_DEV && (
              <p className="text-xs text-center text-gray-500 mt-1">
                Development mode - OTP is visible for testing
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

