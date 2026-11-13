// unit test: one component, alone
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from './StarRating.jsx';

// test what the user sees (Session 22): find things by their role and name, click like a user
describe('StarRating', () => {
  it('shows 5 stars and the current rating', () => {
    render(<StarRating rating={3} onRate={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
    expect(screen.getByRole('group', { name: 'Rated 3 out of 5' })).toBeInTheDocument();
  });

  it('sends the clicked star up to the parent', async () => {
    const onRate = vi.fn(); // a fake function that remembers how it was called
    render(<StarRating rating={null} onRate={onRate} />);
    await userEvent.click(screen.getByRole('button', { name: '4 stars' }));
    expect(onRate).toHaveBeenCalledWith(4);
  });
});
