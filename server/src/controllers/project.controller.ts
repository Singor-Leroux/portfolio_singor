import { Request, Response, NextFunction } from 'express';
import { IRequestWithUser, IResponse } from '../types/express';
import { Server as SocketIOServer } from 'socket.io';
import ProjectModel, { IProject } from '../models/Project.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse.utils';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Types pour les événements WebSocket
type ProjectEvent = 'project:created' | 'project:updated' | 'project:deleted';

// Interface pour la structure des données d'événement
interface ProjectEventData {
  type: ProjectEvent;
  data: any;
  timestamp: string;
  userId?: string;
}

// Fonction utilitaire pour émettre des événements WebSocket
const emitProjectEvent = (req: IRequestWithUser, event: ProjectEvent, data: any) => {
  const io: SocketIOServer = req.app.get('io');
  if (io) {
    const eventData: ProjectEventData = {
      type: event,
      data,
      timestamp: new Date().toISOString(),
      userId: req.user?.id
    };
    
    // Émettre l'événement global
    io.emit(event, eventData);
    
    // Émettre dans une salle spécifique pour les mises à jour en temps réel
    io.to('projects').emit(`projects:${event}`, eventData);
  }
};

// @desc    Get all projects
// @route   GET /api/v1/projects
// @access  Private/Admin
// @query   featured (optional) - Filter by featured status
export const getProjects = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: NextFunction) => {
  try {
    // Build query
    let query: mongoose.Query<IProject[], IProject>;
    
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = ProjectModel.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
      const fields = (req.query.select as string).split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await ProjectModel.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const projects = await query;

    // Pagination result
    const pagination: any = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single project
// @route   GET /api/v1/projects/:id
// @access  Public
export const getProject = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: NextFunction) => {
  const project = await ProjectModel.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse(`Projet non trouvé avec l'ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private/Admin
interface CreateProjectBody {
  title: string;
  description: string;
  technologies: string | string[];
  githubUrl?: string;
  demoUrl?: string;
  featured?: boolean;
}

export const createProject = asyncHandler(async (req: IRequestWithUser & { body: CreateProjectBody }, res: IResponse, next: NextFunction) => {
  try {
    const { title, description, technologies, githubUrl, demoUrl, featured } = req.body;
    
    // Vérifier si les technologies sont fournies sous forme de chaîne et les convertir en tableau
    let techArray: string[] = [];
    if (typeof technologies === 'string') {
      techArray = technologies
        .split(',')
        .map((tech: string) => tech.trim())
        .filter((tech: string) => tech.length > 0);
    } else if (Array.isArray(technologies)) {
      techArray = technologies;
    }

    // Construire l'objet du projet
    const projectData: any = {
      title,
      description,
      technologies: techArray,
      featured: featured === 'true' || featured === true,
      user: req.user?.id,
    };

    // Ajouter les URLs optionnelles si elles existent
    if (githubUrl) projectData.githubUrl = githubUrl;
    if (demoUrl) projectData.demoUrl = demoUrl;

    // Gérer l'image si elle est fournie
    if (req.file) {
      // Utiliser un chemin relatif pour l'image téléversée
      projectData.imageUrl = `/uploads/projects/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // Si une URL d'image est fournie directement
      projectData.imageUrl = req.body.imageUrl;
      
      // Si c'est une URL complète, essayer de la convertir en chemin relatif
      if (projectData.imageUrl.startsWith('http')) {
        try {
          const url = new URL(projectData.imageUrl);
          projectData.imageUrl = url.pathname; // Ne garder que le chemin
        } catch (e) {
          // En cas d'erreur, on garde l'URL telle quelle
          console.warn('Impossible de parser l\'URL de l\'image:', projectData.imageUrl);
        }
      }
    } else {
      return next(new ErrorResponse('Une image est requise pour le projet', 400));
    }

    const project = await ProjectModel.create(projectData);

    // Émettre un événement WebSocket pour la création d'un projet
    emitProjectEvent(req, 'project:created', project);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', 'public', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
});

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private/Admin
interface UpdateProjectBody {
  id?: string;
  title?: string;
  description?: string;
  technologies?: string | string[];
  githubUrl?: string;
  demoUrl?: string;
  featured?: boolean;
  image?: string;
}

