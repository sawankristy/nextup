// integration tests: a route with its middleware, through supertest
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';
import app from '../app.js';

// supertest calls the app directly: no port, no database (Session 22)
// all these requests are answered before any route touches MongoDB
// a valid token for a fake user, signed with the test secret from vitest.config.js
const token = jwt.sign({ sub: '64b7f0c2a1b2c3d4e5f60718' }, process.env.JWT_SECRET);

describe('NextUp API', () => {
  it('GET /api/health answers 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('rejects a missing token', async () => {
    const res = await request(app).get('/api/lists');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Missing token' });
  });

  it('locks the suggestions behind a token', async () => {
    const res = await request(app).get('/api/suggestions/movies');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Missing token' });
  });

  it('rejects a short password at signup', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test', email: 'test@example.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Password must be at least 8 characters' });
  });

  it('rejects an empty list name, even with a valid token', async () => {
    const res = await request(app)
      .post('/api/lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', category: 'book' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'List name is required' });
  });
});
