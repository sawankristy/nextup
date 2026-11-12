import { useState } from 'react';

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Give your list a name';
  else if (form.name.trim().length > 60) errors.name = 'Keep it under 60 characters';
  return errors;
}

// many fields --> one state object, and [name]: value changes the right one
export default function NewListForm({ onCreate, onCancel }) {
  const [form, setForm] = useState({ name: '', category: 'book' });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return; // has errors --> stop
    try {
      await onCreate({ name: form.name.trim(), category: form.category });
    } catch (err) {
      setErrors({ name: err.message }); // the server said no
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="list-name">List name</label>
        <input
          id="list-name"
          name="name"
          placeholder="Summer reads"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>

      <fieldset className="field">
        <legend>Category</legend>
        <div className="radio-row">
          <label className="radio">
            <input
              type="radio"
              name="category"
              value="book"
              checked={form.category === 'book'}
              onChange={handleChange}
            />
            Books
          </label>
          <label className="radio">
            <input
              type="radio"
              name="category"
              value="movie"
              checked={form.category === 'movie'}
              onChange={handleChange}
            />
            Movies
          </label>
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button>
        <button className="button">Create list</button>
      </div>
    </form>
  );
}
