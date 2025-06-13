const mongoose = require('mongoose');
require('dotenv').config();

async function checkAndFixDuplicateIndexes() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connecté à MongoDB...');

    // Récupérer la collection users
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Afficher les index actuels
    const indexes = await usersCollection.indexes();
    console.log('Index actuels sur la collection users:');
    console.log(JSON.stringify(indexes, null, 2));

    // Vérifier s'il y a un index en double sur le champ email
    const emailIndexes = indexes.filter(index => 
      index.key && index.key.email === 1
    );

    if (emailIndexes.length > 1) {
      console.log('\nDétection de doublons d\'index sur le champ email:');
      console.log(JSON.stringify(emailIndexes, null, 2));
      
      // Garder l'index avec le nom attendu par Mongoose et supprimer les autres
      const indexToKeep = emailIndexes.find(index => 
        index.name === 'email_1' || 
        (index.name && index.name.startsWith('email_'))
      );

      if (indexToKeep) {
        console.log(`\nConservation de l'index: ${indexToKeep.name}`);
        
        // Supprimer les autres index en double
        for (const index of emailIndexes) {
          if (index.name !== indexToKeep.name) {
            console.log(`Suppression de l'index en double: ${index.name}`);
            await usersCollection.dropIndex(index.name);
          }
        }
        
        console.log('\nIndex en double supprimés avec succès.');
      }
    } else {
      console.log('\nAucun doublon d\'index détecté sur le champ email.');
    }

  } catch (error) {
    console.error('Erreur lors de la vérification des index:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Déconnecté de MongoDB.');
    process.exit(0);
  }
}

// Exécuter la fonction
checkAndFixDuplicateIndexes();
