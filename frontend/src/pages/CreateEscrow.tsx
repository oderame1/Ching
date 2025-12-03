import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreateEscrowForm } from '@/components/CreateEscrowForm';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CreateEscrowPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/escrow/initiate`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/escrow/${response.data.escrow.id}`);
    } catch (error: any) {
      alert('Failed to create escrow: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create Escrow</h1>
      <CreateEscrowForm onSubmit={handleSubmit} />
    </div>
  );
}


