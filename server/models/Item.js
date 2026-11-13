import mongoose from 'mongoose';

// one book or one movie inside a list
const itemSchema = new mongoose.Schema(
  {
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    // i keep the owner here too, so every item query can filter by userId directly
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    externalId: { type: String, required: true }, // the id from Open Library or TMDB
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, trim: true, maxlength: 200, default: '' }, // books only, movies leave it empty
    year: { type: Number, default: null },
    imageUrl: { type: String, default: '' }, // the cover (book) or the poster (movie)
    status: { type: String, enum: ['to do', 'in progress', 'done'], default: 'to do' },
    rating: { type: Number, min: 1, max: 5, default: null }, // null = not rated yet
  },
  { timestamps: true }
);

// matches find({ listId, userId }).sort({ createdAt: -1 }) --> only the titles of this list, already sorted
itemSchema.index({ listId: 1, userId: 1, createdAt: -1 });

// model Item --> collection "items"
export const Item = mongoose.model('Item', itemSchema);
