import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import SkillsPage from '../pages/SkillsPage';
import ExperiencesPage from '../pages/ExperiencesPage';
import EducationPage from '../pages/EducationPage';
import CertificationsPage from '../pages/CertificationsPage';
import ProjectsPage from '../pages/ProjectsPage';
import UsersPage from '../pages/UsersPage';

// 404 page
const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>404 - Page non trouvée</h2>
    <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      
      {/* Redirect root to dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="experiences" element={<ExperiencesPage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="certifications" element={<CertificationsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
