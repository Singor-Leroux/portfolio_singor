import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Material-UI Components
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  CircularProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Menu,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';

// Icons
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | string;
  status: 'pending' | 'active' | 'suspended' | 'banned';
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Pour gérer d'autres propriétés potentielles
}

interface UserFormState {
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  password?: string;
  confirmPassword?: string;
}

const initialUserFormState: UserFormState = {
  name: '',
  email: '',
  role: 'user',
  password: '',
  confirmPassword: ''
};

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>(initialUserFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  // Gestion de la modale utilisateur
  const handleOpenUserDialog = (user: User | null = null) => {
    if (user) {
      // Mode édition
      setUserForm({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role as 'user' | 'admin',
        password: '',
        confirmPassword: ''
      });
      setIsEditing(true);
    } else {
      // Mode création
      setUserForm(initialUserFormState);
      setIsEditing(false);
    }
    setUserDialogOpen(true);
    setFormErrors({});
  };

  const handleCloseUserDialog = () => {
    setUserDialogOpen(false);
    setUserForm(initialUserFormState);
    setFormErrors({});
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!userForm.name.trim()) {
      errors.name = 'Le nom est requis';
    }
    
    if (!userForm.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!isEditing && !userForm.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (userForm.password && userForm.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (userForm.password !== userForm.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const userData = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        ...(userForm.password && { password: userForm.password })
      };
      
      if (isEditing && userForm._id) {
        // Mise à jour de l'utilisateur existant
        await updateUser(userForm._id, userData);
        showSnackbar('Utilisateur mis à jour avec succès', 'success');
      } else {
        // Création d'un nouvel utilisateur
        await createUser(userData);
        showSnackbar('Utilisateur créé avec succès', 'success');
      }
      
      handleCloseUserDialog();
      queryClient.invalidateQueries(['users']);
    } catch (error: any) {
      showSnackbar(`Erreur: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const { enqueueSnackbar } = useSnackbar();
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const token = localStorage.getItem('token') || '';
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Récupérer les utilisateurs
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get(`${getApiBaseUrl()}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.data;
    },
  });

  // Fonction pour créer un nouvel utilisateur
  const createUser = async (userData: Omit<UserFormState, '_id' | 'confirmPassword'>) => {
    const response = await axios.post(`${getApiBaseUrl()}/api/v1/users`, userData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  };

  // Fonction pour mettre à jour un utilisateur
  const updateUser = async (userId: string, userData: Partial<UserFormState>) => {
    const response = await axios.put(`${getApiBaseUrl()}/api/v1/users/${userId}`, userData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  };

  // Fonction utilitaire pour obtenir l'URL de base de l'API
  const getApiBaseUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // S'assurer que l'URL ne se termine pas par /api
    return baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  };

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axios.delete(`${getApiBaseUrl()}/api/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar('Utilisateur supprimé avec succès', 'success');
      // enqueueSnackbar('Utilisateur supprimé avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      showSnackbar('Erreur lors de la suppression de l\'utilisateur', 'error');
      // enqueueSnackbar('Erreur lors de la suppression de l\'utilisateur', { variant: 'error' });
    },
  });

  // Mutation pour changer le statut d'un utilisateur
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) => {
      await axios.put(
        `${getApiBaseUrl()}/api/v1/users/${userId}/suspend`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar('Statut mis à jour avec succès', 'success');
      // enqueueSnackbar('Statut mis à jour avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      console.error('Erreur lors du changement de statut:', error);
      showSnackbar('Erreur lors de la modification du statut', 'error');
      // enqueueSnackbar('Erreur lors de la modification du statut', { variant: 'error' });
    },
  });

  // Mutation pour changer le rôle d'un utilisateur
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
      await axios.put(
        `${getApiBaseUrl()}/api/v1/users/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar('Rôle mis à jour avec succès', 'success');
      // enqueueSnackbar('Rôle mis à jour avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      console.error('Erreur lors du changement de rôle:', error);
      showSnackbar('Erreur lors de la mise à jour du rôle', 'error');
      // enqueueSnackbar('Erreur lors de la mise à jour du rôle', { variant: 'error' });
    },
  });

  // Gestion du menu contextuel
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  // Gestion de la pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredUsers.length) : 0;

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Rendu du statut avec une puce de couleur
  const renderStatusChip = (status: string) => {
    const statusMap = {
      active: { label: 'Actif', color: 'success' as const },
      suspended: { label: 'Suspendu', color: 'error' as const },
      pending: { label: 'En attente', color: 'warning' as const },
      banned: { label: 'Banni', color: 'error' as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'default' as const };
    
    return (
      <Chip 
        label={statusInfo.label} 
        color={statusInfo.color} 
        size="small"
        variant="outlined"
      />
    );
  };

  // Gestion des actions
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser._id);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    toggleStatusMutation.mutate({ userId: user._id, status: newStatus });
    handleMenuClose();
  };

  const handleChangeRole = (user: User, newRole: 'user' | 'admin') => {
    changeRoleMutation.mutate({ userId: user._id, role: newRole });
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">
          Erreur lors du chargement des utilisateurs. Veuillez réessayer.
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des utilisateurs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenUserDialog()}
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher un utilisateur..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut"
                  onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tous les statuts</MenuItem>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="suspended">Suspendu</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="banned">Banni</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={roleFilter}
                  label="Rôle"
                  onChange={(e: SelectChangeEvent) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">Tous les rôles</MenuItem>
                  <MenuItem value="admin">Administrateur</MenuItem>
                  <MenuItem value="user">Utilisateur</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Dernière connexion</TableCell>
                  <TableCell>Inscription</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user: User) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar>
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2">{user.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                            color={user.role === 'admin' ? 'primary' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(user.status)}
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}
                        </TableCell>
                        <TableCell>
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell align="right" sx={{ width: '80px' }}>
                          <Box display="flex" justifyContent="flex-end">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, user);
                              }}
                              disabled={isSubmitting || user.id === currentUser?.id}
                              aria-label="Actions"
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        Aucun utilisateur trouvé
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page :"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            }
          />
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: '200px',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
            borderRadius: '8px',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedUser) {
              handleOpenUserDialog(selectedUser);
            }
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1, color: 'text.secondary' }} /> Modifier
        </MenuItem>
        {selectedUser?.status === 'active' ? (
          <MenuItem
            onClick={() => selectedUser && handleToggleStatus(selectedUser)}
            disabled={isSubmitting}
          >
            <LockIcon sx={{ mr: 1, color: 'warning.main' }} /> Suspendre
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => selectedUser && handleToggleStatus(selectedUser)}
            disabled={isSubmitting}
          >
            <LockOpenIcon sx={{ mr: 1, color: 'success.main' }} /> Activer
          </MenuItem>
        )}
        {selectedUser?.role === 'user' ? (
          <MenuItem
            onClick={() => selectedUser && handleChangeRole(selectedUser, 'admin')}
            disabled={isSubmitting}
          >
            <AdminIcon sx={{ mr: 1, color: 'primary.main' }} /> Rendre administrateur
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => selectedUser && handleChangeRole(selectedUser, 'user')}
            disabled={isSubmitting || (selectedUser?.id && currentUser?.id ? selectedUser.id === currentUser.id : false)}
          >
            <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} /> Rendre utilisateur
          </MenuItem>
        )}
        <MenuItem
          onClick={() => selectedUser && handleDeleteClick(selectedUser)}
          disabled={isSubmitting || (selectedUser?.id && currentUser?.id ? selectedUser.id === currentUser.id : false)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Supprimer
        </MenuItem>
      </Menu>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Êtes-vous sûr de vouloir supprimer l'utilisateur {selectedUser?.name} ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale d'ajout/modification d'utilisateur */}
      <Dialog open={userDialogOpen} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitUser}>
          <DialogTitle>
            {isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom complet"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Rôle</InputLabel>
                  <Select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'user' | 'admin' })}
                    label="Rôle"
                    required
                  >
                    <MenuItem value="user">Utilisateur</MenuItem>
                    <MenuItem value="admin">Administrateur</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {!isEditing && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mot de passe"
                      type="password"
                      value={userForm.password || ''}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                      margin="normal"
                      required={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirmer le mot de passe"
                      type="password"
                      value={userForm.confirmPassword || ''}
                      onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      margin="normal"
                      required={!isEditing}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleCloseUserDialog} color="inherit">
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default UsersPage;
