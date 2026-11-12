import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

// these 3 routes answer before touching the database, so the test doesn't need MongoDB
let server;
let baseUrl;

before(async () => {
  // port 0 = "give me any free port"
  await new Promise(resolve => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => {
  server.close();
});

test('GET /api/health answers 200', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('GET /api/lists without a token answers 401', async () => {
  const res = await fetch(`${baseUrl}/api/lists`);
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: 'Missing token' });
});

test('POST /api/auth/signup with a short password answers 400', async () => {
  const res = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: '123' }),
  });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'Password must be at least 8 characters' });
});
