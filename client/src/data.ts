import { UserProfile, FormattedUserProfile } from './types/user';

// Valeurs par défaut pour les données personnelles
const defaultPersonalInfo = {
  name: "Singor Kpatchou",
  title: "Développeur Full Stack",
  about: "Développeur passionné par la création d'applications web modernes et performantes. J'aime résoudre des problèmes complexes et créer des expériences utilisateur exceptionnelles.",
  email: "contact@singor-kpatchou.com",
  phone: "+33 6 12 34 56 78",
  address: "Paris, France",
  socialLinks: {
    github: "https://github.com/singor-kpatchou",
    linkedin: "https://linkedin.com/in/singor-kpatchou",
    twitter: "https://twitter.com/singor_k"
  }
} as const;

// Fonction pour formater les données de l'utilisateur
export const formatUserData = (userData: UserProfile | null): FormattedUserProfile => {
  if (!userData) return defaultPersonalInfo as FormattedUserProfile;
  
  // Type assertion pour accéder à cvUrl en toute sécurité
  const userWithCv = userData as UserProfile & { cvUrl?: string };
  
  return {
    name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || defaultPersonalInfo.name,
    title: userData.title || defaultPersonalInfo.title,
    about: userData.about || defaultPersonalInfo.about,
    email: userData.email || defaultPersonalInfo.email,
    phone: userData.phoneNumber || defaultPersonalInfo.phone,
    address: userData.address || defaultPersonalInfo.address,
    cvUrl: userWithCv.cvUrl || '',
    profileImage: userData.profileImage || 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    socialLinks: {
      github: userData.socialLinks?.github || defaultPersonalInfo.socialLinks.github,
      linkedin: userData.socialLinks?.linkedin || defaultPersonalInfo.socialLinks.linkedin,
      twitter: userData.socialLinks?.twitter || defaultPersonalInfo.socialLinks.twitter
    }
  };
};

// Export des valeurs par défaut pour la rétrocompatibilité
export const personalInfo = defaultPersonalInfo as FormattedUserProfile;

// Les compétences sont maintenant chargées dynamiquement depuis l'API
