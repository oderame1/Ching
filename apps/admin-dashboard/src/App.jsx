import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import Disputes from './pages/Disputes';
import DisputeDetail from './pages/DisputeDetail';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';
import { requireAdmin } from './utils/auth';
import './App.css';

function ProtectedRoute({ children }) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  if (user.role !== 'admin') {
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
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/disputes" element={
          <ProtectedRoute>
            <Disputes />
          </ProtectedRoute>
        } />
        <Route path="/disputes/:id" element={
          <ProtectedRoute>
            <DisputeDetail />
          </ProtectedRoute>
        } />
        <Route path="/audit" element={
          <ProtectedRoute>
            <AuditLogs />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

