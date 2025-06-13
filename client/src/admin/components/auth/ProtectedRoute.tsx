import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  children?: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  adminOnly = false, 
  children,
  requireAuth = true
}) => {
  const { user, isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname + location.search;

  // Effet pour gérer les redirections après connexion
  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié mais qu'une authentification est requise
    if (!loading && !isAuthenticated && requireAuth) {
      // Stocker l'URL actuelle pour rediriger après la connexion
      if (currentPath !== '/admin/login') {
        localStorage.setItem('redirectAfterLogin', currentPath);
      }
    }
  }, [isAuthenticated, loading, currentPath, requireAuth]);

  // Afficher un loader pendant le chargement initial
  if (loading || !initialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Chargement de l'application...
        </Typography>
      </Box>
    );
  }

  // Si l'authentification est requise mais que l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est connecté mais tente d'accéder à la page de connexion
  if (isAuthenticated && location.pathname === '/admin/login') {
    const redirectTo = localStorage.getItem('redirectAfterLogin') || '/admin';
    localStorage.removeItem('redirectAfterLogin');
    return <Navigate to={redirectTo} replace />;
  }

  // Vérifier si l'utilisateur a le rôle admin si requis
  if (isAuthenticated && adminOnly && user?.role !== 'admin') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" color="error">
          Accès non autorisé
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Typography>
      </Box>
    );
  }

  // Afficher les enfants ou le composant Outlet pour les routes imbriquées
  return children ? <>{children}</> : <Outlet />;
};
