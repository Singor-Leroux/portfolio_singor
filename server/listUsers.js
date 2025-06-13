const mongoose = require('mongoose');
require('dotenv').config();

// Assurez-vous que le chemin vers le modèle User est correct
const User = require('./src/models/user.model');

async function listUsers() {
  try {
    console.log('Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à la base de données');

    // Lister tous les utilisateurs (sans les mots de passe)
    const users = await User.find({}).select('-password -refreshToken');
    console.log('\nUtilisateurs existants:');
    console.log(JSON.stringify(users, null, 2));
    
    // Vérifier si l'admin existe
    const admin = await User.findOne({ email: 'admin@example.com' });
    if (admin) {
      console.log('\nCompte admin trouvé:');
      console.log(`Email: ${admin.email}`);
      console.log(`Rôle: ${admin.role}`);
      console.log(`Statut: ${admin.status}`);
    } else {
      console.log('\nAucun compte admin trouvé avec cet email.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
}

listUsers();
