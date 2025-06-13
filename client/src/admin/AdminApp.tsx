import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import { createAppTheme } from './theme';
import { useMemo } from 'react';

const queryClient = new QueryClient();

export const AdminApp = () => {
  // Créer le thème avec la fonction createAppTheme
  const adminTheme = useMemo(
    () => createAppTheme('light'), // Utiliser 'dark' pour le mode sombre
    []
  );

  // Ajouter des surcharges spécifiques au thème si nécessaire
  const themeWithOverrides = useMemo(
    () => ({
      ...adminTheme,
      components: {
        ...adminTheme.components,
        MuiContainer: {
          styleOverrides: {
            root: {
              paddingLeft: '16px',
              paddingRight: '16px',
            },
          },
        },
      },
    }),
    [adminTheme]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={themeWithOverrides}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default AdminApp;
