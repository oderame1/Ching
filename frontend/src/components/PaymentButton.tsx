'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PaymentButtonProps {
  escrowId: string;
}

export function PaymentButton({ escrowId }: PaymentButtonProps) {
  const [gateway, setGateway] = useState<'paystack' | 'flutterwave'>('paystack');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/payments/initialize`,
        {
          escrowId,
          gateway,
          callbackUrl: `${window.location.origin}/escrow/${escrowId}`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Redirect to payment URL
      window.location.href = response.data.paymentUrl;
    } catch (error: any) {
      alert('Failed to initialize payment: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select value={gateway} onValueChange={(value: any) => setGateway(value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paystack">Paystack</SelectItem>
          <SelectItem value="flutterwave">Flutterwave</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handlePayment} disabled={loading} className="w-full">
        {loading ? 'Processing...' : 'Pay Now'}
      </Button>
    </div>
  );
}

