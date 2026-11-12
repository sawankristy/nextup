// small helpers for text on the screen (no React, no DOM here)

// plural(1, 'title') --> "1 title", plural(4, 'title') --> "4 titles"
export function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// "Kristy Sawan" --> "KS"
export function initials(name) {
  return name
    .split(' ')
    .filter(word => word !== '')
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
}
