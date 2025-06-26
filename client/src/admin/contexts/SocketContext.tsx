import React, { createContext, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_CONFIG, getWebSocketUrl, setupSocketListeners } from '../config/websocket';

type EventCallback<T = any> = (data: T) => void;

interface ISocketContext {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  emit: <T = any>(event: string, data?: any, callback?: (response: T) => void) => void;
  on: <T = any>(event: string, callback: (data: T) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

const initialContext: ISocketContext = {
  socket: null,
  isConnected: false,
  connect: () => { console.warn('SocketContext not initialized') },
  disconnect: () => { console.warn('SocketContext not initialized') },
  joinRoom: () => { console.warn('SocketContext not initialized') },
  leaveRoom: () => { console.warn('SocketContext not initialized') },
  emit: () => { console.warn('SocketContext not initialized') },
  on: () => { console.warn('SocketContext not initialized') },
  off: () => { console.warn('SocketContext not initialized') },
};

const SocketContext = createContext<ISocketContext>(initialContext);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const eventListeners = useRef<Map<string, EventCallback[]>>(new Map());
  const cleanupRef = useRef<() => void>();

  // Gestion de la connexion WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('WebSocket déjà connecté');
      return;
    }

    // Nettoyer la connexion existante
    const cleanupExistingConnection = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
    };
    
    // Nettoyer avant de créer une nouvelle connexion
    cleanupExistingConnection();

    // Créer une nouvelle instance de socket
    const socket = io(getWebSocketUrl(), {
      ...WS_CONFIG,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Configurer les écouteurs d'événements
    cleanupRef.current = setupSocketListeners(socket);

    // Gestion des événements de connexion
    const handleConnect = () => {
      setIsConnected(true);
      console.log('✅ Connexion WebSocket établie');
    };

    // Gestion des déconnexions
    const handleDisconnect = (reason: string) => {
      console.log('❌ Déconnecté du serveur WebSocket:', reason);
      setIsConnected(false);
      
      // Tentative de reconnexion avec délai fixe
      const delay = 5000; // 5 secondes
      console.log(`🔄 Tentative de reconnexion dans ${delay}ms...`);
      
      const timeoutId = setTimeout(() => {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      }, delay);

      return () => clearTimeout(timeoutId);
    };

    // Gestion des erreurs de connexion
    const handleConnectError = (error: Error) => {
      console.error('Erreur de connexion WebSocket:', error);
      setIsConnected(false);
      
      // Réessayer avec une stratégie de backoff exponentiel
      const delay = Math.min(1000 * Math.pow(2, 0), 30000);
      
      console.log(`Tentative de reconnexion dans ${delay}ms`);
      
      setTimeout(() => {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      }, delay);
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
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      
      // Nettoyer les ressources
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
    };
  }, []);

  // Gestion de la déconnexion
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  }, []);

  // Rejoindre une salle
  const joinRoom = useCallback((room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('joinRoom', room);
    }
  }, []);

  // Quitter une salle
  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', room);
    }
  }, []);

  // Émettre un événement
  const emit = useCallback(<T = any>(
    event: string, 
    data?: any, 
    callback?: (response: T) => void
  ) => {
    if (socketRef.current) {
      return socketRef.current.emit(event, data, callback);
    }
    console.warn('Tentative d\'émission sans connexion WebSocket');
  }, []);

  // S'abonner à un événement
  const on = useCallback(<T = any>(
    event: string, 
    callback: (data: T) => void
  ) => {
    if (!socketRef.current) return;
    
    // Ajouter le callback à la liste des écouteurs
    const listeners = eventListeners.current.get(event) || [];
    eventListeners.current.set(event, [...listeners, callback]);
    
    // Ajouter l'écouteur au socket
    socketRef.current.on(event, callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      socketRef.current?.off(event, callback);
      const updatedListeners = (eventListeners.current.get(event) || [])
        .filter(cb => cb !== callback);
      
      if (updatedListeners.length > 0) {
        eventListeners.current.set(event, updatedListeners);
      } else {
        eventListeners.current.delete(event);
      }
    };
  }, []);

  // Se désabonner d'un événement
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (!socketRef.current) return;
    
    if (callback) {
      socketRef.current.off(event, callback);
      const listeners = (eventListeners.current.get(event) || [])
        .filter(cb => cb !== callback);
      
      if (listeners.length > 0) {
        eventListeners.current.set(event, listeners);
      } else {
        eventListeners.current.delete(event);
      }
    } else {
      // Supprimer tous les écouteurs pour cet événement
      const listeners = eventListeners.current.get(event) || [];
      listeners.forEach(listener => {
        socketRef.current?.off(event, listener);
      });
      eventListeners.current.delete(event);
    }
  }, []);

  // Nettoyage à la suppression du composant
  useEffect(() => {
    // Fonction de nettoyage
    const cleanup = () => {
      // Supprimer tous les écouteurs
      eventListeners.current.forEach((listeners, event) => {
        listeners.forEach(callback => {
          socketRef.current?.off(event, callback);
        });
      });
      eventListeners.current.clear();
      
      // Nettoyer la connexion
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
      
      // Fermer la connexion WebSocket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    
    // Retourner la fonction de nettoyage
    return cleanup;
  }, []);

  // Valeur du contexte
  const contextValue = useMemo(() => ({
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    emit,
    on,
    off
  }), [isConnected, connect, disconnect, joinRoom, leaveRoom, emit, on, off]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
