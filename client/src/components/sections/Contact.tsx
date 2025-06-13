import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Github as GitHub, Linkedin, Twitter } from 'lucide-react';
import { personalInfo } from '../../data';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset the submitted state after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-200 mb-4">
            Me Contacter
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Vous avez un projet en tête ou vous souhaitez simplement discuter ? N'hésitez pas à me contacter !
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/5 dark:bg-gray-700 dark:p-8 dark:rounded-xl">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-blue-400 mb-6">
              Informations de contact
            </h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MapPin className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-1">Localisation</h4>
                  <p className="text-gray-600 dark:text-blue-400">{personalInfo.location}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mail className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-1">Email</h4>
                  <a href={`mailto:${personalInfo.email}`} className="text-gray-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                    {personalInfo.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Phone className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-1">Téléphone</h4>
                  <a href={`tel:${personalInfo.phone}`} className="text-gray-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                    {personalInfo.phone}
                  </a>
                </div>
              </div>
            </div>
            
            <h4 className="font-medium text-gray-800 dark:text-blue-400 mb-4">
              Suivez-moi
            </h4>
            
            <div className="flex space-x-4">
              <a 
                href={personalInfo.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:text-blue-500 p-3 rounded-lg shadow-sm hover:shadow-md hover:text-blue-600 dark:hover:text-white dark:hover:bg-blue-500 transition-all duration-300"
                aria-label="GitHub"
              >
                <GitHub />
              </a>
              <a 
                href={personalInfo.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:text-blue-500 p-3 rounded-lg shadow-sm hover:shadow-md hover:text-blue-600 dark:hover:text-white dark:hover:bg-blue-500 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin />
              </a>
              <a 
                href={personalInfo.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:text-blue-500 p-3 rounded-lg shadow-sm hover:shadow-md hover:text-blue-600 dark:hover:text-white dark:hover:bg-blue-500 transition-all duration-400"
                aria-label="Twitter"
              >
                <Twitter />
              </a>
            </div>
          </div>
          
          <div className="lg:w-3/5">
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                Envoyez-moi un message
              </h3>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                  <p className="font-medium">Message envoyé avec succès !</p>
                  <p>Merci pour votre message. Je vous répondrai dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                        placeholder="Votre nom"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                        placeholder="Votre email"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                      placeholder="Sujet de votre message"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                      placeholder="Votre message..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center justify-center w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <span>Envoyer</span>
                        <Send size={16} className="ml-2" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;