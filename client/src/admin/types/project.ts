export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl: string;
  imageUrl: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  user?: string;
}

export interface ProjectCreationPayload {
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl: string;
  imageUrl: string;
  featured: boolean;
}

export interface ProjectUpdatePayload extends Partial<ProjectCreationPayload> {
  _id: string;
}
