import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getStoredUser } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchLogs();
  }, [navigate]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/audit/audit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  return (
    <div className="audit-logs">
      <h1>Audit Logs</h1>
      <div className="logs-list">
        {logs.length === 0 ? (
          <p>No audit logs</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="log-card">
              <p><strong>Action:</strong> {log.action}</p>
              <p><strong>Entity:</strong> {log.entity_type} - {log.entity_id}</p>
              <p><strong>User:</strong> {log.user_id}</p>
              <p><strong>Time:</strong> {new Date(log.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

