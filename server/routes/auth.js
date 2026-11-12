import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { signToken } from '../auth/token.js';
import { validate, SignupInput, LoginInput } from '../middleware/validate.js';

const authRouter = express.Router();

// what the front end gets about the user (never the hash!)
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

// SIGN UP --> POST /api/auth/signup  (validate --> hash --> save --> sign)
authRouter.post('/signup', validate(SignupInput), async (req, res) => {
  const { name, password } = req.body; // zod already trimmed the name
  const email = req.body.email.toLowerCase();
  try {
    if (await User.findOne({ email })) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12); // 12 = the cost, slow on purpose
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch {
    res.status(500).json({ error: 'Could not create the account' });
  }
});

// LOG IN --> POST /api/auth/login  (find --> compare --> sign)
authRouter.post('/login', validate(LoginInput), async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { password } = req.body;
  try {
    const user = await User.findOne({ email });
    const ok = user && await bcrypt.compare(password, user.passwordHash);
    // same message in both cases, so nobody can find out which emails have an account
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch {
    res.status(500).json({ error: 'Could not log in' });
  }
});

export default authRouter;
