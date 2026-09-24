import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/student_support';

  // Strategy 1: Try Primary MONGO_URI from env (if valid and not placeholder)
  if (primaryUri && !primaryUri.includes('USERNAME:PASSWORD') && !primaryUri.includes('YOUR_CLUSTER')) {
    try {
      console.log('Connecting to primary MongoDB URI...');
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
      console.log('⚡ Connected to Primary MongoDB Atlas/Database!');
      return;
    } catch (err) {
      console.warn('⚠️ Primary MONGO_URI failed to connect:', err.message);
    }
  }

  // Strategy 2: Try Local MongoDB instance
  try {
    console.log('Attempting local MongoDB connection (mongodb://127.0.0.1:27017/student_support)...');
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log('⚡ Connected to Local MongoDB Service!');
    return;
  } catch (err) {
    console.warn('⚠️ Local MongoDB connection failed:', err.message);
  }

  // Strategy 3: Automatic In-Memory MongoDB Fallback (Guarantees zero-config instant startup!)
  try {
    console.log('🚀 Spinning up in-memory MongoDB Server (Zero-Config Mode)...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`⚡ Connected to In-Memory MongoDB Server at ${memoryUri}`);
    console.log('💡 Note: All data will be preserved during the server process run and seeded automatically.');
  } catch (err) {
    console.error('❌ Failed to launch In-Memory MongoDB:', err.message);
    process.exit(1);
  }
};
