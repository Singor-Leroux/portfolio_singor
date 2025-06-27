import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// ThemeProvider sera fourni par ThemeContextProvider
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext'; // Importer notre fournisseur de thème
import App from './App';
// Temporairement désactivé pour permettre le build
// import reportWebVitals from './reportWebVitals';
// 'theme' n'est plus importé directement ici

// Suppression des logs en production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <AuthProvider> {/* AuthProvider peut être à l'intérieur ou à l'extérieur de ThemeContextProvider selon les besoins */} 
          {/* CssBaseline est déjà dans ThemeContextProvider, donc pas besoin ici si vous le laissez là-bas */}
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ThemeContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Temporairement désactivé pour permettre le build
// reportWebVitals(console.log);
