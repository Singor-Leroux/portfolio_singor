import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { Code, Globe, User, Mail, MapPin, Phone } from 'lucide-react';
import { FormattedUserProfile } from '../../types/user';

const About: React.FC = () => {
  const { userData, loading } = useUser() as { 
    userData: FormattedUserProfile; 
    loading: boolean;
  };

  if (loading) {
    return (
      <section id="about" className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mx-auto mb-4"></div>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mt-8"></div>
        </div>
      </section>
    );
  }

  if (!userData) {
    return (
      <section id="about" className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            À propos de moi
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Impossible de charger les informations. Veuillez réessayer plus tard.
          </p>
        </div>
      </section>
    );
  }
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
            
            {userData.about ? (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {userData.about}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  J'ai travaillé sur divers projets, du développement de sites vitrine élégants à la création d'applications web complexes. Ma passion est de transformer des idées en solutions numériques performantes et esthétiques.
                </p>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic mb-8">
                Aucune description n'est disponible pour le moment.
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start space-x-3">
                <User className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Nom</h4>
                  <p className="text-gray-600 dark:text-gray-300">{userData.name}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Code className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Rôle</h4>
                  <p className="text-gray-600 dark:text-blue-300">{userData.title}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Email</h4>
                  <p className="text-gray-600 dark:text-blue-300 hover:underline">{userData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Téléphone</h4>
                  <p className="text-gray-600 dark:text-blue-300 hover:underline">{userData.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Localisation</h4>
                  <p className="text-gray-600 dark:text-blue-300">
                    {userData.location || userData.address || 'Non spécifiée'}
                  </p>
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
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => userData.cvUrl && window.open(userData.cvUrl, '_blank')}
                disabled={!userData.cvUrl}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-md transition-all duration-300 font-medium ${
                  userData.cvUrl 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                aria-label={userData.cvUrl ? "Télécharger mon CV" : "CV non disponible"}
                title={userData.cvUrl ? `Télécharger le CV (${new Date().getFullYear()})` : "CV non disponible"}
              >
                <svg 
                  className={`w-5 h-5 mr-2 ${userData.cvUrl ? 'text-white' : 'text-gray-400'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                Télécharger mon CV
              </button>
              
              {!userData.cvUrl && (
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  CV non disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;