import { describe, it, expect } from 'vitest';
import { plural, initials } from './format.js';

// unit tests: one function, alone (no React, no browser, no server) --> milliseconds
// like the slide: one behavior per it, and the edges too, not only the happy path

describe('plural', () => {
  it('adds an s for 0', () => {
    expect(plural(0, 'title')).toBe('0 titles');
  });

  it('keeps the word as it is for 1', () => {
    expect(plural(1, 'title')).toBe('1 title');
  });

  it('adds an s for more than 1', () => {
    const result = plural(4, 'title'); // act
    expect(result).toBe('4 titles'); // assert
  });
});

describe('initials', () => {
  it('takes the first letter of the first name and the last name', () => {
    expect(initials('Kristy Sawan')).toBe('KS');
  });

  it('ignores extra spaces and makes the letters uppercase', () => {
    expect(initials('  kristy  sawan ')).toBe('KS');
  });

  it('gives one letter for one word', () => {
    expect(initials('Lynn')).toBe('L');
  });

  it('keeps only 2 letters for three words', () => {
    expect(initials('Kristy Marie Sawan')).toBe('KM');
  });

  it('gives an empty string for an empty name', () => {
    expect(initials('')).toBe('');
  });
});
