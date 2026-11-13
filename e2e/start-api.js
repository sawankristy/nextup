// starts OUR API for the end-to-end tests, with a MongoDB that only lives in memory
// --> it never touches the real Atlas data, needs no .env file, and works on any computer
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongo = await MongoMemoryServer.create(); // a real MongoDB, empty, gone when the tests stop

// the same variables as server/.env, but with test values (nothing secret here)
process.env.MONGODB_URI = mongo.getUri();
process.env.JWT_SECRET = 'e2e-test-secret';
process.env.TMDB_API_KEY = 'not-used-in-e2e'; // the search isn't tested
process.env.CLIENT_ORIGIN = 'http://localhost:4173'; // the built client (vite preview), for cors
process.env.PORT = '3001'; // not 3000, so it never mixes with npm run dev

// import AFTER the lines above: server.js checks the variables, connects to the database, then listens
// (a normal import at the top of the file would run before process.env is set)
await import('../server/server.js');
