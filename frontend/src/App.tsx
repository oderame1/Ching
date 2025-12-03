import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import AuthPage from './pages/Auth';
import CreateEscrowPage from './pages/CreateEscrow';
import EscrowDetailPage from './pages/EscrowDetail';
import TestHubPage from './pages/TestHub';
import TestOTPPage from './pages/TestOTP';
import TestEscrowPage from './pages/TestEscrow';
import TestPaymentsPage from './pages/TestPayments';
import TestPayoutsPage from './pages/TestPayouts';
import TestUsersPage from './pages/TestUsers';
import TestNotificationsPage from './pages/TestNotifications';
import TestSuitePage from './pages/TestSuite';
import AdminPage from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/create" element={<CreateEscrowPage />} />
        <Route path="/escrow/:id" element={<EscrowDetailPage />} />
        <Route path="/test-hub" element={<TestHubPage />} />
        <Route path="/test-otp" element={<TestOTPPage />} />
        <Route path="/test-escrow" element={<TestEscrowPage />} />
        <Route path="/test-payments" element={<TestPaymentsPage />} />
        <Route path="/test-payouts" element={<TestPayoutsPage />} />
        <Route path="/test-users" element={<TestUsersPage />} />
        <Route path="/test-notifications" element={<TestNotificationsPage />} />
        <Route path="/test-suite" element={<TestSuitePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


