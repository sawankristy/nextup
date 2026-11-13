import { YEAR_RANGES } from '../labels.js';

// the filter row under the search bar
// the values live in SearchPage (data down), this only shows them and calls the setters (events up)
export default function ResultFilters({ year, setYear, coverOnly, setCoverOnly, hideAdded, setHideAdded }) {
  return (
    <div className="result-filters" role="group" aria-label="Filter the results">
      <div className="field field-inline">
        <label htmlFor="year-filter">Year</label>
        <select id="year-filter" value={year} onChange={e => setYear(e.target.value)}>
          {YEAR_RANGES.map(range => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>
      </div>
      <label className="checkbox">
        <input type="checkbox" checked={coverOnly} onChange={e => setCoverOnly(e.target.checked)} />
        With a cover only
      </label>
      <label className="checkbox">
        <input type="checkbox" checked={hideAdded} onChange={e => setHideAdded(e.target.checked)} />
        Hide titles already in this list
      </label>
    </div>
  );
}
