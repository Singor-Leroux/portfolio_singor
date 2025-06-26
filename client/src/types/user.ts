export interface FormattedUserProfile {
  name: string;
  title: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  location?: string; // Alias pour address
  cvUrl?: string; // URL du CV
  profileImage?: string; // URL de l'image de profil
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  title: string;
  about: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  profileImage?: string; // URL de l'image de profil
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}
