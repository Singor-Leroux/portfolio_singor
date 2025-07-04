import { Box, Container, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid'; // Import explicite du composant Grid
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor: (theme) =>
        theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
    }}
  >
    <Icon sx={{ fontSize: 40, color, mb: 1 }} />
    <Typography component="h2" variant="h6" color="text.primary" gutterBottom>
      {title}
    </Typography>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

const DashboardPage = () => {
  // Ces données viendront de votre API dans une vraie application
  const stats = [
    { title: 'Utilisateurs', value: '1,234', icon: PeopleIcon, color: '#1976d2' },
    { title: 'Visites', value: '8,567', icon: AssessmentIcon, color: '#2e7d32' },
    { title: 'Notifications', value: '12', icon: NotificationsIcon, color: '#ed6c02' },
    { title: 'Sécurité', value: '100%', icon: SecurityIcon, color: '#9c27b0' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tableau de bord
      </Typography>
      
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid key={index} item xs={12} sm={6} md={3} component="div">
              <StatCard {...stat} />
            </Grid>
          ))}
          
          <Grid item xs={12} component="div">
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Vue d'ensemble
              </Typography>
              <Box sx={{ height: 300 }}>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 10 }}>
                  Graphiques et statistiques à venir...
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8} component="div">
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Activité récente
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4} component="div">
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Notifications
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} component="div">
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Projets récents
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Aucun projet récent
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;
