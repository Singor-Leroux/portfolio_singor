import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Box, Typography, Link, CircularProgress, Paper } from '@mui/material';
import { Email, Phone, LocationOn, GitHub, LinkedIn, Twitter } from '@mui/icons-material';
import { FormattedUserProfile } from '../types/user';

const UserProfileDisplay: React.FC = () => {
  const { userData, loading, error } = useUser() as { 
    userData: FormattedUserProfile; 
    loading: boolean; 
    error: Error | null 
  };

  if (loading || !userData) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Le nom complet est déjà formaté dans userData.name
  const displayName = userData.name || 'Utilisateur';

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">
          Erreur lors du chargement du profil: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {displayName}
      </Typography>
      <Typography variant="h6" color="primary" gutterBottom>
        {userData.title}
      </Typography>
      
      <Box my={2}>
        <Typography variant="body1" paragraph>
          {userData.about}
        </Typography>
      </Box>

      <Box mt={3}>
        <Box display="flex" alignItems="center" mb={1}>
          <Email color="action" sx={{ mr: 1 }} />
          <Link href={`mailto:${userData.email}`} color="inherit">
            {userData.email}
          </Link>
        </Box>
        
        {userData.phone && (
          <Box display="flex" alignItems="center" mb={1}>
            <Phone color="action" sx={{ mr: 1 }} />
            <Link href={`tel:${userData.phone}`}>
              {userData.phone}
            </Link>
          </Box>
        )}
        
        {userData.address && (
          <Box display="flex" alignItems="center" mb={2}>
            <LocationOn color="action" sx={{ mr: 1 }} />
            <Typography>{userData.address}</Typography>
          </Box>
        )}

        <Box display="flex" mt={2}>
          {userData.socialLinks?.github && (
            <Link 
              href={userData.socialLinks.github} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ mr: 2 }}
            >
              <GitHub />
            </Link>
          )}
          
          {userData.socialLinks?.linkedin && (
            <Link 
              href={userData.socialLinks.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ mr: 2 }}
            >
              <LinkedIn />
            </Link>
          )}
          
          {userData.socialLinks?.twitter && (
            <Link 
              href={userData.socialLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Twitter />
            </Link>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default UserProfileDisplay;
