import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../config/axios';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TablePagination,
  CircularProgress,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu as MuiMenu,
  Grid,
  SelectChangeEvent,
  Snackbar,
  Alert,
  Link
} from '@mui/material';

import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  GitHub,
  LinkedIn,
  Twitter
} from '@mui/icons-material';


interface User {
  _id: string;
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  description?: string;
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
  firstName: string;
  lastName: string;
  title?: string;
  about: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: 'user' | 'admin';
  password?: string;
  confirmPassword?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  profileImage?: string;
  profileImageFile?: File | null;
  cvFile?: File | null;
  cvUrl?: string;
}

const initialUserFormState: UserFormState = {
  firstName: '',
  lastName: '',
  title: '',
  about: '',
  email: '',
  phoneNumber: '',
  address: '',
  role: 'user',
  password: '',
  confirmPassword: '',
  githubUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  profileImage: '',
  profileImageFile: null,
  cvFile: null,
  cvUrl: ''
};

const UsersPage: React.FC = () => {
    // États de pagination et filtres
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // États pour les dialogues et menus
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Snackbar state
  type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // États pour le formulaire
  const [userForm, setUserForm] = useState<UserFormState>(initialUserFormState);
  
  // États pour la gestion des utilisateurs
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Récupération des données utilisateurs avec React Query
  const { 
    data: usersResponse = { data: [] }, 
    isLoading: isLoadingUsers, 
    error: usersError 
  } = useQuery<{ data: User[] }>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    }
  });
  
  const users = usersResponse?.data || [];
  
  // Gestion de la modale utilisateur
  const handleOpenUserDialog = (user: User | null = null) => {
    if (user) {
      // Mode édition - S'assurer que tous les champs sont initialisés avec des valeurs par défaut
      setUserForm({
        ...initialUserFormState, // D'abord initialiser avec les valeurs par défaut
        _id: user._id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        title: user.title || '',
        about: user.about || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        role: (user.role as 'user' | 'admin') || 'user',
        githubUrl: user.socialLinks?.github || '',
        linkedinUrl: user.socialLinks?.linkedin || '',
        twitterUrl: user.socialLinks?.twitter || '',
        profileImage: user.profileImage || '',
        cvUrl: user.cvUrl || '',
        // Ne pas réinitialiser les mots de passe en mode édition
        password: '',
        confirmPassword: ''
      });
      setIsEditing(true);
    } else {
      // Mode création - Utiliser l'état initial
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
    
    if (!userForm.firstName || !userForm.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }
    
    if (!userForm.lastName || !userForm.lastName.trim()) {
      errors.lastName = 'Le nom de famille est requis';
    }
    
    if (!userForm.email || !userForm.email.trim()) {
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
      
      // Créer un FormData pour gérer le téléversement de fichier
      const formData = new FormData();
      
      // Ajouter les champs texte au FormData
      formData.append('firstName', userForm.firstName);
      formData.append('lastName', userForm.lastName);
      if (userForm.title) formData.append('title', userForm.title);
      formData.append('about', userForm.about);
      formData.append('email', userForm.email);
      if (userForm.phoneNumber) formData.append('phoneNumber', userForm.phoneNumber);
      if (userForm.address) formData.append('address', userForm.address);
      formData.append('role', userForm.role);
      if (userForm.password) formData.append('password', userForm.password);
      
      // Ajouter les liens de réseaux sociaux s'ils sont définis
      if (userForm.githubUrl) formData.append('socialLinks[github]', userForm.githubUrl);
      if (userForm.linkedinUrl) formData.append('socialLinks[linkedin]', userForm.linkedinUrl);
      if (userForm.twitterUrl) formData.append('socialLinks[twitter]', userForm.twitterUrl);
      
      // Ajouter le fichier d'image s'il y en a un
      if (userForm.profileImageFile) {
        formData.append('profileImage', userForm.profileImageFile);
      } else if (userForm.profileImage && !userForm.profileImageFile) {
        // Si on a une URL d'image mais pas de nouveau fichier, on la garde
        formData.append('profileImage', userForm.profileImage);
      }
      
      // Ajouter le fichier CV s'il y en a un
      if (userForm.cvFile) {
        formData.append('cvFile', userForm.cvFile);
      } else if (userForm.cvUrl && !userForm.cvFile) {
        // Si on a une URL de CV mais pas de nouveau fichier, on la garde
        formData.append('cvUrl', userForm.cvUrl);
      }
      
      // Configurer les en-têtes pour FormData
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      console.log('Données à envoyer au serveur:', Object.fromEntries(formData.entries()));
      
      if (isEditing && userForm._id) {
        // Mise à jour de l'utilisateur existant avec FormData
        console.log('Mise à jour de l\'utilisateur:', userForm._id);
        const response = await api.put(`/users/${userForm._id}`, formData, config);
        console.log('Réponse du serveur:', response.data);
        showSnackbar('Utilisateur mis à jour avec succès', 'success');
      } else {
        // Création d'un nouvel utilisateur avec FormData
        console.log('Création d\'un nouvel utilisateur');
        const response = await api.post('/users', formData, config);
        console.log('Réponse du serveur (création):', response.data);
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

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };
  
  // Suppression de la variable non utilisée
  const queryClient = useQueryClient();

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Tentative de suppression de l\'utilisateur ID:', userId);
      const response = await api.delete(`/users/${userId}`);
      console.log('Réponse de suppression:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Suppression réussie, données:', data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar(data.message || 'Utilisateur supprimé avec succès', 'success');
      setDeleteDialogOpen(false);
      setAnchorEl(null); // S'assurer que le menu est fermé
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur';
      showSnackbar(errorMessage, 'error');
      setDeleteDialogOpen(false);
      setAnchorEl(null); // S'assurer que le menu est fermé en cas d'erreur
    },
  });

  // Mutation pour changer le statut d'un utilisateur
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) => {
      await api.put(`/users/${userId}/suspend`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar('Statut mis à jour avec succès', 'success');
    },
    onError: (error: any) => {
      console.error('Erreur lors du changement de statut:', error);
      showSnackbar('Erreur lors de la modification du statut', 'error');
    },
  });

  // Mutation pour changer le rôle d'un utilisateur
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
      await api.put(`/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar('Rôle mis à jour avec succès', 'success');
    },
    onError: (error: any) => {
      console.error('Erreur lors du changement de rôle:', error);
      showSnackbar('Erreur lors de la mise à jour du rôle', 'error');
    },
  });

  // Gestion du menu contextuel
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  // Gestion de la pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrage des utilisateurs
  const filteredUsers = (users || []).filter((user: User) => {
    // Vérification des propriétés avant d'appeler toLowerCase()
    const userName = user?.firstName || '';
    const userEmail = user?.email || '';
    const userStatus = user?.status || '';
    const userRole = user?.role || '';

    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = userName.toLowerCase().includes(searchTermLower) ||
                         userEmail.toLowerCase().includes(searchTermLower);
    
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
    const matchesRole = roleFilter === 'all' || userRole === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Calcul des lignes vides pour la pagination
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
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      console.log('Confirmation de suppression pour l\'utilisateur:', selectedUser._id);
      await deleteUserMutation.mutateAsync(selectedUser._id);
      // Ne pas fermer le dialogue ici, laisser onSuccess s'en charger
    } catch (error) {
      console.error('Erreur dans handleConfirmDelete:', error);
      // Le message d'erreur est géré par onError de la mutation
    } finally {
      setAnchorEl(null); // Nettoyer l'anchorEl
      setDeleteDialogOpen(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users?.find((u: User) => u._id === userId);
      if (!user) return;
      
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      await toggleStatusMutation.mutateAsync({ userId, status: newStatus });
      showSnackbar(`Statut de l'utilisateur mis à jour`, 'success');
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const changeUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await changeRoleMutation.mutateAsync({ userId, role: newRole });
      showSnackbar('Rôle de l\'utilisateur mis à jour', 'success');
    } catch (error) {
      showSnackbar('Erreur lors du changement de rôle', 'error');
    }
  };

  if (isLoadingUsers) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (usersError) {
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
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Utilisateurs</Typography>
                  <Typography variant="h4">{users.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Utilisateurs Actifs</Typography>
                  <Typography variant="h4">
                    {users.filter((user: User) => user.status === 'active').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Admin Users</Typography>
                  <Typography variant="h4">
                    {users.filter((user: User) => user.role === 'admin').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3, mt: 3 }}>
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
                  onChange={(event: SelectChangeEvent) => setStatusFilter(event.target.value)}
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
                  onChange={(event: SelectChangeEvent) => setRoleFilter(event.target.value)}
                >
                  <MenuItem value="all">Tous les rôles</MenuItem>
                  <MenuItem value="admin">Administrateur</MenuItem>
                  <MenuItem value="user">Utilisateur</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>GitHub</TableCell>
                <TableCell>LinkedIn</TableCell>
                <TableCell>Twitter</TableCell>
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
                        <Avatar 
                          src={user.profileImage} 
                          alt={`${user.firstName || ''} ${user.lastName || ''}`}
                        >
                          {!user.profileImage && (user?.firstName?.charAt(0)?.toUpperCase() || '?')}
                        </Avatar>
                      </TableCell>
                      <TableCell>{user.lastName || '-'}</TableCell>
                      <TableCell>{user.firstName || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.address || ''}>
                        {user.address || '-'}
                      </TableCell>
                      <TableCell>
                        {user.socialLinks?.github ? (
                          <Link href={user.socialLinks.github} target="_blank" rel="noopener noreferrer">
                            <IconButton size="small" color="primary">
                              <GitHub />
                            </IconButton>
                          </Link>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {user.socialLinks?.linkedin ? (
                          <Link href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            <IconButton size="small" color="primary">
                              <LinkedIn />
                            </IconButton>
                          </Link>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {user.socialLinks?.twitter ? (
                          <Link href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                            <IconButton size="small" color="primary">
                              <Twitter />
                            </IconButton>
                          </Link>
                        ) : '-'}
                      </TableCell>
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
    <MuiMenu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: { width: 200 }
      }}
    >
      <MenuItem onClick={() => {
        if (selectedUser) {
          handleOpenUserDialog(selectedUser);
          handleMenuClose();
        }
      }}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} />
        Modifier
      </MenuItem>
      <MenuItem onClick={() => {
        if (selectedUser) {
          toggleUserStatus(selectedUser._id);
          handleMenuClose();
        }
      }}>
        {selectedUser?.status === 'active' ? (
          <>
            <LockIcon fontSize="small" sx={{ mr: 1 }} />
            Suspendre
          </>
        ) : (
          <>
            <LockOpenIcon fontSize="small" sx={{ mr: 1 }} />
            Activer
          </>
        )}
      </MenuItem>
      <MenuItem onClick={() => {
        if (selectedUser) {
          changeUserRole(selectedUser._id, selectedUser.role === 'admin' ? 'user' : 'admin');
          handleMenuClose();
        }
      }}>
        <AdminIcon fontSize="small" sx={{ mr: 1 }} />
        {selectedUser?.role === 'admin' ? 'Rétrograder' : 'Promouvoir admin'}
      </MenuItem>
      <MenuItem 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault(); // Empêcher tout comportement par défaut
          if (selectedUser) {
            handleDeleteClick(selectedUser);
            // Ne pas appeler handleMenuClose ici pour permettre à la boîte de dialogue de s'afficher
          }
        }}
        sx={{ color: 'error.main' }}
      >
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
        Supprimer
      </MenuItem>
    </MuiMenu>

    {/* Dialogue de confirmation de suppression */}
    <Dialog
      open={deleteDialogOpen}
      onClose={() => setDeleteDialogOpen(false)}
    >
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer l'utilisateur {selectedUser?.firstName} {selectedUser?.lastName} ?
          Cette action est irréversible.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
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
      <DialogTitle>{isEditing ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmitUser} sx={{ mt: 2 }}>
          {/* Aperçu de l'image de profil */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={userForm.profileImageFile 
                ? URL.createObjectURL(userForm.profileImageFile) 
                : userForm.profileImage
              } 
              sx={{ width: 100, height: 100, mb: 2 }}
            >
              {!userForm.profileImageFile && !userForm.profileImage && (
                <PersonIcon sx={{ width: 60, height: 60 }} />
              )}
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddIcon />}
            >
              {userForm.profileImage || userForm.profileImageFile ? 'Changer l\'image' : 'Ajouter une image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    if (file.size > 5 * 1024 * 1024) {
                      showSnackbar('La taille de l\'image ne doit pas dépasser 5 Mo', 'error');
                      return;
                    }
                    setUserForm({
                      ...userForm,
                      profileImageFile: file,
                      profileImage: URL.createObjectURL(file)
                    });
                  }
                }}
              />
            </Button>
            {(userForm.profileImage || userForm.profileImageFile) && (
              <Button
                color="error"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => {
                  setUserForm({
                    ...userForm,
                    profileImage: '',
                    profileImageFile: null
                  });
                }}
              >
                Supprimer l'image
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="Prénom"
              name="firstName"
              autoComplete="given-name"
              value={userForm.firstName}
              onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              sx={{ flex: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Nom"
              name="lastName"
              autoComplete="family-name"
              value={userForm.lastName}
              onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              sx={{ flex: 1 }}
            />
          </Box>
          
          <TextField
            margin="normal"
            fullWidth
            id="title"
            label="Titre"
            name="title"
            value={userForm.title}
            onChange={(e) => setUserForm({...userForm, title: e.target.value})}
            error={!!formErrors.title}
            helperText={formErrors.title}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={4}
            id="about"
            label="Présentation détaillée"
            name="about"
            value={userForm.about}
            onChange={(e) => setUserForm({...userForm, about: e.target.value})}
            error={!!formErrors.about}
            helperText={formErrors.about || 'Décrivez-vous de manière détaillée'}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adresse email"
            name="email"
            autoComplete="email"
            value={userForm.email}
            onChange={(e) => setUserForm({...userForm, email: e.target.value})}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="normal"
              fullWidth
              id="phoneNumber"
              label="Téléphone"
              name="phoneNumber"
              autoComplete="tel"
              value={userForm.phoneNumber}
              onChange={(e) => setUserForm({...userForm, phoneNumber: e.target.value})}
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
              sx={{ flex: 1 }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="address"
              label="Adresse"
              name="address"
              autoComplete="address-line1"
              value={userForm.address}
              onChange={(e) => setUserForm({...userForm, address: e.target.value})}
              error={!!formErrors.address}
              helperText={formErrors.address}
              sx={{ flex: 1 }}
            />
          </Box>
          
          {/* Section CV */}
          <Box sx={{ mb: 3, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>CV de l'utilisateur</Typography>
            
            {userForm.cvUrl || userForm.cvFile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  component="a"
                  href={userForm.cvFile ? URL.createObjectURL(userForm.cvFile) : userForm.cvUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Télécharger le CV
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  size="small"
                  onClick={() => setUserForm({...userForm, cvFile: null, cvUrl: ''})}
                >
                  Supprimer
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddIcon />}
                sx={{ mb: 1 }}
              >
                Ajouter un CV (PDF, max 5MB)
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.size > 5 * 1024 * 1024) {
                        showSnackbar('La taille du fichier ne doit pas dépasser 5 Mo', 'error');
                        return;
                      }
                      if (file.type !== 'application/pdf') {
                        showSnackbar('Veuillez sélectionner un fichier PDF', 'error');
                        return;
                      }
                      setUserForm({
                        ...userForm,
                        cvFile: file
                      });
                    }
                  }}
                />
              </Button>
            )}
            <Typography variant="caption" display="block" color="textSecondary">
              {userForm.cvFile 
                ? `Fichier sélectionné: ${userForm.cvFile.name} (${(userForm.cvFile.size / 1024 / 1024).toFixed(2)} MB)` 
                : 'Aucun fichier sélectionné'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="GitHub"
              placeholder="https://github.com/username"
              value={userForm.githubUrl}
              onChange={(e) => setUserForm({...userForm, githubUrl: e.target.value})}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="LinkedIn"
              placeholder="https://linkedin.com/in/username"
              value={userForm.linkedinUrl}
              onChange={(e) => setUserForm({...userForm, linkedinUrl: e.target.value})}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Twitter"
              placeholder="https://twitter.com/username"
              value={userForm.twitterUrl}
              onChange={(e) => setUserForm({...userForm, twitterUrl: e.target.value})}
              margin="normal"
              variant="outlined"
            />
          </Box>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Rôle</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={userForm.role}
              label="Rôle"
              onChange={(e) => setUserForm({...userForm, role: e.target.value as 'user' | 'admin'})}
            >
              <MenuItem value="user">Utilisateur</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
            </Select>
          </FormControl>
          {!isEditing && (
            <>
              <TextField
                margin="normal"
                required={!isEditing}
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="new-password"
                value={userForm.password || ''}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
              <TextField
                margin="normal"
                required={!isEditing}
                fullWidth
                name="confirmPassword"
                label="Confirmer le mot de passe"
                type="password"
                id="confirmPassword"
                value={userForm.confirmPassword || ''}
                onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
            </>
          )}
          <DialogActions sx={{ px: 0 }}>
            <Button onClick={handleCloseUserDialog}>Annuler</Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>

    {/* Snackbar pour les notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      message={snackbar.message}
      action={
        <IconButton
          size="small"
          color="inherit"
          onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Container>
);
};

export default UsersPage;
