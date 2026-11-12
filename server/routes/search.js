import express from 'express';

const searchRouter = express.Router();

const TMDB_URL = 'https://api.themoviedb.org/3/search/movie';
const POSTER_URL = 'https://image.tmdb.org/t/p/w200';

// GET /api/search/movies?q=alien
// the browser asks OUR server, and our server asks TMDB with the key from .env
// --> the key never reaches the browser
searchRouter.get('/movies', async (req, res) => {
  const { q } = req.query;
  if (typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'q is required' });
  }

  // URLSearchParams builds the "?api_key=...&query=..." part for me
  const params = new URLSearchParams({ api_key: process.env.TMDB_API_KEY, query: q.trim() });
  try {
    const response = await fetch(`${TMDB_URL}?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // i only send back what the app needs, in the same shape as the book results
    const movies = data.results.map(movie => ({
      externalId: String(movie.id),
      title: movie.title,
      author: '',
      year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
      imageUrl: movie.poster_path ? POSTER_URL + movie.poster_path : '',
    }));
    res.json(movies);
  } catch {
    res.status(500).json({ error: 'Movie search failed, try again in a minute' });
  }
});

export default searchRouter;
