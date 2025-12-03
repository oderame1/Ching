import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleApiError } from '@/lib/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
  });

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);

    if (!getAuthToken()) {
      setError('❌ Please login first using the Authentication test page');
      return;
    }

    if (!recipient || !message) {
      setError('❌ Recipient and message are required');
      return;
    }

    try {
      setLoading(true);
      const endpoint = channel === 'whatsapp' ? '/whatsapp' : '/email';
      const payload: any = {
        recipient,
        message,
      };
      
      if (channel === 'email' && subject) {
        payload.subject = subject;
      }

      const response = await axios.post(
        `${API_URL}/api/notifications${endpoint}`,
        payload,
        { headers: getHeaders() }
      );

      setResult(response.data);
      setSuccess(`✅ ${channel === 'whatsapp' ? 'WhatsApp' : 'Email'} notification queued successfully!`);
    } catch (error: any) {
      console.error('Send notification error:', error);
      setError(`❌ ${handleApiError(error, 'Failed to send notification')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📧 Notifications Test
              </h1>
              <p className="text-gray-600">
                Send and test notifications via WhatsApp or Email
              </p>
            </div>
            <Link to="/test-hub">
              <Button variant="outline">← Back to Hub</Button>
            </Link>
          </div>

          {/* Instructions */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-indigo-900 mb-2">📋 Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-indigo-800">
              <li>Make sure you're logged in</li>
              <li>Select notification channel (WhatsApp or Email)</li>
              <li>Enter recipient (phone number for WhatsApp, email for Email)</li>
              <li>Enter your message</li>
              <li>For email, optionally add a subject</li>
              <li>Click "Send Notification" to queue the notification</li>
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

          {/* Send Notification Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Notification</h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <Label htmlFor="channel">Notification Channel</Label>
                <select
                  id="channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as 'whatsapp' | 'email')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={loading}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <Label htmlFor="recipient">
                  Recipient {channel === 'whatsapp' ? '(Phone Number)' : '(Email Address)'}
                </Label>
                <Input
                  id="recipient"
                  type={channel === 'whatsapp' ? 'tel' : 'email'}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={channel === 'whatsapp' ? '+2348012345678' : 'recipient@example.com'}
                  required
                  disabled={loading}
                />
              </div>

              {channel === 'email' && (
                <div>
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  required
                  disabled={loading}
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !recipient || !message}>
                {loading ? '⏳ Sending...' : `📤 Send ${channel === 'whatsapp' ? 'WhatsApp' : 'Email'} Notification`}
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
              <strong>ℹ️ Note:</strong> Notifications are queued for processing. In development mode, 
              the notification service may log the message to the console rather than actually sending it. 
              Make sure the notification service is properly configured with API keys for production use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

