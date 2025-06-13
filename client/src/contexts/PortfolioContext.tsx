import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type Skill, type Project, type Certification, type Education, type Experience } from '../services/api'; 

type CreateSkillInput = Omit<Skill, '_id' | 'createdAt' | 'updatedAt'>;
type UpdateSkillInput = Partial<Omit<Skill, '_id' | 'createdAt' | 'updatedAt'>>;
type CreateProjectInput = FormData;
type UpdateProjectInput = FormData;

interface PortfolioContextType {
  // Données
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  education: Education[];
  experience: Experience[];
  
  // États de chargement
  isLoading: boolean;
  isError: boolean;
  
  // Mutations pour les compétences
  createSkill: (data: CreateSkillInput) => Promise<Skill>;
  updateSkill: (id: string, data: UpdateSkillInput) => Promise<Skill>;
  deleteSkill: (id: string) => Promise<{ _id: string }>;
  
  // Mutations pour les projets
  createProject: (data: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectInput) => Promise<Project>;
  deleteProject: (id: string) => Promise<{ _id: string }>;
  
  // Rafraîchissement des données
  refetchAll: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Configuration des requêtes
  const queryConfig = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  };

  // Requêtes pour récupérer les données
  const {
    data: skills = [],
    isLoading: isLoadingSkills,
    isError: isErrorSkills,
  } = useQuery(['skills'], apiService.getSkills, queryConfig);

  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
  } = useQuery(['projects'], apiService.getProjects, queryConfig);

  const {
    data: certifications = [],
    isLoading: isLoadingCerts,
    isError: isErrorCerts,
  } = useQuery(['certifications'], apiService.getCertifications, queryConfig);

  const {
    data: education = [],
    isLoading: isLoadingEdu,
    isError: isErrorEdu,
  } = useQuery(['education'], apiService.getEducation, queryConfig);

  const {
    data: experience = [],
    isLoading: isLoadingExp,
    isError: isErrorExp,
  } = useQuery(['experience'], apiService.getExperiences, queryConfig);

  // Mutations pour les compétences
  const { mutateAsync: createSkillMutation } = useMutation(apiService.createSkill, {
    onSuccess: () => {
      queryClient.invalidateQueries(['skills']);
    },
  });

  const { mutateAsync: updateSkillMutation } = useMutation(
    ({ id, data }: { id: string; data: UpdateSkillInput }) => 
      apiService.updateSkill(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['skills']);
      },
    }
  );

  const { mutateAsync: deleteSkillMutation } = useMutation(apiService.deleteSkill, {
    onSuccess: () => {
      queryClient.invalidateQueries(['skills']);
    },
  });

  // Mutations pour les projets
  const { mutateAsync: createProjectMutation } = useMutation(apiService.createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });

  const { mutateAsync: updateProjectMutation } = useMutation(
    ({ id, data }: { id: string; data: UpdateProjectInput }) => 
      apiService.updateProject(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      },
    }
  );

  const { mutateAsync: deleteProjectMutation } = useMutation(apiService.deleteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });

  // Fonction pour rafraîchir toutes les données
  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  // État de chargement global
  const isLoading = [
    isLoadingSkills,
    isLoadingProjects,
    isLoadingCerts,
    isLoadingEdu,
    isLoadingExp,
  ].some(Boolean);

  const isError = [
    isErrorSkills,
    isErrorProjects,
    isErrorCerts,
    isErrorEdu,
    isErrorExp,
  ].some(Boolean);

  const value = {
    skills,
    projects,
    certifications,
    education,
    experience,
    isLoading,
    isError,
    createSkill: (data: any) => createSkillMutation(data),
    updateSkill: (id: string, data: any) => updateSkillMutation({ id, data }),
    deleteSkill: (id: string) => deleteSkillMutation(id),
    createProject: (data: FormData) => createProjectMutation(data),
    updateProject: (id: string, data: FormData) => updateProjectMutation({ id, data }),
    deleteProject: (id: string) => deleteProjectMutation(id),
    refetchAll,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
