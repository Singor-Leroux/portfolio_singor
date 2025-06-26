const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

async function dropUsernameIndex() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Vérifier si l'index existe
    const indexes = await usersCollection.indexes();
    const usernameIndex = indexes.find(index => index.name === 'username_1');
    
    if (usernameIndex) {
      console.log('Found username_1 index, dropping it...');
      await usersCollection.dropIndex('username_1');
      console.log('Successfully dropped username_1 index');
    } else {
      console.log('username_1 index not found, nothing to drop');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

dropUsernameIndex();
