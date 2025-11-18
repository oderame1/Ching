'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { EscrowStatusStepper } from '@/components/EscrowStatusStepper';
import { Button } from '@/components/ui/button';
import { PaymentButton } from '@/components/PaymentButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EscrowDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEscrow();
  }, [id]);

  const fetchEscrow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/escrow/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEscrow(response.data.escrow);
    } catch (error) {
      console.error('Failed to fetch escrow:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!escrow) return <div>Escrow not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Escrow Details</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <EscrowStatusStepper currentState={escrow.state} />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-2xl font-bold">{escrow.currency} {Number(escrow.amount).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p>{escrow.description}</p>
          </div>
        </div>

        {escrow.state === 'waiting_for_payment' && <PaymentButton escrowId={escrow.id} />}
      </div>
    </div>
  );
}

