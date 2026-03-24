import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { LanguageProvider } from "./i18n.jsx";
import { NotificationProvider } from "./notifications.jsx";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import CandidatesPage from "./pages/CandidatesPage";
import PipelinePage from "./pages/PipelinePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import JobCreatePage from "./pages/JobCreatePage";
import JobPipelinePage from "./pages/JobPipelinePage";
import CandidateCreatePage from "./pages/CandidateCreatePage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import UsersPage from "./pages/UsersPage";

const ProtectedApp = ({ auth }) => {
  return (
    <Layout user={auth.user} onLogout={auth.logout}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage currentUser={auth.user} />} />
        <Route path="/jobs/new" element={<JobCreatePage currentUser={auth.user} />} />
        <Route path="/jobs/:id" element={<JobPipelinePage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/new" element={<CandidateCreatePage />} />
        <Route path="/candidates/:id" element={<CandidateProfilePage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage currentUser={auth.user} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  const auth = useAuth();

  return (
    <LanguageProvider>
      <NotificationProvider>
        {auth.isAuthenticated ? <ProtectedApp auth={auth} /> : <LoginPage onLogin={auth.login} />}
      </NotificationProvider>
    </LanguageProvider>
  );
};

export default App;
