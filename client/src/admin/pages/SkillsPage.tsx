import { useState } from 'react';
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
  const [currentSkill, setCurrentSkill] = useState<Partial<Skill> | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({ open: false, message: '', severity: 'success' });
  const [searchText, setSearchText] = useState('');
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
    mutationFn: deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      showSnackbar('Compétence supprimée avec succès', 'success');
    },
    onError: () => {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
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
              onClick={() => handleOpen(params.row as Skill)}
              aria-label="Modifier"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
                  deleteMutation.mutate(params.row._id);
                }
              }}
              aria-label="Supprimer"
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, height: '100%' }}>
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
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(row) => row._id}
          disableSelectionOnClick
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
            columnsPanelTextFieldLabel: 'Rechercher une colonne',
            columnsPanelShowAllButton: 'Tout afficher',
            columnsPanelHideAllButton: 'Tout masquer',
            
            // Filtres
            filterPanelAddFilter: 'Ajouter un filtre',
            filterPanelDeleteIconLabel: 'Supprimer',
            filterPanelOperators: 'Opérateurs',
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
              labelRowsPerPage: 'Lignes par page:',
              labelDisplayedRows: ({ from, to, count }) => 
                `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            },
            
            // Messages
            noRowsLabel: 'Aucune donnée disponible',
            noResultsOverlayLabel: 'Aucun résultat trouvé.',
            errorOverlayDefaultLabel: 'Une erreur est survenue.'
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity as 'success' | 'error'} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SkillsPage;
