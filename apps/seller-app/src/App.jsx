import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SellerDashboard from './pages/SellerDashboard';
import EscrowDetail from './pages/EscrowDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SellerDashboard />} />
        <Route path="/escrow/:id" element={<EscrowDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

