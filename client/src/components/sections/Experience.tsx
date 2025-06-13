import React from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { Experience as ExperienceType, Education as EducationType } from '../../types';

const ExperienceItem: React.FC<{ experience: ExperienceType; index: number }> = ({ experience, index }) => {
  return (
    <div 
      className="mb-8 lg:mb-0 relative"
      style={{
        opacity: 0,
        animation: `fadeInUp 0.5s ${index * 0.1}s ease-out forwards`
      }}
    >
      <div className="hidden lg:block absolute top-0 bottom-0 left-[calc(50%-1px)] w-0.5 bg-blue-200 z-0"></div>
      
      <div className={`flex items-center mb-4 lg:mb-8 ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
        <div className={`text-right lg:w-1/2 lg:pr-8 ${index % 2 !== 0 && 'lg:hidden'}`}>
          <span className="text-gray-500 dark:text-blue-300">{experience.duration}</span>
        </div>
        
        <div className="hidden lg:flex lg:items-center lg:justify-center bg-white dark:bg-gray-900 z-10">
          <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-blue-100"></div>
        </div>
        
        <div className={`text-left lg:w-1/2 lg:pl-8 ${index % 2 === 0 && 'lg:hidden'}`}>
          <span className="text-gray-500 dark:text-blue-300">{experience.duration}</span>
        </div>
      </div>
      
      <div className={`lg:flex ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
        <div 
          className={`bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md lg:w-[calc(50%-32px)] ${
            index % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'
          }`}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{experience.role}</h3>
          <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-3">{experience.company}</h4>
          
          <ul className="space-y-2 mb-4">
            {Array.isArray(experience.description) ? (
              experience.description.map((item, i) => (
                <li key={i} className="text-gray-600 dark:text-white text-sm flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 mr-2"></span>
                  {item}
                </li>
              ))
            ) : (
              <li className="text-gray-600 dark:text-white text-sm flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 mr-2"></span>
                  {experience.description}
                </li>
            )}
          </ul>
          
          <div className="flex flex-wrap gap-2">
            {experience.technologies.slice(0, 5).map((tech, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full dark:bg-gray-500 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">
                {tech}
              </span>
            ))}
            {experience.technologies.length > 5 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:text-black dark:hover:bg-gray-200">
                +{experience.technologies.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EducationItem: React.FC<{ education: EducationType; index: number }> = ({ education, index }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
      style={{
        opacity: 0,
        animation: `fadeInUp 0.5s ${index * 0.1 + 0.5}s ease-out forwards`
      }}
    >
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {education.degree}
      </h3>
      
      <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-1">
        {education.institution}
      </h4>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
        {education.duration}
      </p>
      
      <p className="text-gray-600 dark:text-gray-200">
        {education.description}
      </p>
    </div>
  );
};

const Experience: React.FC = () => {
  const { experience: experiences = [], education = [], isLoading, isError } = usePortfolio();
  
  if (isLoading) {
    return (
      <section id="experience" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Expérience & Formation
            </h2>
            <div className="animate-pulse space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="experience" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Expérience & Formation</h2>
          <p className="text-red-500">Erreur lors du chargement des expériences. Veuillez réessayer plus tard.</p>
        </div>
      </section>
    );
  }
  return (
    <section id="experience" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Expérience Professionnelle
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Mon parcours professionnel en tant que développeur et les entreprises avec lesquelles j'ai collaboré.
          </p>
        </div>
        
        <div className="lg:relative mb-20">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Expérience Professionnelle
          </h3>
          {experiences.length > 0 ? (
            <div className="relative">
              {experiences.map((exp: any, index: number) => (
                <ExperienceItem key={exp._id} experience={exp} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Aucune expérience professionnelle à afficher pour le moment.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">Formation</h3>
          {education.length > 0 ? (
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
              {education.map((edu: any, index: number) => (
                <EducationItem key={edu._id} education={edu} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Aucune formation à afficher pour le moment.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Experience;