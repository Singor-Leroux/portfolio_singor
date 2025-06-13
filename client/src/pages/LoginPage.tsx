import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Link,
  useTheme,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { motion } from 'framer-motion';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      // Récupérer l'URL de redirection depuis l'URL actuelle
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect') || '/admin';
      
      // Rediriger vers la page demandée ou le tableau de bord par défaut
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
      console.error('Erreur de connexion:', err);
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Effet pour gérer le mode sombre
  useEffect(() => {
    document.body.style.backgroundColor = isDark ? '#121212' : '#f5f5f5';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [isDark]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg,rgb(54, 54, 118) 0%,rgb(46, 65, 117) 100%)',
        p: 3,
      }}
    >
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 4,
              background: isDark ? 'rgba(30, 30, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <Avatar
                sx={{
                  m: 1,
                  bgcolor: 'primary.main',
                  width: 60,
                  height: 60,
                  mb: 2,
                }}
              >
                <LockOutlinedIcon fontSize="large" />
              </Avatar>
            </motion.div>
            
            <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: isDark ? '#fff' : 'text.primary' }}>
              Connexion
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Accédez à votre espace d'administration
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Adresse email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      value="remember"
                      color="primary"
                      sx={{
                        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color={isDark ? 'text.secondary' : 'text.primary'}>
                      Se souvenir de moi
                    </Typography>
                  }
                />
                <Link href="#" variant="body2" color="primary" underline="hover">
                  Mot de passe oublié ?
                </Link>
              </Box>


              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography
                    color="error"
                    variant="body2"
                    sx={{
                      mt: 1,
                      mb: 2,
                      p: 1.5,
                      backgroundColor: 'error.light',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <span>⚠️</span> {error}
                  </Typography>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #303f9f 30%, #3949ab 90%)',
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <span className="mr-2">Connexion en cours</span>
                      <span className="animate-pulse">...</span>
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </motion.div>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Ou connectez-vous avec
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<i className="fab fa-google"></i>}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                      color: isDark ? '#fff' : 'inherit',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: isDark ? 'rgba(63, 81, 181, 0.1)' : 'rgba(63, 81, 181, 0.04)',
                      },
                    }}
                  >
                    Google
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<i className="fab fa-github"></i>}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                      color: isDark ? '#fff' : 'inherit',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: isDark ? 'rgba(63, 81, 181, 0.1)' : 'rgba(63, 81, 181, 0.04)',
                      },
                    }}
                  >
                    GitHub
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>

          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Mon Portfolio. Tous droits réservés.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
