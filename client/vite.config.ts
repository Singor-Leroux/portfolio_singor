import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5002,
    proxy: {
      // Proxy pour les requêtes API avec le préfixe /api/v1
      '/api/v1': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      },
      // Redirection pour les anciennes URLs sans /v1
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api/v1${path}`,
      },
      // Proxy pour les fichiers statiques dans /uploads
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // Configuration pour le build de production
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Variables d'environnement
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000/api/v1')
  }
});
