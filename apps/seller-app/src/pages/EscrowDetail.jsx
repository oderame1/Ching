import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function EscrowDetail() {
  const { id } = useParams();
  const [escrow, setEscrow] = useState(null);

  useEffect(() => {
    fetchEscrow();
  }, [id]);

  const fetchEscrow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/business/escrow/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEscrow(response.data);
    } catch (error) {
      console.error('Failed to fetch escrow:', error);
    }
  };

  if (!escrow) return <div>Loading...</div>;

  return (
    <div className="escrow-detail">
      <h1>Escrow Details</h1>
      <div className="escrow-info">
        <p>ID: {escrow.id}</p>
        <p>Amount: ${escrow.amount}</p>
        <p>Status: {escrow.status}</p>
        <p>Description: {escrow.description}</p>
      </div>
    </div>
  );
}

