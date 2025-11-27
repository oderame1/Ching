'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleApiError } from '@/lib/errorHandler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TestUsersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  
  // Update form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
  });

  const handleGetCurrentUser = async () => {
    setError(null);
    setSuccess(null);

    if (!getAuthToken()) {
      setError('❌ Please login first using the Authentication test page');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/users/me`,
        { headers: getHeaders() }
      );

      setUserData(response.data.user);
      setName(response.data.user.name || '');
      setEmail(response.data.user.email || '');
      setPhone(response.data.user.phone || '');
      setSuccess('✅ User data retrieved successfully!');
    } catch (error: any) {
      console.error('Get user error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to get user data')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!getAuthToken()) {
      setError('❌ Please login first');
      return;
    }

    try {
      setLoading(true);
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;

      if (Object.keys(updateData).length === 0) {
        setError('❌ Please fill at least one field to update');
        return;
      }

      const response = await axios.patch(
        `${API_URL}/api/users/me`,
        updateData,
        { headers: getHeaders() }
      );

      setUserData(response.data.user);
      setSuccess('✅ User updated successfully!');
    } catch (error: any) {
      console.error('Update user error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to update user')}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load user data on mount if token exists
  useEffect(() => {
    if (getAuthToken()) {
      handleGetCurrentUser();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                👤 User Management Test
              </h1>
              <p className="text-gray-600">
                View and update your user profile
              </p>
            </div>
            <Link href="/test-hub">
              <Button variant="outline">← Back to Hub</Button>
            </Link>
          </div>

          {/* Instructions */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-pink-900 mb-2">📋 Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-pink-800">
              <li>Make sure you're logged in (use Authentication test page first)</li>
              <li>Click "Get Current User" to load your profile</li>
              <li>Update any fields you want to change</li>
              <li>Click "Update Profile" to save changes</li>
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

          {/* Get User Data */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current User Data</h2>
            <Button onClick={handleGetCurrentUser} className="w-full mb-4" disabled={loading}>
              {loading ? '⏳ Loading...' : '📋 Get Current User'}
            </Button>

            {userData && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>ID:</strong> {userData.id}</p>
                  <p><strong>Name:</strong> {userData.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {userData.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {userData.phone || 'N/A'}</p>
                  <p><strong>Role:</strong> {userData.role || 'N/A'}</p>
                  <p><strong>Verified:</strong> {userData.isVerified ? 'Yes' : 'No'}</p>
                  <p><strong>Created:</strong> {userData.createdAt ? new Date(userData.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Update User Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Profile</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+2348012345678"
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '⏳ Updating...' : '💾 Update Profile'}
              </Button>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Note:</strong> All fields are optional. Only fill in the fields you want to update. 
              Email and phone must be unique - if they're already in use by another user, the update will fail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

