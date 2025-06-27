import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProjectSocket } from '../hooks/useProjectSocket';
import { styled } from '@mui/material/styles';
import {
  // Composants Material-UI
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Dialog, 
  DialogTitle,
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress, 
  Alert as MuiAlert, 
  Snackbar, 
  Grid, 
  IconButton, 
  FormControlLabel, 
  Checkbox,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Tooltip,
  Avatar,
  // Switch,
  Link
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Clear as ClearIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon,
  GitHub as GitHubIcon,
  Image as ImageIcon,
  Public as PublicIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  // CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  // Star as StarIcon,
  StarBorder as StarBorderIcon,
  Language as LanguageIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  EditNote as EditNoteIcon
} from '@mui/icons-material';

import {
  ProjectBE,
  ProjectCreationPayload,
  ProjectUpdatePayload,
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from '../api/projects';

// Alias pour la compatibilité
const Alert = MuiAlert;

interface ProjectFormState {
  title: string;
  description: string;
  technologies: string;
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
  imageFile?: File | null;
  imagePreview?: string;
  imageUrl: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

const initialProjectFormState: ProjectFormState = {
  title: '',
  description: '',
  technologies: '',
  githubUrl: '',
  demoUrl: '',
  featured: false,
  imageFile: null,
  imagePreview: '',
  imageUrl: ''
};

// Composant pour l'aperçu de l'image en plein écran
const ImagePreview = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  cursor: 'zoom-out',
});

