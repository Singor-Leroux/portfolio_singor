import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { Skill } from '../../services/api';

// Fonction utilitaire pour convertir le niveau en valeur numérique (1-4)
const getLevelValue = (level: string | number): number => {
  // Si le niveau est déjà un nombre, on s'assure qu'il est entre 1 et 4
  if (typeof level === 'number') {
    return Math.min(4, Math.max(1, level));
  }
  
  // Si c'est une chaîne, on la convertit en nombre
  switch(level) {
    case 'Débutant': return 1;
    case 'Intermédiaire': return 2;
    case 'Confirmé': return 3;
    case 'Expert': return 4;
    default: return 1;
  }
};

const Skills: React.FC = () => {
  const { skills, isLoading, isError } = usePortfolio();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [displayedSkills, setDisplayedSkills] = useState<Skill[]>([]);
  const [animateSkills, setAnimateSkills] = useState(false);

  const categories = [
    { id: 'all', label: 'Toutes' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'database', label: 'Base de données' },
    { id: 'devops', label: 'DevOps' },
    { id: 'other', label: 'Autres' }
  ];

  useEffect(() => {
    if (skills && skills.length > 0) {
      setAnimateSkills(false);
      
      setTimeout(() => {
        if (activeTab === 'all') {
          setDisplayedSkills(skills);
        } else {
          setDisplayedSkills(skills.filter(skill => skill.category === activeTab));
        }
        setAnimateSkills(true);
      }, 300);
    }
  }, [activeTab, skills]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateSkills(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Mes Compétences
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Chargement des compétences...</p>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Mes Compétences
            </h2>
            <p className="text-red-500">Erreur lors du chargement des compétences. Veuillez réessayer plus tard.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Mes Compétences
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Une vue d'ensemble des technologies et outils avec lesquels j'ai travaillé au cours de ma carrière de développeur.
          </p>
        </div>
        
        <div className="mb-10 flex flex-wrap justify-center gap-2 md:gap-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-5 py-2 rounded-full border transition-all duration-300 ${
                activeTab === category.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        
        <div 
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${
            animateSkills ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {displayedSkills.map((skill, index) => (
            <div 
              key={skill.name}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-3">{skill.name}</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ 
                    width: `${(getLevelValue(skill.level) / 4) * 100}%`, 
                    transition: 'width 1s ease-out' 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Débutant</span>
                <span>Expert</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;