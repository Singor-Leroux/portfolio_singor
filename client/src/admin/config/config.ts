// Configuration de l'application
const config = {
  // URL du serveur WebSocket (même port que le serveur HTTP)
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
  
  // Configuration de reconnexion
  reconnect: {
    maxAttempts: 5, // Nombre maximum de tentatives de reconnexion
    initialDelay: 1000, // Délai initial en ms
    maxDelay: 30000, // Délai maximum en ms
    factor: 2 // Facteur de backoff exponentiel
  }
} as const;

export default config;
