import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins pour les imports ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Importer le modèle User
import User from '../src/models/user.model.js';

const ADMIN_EMAIL = 'admin@example.com';
const NEW_PASSWORD = 'admin123';

async function resetAdminPassword() {
  try {
    console.log('Connexion à la base de données...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à la base de données');

    // Vérifier si l'admin existe
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!admin) {
      console.log('\nCréation d\'un nouvel administrateur...');
      
      // Créer un nouveau mot de passe haché
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
      
      // Créer un nouvel administrateur
      admin = new User({
        name: 'Administrateur',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        status: 'active'
      });
      
      await admin.save();
      console.log('✅ Nouvel administrateur créé avec succès!');
    } else {
      console.log('\nMise à jour du mot de passe administrateur...');
      
      // Mettre à jour le mot de passe
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(NEW_PASSWORD, salt);
      admin.status = 'active';
      admin.isEmailVerified = true;
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      
      await admin.save();
      console.log('✅ Mot de passe administrateur mis à jour avec succès!');
    }
    
    console.log('\n🔑 Identifiants de connexion:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Mot de passe: ${NEW_PASSWORD}`);
    console.log('\n⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Erreur lors de la réinitialisation du mot de passe administrateur:');
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Exécuter la fonction
resetAdminPassword();
