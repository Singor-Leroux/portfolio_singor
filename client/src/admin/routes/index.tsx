import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PageLoading } from '../components/common/PageLoading';

// Chargement paresseux des composants avec gestion d'erreur
const lazyLoad = (importFn: () => Promise<{ default: React.ComponentType }>) => {
  return lazy(async () => {
    try {
      const module = await importFn();
      return { default: module.default };
    } catch (error) {
      console.error('Erreur de chargement du composant:', error);
      throw error;
    }
  });
};

// Composants chargés de manière paresseuse
const DashboardPage = lazyLoad(() => import('../pages/DashboardPage'));
const LoginPage = lazyLoad(() => import('../pages/LoginPage'));
const RegisterPage = lazyLoad(() => import('../pages/RegisterPage'));
const AdminLayout = lazyLoad(() => import('../components/layout/AdminLayout'));
const ProtectedRoute = lazyLoad(() => import('../components/auth/ProtectedRoute'));
const SkillsPage = lazyLoad(() => import('../pages/SkillsPage'));
const ExperiencesPage = lazyLoad(() => import('../pages/ExperiencesPage'));
const EducationPage = lazyLoad(() => import('../pages/EducationPage'));
const CertificationsPage = lazyLoad(() => import('../pages/CertificationsPage'));
const ProjectsPage = lazyLoad(() => import('../pages/ProjectsPage'));
const UsersPage = lazyLoad(() => import('../pages/UsersPage'));

// 404 page
const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>404 - Page non trouvée</h2>
    <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
  </div>
);

// Composant Suspense personnalisé
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoading />}>
    {children}
  </Suspense>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route 
        path="login" 
        element={
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        } 
      />
      <Route 
        path="register" 
        element={
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        } 
      />
      
      {/* Redirect root to dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />
      
      {/* Protected routes */}
      <Route 
        element={
          <SuspenseWrapper>
            <ProtectedRoute />
          </SuspenseWrapper>
        }
      >
        <Route 
          path="dashboard" 
          element={
            <SuspenseWrapper>
              <AdminLayout />
            </SuspenseWrapper>
          }
        >
          <Route 
            index 
            element={
              <SuspenseWrapper>
                <DashboardPage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="skills" 
            element={
              <SuspenseWrapper>
                <SkillsPage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="experiences" 
            element={
              <SuspenseWrapper>
                <ExperiencesPage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="education" 
            element={
              <SuspenseWrapper>
                <EducationPage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="certifications" 
            element={
              <SuspenseWrapper>
                <CertificationsPage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="projects" 
            element={
              <SuspenseWrapper>
                <ProjectsPage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="users" 
            element={
              <SuspenseWrapper>
                <UsersPage />
              </SuspenseWrapper>
            } 
          />
        </Route>
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
