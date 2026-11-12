import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import listsRouter from './routes/lists.js';
import itemsRouter from './routes/items.js';
import searchRouter from './routes/search.js';
import { requireAuth } from './middleware/requireAuth.js';

// the app is in its own file (no connect, no listen here)
// so the tests can use it without a database
const app = express();

// middleware: every request passes through these, in this order
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

// health check: just to see if the server is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);                  // public: you can't have a token before logging in
app.use('/api/lists', requireAuth, listsRouter);   // locked
app.use('/api/items', requireAuth, itemsRouter);   // locked
app.use('/api/search', requireAuth, searchRouter); // locked too, so only our users spend our TMDB key

// if no route above matched, answer 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// error handler (4 params): if something breaks (like a body that isn't valid JSON),
// answer with JSON too, not with an HTML error page
app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({ error: err.status ? err.message : 'Something went wrong' });
});

export default app;
