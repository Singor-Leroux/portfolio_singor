// Type pour les informations personnelles
export interface PersonalInfo {
  name: string;
  title: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    [key: string]: string;
  };
}

// Type pour les compétences
export interface Skill {
  id: number;
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'other';
}

// Type pour les projets
export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  projectUrl: string;
  githubUrl: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile';
}

// Type pour l'expérience professionnelle
export interface Experience {
  id: number;
  role: string;
  company: string;
  duration: string;
  description: string[];
  technologies: string[];
}

// Type pour la formation
export interface Education {
  id: number;
  degree: string;
  institution: string;
  duration: string;
  description: string;
}

// Type pour les certifications
export interface Certification {
  id: number;
  title: string;
  issuer: string;
  date: string;
  credentialUrl: string;
}

// Type pour les liens sociaux
export type SocialPlatform = 'github' | 'linkedin' | 'twitter';
