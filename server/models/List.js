import mongoose from 'mongoose';

// a list belongs to one user and has one category: books OR movies
const listSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: { type: String, required: true, enum: ['book', 'movie'] },
  },
  { timestamps: true }
);

// matches find({ userId }).sort({ createdAt: -1 }) --> Mongo reads only my lists, already sorted
listSchema.index({ userId: 1, createdAt: -1 });

// model List --> collection "lists"
export const List = mongoose.model('List', listSchema);
