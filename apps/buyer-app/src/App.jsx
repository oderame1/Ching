import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateEscrow from './pages/CreateEscrow';
import EscrowDetail from './pages/EscrowDetail';
import { requireBuyer } from './utils/auth';
import './App.css';

function ProtectedRoute({ children }) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/" replace />;
  }
  
  const user = JSON.parse(userStr);
  if (user.role !== 'buyer') {
    alert('Access denied. This app is for buyers only.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/escrow/new" element={
          <ProtectedRoute>
            <CreateEscrow />
          </ProtectedRoute>
        } />
        <Route path="/escrow/:id" element={
          <ProtectedRoute>
            <EscrowDetail />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

