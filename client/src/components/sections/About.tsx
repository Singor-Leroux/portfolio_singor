import React from 'react';
import { personalInfo } from '../../data';
import { Code, Globe, User, Mail, MapPin, Phone } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            À propos de moi
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <img 
              src="https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="About Me" 
              className="rounded-lg shadow-xl max-w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          
          <div className="md:w-1/2">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Qui suis-je ?
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {personalInfo.about}
            </p>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              J'ai travaillé sur divers projets, du développement de sites vitrine élégants à la création d'applications web complexes. Ma passion est de transformer des idées en solutions numériques performantes et esthétiques.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start space-x-3">
                <User className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Nom</h4>
                  <p className="text-gray-600 dark:text-blue-300">{personalInfo.name}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Code className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Rôle</h4>
                  <p className="text-gray-600 dark:text-blue-300">{personalInfo.title}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Email</h4>
                  <p className="text-gray-600 dark:text-blue-300 hover:underline">{personalInfo.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Téléphone</h4>
                  <p className="text-gray-600 dark:text-blue-300 hover:underline">{personalInfo.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Localisation</h4>
                  <p className="text-gray-600 dark:text-blue-300">{personalInfo.location}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Globe className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Langues</h4>
                  <p className="text-gray-600 dark:text-blue-300">Français, Anglais</p>
                </div>
              </div>
            </div>
            
            <a 
              href="/resume.pdf" 
              download
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Télécharger mon CV
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;