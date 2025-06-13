import React, { useState, useEffect } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { Project } from '../../services/api';

// Ajout des animations globales
const globalStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .project-card {
    opacity: 0;
    transform: translateY(20px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: white;
    border-radius: 0.75rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .dark .project-card {
    background: #1f2937;
    border-color: #374151;
  }
  
  .project-card.visible {
    animation: fadeInUp 0.5s ease-out forwards;
    opacity: 1 !important;
  }
`;

// Composant pour injecter les styles globaux
const GlobalStyles = () => <style>{globalStyles}</style>;

const ProjectCard: React.FC<{ project: Project; delay: number }> = ({ project, delay }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay * 1000);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);
  
  return (
    <div 
      ref={cardRef}
      className={`group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col project-card ${
        isVisible ? 'visible' : ''
      }`}
      style={{
        animationDelay: `${delay}s`
      }}
    >
      <div className="relative overflow-hidden h-48 bg-gray-100 dark:bg-gray-800">
        {project.imageUrl ? (
          <img 
            src={project.imageUrl} 
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // En cas d'erreur de chargement de l'image
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/800x450?text=Image+non+disponible';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            <span>Pas d'image disponible</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex gap-3">
            {project.demoUrl && (
              <a 
                href={project.demoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-gray-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label={`Voir la démo de ${project.title}`}
                title="Voir la démo"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-800 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                aria-label={`Voir le code source de ${project.title} sur GitHub`}
                title="Voir sur GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">
          {project.description || 'Aucune description disponible pour ce projet.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.technologies?.map((tech: string) => (
            <span 
              key={`${project._id}-${tech}`}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium rounded-full shadow-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const { projects = [], isLoading, isError } = usePortfolio();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Debug: Afficher les projets reçus
  useEffect(() => {
    console.log('Projects data:', projects);
  }, [projects]);

  useEffect(() => {
    if (projects.length > 0) {
      setFilteredProjects(projects);
    }
  }, [projects]);

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'fullstack', label: 'Full Stack' },
    { id: 'mobile', label: 'Mobile' }
  ];
  
  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.technologies?.includes(activeCategory)));
    }
  }, [activeCategory, projects]);

  if (isLoading) {
    return (
      <section id="projects" className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Mes Projets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="projects" className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Mes Projets</h2>
          <p className="text-red-500">Erreur lors du chargement des projets. Veuillez réessayer plus tard.</p>
        </div>
      </section>
    );
  }

  // Debug: Afficher les données des projets
  console.log('Filtered projects:', filteredProjects);
  
  return (
    <>
      <GlobalStyles />
      <section id="projects" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Mes Projets
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez une sélection de projets sur lesquels j'ai travaillé, démontrant mes compétences en développement frontend, backend et full-stack.
          </p>
          {/* Message de débogage */}
          {/* <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
            <p className="font-bold">Debug Info:</p>
            <p>Nombre de projets chargés: {projects.length}</p>
            <p>Nombre de projets filtrés: {filteredProjects.length}</p>
            <p>Catégorie active: {activeCategory}</p>
            {filteredProjects.length > 0 && (
              <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded">
                <p className="font-bold">Premier projet:</p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(filteredProjects[0], null, 2)}
                </pre>
              </div>
            )}
          </div> */}
        </div>
        
        <div className="mb-10 flex flex-wrap justify-center gap-2 md:gap-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 rounded-full border transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard 
              key={project._id}
              project={project}
              delay={index * 0.1}
            />
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-white">
              Aucun projet trouvé dans cette catégorie.
            </p>
          </div>
        )}
      </div>
      </section>
    </>
  );
};

export default Projects;