import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from './StarRating.jsx';

describe('StarRating', () => {
  it('shows 5 stars and the current rating', () => {
    render(<StarRating rating={3} onRate={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
    // getByRole throws if it can't find it, so this also checks the label is right
    expect(screen.getByRole('group', { name: 'Rated 3 out of 5' })).toBeDefined();
  });

  it('sends the clicked star up to the parent', () => {
    const onRate = vi.fn(); // a fake function that remembers how it was called
    render(<StarRating rating={null} onRate={onRate} />);
    fireEvent.click(screen.getByRole('button', { name: '4 stars' }));
    expect(onRate).toHaveBeenCalledWith(4);
  });
});
