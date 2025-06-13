import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Chip, Container, Typography, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress, Alert, Snackbar, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, FileDownload, Search, Clear } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  ExperienceBE, 
  getExperiences, 
  createExperience, 
  updateExperience, 
  deleteExperience, 
  ExperienceCreationPayload, 
  ExperienceUpdatePayload 
} from '../api/experiences';

interface ExperienceFormData extends Omit<Partial<ExperienceBE>, 'technologies'> {
  technologies?: string | string[];
}

const ExperiencesPage = () => {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<{ id: string, title: string } | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [currentExperience, setCurrentExperience] = useState<ExperienceFormData>({});
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ 
    open: false, 
    message: '', 
    severity: 'success'
  });
  const [searchText, setSearchText] = useState('');
  const queryClient = useQueryClient();

  // Récupérer les expériences
  const { data: experiences = [], isLoading, error } = useQuery<ExperienceBE[]>({
    queryKey: ['experiences'],
    queryFn: async () => {
      try {
        console.log('Début de la récupération des expériences...');
        const data = await getExperiences();
        console.log('Données brutes reçues de l\'API:', data);
        return data;
      } catch (err) {
        console.error('Erreur lors de la récupération des expériences:', err);
        throw err;
      }
    },
    onError: (error) => {
      console.error('Erreur dans useQuery:', error);
    },
    onSettled: (data, error) => {
      console.log('useQuery settled - Données:', data, 'Erreur:', error);
    }
  });

  // Log quand les expériences changent
  useEffect(() => {
    console.log('Experiences mises à jour:', experiences);
    console.log('Données à afficher dans le DataGrid:', experiences);
  }, [experiences]);

  // Filtrer les expériences selon le texte de recherche
  const filteredExperiences = useMemo(() => {
    if (!searchText) return experiences || [];
    const searchLower = searchText.toLowerCase();
    return (experiences || []).filter(exp => 
      exp.title?.toLowerCase().includes(searchLower) ||
      exp.company?.toLowerCase().includes(searchLower) ||
      (exp.location && exp.location.toLowerCase().includes(searchLower)) ||
      (exp.technologies && exp.technologies.some(tech => 
        tech.toLowerCase().includes(searchLower)
      ))
    );
  }, [experiences, searchText]);

  // Créer ou mettre à jour une expérience
  const mutation = useMutation({
    mutationFn: (experienceData: Partial<ExperienceBE>) => {
      const { _id, ...rest } = experienceData;
      if (_id) {
        return updateExperience(_id, rest as ExperienceUpdatePayload);
      } else {
        if (!rest.title || !rest.company || !rest.startDate) {
          throw new Error('Le titre, l\'entreprise et la date de début sont requis');
        }
        return createExperience(rest as ExperienceCreationPayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      handleClose();
      showSnackbar('Expérience enregistrée avec succès', 'success');
    },
    onError: (error: Error) => {
      showSnackbar(`Erreur: ${error.message}`, 'error');
    }
  });

  // Supprimer une expérience
  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      showSnackbar('Expérience supprimée avec succès', 'success');
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      showSnackbar(`Erreur lors de la suppression: ${error.message}`, 'error');
      setDeleteDialogOpen(false);
    }
  });

  const handleDeleteClick = (id: string, title: string) => {
    setExperienceToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (experienceToDelete) {
      deleteMutation.mutate(experienceToDelete.id);
    }
  };

  const formatDateForInput = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Vérifie si la date est valide
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpen = (experience: ExperienceFormData | null = null) => {
    if (experience) {
      // Si on modifie une expérience existante, formater les dates
      setCurrentExperience({
        ...experience,
        startDate: formatDateForInput(experience.startDate) || '',
        endDate: formatDateForInput(experience.endDate) || ''
      });
    } else {
      // Si c'est une nouvelle expérience, initialiser avec la date du jour
      setCurrentExperience({ 
        title: '', 
        company: '', 
        location: '',
        startDate: formatDateForInput(new Date().toISOString()),
        endDate: '',
        description: '',
        technologies: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentExperience({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentExperience) {
      // Convertir les technologies en tableau si c'est une chaîne
      const technologies = typeof currentExperience.technologies === 'string'
        ? currentExperience.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
        : currentExperience.technologies || [];
      
      const data = {
        ...currentExperience,
        technologies,
        startDate: currentExperience.startDate || new Date().toISOString().split('T')[0]
      };
      
      mutation.mutate(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentExperience(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Log pour déboguer les données
  useEffect(() => {
    console.log('Données brutes reçues :', experiences);
    console.log('Données filtrées :', filteredExperiences);
    if (filteredExperiences.length > 0) {
      console.log('Première expérience :', filteredExperiences[0]);
      console.log('Titre de la première expérience :', filteredExperiences[0].title);
    }
  }, [experiences, filteredExperiences]);

  // Colonnes du DataGrid
  const columns: GridColDef<ExperienceBE>[] = [
    { 
      field: 'title', 
      headerName: 'Titre', 
      flex: 1, 
      minWidth: 200,
      valueGetter: (params: any) => params.row?.title || 'Sans titre',
      renderCell: (params: any) => (
        <Box sx={{ width: '100%', whiteSpace: 'normal' }}>
          {params.row?.title || 'Sans titre'}
        </Box>
      )
    },
    { 
      field: 'company', 
      headerName: 'Entreprise', 
      flex: 1, 
      minWidth: 150,
      valueGetter: (params: any) => params.row?.company || 'Non spécifiée',
      renderCell: (params: any) => (
        <Box sx={{ width: '100%', whiteSpace: 'normal' }}>
          {params.row?.company || 'Non spécifiée'}
        </Box>
      )
    },
    { 
      field: 'location', 
      headerName: 'Lieu', 
      flex: 1,
      minWidth: 120,
      valueGetter: (params: any) => params.row?.location || 'Non spécifié',
      renderCell: (params: any) => (
        <Box sx={{ width: '100%', whiteSpace: 'normal' }}>
          {params.row?.location || 'Non spécifié'}
        </Box>
      )
    },
    { 
      field: 'startDate', 
      headerName: 'Début', 
      width: 120,
      valueGetter: (params: any) => params.row?.startDate || 'Non spécifiée',
      renderCell: (params: any) => {
        const date = params.row?.startDate;
        const formattedDate = date ? new Date(date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'short'
        }) : 'Non spécifiée';
        
        return (
          <Box sx={{ width: '100%', whiteSpace: 'normal' }}>
            {formattedDate}
          </Box>
        );
      }
    },
    { 
      field: 'endDate', 
      headerName: 'Fin', 
      width: 120,
      valueGetter: (params: any) => params.row?.endDate || 'En cours',
      renderCell: (params: any) => {
        const date = params.row?.endDate;
        let displayText = 'En cours';
        
        if (date) {
          displayText = new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short'
          });
        }
        
        return (
          <Box sx={{ 
            width: '100%', 
            whiteSpace: 'normal',
            fontStyle: !date ? 'italic' : 'normal',
            color: !date ? 'text.secondary' : 'inherit'
          }}>
            {displayText}
          </Box>
        );
      }
    },
    {
      field: 'technologies',
      headerName: 'Technologies',
      flex: 1,
      minWidth: 200,
      valueGetter: (params: any) => (params.row?.technologies || []).join(', ') || 'Aucune',
      renderCell: (params: any) => {
        const technologies = params.row?.technologies || [];
        
        if (technologies.length === 0) {
          return (
            <Box sx={{ 
              width: '100%',
              color: 'text.secondary',
              fontStyle: 'italic',
              padding: '4px 0'
            }}>
              Aucune technologie
            </Box>
          );
        }
        
        return (
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            width: '100%',
            py: 0.5
          }}>
            {technologies.map((tech: string, index: number) => (
              <Chip 
                key={index}
                label={tech.trim()}
                size="small"
                sx={{
                  maxWidth: '100%',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                  fontSize: '0.75rem',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              />
            ))}
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="Modifier">
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen(params.row);
              }}
              aria-label="Modifier"
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                },
                transition: 'all 0.2s',
                p: '6px',
                m: '0 2px',
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(params.row._id, params.row.title || 'cette expérience');
              }}
              aria-label="Supprimer"
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                },
                transition: 'all 0.2s',
                p: '6px',
                m: '0 2px',
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Afficher un indicateur de chargement si nécessaire
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          Erreur lors du chargement des expériences: {error instanceof Error ? error.message : 'Erreur inconnue'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestion des Expériences
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Ajouter une expérience
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Rechercher..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              endAdornment: searchText && (
                <IconButton size="small" onClick={() => setSearchText('')}>
                  <Clear fontSize="small" />
                </IconButton>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => {
              // Fonction d'export simple
              const headers = ['Titre', 'Entreprise', 'Lieu', 'Début', 'Fin', 'Technologies', 'Description'];
              const csvContent = [
                headers.join(','),
                ...experiences.map(exp => [
                  `"${exp.title.replace(/"/g, '""')}"`,
                  `"${exp.company.replace(/"/g, '""')}"`,
                  `"${exp.location?.replace(/"/g, '""') || ''}"`,
                  new Date(exp.startDate).toLocaleDateString(),
                  exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'En cours',
                  `"${exp.technologies?.join(', ').replace(/"/g, '""') || ''}"`,
                  `"${exp.description?.replace(/"/g, '""') || ''}"`
                ].join(','))
              ].join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `experiences_${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exporter en CSV
          </Button>
        </Box>
        <Box sx={{ 
          height: 'calc(100vh - 200px)',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiDataGrid-root': {
            border: 'none',
            flex: 1,
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              '&:focus': {
                outline: 'none',
              }
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: 'action.hover',
                cursor: 'pointer',
              }
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.paper',
              borderBottom: '1px solid #e0e0e0',
            },
          }
        }}>
          {error ? (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error">
                Erreur lors du chargement des expériences. Veuillez réessayer.
                {error instanceof Error && ` (${error.message})`}
              </Alert>
            </Box>
          ) : null}
          {!isLoading && experiences.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Aucune expérience trouvée. Ajoutez votre première expérience en cliquant sur le bouton "Ajouter".
            </Alert>
          ) : null}
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={filteredExperiences}
              columns={columns}
              getRowId={(row) => row._id || Math.random().toString(36).substr(2, 9)}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              loading={isLoading}
              sortingMode="server"
              localeText={{
                // Textes de base
                noRowsLabel: 'Aucune donnée disponible',
                noResultsOverlayLabel: 'Aucun résultat trouvé.',
                
                // Barre d'outils
                toolbarColumns: 'Colonnes',
                toolbarFilters: 'Filtrer',
                toolbarExport: 'Exporter',
                toolbarExportCSV: 'Télécharger en CSV',
                toolbarExportPrint: 'Imprimer',
                toolbarDensity: 'Densité',
                toolbarDensityCompact: 'Compacte',
                toolbarDensityStandard: 'Standard',
                toolbarDensityComfortable: 'Confortable',
                
                // Menu des colonnes
                columnMenuLabel: 'Menu',
                columnMenuShowColumns: 'Afficher les colonnes',
                columnMenuFilter: 'Filtrer',
                columnMenuHideColumn: 'Masquer',
                columnMenuUnsort: 'Non trié',
                columnMenuSortAsc: 'Trier par ordre croissant',
                columnMenuSortDesc: 'Trier par ordre décroissant',
                
                // Panneau des colonnes
                columnsManagementSearchTitle: 'Rechercher une colonne',
                columnsManagementShowHideAllText: 'Tout afficher/masquer',
                columnsManagementNoColumns: 'Aucune colonne disponible',
                
                // Filtres
                filterPanelAddFilter: 'Ajouter un filtre',
                filterPanelDeleteIconLabel: 'Supprimer',
                filterPanelOperator: 'Opérateur',
                filterPanelOperatorAnd: 'Et',
                filterPanelOperatorOr: 'Ou',
                filterPanelColumns: 'Colonnes',
                filterPanelInputLabel: 'Valeur',
                filterPanelInputPlaceholder: 'Valeur du filtre',
                filterOperatorContains: 'contient',
                filterOperatorEquals: 'égal à',
                filterOperatorStartsWith: 'commence par',
                filterOperatorEndsWith: 'se termine par',
                filterOperatorIsEmpty: 'est vide',
                filterOperatorIsNotEmpty: 'n\'est pas vide',
                filterOperatorIsAnyOf: 'fait partie de',
                filterValueAny: 'n\'importe quelle valeur',
                filterValueTrue: 'Oui',
                filterValueFalse: 'Non',
                
                // Pagination
                MuiTablePagination: {
                  labelDisplayedRows: ({ from, to, count }: { from: number, to: number, count: number }) => 
                    `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`,
                  labelRowsPerPage: 'Lignes par page:',
                  getItemAriaLabel: (type: string) => {
                    switch (type) {
                      case 'first':
                        return 'Première page';
                      case 'last':
                        return 'Dernière page';
                      case 'next':
                        return 'Page suivante';
                      case 'previous':
                        return 'Page précédente';
                      default:
                        return '';
                    }
                  }
                }
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
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

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
            Êtes-vous sûr de vouloir supprimer l'expérience <strong>"{experienceToDelete?.title || ''}"</strong> ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cette action est irréversible et supprimera définitivement l'expérience.
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
            startIcon={deleteMutation.isPending ? <CircularProgress size={20} /> : <Delete />}
          >
            {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {currentExperience?._id ? 'Modifier une expérience' : 'Ajouter une expérience'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                name="title"
                label="Titre du poste"
                value={currentExperience?.title || ''}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="company"
                  label="Entreprise"
                  value={currentExperience?.company || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                />
                <TextField
                  name="location"
                  label="Lieu"
                  value={currentExperience?.location || ''}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="startDate"
                  label="Date de début"
                  type="date"
                  value={currentExperience?.startDate || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  name="endDate"
                  label="Date de fin (laisser vide si en cours)"
                  type="date"
                  value={currentExperience?.endDate || ''}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
              <TextField
                name="technologies"
                label="Technologies (séparées par des virgules)"
                value={currentExperience?.technologies || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="Ex: React, Node.js, TypeScript"
              />
              <TextField
                name="description"
                label="Description"
                value={currentExperience?.description || ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ExperiencesPage;
