import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Container, Typography, Dialog, DialogTitle, Paper,
  DialogContent, DialogActions, TextField, CircularProgress, Alert, Snackbar,
  Link, Avatar, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import {
  DataGrid, GridColDef, GridRowParams
} from '@mui/x-data-grid';
import { Add, Edit, Delete, Link as LinkIcon, Image as ImageIcon, Search, Clear, FileDownload } from '@mui/icons-material';
import {
  CertificationBE,
  CertificationCreationPayload,
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from '../api/certifications';

// Form state type, combining BE and CreationPayload for flexibility
type CertificationFormState = Partial<CertificationBE> & Partial<CertificationCreationPayload>;

const CertificationsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificationToDelete, setCertificationToDelete] = useState<{ id: string, title: string } | null>(null);
  const [currentCertification, setCurrentCertification] = useState<CertificationFormState | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the selected file
  const [searchText, setSearchText] = useState(''); // State pour la barre de recherche
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const queryClient = useQueryClient();

  const { data: certifications = [], isLoading, error: queryError } = useQuery<CertificationBE[]>({ // Updated type
    queryKey: ['certifications'],
    queryFn: getCertifications,
  });

  const handleMutationSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ['certifications'] });
    setOpenDialog(false);
    setCurrentCertification(null);
    showSnackbar(message, 'success');
  };

  const handleMutationError = (defaultMessage: string, error?: any) => {
    const message = error?.response?.data?.message || defaultMessage;
    showSnackbar(message, 'error');
  };

  const upsertMutation = useMutation({ // Type for payload.data is now FormData
    mutationFn: (payload: { id?: string; data: FormData }) =>
      payload.id
        ? updateCertification(payload.id, payload.data)
        : createCertification(payload.data),
    onSuccess: () => handleMutationSuccess(`Certification ${currentCertification?._id ? 'mise à jour' : 'créée'} avec succès.`),
    onError: (error) => handleMutationError(`Erreur lors de la sauvegarde de la certification.`, error),
  });

  const removeMutation = useMutation({
    mutationFn: deleteCertification,
    onSuccess: () => {
      handleMutationSuccess('Certification supprimée avec succès.');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      handleMutationError('Erreur lors de la suppression de la certification.', error);
      setDeleteDialogOpen(false);
    },
  });

  const handleDeleteClick = (id: string, title: string) => {
    setCertificationToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (certificationToDelete) {
      removeMutation.mutate(certificationToDelete.id);
    }
  };

  const handleOpenDialog = useCallback((certification: CertificationBE | null = null) => {
    setSelectedFile(null); // Reset selected file on dialog open
    if (certification) {
      setCurrentCertification({
        _id: certification._id,
        title: certification.title,
        issuer: certification.issuer,
        date: certification.date, 
        credentialUrl: certification.credentialUrl,
        imageUrl: certification.imageUrl,
      });
    } else {
      setCurrentCertification({ title: '', issuer: '', date: '', credentialUrl: '', imageUrl: '' });
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCertification(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentCertification) return;

    const formData = new FormData();
    formData.append('title', currentCertification.title || '');
    formData.append('issuer', currentCertification.issuer || '');
    formData.append('date', currentCertification.date || '');
    formData.append('credentialUrl', currentCertification.credentialUrl || '');

    if (selectedFile) {
      // Si un nouveau fichier est sélectionné, l'ajouter au FormData
      formData.append('certificationImage', selectedFile);
      console.log('Nouveau fichier sélectionné:', selectedFile.name);
    } else if (currentCertification.imageUrl) {
      // Si pas de nouveau fichier mais qu'il y a une image existante, conserver l'URL
      formData.append('imageUrl', currentCertification.imageUrl);
      console.log('Conservation de l\'image existante:', currentCertification.imageUrl);
    } else {
      // Si aucune image n'est sélectionnée et qu'il n'y a pas d'image existante
      formData.append('imageUrl', '');
      console.log('Aucune image sélectionnée');
    }

    console.log('Envoi du formulaire avec les données:', {
      id: currentCertification._id,
      hasFile: !!selectedFile,
      hasExistingImage: !!currentCertification.imageUrl
    });

    upsertMutation.mutate({ 
      id: currentCertification._id, 
      data: formData 
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const columns = useMemo<GridColDef<CertificationBE>[]>(() => [
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 100,
      renderCell: (params) => {
        const imageUrl = params.value as string | undefined;
        
        // Log pour débogage
        const fullUrl = imageUrl 
          ? `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
          : undefined;
          
        console.log('Image URL in row:', {
          rawUrl: imageUrl,
          fullUrl,
          rowId: params.row._id,
          title: params.row.title
        });
        
        if (!imageUrl) {
          return (
            <Avatar 
              variant="rounded" 
              sx={{ 
                width: 56, 
                height: 56,
                bgcolor: 'action.hover'
              }}
            >
              <ImageIcon color="action" />
            </Avatar>
          );
        }
        
        return (
          <Box sx={{ 
            width: 56, 
            height: 56, 
            borderRadius: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover'
          }}>
            <img 
              src={fullUrl} 
              alt={params.row.title || 'Certification'}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
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
    { field: 'title', headerName: 'Titre', width: 250, flex:1 },
    { field: 'issuer', headerName: 'Émetteur', width: 200, flex:1 },
    {
      field: 'date',
      headerName: 'Date d\'obtention',
      width: 150,
      valueFormatter: ({ value }) => value ? new Date(value as string | number | Date).toLocaleDateString('fr-FR') : '', // Format date for display
    },
    {
      field: 'credentialUrl',
      headerName: 'Lien',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <IconButton component={Link} href={params.value} target="_blank" rel="noopener">
            <LinkIcon />
          </IconButton>
        ) : null
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      cellClassName: 'actions',
      getActions: (params: GridRowParams<CertificationBE>): JSX.Element[] => [
        <Tooltip key="edit" title="Modifier">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(params.row);
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
        </Tooltip>,
        <Tooltip key="delete" title="Supprimer">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(params.row._id, params.row.title || 'cette certification');
            }}
            aria-label="Supprimer"
            disabled={removeMutation.isPending}
            sx={{
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.contrastText',
              },
              '&.Mui-disabled': {
                color: 'action.disabled',
              },
              transition: 'all 0.2s',
              p: '6px',
              m: '0 2px',
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>,
      ],
    },
  ], [handleOpenDialog, removeMutation]);

  // Filtrer les certifications en fonction de la recherche
  const filteredCertifications = useMemo(() => {
    if (!certifications) return [];
    return certifications.filter(cert => 
      cert.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (cert.issuer && cert.issuer.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [certifications, searchText]);

  function CustomToolbar() {
    return (
      <Box sx={{width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Rechercher..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 250 }}
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
                ['Titre', 'Émetteur', 'Date', 'Lien'].join(','),
                ...filteredCertifications.map(cert => [
                  `"${(cert.title || '').replace(/"/g, '""')}"`,
                  `"${(cert.issuer || '').replace(/"/g, '""')}"`,
                  cert.date ? new Date(cert.date).toLocaleDateString() : '',
                  `"${cert.credentialUrl || ''}"`
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `certifications_${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exporter
          </Button>
        </Box>
      </Box>
    );
  }

  if (isLoading) return <Box display="flex" justifyContent="center" alignItems="center" height="80vh"><CircularProgress /></Box>;
  if (queryError instanceof Error) return <Alert severity="error">Erreur lors du chargement des certifications: {queryError.message}</Alert>;
  if (queryError) return <Alert severity="error">Une erreur inconnue est survenue lors du chargement des certifications.</Alert>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestion des Certifications
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 2 }}
        >
          Ajouter une certification
        </Button>
      </Box>
      
      <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <CustomToolbar />
        <DataGrid
          rows={filteredCertifications}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading || upsertMutation.isPending || removeMutation.isPending}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sortingMode="server"
          sortModel={[{ field: 'date', sort: 'desc' }]}
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
            footerRowSelected: (count: number) =>
              count !== 1
                ? `${count} certifications sélectionnées`
                : '1 certification sélectionnée',
            paginationRowsPerPage: 'Certifications par page:'
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
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: (theme) => 
                theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'
            },
            '& .MuiDataGrid-cell': { 
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
            },
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <DialogTitle>
            {currentCertification?._id ? 'Modifier la certification' : 'Nouvelle certification'}
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}> {/* Reduced top padding */}
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Titre de la certification"
              fullWidth
              variant="outlined"
              value={currentCertification?.title || ''}
              onChange={(e) => setCurrentCertification(prev => ({ ...prev, title: e.target.value }))}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="issuer"
              label="Organisme émetteur"
              fullWidth
              variant="outlined"
              value={currentCertification?.issuer || ''}
              onChange={(e) => setCurrentCertification(prev => ({ ...prev, issuer: e.target.value }))}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="date"
              label="Date d'obtention"
              type="date" // Use date type for better UX, backend expects YYYY-MM-DD or parsable string
              fullWidth
              variant="outlined"
              value={currentCertification?.date || ''} // Ensure this is in 'yyyy-mm-dd' for input type=date
              onChange={(e) => setCurrentCertification(prev => ({ ...prev, date: e.target.value }))}
              required
              InputLabelProps={{ shrink: true }}
              helperText="Format YYYY-MM-DD"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="credentialUrl"
              label="Lien vers la certification (URL)"
              type="url"
              fullWidth
              variant="outlined"
              value={currentCertification?.credentialUrl || ''}
              onChange={(e) => setCurrentCertification(prev => ({ ...prev, credentialUrl: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            {/* Image Upload and Preview Section */}
            <Box mt={2} mb={1}>
              <Typography variant="subtitle2" gutterBottom>Image de la certification</Typography>
              
              {/* Aperçu de l'image */}
              <Box 
                sx={{ 
                  width: 200, 
                  height: 150, 
                  border: '1px dashed', 
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden',
                  mb: 2,
                  bgcolor: 'action.hover',
                  position: 'relative'
                }}
              >
                {selectedFile ? (
                  <img 
                    src={URL.createObjectURL(selectedFile)}
                    alt="Aperçu de la nouvelle image"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain' 
                    }}
                    onError={(e) => {
                      console.error('Erreur de chargement de l\'aperçu de l\'image');
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.style.display = 'none';
                    }}
                  />
                ) : currentCertification?.imageUrl ? (
                  <img 
                    src={`http://localhost:5000${currentCertification.imageUrl.startsWith('/') ? '' : '/'}${currentCertification.imageUrl}`}
                    alt={`Aperçu de ${currentCertification.title || 'la certification'}`}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain' 
                    }}
                    onError={(e) => {
                      console.error('Erreur de chargement de l\'image existante:', currentCertification.imageUrl);
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="caption" display="block" color="text.secondary">
                      Aucune image sélectionnée
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button 
                  component="label" 
                  variant="outlined" 
                  size="small"
                  startIcon={<ImageIcon />}
                >
                  {selectedFile || currentCertification?.imageUrl ? 'Remplacer' : 'Ajouter une image'}
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event.target.files && event.target.files[0]) {
                        setSelectedFile(event.target.files[0]);
                      } else {
                        setSelectedFile(null);
                      }
                      event.target.value = ''; 
                    }}
                  />
                </Button>
                
                {(selectedFile || currentCertification?.imageUrl) && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    startIcon={<Delete />}
                    onClick={() => {
                      setSelectedFile(null);
                      setCurrentCertification(prev => ({ ...prev!, imageUrl: '' }));
                    }}
                  >
                    Supprimer
                  </Button>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? <CircularProgress size={24} /> : (currentCertification?._id ? 'Enregistrer les modifications' : 'Créer')}
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
            Êtes-vous sûr de vouloir supprimer la certification <strong>"{certificationToDelete?.title || ''}"</strong> ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cette action est irréversible et supprimera définitivement la certification.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            autoFocus
            disabled={removeMutation.isPending}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            disabled={removeMutation.isPending}
            startIcon={removeMutation.isPending ? <CircularProgress size={20} /> : <Delete />}
          >
            {removeMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CertificationsPage;
