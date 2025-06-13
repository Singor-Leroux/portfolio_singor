import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 3,
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 4,
              background: isDark ? 'rgba(30, 30, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
                fontWeight: 'bold',
                background: isDark
                  ? 'linear-gradient(45deg, #ff6b6b, #feca57)'
                  : 'linear-gradient(45deg, #3a7bd5, #00d2ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              404
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mb: 2,
                color: isDark ? 'text.primary' : 'text.primary',
              }}
            >
              Oups ! Page non trouvée
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: isDark ? 'text.secondary' : 'text.secondary',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
              Revenez à la page d'accueil ou contactez-nous si vous pensez qu'il s'agit d'une erreur.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                background: isDark
                  ? 'linear-gradient(45deg, #4361ee, #3a0ca3)'
                  : 'linear-gradient(45deg, #4361ee, #3a0ca3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Retour à l'accueil
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
