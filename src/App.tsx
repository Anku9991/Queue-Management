import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientLanding from './pages/PatientLanding';
import PatientTracker from './pages/PatientTracker';
import StaffDashboard from './pages/StaffDashboard';
import TVDisplay from './pages/TVDisplay';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import QRPoster from './pages/QRPoster';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register/:hospitalId" element={<PatientLanding />} />
          <Route path="/tracker/:hospitalId/:tokenId" element={<PatientTracker />} />
          <Route path="/tv/:hospitalId" element={<TVDisplay />} />
          <Route path="/poster/:hospitalId" element={<QRPoster />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected/Staff Routes */}
          <Route element={<Layout />}>
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
