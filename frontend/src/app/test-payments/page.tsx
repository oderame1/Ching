'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleApiError } from '@/lib/errorHandler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TestPaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  
  const [escrowId, setEscrowId] = useState('');
  const [gateway, setGateway] = useState<'paystack' | 'flutterwave'>('paystack');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
  });

  const handleInitializePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);

    if (!getAuthToken()) {
      setError('❌ Please login first using the Authentication test page');
      return;
    }

    if (!escrowId) {
      setError('❌ Please enter an Escrow ID');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/payments/initialize`,
        {
          escrowId,
          gateway,
          ...(callbackUrl && { callbackUrl }),
        },
        { headers: getHeaders() }
      );

      setResult(response.data);
      setSuccess('✅ Payment initialized successfully!');
      setPaymentReference(response.data.payment?.reference || '');
      
      // If payment URL is provided, show it
      if (response.data.paymentUrl) {
        setSuccess(`✅ Payment initialized! Payment URL: ${response.data.paymentUrl}`);
      }
    } catch (error: any) {
      console.error('Initialize payment error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to initialize payment')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetPaymentStatus = async () => {
    if (!paymentReference) {
      setError('❌ Please enter a Payment Reference');
      return;
    }

    setError(null);
    setSuccess(null);
    setResult(null);

    if (!getAuthToken()) {
      setError('❌ Please login first');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/payments/status/${paymentReference}`,
        { headers: getHeaders() }
      );

      setResult(response.data);
      setSuccess('✅ Payment status retrieved successfully!');
    } catch (error: any) {
      console.error('Get payment status error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to get payment status')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                💳 Payments Test
              </h1>
              <p className="text-gray-600">
                Test payment initialization and status checking
              </p>
            </div>
            <Link href="/test-hub">
              <Button variant="outline">← Back to Hub</Button>
            </Link>
          </div>

          {/* Instructions */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-900 mb-2">📋 Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-purple-800">
              <li>Make sure you're logged in and have created an escrow</li>
              <li>Enter the Escrow ID from a created escrow</li>
              <li>Select payment gateway (Paystack or Flutterwave)</li>
              <li>Initialize payment to get a payment URL</li>
              <li>Use the payment reference to check payment status</li>
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

          {/* Initialize Payment Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Initialize Payment</h2>
            <form onSubmit={handleInitializePayment} className="space-y-4">
              <div>
                <Label htmlFor="escrowId">Escrow ID</Label>
                <Input
                  id="escrowId"
                  value={escrowId}
                  onChange={(e) => setEscrowId(e.target.value)}
                  placeholder="Enter escrow UUID"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="gateway">Payment Gateway</Label>
                <select
                  id="gateway"
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value as 'paystack' | 'flutterwave')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={loading}
                >
                  <option value="paystack">Paystack</option>
                  <option value="flutterwave">Flutterwave</option>
                </select>
              </div>

              <div>
                <Label htmlFor="callbackUrl">Callback URL (Optional)</Label>
                <Input
                  id="callbackUrl"
                  type="url"
                  value={callbackUrl}
                  onChange={(e) => setCallbackUrl(e.target.value)}
                  placeholder="https://example.com/callback"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '⏳ Initializing...' : '🚀 Initialize Payment'}
              </Button>
            </form>
          </div>

          {/* Check Payment Status */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Payment Status</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentReference">Payment Reference</Label>
                <Input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Enter payment reference"
                  disabled={loading}
                />
              </div>
              <Button onClick={handleGetPaymentStatus} className="w-full" disabled={loading || !paymentReference}>
                📊 Get Payment Status
              </Button>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Response:</h3>
              <pre className="bg-white p-4 rounded border overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
              {result.paymentUrl && (
                <div className="mt-4">
                  <a
                    href={result.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    🔗 Open Payment URL
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

