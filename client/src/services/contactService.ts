import axios from 'axios';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactMessage = async (formData: ContactFormData) => {
  try {
    // Use the full URL to bypass the baseURL from the api instance
    const response = await axios.post('http://localhost:5000/api/contact', formData, {
      withCredentials: true
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du message:', error);
    
    // Gestion des erreurs plus détaillée
    let errorMessage = 'Une erreur est survenue lors de l\'envoi du message.';
    
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status === 401) {
        errorMessage = 'Non autorisé. Veuillez vous connecter.';
      } else if (error.response.status === 429) {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
    }
    
    return {
      success: false,
      error: errorMessage,
      errors: error.response?.data?.errors || null,
    };
  }
};
