const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../dist/models/user.model');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

async function listIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const indexes = await User.collection.indexes();
    console.log('Indexes on users collection:');
    console.log(JSON.stringify(indexes, null, 2));
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listIndexes();
