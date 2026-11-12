import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import AppLayout from '../components/AppLayout.jsx';
import BackLink from '../components/BackLink.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import ItemCard from '../components/ItemCard.jsx';
import RenameForm from '../components/RenameForm.jsx';
import { plural } from '../format.js';

export default function ListPage() {
  const { id } = useParams(); // the :id in /lists/:id
  const navigate = useNavigate();
  const { data: list, setData: setList, error: listError } = useApi(`/api/lists/${id}`);
  const { data: items, setData: setItems, error: itemsError, reload: reloadItems } = useApi(`/api/lists/${id}/items`);
  const [renaming, setRenaming] = useState(false);
  const [actionError, setActionError] = useState('');

  // change it on screen right away (map + spread), then save it on the server
  async function updateItem(itemId, changes) {
    setActionError('');
    setItems(prev => prev.map(item => (item._id === itemId ? { ...item, ...changes } : item)));
    try {
      await apiFetch(`/api/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(changes) });
    } catch (err) {
      setActionError(err.message);
      reloadItems(); // the save failed --> get the real data back from the server
    }
  }

  // same idea: remove it on screen (filter), then on the server
  async function removeItem(itemId) {
    setActionError('');
    setItems(prev => prev.filter(item => item._id !== itemId));
    try {
      await apiFetch(`/api/items/${itemId}`, { method: 'DELETE' });
    } catch (err) {
      setActionError(err.message);
      reloadItems();
    }
  }

  async function renameList(name) {
    const updated = await apiFetch(`/api/lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    setList(updated);
    setRenaming(false);
  }

  async function deleteList() {
    if (!window.confirm(`Delete "${list.name}" and all its titles?`)) return;
    try {
      await apiFetch(`/api/lists/${id}`, { method: 'DELETE' });
      navigate('/lists');
    } catch (err) {
      setActionError(err.message);
    }
  }

  const error = listError || itemsError;
  if (error) {
    return (
      <AppLayout>
        <BackLink to="/lists">My Lists</BackLink>
        <p className="error" role="alert">{error.message}</p>
      </AppLayout>
    );
  }
  if (!list || !items) {
    return <AppLayout><p className="muted">Loading…</p></AppLayout>;
  }

  const done = items.filter(item => item.status === 'done').length; // computed, not state

  return (
    <AppLayout>
      <BackLink to="/lists">My Lists</BackLink>

      <div className="list-head">
        <CategoryBadge category={list.category} />
        {renaming ? (
          <RenameForm currentName={list.name} onSave={renameList} onCancel={() => setRenaming(false)} />
        ) : (
          <h1>{list.name}</h1>
        )}
        <p className="muted">{plural(items.length, 'title')} · {done} done</p>
        {!renaming && (
          <div className="list-actions">
            <button className="link-button" onClick={() => setRenaming(true)}>Rename</button>
            <button className="link-button danger" onClick={deleteList}>Delete list</button>
          </div>
        )}
      </div>

      <Link to={`/lists/${id}/add`} className="button add-button">+ Add a {list.category}</Link>

      {actionError && <p className="error" role="alert">{actionError}</p>}

      {items.length === 0 ? (
        <p className="empty">Nothing here yet. Add your first {list.category}!</p>
      ) : (
        <ul className="item-list">
          {items.map(item => (
            <ItemCard
              key={item._id}
              item={item}
              category={list.category}
              onChange={updateItem}
              onRemove={removeItem}
            />
          ))}
        </ul>
      )}
    </AppLayout>
  );
}
