import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SkillModel from '../models/Skill.model';

dotenv.config();

const defaultSkills = [
  {
    name: 'JavaScript',
    level: 'Expert',
    category: 'frontend',
    icon: 'javascript'
  },
  {
    name: 'TypeScript',
    level: 'Confirmé',
    category: 'frontend',
    icon: 'typescript'
  },
  {
    name: 'React',
    level: 'Expert',
    category: 'frontend',
    icon: 'react'
  },
  {
    name: 'Node.js',
    level: 'Expert',
    category: 'backend',
    icon: 'nodejs'
  },
  {
    name: 'MongoDB',
    level: 'Confirmé',
    category: 'database',
    icon: 'mongodb'
  },
  {
    name: 'Docker',
    level: 'Intermédiaire',
    category: 'devops',
    icon: 'docker'
  },
  {
    name: 'Git',
    level: 'Confirmé',
    category: 'devops',
    icon: 'git'
  },
  {
    name: 'HTML5',
    level: 'Expert',
    category: 'frontend',
    icon: 'html5'
  },
  {
    name: 'CSS3',
    level: 'Expert',
    category: 'frontend',
    icon: 'css3'
  },
  {
    name: 'Express',
    level: 'Confirmé',
    category: 'backend',
    icon: 'express'
  }
];

export const seedSkills = async () => {
  try {
    // Vérifier si des compétences existent déjà
    const count = await SkillModel.countDocuments();
    
    if (count === 0) {
      console.log('Aucune compétence trouvée. Création des compétences par défaut...');
      await SkillModel.insertMany(defaultSkills);
      console.log('Compétences par défaut créées avec succès !');
    } else {
      console.log(`La base de données contient déjà ${count} compétences.`);
    }
  } catch (error) {
    console.error('Erreur lors de la création des compétences par défaut:', error);
  }
};

// Exécuter le seed si le fichier est exécuté directement
if (require.main === module) {
  // Se connecter à la base de données
  mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => {
      console.log('Connecté à la base de données');
      return seedSkills();
    })
    .then(() => {
      console.log('Seed terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur lors du seed:', error);
      process.exit(1);
    });
}
