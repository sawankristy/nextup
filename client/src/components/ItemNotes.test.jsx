// unit test: one component, alone
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemNotes from './ItemNotes.jsx';

// test what the user sees (Session 22): find things by their role and name, click and type like a user
describe('ItemNotes', () => {
  it('saves a new note without the extra spaces', async () => {
    const onSave = vi.fn(); // a fake function that remembers how it was called
    render(<ItemNotes notes="" title="Dune" onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Add a note' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Notes on Dune' }), '  Loved it  ');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('Loved it');
  });

  it('Cancel saves nothing and keeps the old note', async () => {
    const onSave = vi.fn();
    render(<ItemNotes notes="Great ending" title="Dune" onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit note' }));
    const box = screen.getByRole('textbox', { name: 'Notes on Dune' });
    await userEvent.clear(box);
    await userEvent.type(box, 'Boring');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Great ending')).toBeInTheDocument();
  });
});
