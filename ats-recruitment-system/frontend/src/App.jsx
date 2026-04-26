// Top-level app wiring for routes, auth, and shared layout.
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
import JobDetailsPage from "./pages/JobDetailsPage";
import JobPipelinePage from "./pages/JobPipelinePage";
import CandidateCreatePage from "./pages/CandidateCreatePage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import UsersPage from "./pages/UsersPage";
import OptionsPage from "./pages/OptionsPage";
import ProfilePage from "./pages/ProfilePage";

// Keep protected app focused and easier to understand from the code nearby.
const ProtectedApp = ({ auth }) => {
  return (
    <Layout user={auth.user} onLogout={auth.logout}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage currentUser={auth.user} />} />
        <Route path="/jobs/new" element={<JobCreatePage currentUser={auth.user} />} />
        <Route path="/jobs/:id/edit" element={<JobCreatePage currentUser={auth.user} />} />
        <Route path="/jobs/:id/pipeline" element={<JobPipelinePage currentUser={auth.user} />} />
        <Route path="/jobs/:id" element={<JobDetailsPage currentUser={auth.user} />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/new" element={<CandidateCreatePage />} />
        <Route path="/candidates/:id" element={<CandidateProfilePage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage currentUser={auth.user} />} />
        <Route path="/settings/profile" element={<ProfilePage currentUser={auth.user} onUserUpdate={auth.updateUser} />} />
        <Route path="/settings/users" element={<UsersPage currentUser={auth.user} />} />
        <Route path="/settings/options" element={<OptionsPage currentUser={auth.user} />} />
        <Route path="/users" element={<Navigate to="/settings/users" replace />} />
        <Route path="/options" element={<Navigate to="/settings/options" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

// Keep app focused and easier to understand from the code nearby.
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
