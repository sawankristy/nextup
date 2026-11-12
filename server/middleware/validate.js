import mongoose from 'mongoose';
import { z } from 'zod';

// i describe the shape of each body ONCE with zod (Session 21)
// wrong type, missing field or too long --> 400, before Mongo even sees it
// .trim() cleans the text while it checks, and the keys i didn't list are dropped

export function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

// one middleware for every body: give it a schema, it does the rest
export const validate = schema => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {}); // no body at all --> {} so the messages stay clear
  if (!result.success) {
    const msg = result.error.issues[0].message; // the first problem is enough
    return res.status(400).json({ error: msg });
  }
  req.body = result.data; // only the declared fields, already trimmed
  next();
};

export const SignupInput = z.object({
  name: z.string({ error: 'Name is required' })
    .trim()
    .min(1, 'Name is required')
    .max(60, 'Name must be 60 characters or less'),
  email: z.string({ error: 'A valid email is required' })
    .trim()
    .max(254, 'A valid email is required')
    .refine(email => email.includes('@'), 'A valid email is required'),
  password: z.string({ error: 'Password must be at least 8 characters' })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be 100 characters or less'),
});

export const LoginInput = z.object({
  email: z.string({ error: 'Email and password are required' })
    .trim()
    .min(1, 'Email and password are required')
    .max(254, 'Email or password is too long'),
  password: z.string({ error: 'Email and password are required' })
    .max(100, 'Email or password is too long'),
});

// the same rules for a new list and for renaming one
const listName = z.string({ error: 'List name is required' })
  .trim()
  .min(1, 'List name is required')
  .max(60, 'List name must be 60 characters or less');

export const NewListInput = z.object({
  name: listName,
  category: z.enum(['book', 'movie'], { error: "category must be 'book' or 'movie'" }),
});

// renaming only needs a name (the category never changes)
export const RenameInput = z.object({
  name: listName,
});

// a title from the search results (status and rating are NOT here, a new title always starts at 'to do')
export const NewItemInput = z.object({
  externalId: z.string({ error: 'externalId and title are required' })
    .trim()
    .min(1, 'externalId and title are required')
    .max(100, 'externalId is too long'),
  title: z.string({ error: 'externalId and title are required' })
    .trim()
    .min(1, 'externalId and title are required')
    .max(200, 'title must be 200 characters or less'),
  author: z.string({ error: 'author must be text' })
    .trim()
    .max(200, 'author must be 200 characters or less')
    .optional(),
  year: z.number({ error: 'year must be a whole number' })
    .int('year must be a whole number')
    .min(0, 'year must be between 0 and 3000')
    .max(3000, 'year must be between 0 and 3000')
    .nullable() // null = the year isn't known
    .optional(),
  imageUrl: z.string({ error: 'imageUrl must be text' })
    .trim()
    .max(500, 'imageUrl is too long')
    .optional(),
});

// PATCH: both are optional, but the ones that are sent must be correct
const STATUS_ERROR = "status must be 'to do', 'in progress' or 'done'";
const RATING_ERROR = 'rating must be a whole number from 1 to 5';

export const ItemUpdateInput = z.object({
  status: z.enum(['to do', 'in progress', 'done'], { error: STATUS_ERROR }).optional(),
  rating: z.number({ error: RATING_ERROR })
    .int(RATING_ERROR)
    .min(1, RATING_ERROR)
    .max(5, RATING_ERROR)
    .optional(),
}).refine(body => body.status !== undefined || body.rating !== undefined, 'Send a status or a rating');
