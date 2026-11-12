import mongoose from 'mongoose';

// one user = one account
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }, // never the real password, only the bcrypt hash
  },
  { timestamps: true } // adds createdAt and updatedAt by itself
);

// model User --> collection "users"
export const User = mongoose.model('User', userSchema);
