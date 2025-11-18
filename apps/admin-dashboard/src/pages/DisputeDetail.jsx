import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function DisputeDetail() {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [resolution, setResolution] = useState('favor_buyer');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchDispute();
  }, [id]);

  const fetchDispute = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/business/disputes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDispute(response.data);
    } catch (error) {
      console.error('Failed to fetch dispute:', error);
    }
  };

  const handleResolve = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/business/disputes/${id}/resolve`,
        {
          resolution,
          admin_notes: notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchDispute();
    } catch (error) {
      alert('Failed to resolve dispute: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!dispute) return <div>Loading...</div>;

  return (
    <div className="dispute-detail">
      <h1>Dispute Details</h1>
      <div className="dispute-info">
        <p>ID: {dispute.id}</p>
        <p>Status: {dispute.status}</p>
        <p>Reason: {dispute.reason}</p>
        <p>Description: {dispute.description}</p>
      </div>
      {dispute.status === 'open' && (
        <div className="resolve-form">
          <h2>Resolve Dispute</h2>
          <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
            <option value="favor_buyer">Favor Buyer</option>
            <option value="favor_seller">Favor Seller</option>
            <option value="partial_buyer">Partial Buyer</option>
            <option value="partial_seller">Partial Seller</option>
            <option value="refund">Refund</option>
          </select>
          <textarea
            placeholder="Admin Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
          <button onClick={handleResolve}>Resolve Dispute</button>
        </div>
      )}
    </div>
  );
}

