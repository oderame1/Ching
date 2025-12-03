import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleApiError } from '@/lib/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function TestPayoutsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [payoutReference, setPayoutReference] = useState('');

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
  });

  const handleGetPayoutStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);

    if (!getAuthToken()) {
      setError('❌ Please login first using the Authentication test page');
      return;
    }

    if (!payoutReference) {
      setError('❌ Please enter a Payout Reference');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/payouts/status/${payoutReference}`,
        { headers: getHeaders() }
      );

      setResult(response.data);
      setSuccess('✅ Payout status retrieved successfully!');
    } catch (error: any) {
      console.error('Get payout status error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to get payout status')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                💰 Payouts Test
              </h1>
              <p className="text-gray-600">
                Check payout status and details
              </p>
            </div>
            <Link to="/test-hub">
              <Button variant="outline">← Back to Hub</Button>
            </Link>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">📋 Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
              <li>Make sure you're logged in</li>
              <li>Enter a payout reference from a completed escrow</li>
              <li>Click "Get Payout Status" to view payout details</li>
              <li>Payouts are typically created automatically when escrow is released</li>
            </ol>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          )}

          {/* Get Payout Status Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Payout Status</h2>
            <form onSubmit={handleGetPayoutStatus} className="space-y-4">
              <div>
                <Label htmlFor="payoutReference">Payout Reference</Label>
                <Input
                  id="payoutReference"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  placeholder="Enter payout reference"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Payout references are generated when escrows are released. Check your escrow details for the payout reference.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !payoutReference}>
                {loading ? '⏳ Checking...' : '📊 Get Payout Status'}
              </Button>
            </form>
          </div>

          {/* Result Display */}
          {result && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Response:</h3>
              <pre className="bg-white p-4 rounded border overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Note:</strong> Payouts are typically created automatically when an escrow is released. 
              To test payouts, first create an escrow, complete the payment, mark it as delivered and received, 
              then release the escrow. The payout reference will be available in the escrow details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

