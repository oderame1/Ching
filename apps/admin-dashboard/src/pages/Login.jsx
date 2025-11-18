import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in as admin
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      
      // Store token and user info
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Check if user is an admin
      if (response.data.user.role !== 'admin') {
        alert(`Access denied. This app is for administrators only. Your role is: ${response.data.user.role}`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      
      navigate('/');
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="login-container">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        Test: admin@test.escrow / admin123
      </p>
    </div>
  );
}

