import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import CandidatesPage from "./pages/CandidatesPage";
import PipelinePage from "./pages/PipelinePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

const ProtectedApp = ({ auth }) => {
  return (
    <Layout user={auth.user} onLogout={auth.logout}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <LoginPage onLogin={auth.login} />;
  }

  return <ProtectedApp auth={auth} />;
};

export default App;
