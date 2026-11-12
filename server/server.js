// load .env first, so process.env has our values before anything uses them
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

// a secret is missing? crash now with a clear message, not later in the middle of a request
for (const key of ['MONGODB_URI', 'JWT_SECRET', 'TMDB_API_KEY', 'CLIENT_ORIGIN']) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
}

// injection backstop: a filter value like { $ne: '' } is treated as plain data, not as an operator
mongoose.set('sanitizeFilter', true);

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
