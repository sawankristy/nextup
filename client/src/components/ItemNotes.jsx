import { useState } from 'react';

// my own note on one title: a small button, the note itself, or a small form to write it
// same pattern as RenameForm: a controlled form with Save / Cancel, and the parent does the saving
export default function ItemNotes({ notes, title, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes); // what's in the textarea while i write

  function startEditing() {
    setDraft(notes); // always start from the saved note
    setEditing(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (text !== notes) onSave(text); // nothing changed --> no request, just close
    setEditing(false);
  }

  function handleCancel() {
    setDraft(notes); // put the draft back
    setEditing(false);
  }

  // the textarea is inside its label (like the checkboxes of the search filters),
  // the label text is only for screen readers
  if (editing) {
    return (
      <form className="notes-form" onSubmit={handleSubmit}>
        <label>
          <span className="visually-hidden">Notes on {title}</span>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            maxLength={1000}
            rows={3}
            autoFocus
          />
        </label>
        <div className="notes-actions">
          <span className="muted small">{draft.length} / 1000</span>
          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={handleCancel}>Cancel</button>
            <button className="button">Save</button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="notes">
      {notes && <p className="item-notes">{notes}</p>}
      <button type="button" className="link-button small" onClick={startEditing}>
        {notes ? 'Edit note' : '+ Add a note'}
      </button>
    </div>
  );
}
