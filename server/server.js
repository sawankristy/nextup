// load .env first, so process.env has our values before anything uses them
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const port = Number(process.env.PORT) || 3000;

// connect to the database first, then start listening
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('connected to MongoDB');
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}
