import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateEscrow from './pages/CreateEscrow';
import EscrowDetail from './pages/EscrowDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/escrow/new" element={<CreateEscrow />} />
        <Route path="/escrow/:id" element={<EscrowDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

