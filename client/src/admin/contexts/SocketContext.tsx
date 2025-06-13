import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '../config/config';

interface ISocketContext {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const reconnectAttempts = useRef(0);

  const connect = () => {
    if (socketRef.current?.connected) return;

    // Configuration de la connexion WebSocket
    socketRef.current = io(config.wsUrl, {
      autoConnect: false,
      reconnection: false,
      transports: ['websocket'],
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Gestion des événements de connexion
    const handleConnect = () => {
      console.log('✅ Connecté au serveur WebSocket');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    // Gestion des déconnexions
    const handleDisconnect = (reason: string) => {
      console.log('❌ Déconnecté du serveur WebSocket:', reason);
      setIsConnected(false);
      
      // Tentative de reconnexion avec backoff exponentiel
      if (reconnectAttempts.current < config.reconnect.maxAttempts) {
        const delay = Math.min(
          config.reconnect.initialDelay * Math.pow(config.reconnect.factor, reconnectAttempts.current),
          config.reconnect.maxDelay
        );
        
        reconnectAttempts.current++;
        console.log(`🔄 Tentative de reconnexion ${reconnectAttempts.current}/${config.reconnect.maxAttempts} dans ${delay}ms...`);
        
        const timeoutId = setTimeout(() => {
          if (socket && !socket.connected) {
            console.log('🔌 Tentative de reconnexion en cours...');
            socket.connect();
          }
        }, delay);

        // Nettoyer le timeout si le composant est démonté
        return () => clearTimeout(timeoutId);
      } else {
        console.error('🚫 Nombre maximum de tentatives de reconnexion atteint');
      }
    };

    // Gestion des erreurs de connexion
    const handleConnectError = (error: Error) => {
      console.error('❌ Erreur de connexion WebSocket:', error.message);
      setIsConnected(false);
    };

    // Ajout des écouteurs d'événements
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Établir la connexion
    console.log('🔗 Connexion au serveur WebSocket...');
    socket.connect();

    // Nettoyage des écouteurs lors du démontage
    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
      }
    };
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const joinRoom = (room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', room);
    }
  };

  const leaveRoom = (room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveRoom', room);
    }
  };

  // Se connecter au montage du composant et se déconnecter au démontage
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        connect,
        disconnect,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
