import express from 'express';
import { List } from '../models/List.js';
import { Item } from '../models/Item.js';
import { validateId, validateNewList, validateRename, validateNewItem } from '../middleware/validate.js';

// every route here runs after requireAuth, so req.userId is always set
const listsRouter = express.Router();

// READ ALL --> GET /api/lists  (my lists, newest first, with how many titles each one has)
listsRouter.get('/', async (req, res) => {
  try {
    const lists = await List.find({ userId: req.userId }).sort({ createdAt: -1 });
    // Promise.all waits for all the counts at the same time
    const counts = await Promise.all(
      lists.map(list => Item.countDocuments({ listId: list._id, userId: req.userId }))
    );
    res.json(lists.map((list, i) => ({ ...list.toObject(), count: counts[i] })));
  } catch {
    res.status(500).json({ error: 'Could not get your lists' });
  }
});

// CREATE --> POST /api/lists
listsRouter.post('/', validateNewList, async (req, res) => {
  try {
    const list = await List.create({
      userId: req.userId, // the owner comes from the token, never from the body
      name: req.body.name.trim(),
      category: req.body.category,
    });
    res.status(201).json({ ...list.toObject(), count: 0 });
  } catch (err) {
    res.status(400).json({ error: err.message }); // a schema rule failed (like a name that's too long)
  }
});

// READ ONE --> GET /api/lists/:id
listsRouter.get('/:id', validateId, async (req, res) => {
  try {
    // userId in the filter: someone else's list --> null --> 404, like it doesn't exist
    const list = await List.findOne({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch {
    res.status(500).json({ error: 'Could not get the list' });
  }
});

// RENAME --> PATCH /api/lists/:id  (only the name, the category stays the same)
listsRouter.patch('/:id', validateId, validateRename, async (req, res) => {
  try {
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name: req.body.name.trim() },
      // returnDocument: 'after' = new: true from the course (Mongoose 9 renamed it)
      { returnDocument: 'after', runValidators: true }
    );
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE --> DELETE /api/lists/:id  (the list AND its items)
listsRouter.delete('/:id', validateId, async (req, res) => {
  try {
    const list = await List.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ error: 'List not found' });
    await Item.deleteMany({ listId: list._id, userId: req.userId }); // no items left behind
    res.sendStatus(204);
  } catch {
    res.status(500).json({ error: 'Could not delete the list' });
  }
});

// ITEMS OF A LIST --> GET /api/lists/:id/items
listsRouter.get('/:id/items', validateId, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ error: 'List not found' });
    const items = await Item.find({ listId: list._id, userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Could not get the titles' });
  }
});

// ADD A TITLE --> POST /api/lists/:id/items  (from the search results)
listsRouter.post('/:id/items', validateId, validateNewItem, async (req, res) => {
  const { externalId, title, author, year, imageUrl } = req.body;
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ error: 'List not found' });
    if (await Item.findOne({ listId: list._id, externalId })) {
      return res.status(409).json({ error: 'Already in this list' });
    }
    // i pick the fields one by one, so the body can't set userId, status or rating by itself
    const item = await Item.create({
      listId: list._id,
      userId: req.userId,
      externalId,
      title,
      author,
      year,
      imageUrl,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default listsRouter;
