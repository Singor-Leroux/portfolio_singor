import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Container, Typography, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, SelectChangeEvent, CircularProgress, Alert, Snackbar, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, FileDownload, Search, Clear } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowParams, GridRenderCellParams } from '@mui/x-data-grid';
import { blue, green, orange, red, grey, yellow } from '@mui/material/colors';
import { Skill, getSkills, createSkill, updateSkill, deleteSkill, SkillLevel, SkillCreationPayload, SkillUpdatePayload } from '../api/skills';

const SkillsPage = () => {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<{ id: string, name: string } | null>(null);
  const [currentSkill, setCurrentSkill] = useState<Partial<Skill> | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({ open: false, message: '', severity: 'success' });
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const queryClient = useQueryClient();

  // Récupérer les compétences
  const { data: skills = [], isLoading, error } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: getSkills,
  });

  // Créer ou mettre à jour une compétence
  const mutation = useMutation({
    mutationFn: (skillData: Partial<Skill>) => {
      const { _id, name, level, category } = skillData;
      if (_id) {
        // Pour la mise à jour, ne passer que les champs qui peuvent être mis à jour
        const payload: SkillUpdatePayload = {};
        if (name) payload.name = name;
        if (level) payload.level = level;
        if (category) payload.category = category;
        return updateSkill(_id, payload);
      } else {
        // Pour la création, s'assurer que les champs requis sont présents
        if (!name || !category) {
          // Gérer l'erreur ou s'assurer que la validation se fait avant
          throw new Error('Nom et catégorie sont requis pour créer une compétence.');
        }
        const payload: SkillCreationPayload = { name, category };
        if (level) payload.level = level;
        return createSkill(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      handleClose();
      showSnackbar('Compétence enregistrée avec succès', 'success');
    },
    onError: () => {
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    }
  });

  // Supprimer une compétence
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      showSnackbar('Compétence supprimée avec succès', 'success');
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      showSnackbar(`Erreur lors de la suppression: ${error.message}`, 'error');
      setDeleteDialogOpen(false);
    },
  });

  const handleOpen = (skill: Partial<Skill> | null = null) => {
    setCurrentSkill(skill || { name: '', level: 'Débutant', category: 'other' }); // Default level as SkillLevel
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentSkill(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSkill) {
      mutation.mutate(currentSkill);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setSkillToDelete({ id, name });
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (skillToDelete) {
      deleteMutation.mutate(skillToDelete.id);
    }
  }, [skillToDelete, deleteMutation]);

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Erreur lors du chargement des compétences</Alert>;

  // Fonction pour obtenir la couleur en fonction du niveau
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant': return blue[500];
      case 'Intermédiaire': return yellow[500];
      case 'Confirmé': return orange[500];
      case 'Expert': return green[500];
      default: return grey[500];
    }
  };

  // Définition des colonnes du DataGrid
  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Nom', 
      flex: 1,
      minWidth: 200,
    },
    { 
      field: 'level', 
      headerName: 'Niveau', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: getLevelColor(params.value || ''),
            }}
          />
          {params.value || 'N/A'}
        </Box>
      ),
    },
    { 
      field: 'category', 
      headerName: 'Catégorie', 
      width: 150,
      valueGetter: (params) => {
        switch (params.value) {
          case 'frontend': return 'Frontend';
          case 'backend': return 'Backend';
          case 'database': return 'Base de données';
          case 'devops': return 'DevOps';
          case 'other': return 'Autre';
          default: return params.value;
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <Tooltip title="Modifier">
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen(params.row as Skill);
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
                m: '0 4px',
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
                handleDeleteClick(params.row._id, params.row.name);
              }}
              disabled={deleteMutation.isPending}
              aria-label="Supprimer"
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                },
                transition: 'all 0.2s',
                p: '6px',
                m: '0 4px',
              }}
            >
              {deleteMutation.isPending && skillToDelete?.id === params.row._id ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Delete fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestion des Compétences
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Ajouter une compétence
        </Button>
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
              const csvContent = [
                Object.keys(skills[0] || {}).join(','),
                ...skills.map(skill => Object.values(skill).join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `competences_${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exporter
          </Button>
        </Box>
        <DataGrid
          rows={skills.filter(skill => 
            skill.name.toLowerCase().includes(searchText.toLowerCase()) ||
            (skill.level && skill.level.toLowerCase().includes(searchText.toLowerCase())) ||
            (skill.category && skill.category.toLowerCase().includes(searchText.toLowerCase()))
          )}
          columns={columns}
          getRowId={(row) => row._id}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sortingMode="server"
          localeText={{
            // Textes de base
            noRowsLabel: 'Aucune donnée disponible',
            noResultsOverlayLabel: 'Aucun résultat trouvé.',
            
            // Barre d'outils
            toolbarColumns: 'Colonnes',
            toolbarFilters: 'Filtrer',
            
            // Menu des colonnes
            columnMenuShowColumns: 'Afficher les colonnes',
            columnMenuFilter: 'Filtrer',
            
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
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {currentSkill?._id ? 'Modifier la compétence' : 'Nouvelle compétence'} {/* Use _id */}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nom de la compétence"
              fullWidth
              variant="outlined"
              value={currentSkill?.name || ''}
              onChange={(e) => setCurrentSkill({ ...currentSkill, name: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={currentSkill?.category || 'other'}
                label="Catégorie"
                onChange={(e: SelectChangeEvent) => 
                  setCurrentSkill({ ...currentSkill, category: e.target.value as any })
                }
                required
              >
                <MenuItem value="frontend">Frontend</MenuItem>
                <MenuItem value="backend">Backend</MenuItem>
                <MenuItem value="database">Base de données</MenuItem>
                <MenuItem value="devops">DevOps</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Niveau</InputLabel>
              <Select
                value={currentSkill?.level || 'Débutant'} // Default to a SkillLevel value
                label="Niveau"
                onChange={(e: SelectChangeEvent) => 
                  setCurrentSkill({ ...currentSkill, level: e.target.value as SkillLevel })
                }
                // required // Level is optional in backend model, adjust if needed
              >
                <MenuItem value="Débutant">Débutant</MenuItem>
                <MenuItem value="Intermédiaire">Intermédiaire</MenuItem>
                <MenuItem value="Confirmé">Confirmé</MenuItem>
                <MenuItem value="Expert">Expert</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Enregistrement...' : currentSkill?._id ? 'Mettre à jour' : 'Créer'} {/* Use _id */}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
            Êtes-vous sûr de vouloir supprimer la compétence <strong>"{skillToDelete?.name}"</strong> ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cette action est irréversible et supprimera définitivement la compétence.
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

      {/* Snackbar pour les notifications */}
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

export default SkillsPage;
