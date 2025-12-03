import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { handleApiError } from '@/lib/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function TestEscrowPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  
  // Form states
  const [counterpartyId, setCounterpartyId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [description, setDescription] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [escrowId, setEscrowId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
  });

  const handleInitiateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);

    if (!getAuthToken()) {
      setError('❌ Please login first using the Authentication test page');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/escrow/initiate`,
        {
          counterpartyId,
          amount: parseFloat(amount),
          currency,
          description,
          expiresInDays: parseInt(expiresInDays),
        },
        { headers: getHeaders() }
      );

      setResult(response.data);
      setSuccess('✅ Escrow created successfully!');
      setEscrowId(response.data.escrow?.id || '');
    } catch (error: any) {
      console.error('Initiate escrow error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to create escrow')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetEscrow = async () => {
    if (!escrowId) {
      setError('❌ Please enter an Escrow ID');
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
        `${API_URL}/api/escrow/${escrowId}`,
        { headers: getHeaders() }
      );

      setResult(response.data);
      setSuccess('✅ Escrow retrieved successfully!');
    } catch (error: any) {
      console.error('Get escrow error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to get escrow')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEscrow = async () => {
    if (!escrowId) {
      setError('❌ Please enter an Escrow ID');
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
      const response = await axios.post(
        `${API_URL}/api/escrow/${escrowId}/cancel`,
        { reason: cancelReason || undefined },
        { headers: getHeaders() }
      );

      setResult(response.data);
      setSuccess('✅ Escrow cancelled successfully!');
    } catch (error: any) {
      console.error('Cancel escrow error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to cancel escrow')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!escrowId) {
      setError('❌ Please enter an Escrow ID');
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
      const response = await axios.post(
        `${API_URL}/api/escrow/${escrowId}/delivered`,
        {},
        { headers: getHeaders() }
      );

      setResult(response.data);
      setSuccess('✅ Escrow marked as delivered!');
    } catch (error: any) {
      console.error('Mark delivered error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to mark delivered')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReceived = async () => {
    if (!escrowId) {
      setError('❌ Please enter an Escrow ID');
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
      const response = await axios.post(
        `${API_URL}/api/escrow/${escrowId}/received`,
        {},
        { headers: getHeaders() }
      );

      setResult(response.data);
      setSuccess('✅ Escrow marked as received!');
    } catch (error: any) {
      console.error('Mark received error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to mark received')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                💼 Escrow Management Test
              </h1>
              <p className="text-gray-600">
                Test escrow creation, tracking, and status updates
              </p>
            </div>
            <Link to="/test-hub">
              <Button variant="outline">← Back to Hub</Button>
            </Link>
          </div>

          {/* Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">📋 Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
              <li>Make sure you're logged in (use Authentication test page first)</li>
              <li>Create an escrow by filling the form below</li>
              <li>Use the Escrow ID to track, cancel, or update status</li>
              <li>Only buyer can mark received, only seller can mark delivered</li>
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

          {/* Create Escrow Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Escrow</h2>
            <form onSubmit={handleInitiateEscrow} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="counterpartyId">Counterparty ID (UUID)</Label>
                  <Input
                    id="counterpartyId"
                    value={counterpartyId}
                    onChange={(e) => setCounterpartyId(e.target.value)}
                    placeholder="User UUID to transact with"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000.00"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={loading}
                  >
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="expiresInDays">Expires In (Days)</Label>
                  <Input
                    id="expiresInDays"
                    type="number"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    placeholder="7"
                    min="1"
                    max="30"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product/service description"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '⏳ Creating...' : '✨ Create Escrow'}
              </Button>
            </form>
          </div>

          {/* Escrow Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Escrow Actions</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="escrowId">Escrow ID</Label>
                  <Input
                    id="escrowId"
                    value={escrowId}
                    onChange={(e) => setEscrowId(e.target.value)}
                    placeholder="Enter escrow UUID"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleGetEscrow} className="w-full" disabled={loading || !escrowId}>
                    📋 Get Escrow Details
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cancelReason">Cancel Reason (Optional)</Label>
                  <Input
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCancelEscrow} variant="destructive" className="w-full" disabled={loading || !escrowId}>
                    ❌ Cancel Escrow
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleMarkDelivered} className="w-full" disabled={loading || !escrowId}>
                  📦 Mark as Delivered (Seller)
                </Button>
                <Button onClick={handleMarkReceived} className="w-full" disabled={loading || !escrowId}>
                  ✅ Mark as Received (Buyer)
                </Button>
              </div>
            </div>
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
        </div>
      </div>
    </div>
  );
}

