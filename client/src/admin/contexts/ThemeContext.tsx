import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';
import { createAppTheme } from '../theme'; // Importer la fonction de création de thème
import CssBaseline from '@mui/material/CssBaseline';

interface ThemeContextType {
  toggleTheme: () => void;
  mode: PaletteMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};

interface ThemeContextProviderProps {
  children: React.ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const storedPreference = localStorage.getItem('themeMode') as PaletteMode | null;
    return storedPreference || 'light'; // Default to light mode
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  // Supprimer l'ancienne logique de création de thème en dur
  /*
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // Vous pouvez personnaliser davantage vos palettes light et dark ici
          ...(mode === 'light'
            ? {
                // Palette pour le mode clair
                primary: { main: '#1976d2' }, // Bleu par défaut de MUI
                secondary: { main: '#dc004e' }, // Rose par défaut de MUI
                background: {
                  default: '#f4f6f8', // Un gris clair pour le fond
                  paper: '#ffffff',
                },
              }
            : {
                // Palette pour le mode sombre
                primary: { main: '#90caf9' }, // Un bleu plus clair pour le mode sombre
                secondary: { main: '#f48fb1' }, // Un rose plus clair pour le mode sombre
                background: {
                  default: '#121212', // Fond sombre standard
                  paper: '#1e1e1e', // Un peu plus clair pour les "papiers"
                },
                text: {
                  primary: '#ffffff',
                  secondary: 'rgba(255, 255, 255, 0.7)',
                }
              }),
        },
        // Vous pouvez ajouter d'autres personnalisations de thème ici (typographie, etc.)
      }),
    [mode]
  );
  */

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalise les styles et applique la couleur de fond */} 
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
