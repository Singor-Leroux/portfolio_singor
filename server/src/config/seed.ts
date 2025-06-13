import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SkillModel from '../models/Skill.model';

dotenv.config();

const defaultSkills = [
  {
    name: 'JavaScript',
    level: 5,
    category: 'frontend',
    icon: 'javascript'
  },
  {
    name: 'TypeScript',
    level: 4,
    category: 'frontend',
    icon: 'typescript'
  },
  {
    name: 'React',
    level: 5,
    category: 'frontend',
    icon: 'react'
  },
  {
    name: 'Node.js',
    level: 5,
    category: 'backend',
    icon: 'nodejs'
  },
  {
    name: 'MongoDB',
    level: 4,
    category: 'database',
    icon: 'mongodb'
  },
  {
    name: 'Docker',
    level: 3,
    category: 'devops',
    icon: 'docker'
  },
  {
    name: 'Git',
    level: 4,
    category: 'devops',
    icon: 'git'
  },
  {
    name: 'HTML5',
    level: 5,
    category: 'frontend',
    icon: 'html5'
  },
  {
    name: 'CSS3',
    level: 5,
    category: 'frontend',
    icon: 'css3'
  },
  {
    name: 'Express',
    level: 4,
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
