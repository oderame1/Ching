import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SellerDashboard from './pages/SellerDashboard';
import EscrowDetail from './pages/EscrowDetail';
import { requireSeller } from './utils/auth';
import './App.css';

function ProtectedRoute({ children }) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  if (user.role !== 'seller') {
    alert('Access denied. This app is for sellers only.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <SellerDashboard />
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

