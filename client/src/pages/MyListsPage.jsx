import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import AppLayout from '../components/AppLayout.jsx';
import ListCard from '../components/ListCard.jsx';
import NewListForm from '../components/NewListForm.jsx';
import { plural } from '../format.js';

export default function MyListsPage() {
  const { data: lists, error } = useApi('/api/lists');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  async function createList(newList) {
    const list = await apiFetch('/api/lists', {
      method: 'POST',
      body: JSON.stringify(newList),
    });
    navigate(`/lists/${list._id}`); // go straight into the new list
  }

  return (
    <AppLayout>
      <div className="title-row">
        <div>
          <h1>My Lists</h1>
          {lists && <p className="muted">{plural(lists.length, 'list')} · books and movies</p>}
        </div>
        {!showForm && (
          <button className="button" onClick={() => setShowForm(true)}>+ New list</button>
        )}
      </div>

      {showForm && <NewListForm onCreate={createList} onCancel={() => setShowForm(false)} />}

      {error && <p className="error" role="alert">{error.message}</p>}
      {!lists && !error && <p className="muted">Loading…</p>}
      {lists?.length === 0 && (
        <p className="empty">No lists yet. Create your first one with “+ New list”.</p>
      )}
      {lists?.length > 0 && (
        <div className="list-grid">
          {lists.map(list => <ListCard key={list._id} list={list} />)}
        </div>
      )}

      <p className="hint">
        Each list has a category. A <b className="text-book">Books</b> list searches Open Library,
        a <b className="text-movie">Movies</b> list searches TMDB.
      </p>
    </AppLayout>
  );
}
