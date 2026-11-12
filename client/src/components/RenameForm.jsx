import { useState } from 'react';

// replaces the list title while you rename it
export default function RenameForm({ currentName, onSave, onCancel }) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError("The name can't be empty");
    if (name.trim().length > 60) return setError('Keep it under 60 characters');
    try {
      await onSave(name.trim());
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="rename-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="rename" className="visually-hidden">List name</label>
      <input id="rename" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <div className="form-actions">
        <button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button>
        <button className="button">Save</button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </form>
  );
}