const ProjectsPage = () => {
  // URL de base pour les images
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:5000';
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string, title: string } | null>(null);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectFormState>(initialProjectFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  // État de soumission géré par la mutation
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Utilisation du hook WebSocket pour les projets
  useProjectSocket({
    onProjectCreated: (project) => {
      // Invalider le cache pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Afficher une notification
      setSnackbar({
        open: true,
        message: `Nouveau projet créé: ${project.title}`,
        severity: 'success',
      });
    },
    onProjectUpdated: (data) => {
      // Mettre à jour le cache avec les nouvelles données
      queryClient.setQueryData(['projects'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((p: any) => 
          p._id === data.new._id ? { ...p, ...data.new } : p
        );
      });
      // Afficher une notification
      setSnackbar({
        open: true,
        message: `Projet mis à jour: ${data.new.title}`,
        severity: 'info',
      });
    },
    onProjectDeleted: (project) => {
      // Supprimer le projet du cache
      queryClient.setQueryData(['projects'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((p: any) => p._id !== project._id);
      });
      // Afficher une notification
      setSnackbar({
        open: true,
        message: `Projet supprimé: ${project.title}`,
        severity: 'warning',
      });
    },
  });

  const queryClient = useQueryClient();

  // Fonction pour forcer le rafraîchissement des données
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  }, [queryClient]);

  // Fonction de validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!currentProject.title.trim()) {
      errors.title = 'Le titre est requis';
    }
    
    if (!currentProject.description.trim()) {
      errors.description = 'La description est requise';
    }
    
    if (!currentProject.imageFile && !currentProject.imageUrl && !currentProject.imagePreview) {
      errors.imageUrl = "Une image est requise";
    }
    
    if (!currentProject.technologies.trim()) {
      errors.technologies = 'Au moins une technologie est requise';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Récupérer les projets
  const { data: projects = [], isLoading, error } = useQuery<ProjectBE[], Error>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Mutations pour créer, mettre à jour et supprimer des projets
  const createMutation = useMutation<ProjectBE, Error, ProjectCreationPayload>({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleCloseDialog();
      showSnackbar('Projet créé avec succès', 'success');
    },
    onError: (error) => {
      showSnackbar(`Erreur lors de la création: ${error.message}`, 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProjectUpdatePayload | FormData) => {
      if (data instanceof FormData) {
        return updateProject(editingId!, data);
      } else {
        return updateProject(editingId!, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSnackbar('Projet mis à jour avec succès', 'success');
    },
    onError: () => {
      showSnackbar('Erreur lors de la mise à jour du projet', 'error');
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSnackbar('Projet supprimé avec succès', 'success');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      showSnackbar(`Erreur lors de la suppression: ${error.message}`, 'error');
      setDeleteDialogOpen(false);
    }
  });

  const handleDeleteClick = (id: string, title: string) => {
    setProjectToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };

  // Gestion des dialogues
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProject(initialProjectFormState);
    setEditingId(null);
    setFormErrors({});
    
    // Nettoyer l'URL de l'aperçu de l'image
    if (currentProject.imagePreview && currentProject.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(currentProject.imagePreview);
    }
  };

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    setPreviewImage(imageUrl);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleOpenEditDialog = (project: ProjectBE) => {
    // Construire l'URL complète de l'image si c'est un chemin relatif
    const getFullImageUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http') || url.startsWith('blob:')) return url;
      return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    setCurrentProject({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      featured: project.featured,
      imageFile: null,
      imagePreview: getFullImageUrl(project.imageUrl),
      imageUrl: project.imageUrl,
      _id: project._id,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    });
    
    setEditingId(project._id);
    setOpenDialog(true);
    
    console.log('Project data loaded:', {
      ...project,
      imageUrl: project.imageUrl,
      fullImageUrl: getFullImageUrl(project.imageUrl)
    });
  };

  const handleOpenCreateDialog = () => {
    setCurrentProject(initialProjectFormState);
    setEditingId(null);
    setOpenDialog(true);
  };

  // Gestion des changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Gestion spéciale pour les cases à cocher
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCurrentProject(prev => ({
        ...prev,
        [name]: checked
      }));
      
      // Effacer l'erreur du champ modifié
      if (formErrors[name as keyof typeof formErrors]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }
    
    // Gestion des champs de texte normaux
    setCurrentProject(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Gestion du glisser-déposer
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Gestion du dépôt de fichier
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  // Gestion spécifique pour le champ de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };
  
  // Traitement du fichier
  const processFile = (file: File) => {
    
    // Vérifier le type de fichier
    if (!file.type.match('image.*')) {
      showSnackbar('Veuillez sélectionner un fichier image valide', 'error');
      return;
    }
    
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('La taille du fichier ne doit pas dépasser 5MB', 'error');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setCurrentProject(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result as string,
        // Effacer l'erreur d'image si elle existe
        ...(formErrors.imageUrl && { formErrors: { ...formErrors, imageUrl: '' } })
      }));
    };
    
    reader.onerror = () => {
      showSnackbar('Erreur lors de la lecture du fichier', 'error');
    };
    
    reader.readAsDataURL(file);
  };
  
  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setCurrentProject(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: '',
      imageUrl: ''
    }));
  
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showSnackbar('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }
    
    try {
      const technologies = currentProject.technologies.split(',').map(tech => tech.trim()).filter(Boolean);
      
      if (editingId) {
        // Mise à jour d'un projet existant
        if (currentProject.imageFile) {
          // Si une nouvelle image est fournie, on crée un FormData
          const formData = new FormData();
          formData.append('title', currentProject.title.trim());
          formData.append('description', currentProject.description.trim());
          formData.append('technologies', JSON.stringify(technologies));
          formData.append('featured', currentProject.featured.toString());
          if (currentProject.githubUrl) formData.append('githubUrl', currentProject.githubUrl.trim());
          if (currentProject.demoUrl) formData.append('demoUrl', currentProject.demoUrl.trim());
          formData.append('imageFile', currentProject.imageFile);
          
          // Pour FormData, on envoie directement l'objet FormData
          // L'ID sera ajouté automatiquement dans la fonction updateProject
          await updateMutation.mutateAsync(formData, {
            onSuccess: () => {
              // Réinitialiser le formulaire après la mise à jour réussie
              setCurrentProject(initialProjectFormState);
              setOpenDialog(false);
              setEditingId(null);
              showSnackbar('Projet mis à jour avec succès', 'success');
            },
            onError: (error) => {
              console.error('Erreur lors de la mise à jour du projet:', error);
              showSnackbar('Erreur lors de la mise à jour du projet', 'error');
            }
          });
        } else {
          // Si pas de nouvelle image, on envoie les données normalement
          // Préparer les données de mise à jour
          const updateData: ProjectUpdatePayload = {
            title: currentProject.title.trim(),
            description: currentProject.description.trim(),
            technologies: technologies,
            featured: currentProject.featured,
            githubUrl: currentProject.githubUrl ? currentProject.githubUrl.trim() : undefined,
            demoUrl: currentProject.demoUrl ? currentProject.demoUrl.trim() : undefined,
            imageUrl: (!currentProject.imagePreview && !currentProject.imageUrl) 
              ? '' 
              : (currentProject.imagePreview || currentProject.imageUrl || undefined)
          };
          
          // Nettoyer les champs non définis
          Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof ProjectUpdatePayload] === undefined) {
              delete updateData[key as keyof ProjectUpdatePayload];
            }
          });
          
          await updateMutation.mutateAsync(updateData, {
            onSuccess: () => {
              // Réinitialiser le formulaire après la mise à jour réussie
              setCurrentProject(initialProjectFormState);
              setOpenDialog(false);
              setEditingId(null);
            }
          });
        }
      } else {
        // Création d'un nouveau projet - un fichier image est requis
        if (!currentProject.imageFile) {
          throw new Error("Un fichier image est requis pour la création");
        }
        
        const formData = new FormData();
        formData.append('title', currentProject.title.trim());
        formData.append('description', currentProject.description.trim());
        formData.append('technologies', JSON.stringify(technologies));
        formData.append('featured', currentProject.featured.toString());
        if (currentProject.githubUrl) formData.append('githubUrl', currentProject.githubUrl.trim());
        if (currentProject.demoUrl) formData.append('demoUrl', currentProject.demoUrl.trim());
        formData.append('imageFile', currentProject.imageFile);
        
        await createMutation.mutateAsync(formData as any);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      showSnackbar(error instanceof Error ? error.message : 'Une erreur est survenue', 'error');
    }
  };

  // Gestion des notifications
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Filtrage des projets
  const filteredProjects = useMemo(() => {
    if (!searchText) return projects;
    const searchLower = searchText.toLowerCase();
    return projects.filter(project => 
      project.title.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchLower))
    );
  }, [projects, searchText]);

  // Configuration des colonnes du tableau
  const columns: GridColDef<ProjectBE>[] = [
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 100,
      renderCell: (params) => {
        const imageUrl = params.value as string;
        
        if (!imageUrl) {
          return <Avatar variant="rounded" sx={{ width: 60, height: 60 }}><ImageIcon /></Avatar>;
        }
        
        // Construction de l'URL complète
        const fullUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${IMAGE_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        
        return (
          <Box 
            onClick={(e) => {
              e.stopPropagation();
              handleImageClick(e, fullUrl);
            }}
            sx={{ cursor: 'pointer' }}
          >
            <Avatar 
              src={fullUrl} 
              alt={params.row.title} 
              variant="rounded" 
              sx={{ 
                width: 60, 
                height: 60,
                '&:hover': {
                  opacity: 0.9,
                  boxShadow: 3
                }
              }} 
              onError={(e) => {
                // Gestion des erreurs de chargement d'image
                console.error('Erreur de chargement de l\'image:', fullUrl);
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '';
              }}
            />
          </Box>
        );
      },
      sortable: false,
      filterable: false,
    },
    { 
      field: 'title', 
      headerName: 'Titre', 
      flex: 1,
      minWidth: 200 
    },
    { 
      field: 'technologies', 
      headerName: 'Technologies', 
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value.map((tech: string, index: number) => (
            <Chip 
              key={index} 
              label={tech} 
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      ),
    },
    { 
      field: 'githubUrl', 
      headerName: 'GitHub', 
      width: 100,
      sortable: false,
      renderCell: (params) => (
        params.value ? (
          <IconButton 
            size="small" 
            href={params.value} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <GitHubIcon />
          </IconButton>
        ) : null
      )
    },
    { 
      field: 'demoUrl', 
      headerName: 'Démo', 
      width: 100,
      sortable: false,
      renderCell: (params) => (
        params.value ? (
          <IconButton 
            size="small" 
            href={params.value} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <PublicIcon />
          </IconButton>
        ) : null
      )
    },
    { 
      field: 'featured', 
      headerName: 'À la une', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Oui' : 'Non'} 
          color={params.value ? 'primary' : 'default'}
          size="small"
        />
      ) 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditDialog(params.row);
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(params.row._id, params.row.title);
            }}
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : <DeleteIcon />}
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
            >
              Réessayer
            </Button>
          }
        >
          Erreur lors du chargement des projets. {error instanceof Error ? error.message : ''}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestion des Projets
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Rafraîchir
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Ajouter un Projet
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Rechercher..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              endAdornment: searchText && (
                <IconButton size="small" onClick={() => setSearchText('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => {
              // Fonction d'export simple
              const csvContent = [
                ['Titre', 'Description', 'Technologies', 'À la une', 'GitHub', 'Démo'].join(','),
                ...filteredProjects.map(project => [
                  `"${project.title.replace(/"/g, '""')}"`,
                  `"${project.description.replace(/"/g, '""')}"`,
                  `"${project.technologies.join(', ')}"`,
                  project.featured ? 'Oui' : 'Non',
                  project.githubUrl || '',
                  project.demoUrl || ''
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `projets_${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exporter en CSV
          </Button>
        </Box>
        <DataGrid
          rows={filteredProjects}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          localeText={{
            // Menu et en-têtes
            columnMenuLabel: 'Menu',
            columnMenuShowColumns: 'Afficher les colonnes',
            columnMenuFilter: 'Filtrer',
            columnMenuHideColumn: 'Masquer',
            columnMenuUnsort: 'Non trié',
            columnMenuSortAsc: 'Trier par ordre croissant',
            columnMenuSortDesc: 'Trier par ordre décroissant',
            columnHeaderSortIconLabel: 'Trier',
            
            // Panneau des colonnes
            // Propriétés de localisation supportées
            toolbarColumns: 'Colonnes',
            toolbarFilters: 'Filtres',
            
            // Filtres - Configuration minimale
            filterPanelAddFilter: 'Ajouter un filtre',
            filterPanelDeleteIconLabel: 'Supprimer',
            filterPanelOperator: 'Opérateur',
            filterOperatorContains: 'contient',
            filterOperatorEquals: 'égal à',
            
            // Pagination - Configuration minimale
            footerRowSelected: (count: number) =>
              count !== 1
                ? `${count} projets sélectionnés`
                : '1 projet sélectionné',
            paginationRowsPerPage: 'Projets par page:',
            
            // Messages
            noRowsLabel: 'Aucun projet trouvé',
            noResultsOverlayLabel: 'Aucun résultat trouvé'
          }}
          sx={{
            flex: 1,
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: 'action.hover',
                cursor: 'pointer',
              },
            },
          }}
        />
      </Paper>

      {/* Dialogue d'ajout/édition de projet */}
      <Dialog 
        open={openDialog} 
        onClose={!(createMutation.isPending || updateMutation.isPending || deleteMutation.isPending) ? handleCloseDialog : undefined} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(145deg,rgb(96, 86, 86),rgb(65, 70, 78))',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ 
            bgcolor: 'primary.mainCopy', 
            color: 'white',
            py: 2,
            mb: 2,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {editingId ? <EditNoteIcon /> : <AddCircleOutlineIcon />}
            {editingId ? 'Modifier le Projet' : 'Nouveau Projet'}
          </DialogTitle>
          
          <DialogContent sx={{ py: 3, px: { xs: 2, sm: 4 } }}>
            <Grid container spacing={3}>
              {/* Colonne de gauche - Informations générales */}
              <Grid item xs={12} md={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  <CardHeader 
                    title="Informations générales" 
                    titleTypographyProps={{ variant: 'h6' }}
                    avatar={<InfoIcon color="primary" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Titre du projet"
                      name="title"
                      value={currentProject.title}
                      onChange={handleChange}
                      error={!!formErrors.title}
                      helperText={formErrors.title}
                      margin="normal"
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <TitleIcon sx={{ color: 'text.secondary', mr: 1, my: 0.5 }} />
                      }}
                      sx={{ mb: 2 }}
                      disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                    />
                    
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={currentProject.description}
                      onChange={handleChange}
                      error={!!formErrors.description}
                      helperText={formErrors.description || "Décrivez brièvement votre projet"}
                      margin="normal"
                      multiline
                      rows={4}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <DescriptionIcon sx={{ color: 'text.secondary', mr: 1, mt: 1.5, alignSelf: 'flex-start' }} />
                      }}
                      sx={{ mb: 2 }}
                      disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                    />
                    
                    <TextField
                      fullWidth
                      label="Technologies"
                      name="technologies"
                      value={currentProject.technologies}
                      onChange={handleChange}
                      error={!!formErrors.technologies}
                      helperText={formErrors.technologies || 'Séparez les technologies par des virgules (ex: React, Node.js, MongoDB)'}
                      margin="normal"
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <CodeIcon sx={{ color: 'text.secondary', mr: 1, my: 0.5 }} />
                      }}
                      disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={currentProject.featured}
                          onChange={handleChange}
                          name="featured"
                          color="primary"
                          disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <StarBorderIcon color={currentProject.featured ? 'primary' : 'action'} />
                          <Typography>Mettre en avant sur la page d'accueil</Typography>
                        </Box>
                      }
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Colonne de droite - Liens et image */}
              <Grid item xs={12} md={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  <CardHeader 
                    title="Liens externes" 
                    titleTypographyProps={{ variant: 'h6' }}
                    avatar={<Link color="primary" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Lien GitHub"
                      name="githubUrl"
                      value={currentProject.githubUrl}
                      onChange={handleChange}
                      error={!!formErrors.githubUrl}
                      helperText={formErrors.githubUrl || "Lien vers le dépôt GitHub"}
                      margin="normal"
                      type="url"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <GitHubIcon sx={{ color: 'text.secondary', mr: 1, my: 0.5 }} />
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Lien de démo"
                      name="demoUrl"
                      value={currentProject.demoUrl}
                      onChange={handleChange}
                      error={!!formErrors.demoUrl}
                      helperText={formErrors.demoUrl || "Lien vers la démo en ligne (optionnel)"}
                      margin="normal"
                      type="url"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <LanguageIcon sx={{ color: 'text.secondary', mr: 1, my: 0.5 }} />
                      }}
                    />
                  </CardContent>
                </Card>
                
                <Card 
                  variant="outlined" 
                  sx={{ 
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  <CardHeader 
                    title="Image du projet" 
                    titleTypographyProps={{ variant: 'h6' }}
                    avatar={<ImageIcon color="primary" />}
                    action={
                      !editingId && (
                        <Chip 
                          label="Requis" 
                          size="small" 
                          color="error" 
                          variant="outlined"
                        />
                      )
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="project-image-upload"
                      type="file"
                      onChange={handleFileChange}
                      disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                    />
                    <Box 
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      sx={{
                        border: isDragging ? '2px dashed' : '2px dashed transparent',
                        borderColor: isDragging ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        p: 2,
                        mb: 2,
                        transition: 'all 0.3s ease',
                        backgroundColor: isDragging ? 'action.hover' : 'background.paper',
                      }}
                    >
                      <label htmlFor="project-image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          fullWidth
                          disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                          sx={{
                            py: 1.5,
                            borderStyle: 'dashed',
                            '&:hover': {
                              borderStyle: 'dashed',
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          {isDragging 
                            ? 'Déposez l\'image ici' 
                            : currentProject.imageFile || currentProject.imagePreview || currentProject.imageUrl 
                              ? 'Remplacer l\'image' 
                              : 'Glissez-déposez une image ou cliquez pour sélectionner'}
                        </Button>
                      </label>
                      <Typography variant="caption" color="textSecondary" display="block" textAlign="center" mt={1}>
                        Formats acceptés : JPG, PNG, WEBP • Max 5MB
                      </Typography>
                    </Box>
                    
                    {(currentProject.imagePreview || currentProject.imageUrl) ? (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Box
                          sx={{
                            position: 'relative',
                            '&:hover .image-actions': {
                              opacity: 1
                            }
                          }}
                        >
                          <Box 
                            component="img"
                            src={currentProject.imagePreview || 
                                 (currentProject.imageUrl.startsWith('http') || 
                                  currentProject.imageUrl.startsWith('data:') ||
                                  currentProject.imageUrl.startsWith('blob:')
                                  ? currentProject.imageUrl 
                                  : `${IMAGE_BASE_URL}${currentProject.imageUrl.startsWith('/') ? '' : '/'}${currentProject.imageUrl}`)}
                            alt="Aperçu du projet"
                            sx={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              backgroundColor: 'background.paper',
                              p: 1,
                              transition: 'all 0.3s ease'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '';
                              target.style.display = 'none';
                            }}
                          />
                          <Box 
                            className="image-actions"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              display: 'flex',
                              gap: 1,
                              opacity: 0,
                              transition: 'opacity 0.3s ease',
                              '& button': {
                                backgroundColor: 'background.paper',
                                '&:hover': {
                                  backgroundColor: 'background.paper',
                                  opacity: 0.9
                                }
                              }
                            }}
                          >
                            <Tooltip title="Aperçu en grand">
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const url = currentProject.imagePreview || 
                                    (currentProject.imageUrl.startsWith('http') || 
                                     currentProject.imageUrl.startsWith('data:') ||
                                     currentProject.imageUrl.startsWith('blob:')
                                      ? currentProject.imageUrl 
                                      : `${IMAGE_BASE_URL}${currentProject.imageUrl.startsWith('/') ? '' : '/'}${currentProject.imageUrl}`);
                                  setPreviewImage(url);
                                }}
                              >
                                <ZoomInIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer l'image">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage();
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box 
                        sx={{ 
                          mt: 2,
                          border: '2px dashed',
                          borderColor: 'divider',
                          borderRadius: 1,
                          p: 3,
                          textAlign: 'center',
                          backgroundColor: 'background.default',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Glissez-déposez une image ici ou cliquez pour sélectionner
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Formats acceptés : JPG, PNG, WEBP • Max 5MB
                        </Typography>
                      </Box>
                    )}
                    
                    {formErrors.imageUrl && (
                      <Alert 
                        severity="error" 
                        sx={{ mt: 2 }}
                        icon={<ErrorOutlineIcon fontSize="small" />}
                      >
                        {formErrors.imageUrl}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={handleCloseDialog} 
              color="inherit"
              disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
              startIcon={<CloseIcon />}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || (!currentProject.imageFile && !currentProject.imageUrl && !editingId)}
              startIcon={(createMutation.isPending || updateMutation.isPending || deleteMutation.isPending) ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{
                minWidth: 120,
                '&:disabled': {
                  opacity: 0.7
                }
              }}
            >
              {(createMutation.isPending || updateMutation.isPending || deleteMutation.isPending) ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le projet <strong>"{projectToDelete?.title || ''}"</strong> ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cette action est irréversible et supprimera définitivement le projet.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            autoFocus
            disabled={deleteMutation.isPending}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Aperçu de l'image en plein écran */}
      {previewImage && (
        <ImagePreview onClick={handleClosePreview}>
          <Box 
            component="img"
            src={previewImage}
            alt="Aperçu du projet"
            sx={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: 1,
              boxShadow: 3
            }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '';
              showSnackbar('Impossible de charger l\'image', 'error');
              handleClosePreview();
            }}
          />
        </ImagePreview>
      )}
    </Container>
  );
};

export default ProjectsPage;
