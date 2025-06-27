import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Project } from '../types/project';

interface ProjectEventHandlers {
  onProjectCreated?: (project: Project) => void;
  onProjectUpdated?: (data: { old: Project; new: Project }) => void;
  onProjectDeleted?: (project: Project) => void;
}

export const useProjectSocket = (handlers: ProjectEventHandlers) => {
  const { socket, isConnected } = useSocket();

  // Rejoindre la salle des projets lors de la connexion
  useEffect(() => {
    if (isConnected && socket) {
      console.log('🔌 Rejoindre la salle "projects"');
      socket.emit('joinRoom', 'projects');

      return () => {
        console.log('🚪 Quitter la salle "projects"');
        socket.emit('leaveRoom', 'projects');
      };
    }
  }, [socket, isConnected]);

  // Gestion des événements de projet
  useEffect(() => {
    if (!socket) return;

    // Fonction de gestion des événements
    const handleProjectCreated = (data: any) => {
      console.log('🎉 Nouveau projet créé:', data);
      if (handlers.onProjectCreated) {
        handlers.onProjectCreated(data.data);
      }
    };

    const handleProjectUpdated = (data: any) => {
      console.log('🔄 Projet mis à jour:', data);
      if (handlers.onProjectUpdated) {
        handlers.onProjectUpdated(data.data);
      }
    };

    const handleProjectDeleted = (data: any) => {
      console.log('🗑️ Projet supprimé:', data);
      if (handlers.onProjectDeleted) {
        handlers.onProjectDeleted(data.data);
      }
    };

    // S'abonner aux événements
    socket.on('project:created', handleProjectCreated);
    socket.on('project:updated', handleProjectUpdated);
    socket.on('project:deleted', handleProjectDeleted);

    // Nettoyage des écouteurs
    return () => {
      socket.off('project:created', handleProjectCreated);
      socket.off('project:updated', handleProjectUpdated);
      socket.off('project:deleted', handleProjectDeleted);
    };
  }, [socket, handlers]);

  // Fonction pour forcer une actualisation des données
  const refreshProjects = useCallback(() => {
    if (socket) {
      console.log('🔄 Actualisation des projets demandée');
      // Vous pouvez émettre un événement personnalisé si nécessaire
      // socket.emit('refresh:projects');
    }
  }, [socket]);

  return { refreshProjects };
};

export default useProjectSocket;
