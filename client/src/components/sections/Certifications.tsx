import React from 'react';
import { ExternalLink } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';

const Certifications: React.FC = () => {
  const { certifications = [], isLoading, isError } = usePortfolio();
  
  if (isLoading) {
    return (
      <section id="certifications" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Certifications & Formation
            </h2>
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="certifications" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Certifications & Formation</h2>
          <p className="text-red-500">Erreur lors du chargement des certifications. Veuillez réessayer plus tard.</p>
        </div>
      </section>
    );
  }
  
  if (certifications.length === 0) {
    return (
      <section id="certifications" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Certifications & Formation</h2>
          <p className="text-gray-600 dark:text-gray-300">Aucune certification disponible pour le moment.</p>
        </div>
      </section>
    );
  }
  return (
    <section id="certifications" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Certifications & Formation
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Les certifications et formations que j'ai complétées pour développer et valider mes compétences techniques.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certifications.map((cert: any, index: number) => (
            <div 
              key={cert._id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                opacity: 0,
                animation: `fadeInUp 0.5s ${index * 0.1}s ease-out forwards`
              }}
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-1/3 h-40 md:h-auto relative">
                  <img 
                    src={cert.imageUrl} 
                    alt={cert.title} 
                    className="w-96 h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-600 opacity-20"></div>
                </div>
                
                <div className="md:w-2/3 p-6 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {cert.title}
                  </h3>
                  
                  <p className="text-blue-600 dark:text-blue-300 font-medium mb-2">
                    {cert.issuer}
                  </p>
                  
                  <p className="text-gray-500 dark:text-gray-200 text-sm mb-4">
                    {cert.date}
                  </p>
                  
                  {cert.credentialUrl && (
                    <div className="mt-auto">
                      <a 
                        href={cert.credentialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 transition-colors"
                      >
                        Vérifier la certification <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;