import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import AppLayout from '../components/AppLayout.jsx';
import ListCard from '../components/ListCard.jsx';
import NewListForm from '../components/NewListForm.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Suggestions from '../components/Suggestions.jsx';
import { plural } from '../format.js';

export default function MyListsPage() {
  const { data: lists, setData: setLists, error } = useApi('/api/lists');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  async function createList(newList) {
    const list = await apiFetch('/api/lists', {
      method: 'POST',
      body: JSON.stringify(newList),
    });
    if (lists) setLists(prev => [list, ...prev]); // the cache knows the new list, so My Lists is right when i come back
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
      {!lists && !error && <Skeleton type="cards" count={4} />}
      {lists?.length === 0 && (
        <p className="empty">No lists yet. Create your first one with “+ New list”.</p>
      )}
      {lists?.length > 0 && (
        <div className="list-grid">
          {lists.map(list => <ListCard key={list._id} list={list} />)}
        </div>
      )}

      {/* only once my lists are here: the "Add to:" select needs them */}
      {lists && <Suggestions lists={lists} setLists={setLists} />}
    </AppLayout>
  );
}
