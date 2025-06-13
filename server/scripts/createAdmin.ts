import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/user.model';

// Charger les variables d'environnement
dotenv.config({ path: '../.env' });

const createAdmin = async () => {
  try {
    // Vérifier les variables d'environnement nécessaires
    if (!process.env.MONGODB_URI) {
      console.error('Erreur: MONGODB_URI n\'est pas défini dans le fichier .env');
      process.exit(1);
    }

    // Connexion à la base de données
    console.log('Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à la base de données');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Un administrateur avec cet email existe déjà');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Créer le mot de passe haché
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Créer l'utilisateur admin
    const admin = new User({
      name: 'Administrateur',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });

    await admin.save();
    
    console.log('\n✅ Compte administrateur créé avec succès!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('\n⚠️  IMPORTANT: Changez ce mot de passe immédiatement après la première connexion!\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la création du compte administrateur:');
    console.error(error);
    process.exit(1);
  }
};

// Exécuter la fonction
createAdmin();
