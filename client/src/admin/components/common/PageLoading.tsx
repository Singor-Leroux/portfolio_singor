import { Box, CircularProgress } from '@mui/material';

export const PageLoading = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="60vh"
  >
    <CircularProgress size={60} />
  </Box>
);
