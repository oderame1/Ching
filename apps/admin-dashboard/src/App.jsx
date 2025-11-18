import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import Disputes from './pages/Disputes';
import DisputeDetail from './pages/DisputeDetail';
import AuditLogs from './pages/AuditLogs';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/disputes/:id" element={<DisputeDetail />} />
        <Route path="/audit" element={<AuditLogs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

