import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [escrows, setEscrows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      const token = localStorage.getItem('token');
      // In production, this would fetch from API
      // const response = await axios.get(`${API_URL}/api/business/escrow`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setEscrows(response.data);
    } catch (error) {
      console.error('Failed to fetch escrows:', error);
    }
  };

  return (
    <div className="dashboard">
      <header>
        <h1>My Escrows</h1>
        <button onClick={() => navigate('/escrow/new')}>Create Escrow</button>
      </header>
      <div className="escrows-list">
        {escrows.length === 0 ? (
          <p>No escrows yet. Create your first one!</p>
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

