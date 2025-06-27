import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Avatar,
  InputAdornment,
  Link as MuiLink,
  CircularProgress,
  Collapse
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Composants de mise en page personnalisés
const FormRow = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, width: '100%' }}>
    {children}
  </Box>
);

const FormColumn = ({ children, width = 1 }: { children: React.ReactNode, width?: number }) => (
  <Box sx={{ 
    flex: width, 
    minWidth: { xs: '100%', sm: 'calc(50% - 16px)' },
    maxWidth: '100%',
    boxSizing: 'border-box',
    px: 1
  }}>
    {children}
  </Box>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    title: '',
    about: '',
    phone: '',
    address: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName) newErrors.lastName = 'Le nom est requis';
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // VITE_API_URL contient déjà /api/v1, donc on utilise directement /auth/register
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate('/login', { state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' } });
      } else {
        console.error('Erreur d\'inscription:', data);
        // Si nous avons des erreurs de validation, les afficher
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrors: Record<string, string> = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            validationErrors[err.field] = err.message;
          });
          setErrors(prev => ({
            ...prev,
            ...validationErrors,
            submit: 'Veuillez corriger les erreurs ci-dessous'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            submit: data.message || 'Une erreur est survenue lors de l\'inscription'
          }));
        }
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Erreur de connexion au serveur'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Créer un compte
        </Typography>
        
        {errors.submit && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errors.submit}
          </Typography>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <FormRow>
            <FormColumn>
              <TextField
                required
                fullWidth
                id="firstName"
                label="Prénom"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </FormColumn>
            <FormColumn>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Nom"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn width={1}>
              <TextField
                required
                fullWidth
                id="email"
                label="Adresse email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <TextField
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </FormColumn>
            <FormColumn>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirmer le mot de passe"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </FormColumn>
          </FormRow>

          <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
            <Button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showAdvanced ? 'Masquer les champs avancés' : 'Afficher plus de champs'}
            </Button>
          </Box>

          <Collapse in={showAdvanced}>
            <FormRow>
              <FormColumn width={1}>
                <TextField
                  fullWidth
                  id="title"
                  label="Titre professionnel"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormColumn>
            </FormRow>

            <FormRow>
              <FormColumn width={1}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Téléphone"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormColumn>
            </FormRow>

            <FormRow>
              <FormColumn width={1}>
                <TextField
                  fullWidth
                  id="address"
                  label="Adresse"
                  name="address"
                  autoComplete="address-line1"
                  value={formData.address}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormColumn>
            </FormRow>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Liens sociaux
            </Typography>

            <FormRow>
              <FormColumn width={1}>
                <TextField
                  fullWidth
                  id="github"
                  label="GitHub"
                  name="socialLinks.github"
                  value={formData.socialLinks.github}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GitHubIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormColumn>
            </FormRow>

            <FormRow>
              <FormColumn width={1}>
                <TextField
                  fullWidth
                  id="linkedin"
                  label="LinkedIn"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkedInIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormColumn>
            </FormRow>

            <FormRow>
              <FormColumn width={1}>
                <TextField
                  fullWidth
                  id="twitter"
                  label="Twitter"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TwitterIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormColumn>
            </FormRow>

            <FormRow>
              <FormColumn width={1}>
                <TextField
                  fullWidth
                  id="about"
                  label="À propos de vous"
                  name="about"
                  multiline
                  rows={4}
                  value={formData.about}
                  onChange={handleChange}
                />
              </FormColumn>
            </FormRow>
          </Collapse>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'S\'inscrire'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <MuiLink component={Link} to="/login" variant="body2">
              Déjà un compte ? Connectez-vous
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

// Export par défaut du composant RegisterPage
export default RegisterPage;
