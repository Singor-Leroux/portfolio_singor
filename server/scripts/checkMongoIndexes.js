const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

async function checkIndexes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collections = await db.collections();
    
    console.log('Available collections:');
    console.log(collections.map(c => c.collectionName).join(', '));
    
    // Vérifier si la collection users existe
    const usersCollection = db.collection('users');
    const indexes = await usersCollection.indexes();
    
    console.log('\nIndexes on users collection:');
    console.log(JSON.stringify(indexes, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

checkIndexes();
