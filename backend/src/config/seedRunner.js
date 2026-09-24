import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db.js';
import { seedDatabase } from './seed.js';

const run = async () => {
  await connectDB();
  await seedDatabase();
  console.log('Seeding finished.');
  process.exit(0);
};

run();
