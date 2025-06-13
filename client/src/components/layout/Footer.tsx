import React from 'react';
import { Heart, ArrowUp } from 'lucide-react';
import { personalInfo } from '../../data';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="bg-gray-900 dark:bg-blue-950 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0">
            <a href="#" className="text-2xl font-bold">
              <span>&lt;</span>
            KSML<span className="text-blue-400">.dev</span><span>/&gt;</span>
            </a>
            <p className="text-gray-400 dark:text-gray-100 mt-2 max-w-md">
              Développeur full-stack passionné par la création d'applications web et mobiles modernes et performantes.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <button 
              onClick={scrollToTop} 
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors mb-4"
              aria-label="Scroll to top"
            >
              <ArrowUp size={20} />
            </button>
            
            <nav className="flex space-x-6">
              <a href="#about" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-blue-400 transition-colors relative group">
                À propos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#projects" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-blue-400 transition-colors relative group">
                Projets
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#contact" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-blue-400 transition-all duration-300 relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} {personalInfo.name}. Tous droits réservés.
          </p>
          <p className="text-gray-400 text-sm flex items-center">
            Conçu et développé avec <Heart size={14} className="text-red-500 mx-1" /> par {personalInfo.name}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;