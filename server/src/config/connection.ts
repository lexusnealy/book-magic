import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGO_URI || '';

if (!MONGODB_URI) {
  console.error('MONGO_URI environment variable is not set');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('MongoDB connection error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      codeName: error?.codeName,
    });
    if (error?.name === 'MongooseServerSelectionError') {
      console.error('Could not connect to MongoDB Atlas. Please check:');
      console.error('1. Your IP address is whitelisted in MongoDB Atlas');
      console.error('2. Your username and password are correct');
      console.error('3. The cluster is running and accessible');
    }
    process.exit(1);
  }
};

connectDB();

export default mongoose.connection;