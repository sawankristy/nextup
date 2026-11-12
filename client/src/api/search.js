import { apiFetch } from './client.js';

const BOOKS_URL = 'https://openlibrary.org/search.json';
const COVERS_URL = 'https://covers.openlibrary.org/b/id/';

// Open Library is free and needs no key, so the browser can ask it directly
async function searchBooks(query) {
  const params = new URLSearchParams({
    q: query,
    limit: 20,
    fields: 'key,title,author_name,first_publish_year,cover_i', // only what i need
  });
  const res = await fetch(`${BOOKS_URL}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // same shape as the movies that come from our server
  return data.docs.map(book => ({
    externalId: book.key, // like "/works/OL82563W"
    title: book.title,
    author: book.author_name?.[0] ?? '',
    year: book.first_publish_year ?? null,
    imageUrl: book.cover_i ? `${COVERS_URL}${book.cover_i}-M.jpg` : '',
  }));
}

// TMDB needs a secret key, so movies go through our server (the key stays in server/.env)
function searchMovies(query) {
  const params = new URLSearchParams({ q: query });
  return apiFetch(`/api/search/movies?${params}`);
}

// the list's category decides which database we search
export function searchTitles(category, query) {
  return category === 'book' ? searchBooks(query) : searchMovies(query);
}
