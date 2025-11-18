import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getStoredUser } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function SellerDashboard() {
  const [escrows, setEscrows] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser || currentUser.role !== 'seller') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchEscrows();
  }, [navigate]);

  const fetchEscrows = async () => {
    try {
      const token = localStorage.getItem('token');
      // In production, fetch from API
    } catch (error) {
      console.error('Failed to fetch escrows:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Seller Dashboard - {user.name}</h1>
        <div>
          <span>Welcome, {user.email}</span>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}>Logout</button>
        </div>
      </header>
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

