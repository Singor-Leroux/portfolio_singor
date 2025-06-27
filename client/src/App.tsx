import { useEffect, ReactNode, Suspense } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Button 
} from '@mui/material';
import Header from './components/layout/Header';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Skills from './components/sections/Skills';
import Projects from './components/sections/Projects';
import Certifications from './components/sections/Certifications';
import Experience from './components/sections/Experience';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';
import LoginPage from './admin/pages/LoginPage';
import RegisterPage from './admin/pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { personalInfo } from './data';
import AdminApp from './admin/AdminApp';

// Composant de chargement global
const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);



// Composant pour les routes protégées
interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // Afficher un spinner pendant le chargement
  if (!initialized || loading) {
    return <LoadingSpinner />;
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Vérifier si l'utilisateur est admin si la route l'exige
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};





// Composant pour la mise en page publique
const PublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);

// Composant pour la page d'accueil
const HomePage = () => (
  <PublicLayout>
    <Hero />
    <About />
    <Skills />
    <Projects />
    <Certifications />
    <Experience />
    <Contact />
  </PublicLayout>
);

// Composant pour les erreurs d'autorisation
const UnauthorizedPage = () => {
  const navigate = useNavigate();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Accès non autorisé
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/')}
        sx={{ mt: 2 }}
      >
        Retour à l'accueil
      </Button>
    </Box>
  );
};

// Composant principal de l'application
const AppContent = () => {
  useEffect(() => {
    document.title = `${personalInfo.name} | ${personalInfo.title}`;
  }, []);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Routes d'administration */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly>
              <AdminApp />
            </ProtectedRoute>
          }
        />

        {/* Redirections */}
        <Route path="/administration" element={<Navigate to="/admin" replace />} />
        
        {/* Route 404 - Doit être la dernière */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  const theme = createTheme({
    spacing: 4,
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      },
    },
  });

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <UserProvider>
            <AppContent />
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;