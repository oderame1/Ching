import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem('token');
      // In production, fetch from API
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    }
  };

  return (
    <div className="disputes">
      <h1>Disputes</h1>
      <div className="disputes-list">
        {disputes.length === 0 ? (
          <p>No disputes</p>
        ) : (
          disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="dispute-card"
              onClick={() => navigate(`/disputes/${dispute.id}`)}
            >
              <h3>Dispute #{dispute.id.slice(0, 8)}</h3>
              <p>Status: {dispute.status}</p>
              <p>Reason: {dispute.reason}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

