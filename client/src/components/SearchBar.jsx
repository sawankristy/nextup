import { useState } from 'react';

// the text in the input only matters here, so its state stays in this component
export default function SearchBar({ label, placeholder, onSearch, disabled }) {
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault(); // no page reload (button click and Enter both submit)
    if (!text.trim()) return; // empty --> no point searching
    onSearch(text.trim()); // send it up to the page
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <label htmlFor="search" className="visually-hidden">{label}</label>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <input
        id="search"
        type="search"
        placeholder={placeholder}
        value={text}
        onChange={e => setText(e.target.value)}
        autoFocus
      />
      <button className="button" disabled={disabled}>Search</button>
    </form>
  );
}
