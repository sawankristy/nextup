import express from 'express';
import { toMovie } from './search.js';

const suggestionsRouter = express.Router();

const POPULAR_MOVIES_URL = 'https://api.themoviedb.org/3/movie/popular';
const TRENDING_BOOKS_URL = 'https://openlibrary.org/trending/weekly.json?limit=12';
const COVERS_URL = 'https://covers.openlibrary.org/b/id/';
const ONE_HOUR = 60 * 60_000;

// everybody gets the same suggestions, so i keep each answer for 1 hour (Session 22: don't do the same work twice)
// 'books' / 'movies' --> { data, expires }
const cache = new Map();

// TMDB popular movies, only the ones with a poster, about 12
async function loadMovies() {
  const params = new URLSearchParams({ api_key: process.env.TMDB_API_KEY }); // the key stays on the server
  const response = await fetch(`${POPULAR_MOVIES_URL}?${params}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data.results.map(toMovie).filter(movie => movie.imageUrl).slice(0, 12);
}

// Open Library trending books of the week, same shape as searchBooks in the client
async function loadBooks() {
  const response = await fetch(TRENDING_BOOKS_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  const books = data.works.map(work => ({
    externalId: work.key, // like "/works/OL82563W"
    title: work.title,
    author: work.author_name?.[0] ?? '',
    year: work.first_publish_year ?? null,
    imageUrl: work.cover_i ? `${COVERS_URL}${work.cover_i}-M.jpg` : '',
  }));
  return books.filter(book => book.imageUrl); // only the ones with a cover
}

// same pattern as the slide: still fresh in the cache --> answer from it, otherwise ask again and keep it
async function getSuggestions(type) {
  const hit = cache.get(type);
  if (hit && hit.expires > Date.now()) return hit.data;
  const data = type === 'books' ? await loadBooks() : await loadMovies(); // the slow part
  cache.set(type, { data, expires: Date.now() + ONE_HOUR });
  return data;
}

// GET /api/suggestions/books
suggestionsRouter.get('/books', async (req, res) => {
  try {
    res.json(await getSuggestions('books'));
  } catch {
    res.status(500).json({ error: 'Suggestions are not available right now' });
  }
});

// GET /api/suggestions/movies
suggestionsRouter.get('/movies', async (req, res) => {
  try {
    res.json(await getSuggestions('movies'));
  } catch {
    res.status(500).json({ error: 'Suggestions are not available right now' });
  }
});

export default suggestionsRouter;
