import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Container, Typography, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress, Alert, Snackbar, Grid, IconButton
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams, GridActionsColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete, FileDownload, Search, Clear } from '@mui/icons-material';
import {
  EducationBE,
  EducationCreationPayload,
  EducationUpdatePayload,
  getEducations,
  createEducation,
  updateEducation,
  deleteEducation
} from '../api/education';

interface EducationFormState {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string; // Keep as string for form input, can be empty
  description: string;
}

const initialEducationFormState: EducationFormState = {
  degree: '',
  institution: '',
  startDate: '',
  endDate: '',
  description: ''
};

const EducationPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEducationForm, setCurrentEducationForm] = useState<EducationFormState>(initialEducationFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [searchText, setSearchText] = useState('');
  const queryClient = useQueryClient();

  const { data: educations = [], isLoading, error: queryError } = useQuery<EducationBE[], Error>({
    queryKey: ['educations'],
    queryFn: getEducations,
  });

  const mutation = useMutation<
    EducationBE,
    Error,
    EducationCreationPayload | EducationUpdatePayload
  >({
    mutationFn: async (educationData) => {
      if (editingId) {
        return updateEducation(editingId, educationData as EducationUpdatePayload);
      }
      return createEducation(educationData as EducationCreationPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations'] });
      setOpenDialog(false);
      showSnackbar(`Formation ${editingId ? 'mise à jour' : 'créée'} avec succès`, 'success');
      setEditingId(null);
    },
    onError: (err) => {
      showSnackbar(`Erreur lors de la ${editingId ? 'mise à jour' : 'création'} de la formation: ${err.message}`, 'error');
    }
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations'] });
      showSnackbar('Formation supprimée avec succès', 'success');
    },
    onError: (err) => {
      showSnackbar(`Erreur lors de la suppression: ${err.message}`, 'error');
    }
  });

  const handleOpenCreateDialog = () => {
    setCurrentEducationForm(initialEducationFormState);
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (education: EducationBE) => {
    setEditingId(education._id);
    setCurrentEducationForm({
      degree: education.degree,
      institution: education.institution,
      startDate: education.startDate, // Assuming dates are stored as YYYY-MM-DD or compatible
      endDate: education.endDate || '',
      description: education.description || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEducationForm(initialEducationFormState);
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const payload: EducationCreationPayload | EducationUpdatePayload = {
      degree: currentEducationForm.degree,
      institution: currentEducationForm.institution,
      startDate: currentEducationForm.startDate,
      ...(currentEducationForm.endDate && { endDate: currentEducationForm.endDate }),
      ...(currentEducationForm.description && { description: currentEducationForm.description }),
    };

    mutation.mutate(payload);
  };
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCurrentEducationForm(prev => ({ ...prev, [name]: value }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const columns: GridColDef<EducationBE>[] = [
    { field: 'degree', headerName: 'Diplôme', flex: 1.5, minWidth: 200 },
    { field: 'institution', headerName: 'Établissement', flex: 1.5, minWidth: 200 },
    { 
      field: 'startDate', 
      headerName: 'Début', 
      flex: 0.7, 
      minWidth: 100, 
      type: 'date',
      valueGetter: (params: { row: EducationBE }) => {
        if (!params?.row?.startDate) return null;
        try {
          const date = new Date(params.row.startDate);
          return isNaN(date.getTime()) ? null : date;
        } catch (e) {
          return null;
        }
      },
      renderCell: (params) => {
        if (!params?.value) return 'Non spécifié';
        try {
          return params.value.toLocaleDateString();
        } catch (e) {
          return 'Date invalide';
        }
      }
    },
    { 
      field: 'endDate', 
      headerName: 'Fin', 
      flex: 0.7, 
      minWidth: 100, 
      type: 'date',
      valueGetter: (params: { row: EducationBE }) => {
        if (!params?.row?.endDate) return null;
        try {
          const date = new Date(params.row.endDate);
          return isNaN(date.getTime()) ? null : date;
        } catch (e) {
          return null;
        }
      },
      renderCell: (params) => {
        if (!params?.value) return 'En cours';
        try {
          return params.value.toLocaleDateString();
        } catch (e) {
          return 'Date invalide';
        }
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: (params: GridRowParams<EducationBE>): JSX.Element[] => [
        <div key="edit" onClick={() => handleOpenEditDialog(params.row)}>
          {/* @ts-expect-error - Workaround for MUI GridActionsCellItem type issue */}
          <GridActionsCellItem
            icon={<Edit />}
            label="Modifier"
            showInMenu={false}
            aria-label="Modifier"
          />
        </div>,
        <div key="delete" onClick={() => !deleteMutation.isPending && deleteMutation.mutate(params.row._id)}>
          {/* @ts-expect-error - Workaround for MUI GridActionsCellItem type issue */}
          <GridActionsCellItem
            icon={<Delete />}
            label="Supprimer"
            disabled={deleteMutation.isPending}
            showInMenu={false}
            aria-label="Supprimer"
          />
        </div>,
      ],
    } as GridActionsColDef<EducationBE>,
  ];

  // Filtrer les formations en fonction de la recherche
  const filteredEducations = React.useMemo(() => {
    if (!educations) return [];
    return educations.filter(edu => 
      edu.degree.toLowerCase().includes(searchText.toLowerCase()) ||
      edu.institution.toLowerCase().includes(searchText.toLowerCase()) ||
      (edu.description && edu.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [educations, searchText]);

  if (isLoading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
  if (queryError) return <Container sx={{ mt: 2 }}><Alert severity="error">Erreur lors du chargement des formations: {queryError.message}</Alert></Container>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des Formations
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
        >
          Ajouter une Formation
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
                ['Diplôme', 'Établissement', 'Début', 'Fin', 'Description'].join(','),
                ...filteredEducations.map(edu => [
                  `"${edu.degree.replace(/"/g, '""')}"`,
                  `"${edu.institution.replace(/"/g, '""')}"`,
                  new Date(edu.startDate).toLocaleDateString(),
                  edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'En cours',
                  `"${edu.description?.replace(/"/g, '""') || ''}"`
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `formations_${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exporter en CSV
          </Button>
        </Box>
        <DataGrid
          rows={filteredEducations}
          columns={columns}
          getRowId={(row: EducationBE) => row._id}
          loading={isLoading || mutation.isPending || deleteMutation.isPending}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? 'Modifier la Formation' : 'Nouvelle Formation'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{pt: 1}}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  name="degree"
                  label="Diplôme"
                  type="text"
                  fullWidth
                  value={currentEducationForm.degree}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="institution"
                  label="Établissement"
                  type="text"
                  fullWidth
                  value={currentEducationForm.institution}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="startDate"
                  label="Date de début"
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={currentEducationForm.startDate}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="endDate"
                  label="Date de fin (optionnel)"
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={currentEducationForm.endDate}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="description"
                  label="Description (optionnel)"
                  type="text"
                  fullWidth
                  multiline
                  rows={4}
                  value={currentEducationForm.description}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={mutation.isPending}>
              {mutation.isPending ? <CircularProgress size={24} /> : editingId ? 'Mettre à jour' : 'Créer'}
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EducationPage;
