import express from 'express';
import { Item } from '../models/Item.js';
import { validateId, validate, ItemUpdateInput } from '../middleware/validate.js';

// every route here runs after requireAuth, so req.userId is always set
const itemsRouter = express.Router();

// UPDATE --> PATCH /api/items/:id  (status, rating and/or notes)
itemsRouter.patch('/:id', validateId, validate(ItemUpdateInput), async (req, res) => {
  const { status, rating, notes } = req.body;
  // only the fields that were sent, so changing the rating doesn't erase the status
  const changes = {};
  if (status !== undefined) changes.status = status;
  if (rating !== undefined) changes.rating = rating;
  if (notes !== undefined) changes.notes = notes;
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      changes,
      { returnDocument: 'after', runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE --> DELETE /api/items/:id
itemsRouter.delete('/:id', validateId, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.sendStatus(204); // 204 = deleted, no body
  } catch {
    res.status(500).json({ error: 'Could not delete the item' });
  }
});

export default itemsRouter;
