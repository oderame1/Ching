import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEscrows: 0,
    activeEscrows: 0,
    totalDisputes: 0,
    openDisputes: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // In production, fetch from API
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <nav>
          <button onClick={() => navigate('/disputes')}>Disputes</button>
          <button onClick={() => navigate('/audit')}>Audit Logs</button>
        </nav>
      </header>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Escrows</h3>
          <p>{stats.totalEscrows}</p>
        </div>
        <div className="stat-card">
          <h3>Active Escrows</h3>
          <p>{stats.activeEscrows}</p>
        </div>
        <div className="stat-card">
          <h3>Total Disputes</h3>
          <p>{stats.totalDisputes}</p>
        </div>
        <div className="stat-card">
          <h3>Open Disputes</h3>
          <p>{stats.openDisputes}</p>
        </div>
      </div>
    </div>
  );
}