export const updateProject = asyncHandler(async (req: IRequestWithUser & { body: UpdateProjectBody }, res: IResponse, next: NextFunction) => {
  try {
    // Récupérer l'ID depuis les paramètres de la requête ou du body (pour les FormData)
    const projectId = req.params.id || req.body.id;
    
    if (!projectId) {
      return next(new ErrorResponse('ID du projet manquant', 400));
    }
    
    const { title, description, technologies, githubUrl, demoUrl, featured } = req.body;
    let techArray: string[] = [];
    
    // Vérifier si les technologies sont fournies sous forme de chaîne et les convertir en tableau
    if (technologies && typeof technologies === 'string') {
      techArray = technologies
        .split(',')
        .map((tech: string) => tech.trim())
        .filter((tech: string) => tech.length > 0);
    } else if (Array.isArray(technologies)) {
      techArray = technologies;
    }

    // Récupérer le projet avant la mise à jour pour avoir l'ancien état
    const oldProject = await ProjectModel.findById(projectId);
    if (!oldProject) {
      return next(new ErrorResponse(`Projet non trouvé avec l'ID ${projectId}`, 404));
    }

    // Construire l'objet de mise à jour
    const updateData: any = {
      title,
      description,
      technologies: techArray,
      featured: featured === 'true' || featured === true,
    };

    // Ajouter les URLs optionnelles si elles existent
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl || undefined;
    if (demoUrl !== undefined) updateData.demoUrl = demoUrl || undefined;

    // Gérer l'image si une nouvelle est fournie
    if (req.file) {
      // Utiliser un chemin relatif pour la nouvelle image
      updateData.imageUrl = `/uploads/projects/${req.file.filename}`;
      
      // Supprimer l'ancienne image si elle existe
      if (oldProject.imageUrl) {
        const oldImagePath = path.join(
          __dirname, 
          '..', 
          '..', 
          'public', 
          oldProject.imageUrl.startsWith('/') ? oldProject.imageUrl.substring(1) : oldProject.imageUrl
        );
        
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (req.body.imageUrl === '') {
      // Si l'image est supprimée (champ vide)
      updateData.imageUrl = '';
      
      // Supprimer l'ancienne image si elle existe
      if (oldProject.imageUrl) {
        const oldImagePath = path.join(
          __dirname, 
          '..', 
          '..', 
          'public', 
          oldProject.imageUrl.startsWith('/') ? oldProject.imageUrl.substring(1) : oldProject.imageUrl
        );
        
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (req.body.imageUrl) {
      // Si une URL d'image est fournie directement
      updateData.imageUrl = req.body.imageUrl;
      
      // Si c'est une URL complète, essayer de la convertir en chemin relatif
      if (updateData.imageUrl.startsWith('http')) {
        try {
          const url = new URL(updateData.imageUrl);
          updateData.imageUrl = url.pathname; // Ne garder que le chemin
        } catch (e) {
          // En cas d'erreur, on garde l'URL telle quelle
          console.warn('Impossible de parser l\'URL de l\'image:', updateData.imageUrl);
        }
      }
    }

    const project = await ProjectModel.findByIdAndUpdate(projectId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      // Supprimer le fichier uploadé en cas d'erreur
      if (req.file) {
        const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'projects', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return next(new ErrorResponse(`Projet non trouvé avec l'ID ${projectId}`, 404));
    }

    // Émettre un événement WebSocket pour la mise à jour du projet
    emitProjectEvent(req, 'project:updated', {
      old: oldProject,
      new: project
    });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'projects', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
});

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
// @access  Private/Admin
export const deleteProject = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: NextFunction) => {
  try {
    // Récupérer le projet avant la suppression pour l'événement
    const project = await ProjectModel.findById(req.params.id);
    
    if (!project) {
      return next(new ErrorResponse(`Projet non trouvé avec l'ID ${req.params.id}`, 404));
    }

    // Supprimer l'image associée si elle existe
    if (project.imageUrl) {
      const filePath = path.join(__dirname, '..', '..', 'public', project.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await project.deleteOne();

    // Émettre un événement WebSocket pour la suppression du projet
    emitProjectEvent(req, 'project:deleted', project);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get featured projects
// @route   GET /api/v1/projects/featured
// @access  Public
export const getFeaturedProjects = asyncHandler(async (req: IRequestWithUser, res: IResponse, next: NextFunction) => {
  const projects = await ProjectModel.find({ featured: true }).sort('-createdAt').limit(6);

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});
