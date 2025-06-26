import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5002,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      // Proxy pour toutes les requêtes API
      '^/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Transmettre les cookies de la requête originale
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
            // Ajouter des en-têtes nécessaires
            proxyReq.setHeader('x-forwarded-proto', 'http');
            proxyReq.setHeader('x-forwarded-host', 'localhost:5002');
            proxyReq.setHeader('host', 'localhost:5000');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // S'assurer que les en-têtes de cookies sont correctement transmis
            if (proxyRes.headers['set-cookie']) {
              // Supprimer les attributs de cookie problématiques
              const cookies = proxyRes.headers['set-cookie'].map(cookie => 
                cookie
                  .replace(/;\s*secure;?/i, '')
                  .replace(/;\s*Domain=[^;]+/i, '')
                  .replace(/;\s*SameSite=(Strict|Lax|None)/i, '')
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
    // Configuration CORS pour le développement
    cors: {
      origin: 'http://localhost:5002',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
  },
  // Configuration du build
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['axios', 'jwt-decode', 'socket.io-client'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled']
        }
      }
    }
  },
  // Configuration des alias
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@context': fileURLToPath(new URL('./src/context', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url))
    }
  },
  // Configuration des variables d'environnement
  define: {
    'process.env': {},
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000/api/v1')
  },
  // Configuration du serveur de développement
  preview: {
    port: 5002,
    strictPort: true,
    host: '0.0.0.0',
    cors: {
      origin: 'http://localhost:5002',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  }
});
