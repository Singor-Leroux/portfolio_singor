import { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';

const isProduction = import.meta.env.PROD;
const defaultWsUrl = isProduction 
  ? `${window.location.protocol === 'https:' ? 'wss://' : 'ws://'}${window.location.host}`
  : 'ws://localhost:5000';

export const WS_CONFIG: Partial<ManagerOptions & SocketOptions> = {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  withCredentials: true,
  query: {
    clientType: 'admin',
    version: '1.0.0',
    timestamp: Date.now()
  }
} as const;

export const getWebSocketUrl = (): string => {
  return import.meta.env.VITE_WS_URL || defaultWsUrl;
};

export const setupSocketListeners = (socket: Socket) => {
  const events = {
    connect: () => console.log('✅ Connecté au serveur WebSocket'),
    connect_error: (error: Error) => console.error('Erreur de connexion:', error),
    disconnect: (reason: string) => console.log(`Déconnecté: ${reason}`),
    error: (error: Error) => console.error('Erreur WebSocket:', error)
  };

  // Ajout des écouteurs
  Object.entries(events).forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  // Fonction de nettoyage
  return () => {
    Object.entries(events).forEach(([event, handler]) => {
      socket.off(event, handler as any);
    });
  };
};
