import mongoose from 'mongoose';

// validation middleware: check the input, send a 400 if something is wrong, otherwise next()
// (i check the type too, so nobody can send an object where i expect text)

const CATEGORIES = ['book', 'movie'];
const STATUSES = ['to do', 'in progress', 'done'];

function isText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

export function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

export function validateSignup(req, res, next) {
  const { name, email, password } = req.body ?? {};
  if (!isText(name)) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!isText(email) || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body ?? {};
  if (!isText(email) || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  next();
}

export function validateNewList(req, res, next) {
  const { name, category } = req.body ?? {};
  if (!isText(name)) {
    return res.status(400).json({ error: 'List name is required' });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "category must be 'book' or 'movie'" });
  }
  next();
}

// renaming only needs a name (the category never changes)
export function validateRename(req, res, next) {
  const { name } = req.body ?? {};
  if (!isText(name)) {
    return res.status(400).json({ error: 'List name is required' });
  }
  next();
}

export function validateNewItem(req, res, next) {
  const { externalId, title } = req.body ?? {};
  if (!isText(externalId) || !isText(title)) {
    return res.status(400).json({ error: 'externalId and title are required' });
  }
  next();
}

// PATCH: both are optional, but the ones that are sent must be correct
export function validateItemUpdate(req, res, next) {
  const { status, rating } = req.body ?? {};
  if (status === undefined && rating === undefined) {
    return res.status(400).json({ error: 'Send a status or a rating' });
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    return res.status(400).json({ error: "status must be 'to do', 'in progress' or 'done'" });
  }
  if (rating !== undefined && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) {
    return res.status(400).json({ error: 'rating must be a whole number from 1 to 5' });
  }
  next();
}
