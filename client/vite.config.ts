import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5002,
    host: '0.0.0.0', // Écoute sur toutes les interfaces réseau
    strictPort: true, // N'essaye pas de trouver un autre port si le port est occupé
    proxy: {
      // Proxy pour les requêtes API avec le préfixe /api/v1
      '^/api/v1/.*': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Important pour les cookies
        cookieDomainRewrite: '',
        // Ne pas réécrire le chemin, le serveur attend /api/v1
        rewrite: (path) => path,
      },
      // Proxy pour les requêtes d'API sans le préfixe /api/v1
      '^/(auth|experiences|skills|projects|educations|certifications)/.*': {
        target: 'http://localhost:5000/api/v1',
        changeOrigin: true,
        secure: false,
        // Important pour les cookies
        cookieDomainRewrite: '',
        // Réécrire le chemin pour ajouter /api/v1
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Ajouter des en-têtes nécessaires
            proxyReq.setHeader('Accept', 'application/json');
            // Transmettre les cookies de la requête originale
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // S'assurer que les en-têtes de cookies sont correctement transmis
            if (proxyRes.headers['set-cookie']) {
              // Remplacer le domaine si nécessaire
              const cookies = proxyRes.headers['set-cookie'].map(cookie => 
                cookie.replace(/;\s*secure;?/i, '')
                     .replace(/;\s*Domain=[^;]+/i, '')
              );
              proxyRes.headers['set-cookie'] = cookies;
            }
          });
        },
      },
      // Proxy pour les fichiers statiques dans /uploads
      '^/uploads/.*': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    },
    // Configuration HMR
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5002
    },
  },
  // Configuration pour le build de production
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Configuration pour optimiser le build de production
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
  // Variables d'environnement
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000/api/v1'),
    'process.env': {}
  },
  // Optimisation pour le développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
    force: true // Forcer la régénération du bundle lors du démarrage
  }
});
