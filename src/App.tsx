import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useQueueStore } from './store/useQueueStore';
import PatientLanding from './pages/PatientLanding';
import PatientTracker from './pages/PatientTracker';
import StaffDashboard from './pages/StaffDashboard';
import TVDisplay from './pages/TVDisplay';
import AdminDashboard from './pages/AdminDashboard';
import QRPoster from './pages/QRPoster';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import DemoNavigation from './components/DemoNavigation';

function App() {
  const initListeners = useQueueStore(state => state.initListeners);

  useEffect(() => {
    initListeners();
  }, [initListeners]);

  return (
    <Router>
      <Routes>
        {/* Public Patient Routes */}
        <Route path="/" element={<PatientLanding />} />
        <Route path="/tracker/:id" element={<PatientTracker />} />
        <Route path="/tv" element={<TVDisplay />} />
        <Route path="/poster" element={<QRPoster />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected/Staff Routes */}
        <Route element={<Layout />}>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DemoNavigation />
    </Router>
  );
}

export default App;
