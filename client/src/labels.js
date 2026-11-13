// the database keeps 'to do' / 'in progress' / 'done', the screen shows words that fit the category
// in its own file because ItemCard and the filter pills both need the same words
export const STATUS_LABELS = {
  book: { 'to do': 'To read', 'in progress': 'Reading', done: 'Done' },
  movie: { 'to do': 'To watch', 'in progress': 'Watching', done: 'Done' },
};

// the Year filter of the search results: the words in the select + the years each choice keeps (both ends included)
// in this file because ResultFilters shows them and SearchPage filters with them
export const YEAR_RANGES = [
  { value: 'any', label: 'Any year' },
  { value: 'before-1980', label: 'Before 1980', from: 0, to: 1979 },
  { value: '1980-1999', label: '1980–1999', from: 1980, to: 1999 },
  { value: '2000-2014', label: '2000–2014', from: 2000, to: 2014 },
  { value: '2015-after', label: '2015 and after', from: 2015, to: 3000 },
];
