import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function SellerDashboard() {
  const [escrows, setEscrows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      const token = localStorage.getItem('token');
      // In production, fetch from API
    } catch (error) {
      console.error('Failed to fetch escrows:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Seller Dashboard</h1>
      <div className="escrows-list">
        {escrows.length === 0 ? (
          <p>No escrows yet.</p>
        ) : (
          escrows.map((escrow) => (
            <div key={escrow.id} className="escrow-card" onClick={() => navigate(`/escrow/${escrow.id}`)}>
              <h3>Escrow #{escrow.id.slice(0, 8)}</h3>
              <p>Amount: ${escrow.amount}</p>
              <p>Status: {escrow.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

