import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { requireBuyer } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function CreateEscrow() {
  const [sellerId, setSellerId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!requireBuyer(navigate)) {
      return;
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/business/escrow`,
        {
          seller_id: sellerId,
          amount: parseFloat(amount),
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate(`/escrow/${response.data.id}`);
    } catch (error) {
      alert('Failed to create escrow: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="create-escrow">
      <h1>Create Escrow</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Seller ID"
          value={sellerId}
          onChange={(e) => setSellerId(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Create Escrow</button>
      </form>
    </div>
  );
}

