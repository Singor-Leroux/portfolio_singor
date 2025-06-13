// server/src/config/db.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedSkills } from './seed';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Exécuter le seed après la connexion à la base de données
    if (process.env.NODE_ENV !== 'test') {
      await seedSkills();
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;