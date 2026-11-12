# Security audit (Session 21 lab)

We attacked our own API, fixed the holes, then ran the **exact same attacks** again.

- **When:** 13 November 2026, on the API running locally (`npm start` in `server/`) with our MongoDB Atlas database.
- **How:** with `curl`, as two throwaway users, Alice and Bob, who were deleted afterwards. Alice has one Books list. `$ALICE` and `$BOB` stand for their login tokens.
- **Before** = the code at commit `f4ae10e`. **After** = the commit that adds this file.

## Summary

| Hole | Before | After | |
| --- | --- | --- | --- |
| Brute force | 20 wrong passwords → 20 × `401`, nothing slows down | from the 5th login request: `429 Too many attempts` | **fixed** |
| Headers | `X-Powered-By: Express`, no security headers | 12 security headers from helmet, `X-Powered-By` gone | **fixed** |
| Big body | 1 MB → `413`, but 50 KB was read in full | anything over 10 KB → `413` | **fixed** |
| Injection | `400`: the email must be text | `400`: same, now also checked by zod and `sanitizeFilter` | already closed |
| Mass assignment | `userId`, `status`, `rating` in the body were ignored | same, now dropped by zod before the route | already closed |
| IDOR | Bob deleting Alice's list → `404` | `404` | already closed |
| Secrets | no real secret in the Git history | same, and the server now refuses to start without its secrets | already closed |

---

## 1. Brute force

**Attack:** 20 wrong passwords in a row for Alice.
```
for i in $(seq 1 20); do
  curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' \
    -d '{"email":"alice-test@example.com","password":"wrong-'$i'"}'
done
```
**Before:** all 20 answered `401 {"error":"Invalid email or password"}`. Nothing stops a script from trying thousands of passwords.

**Fix:** `server/app.js`
- lines 21–26: a `loginLimiter` (5 requests per 15 minutes per IP, then `429`)
- line 34: `app.use('/api/auth/login', loginLimiter)`
- lines 15–20 and 33: an `apiLimiter` (300 requests per 15 minutes) on the whole `/api`
- line 29: `app.set('trust proxy', 1)`, so on Render the limit counts the visitor's IP and not Render's proxy

**After:**
```
attempt 1: {"error":"Invalid email or password"} HTTP 401
...
attempt 4: {"error":"Invalid email or password"} HTTP 401
attempt 5: {"error":"Too many attempts. Try again later."} HTTP 429
...
attempt 20: {"error":"Too many attempts. Try again later."} HTTP 429
```
The last answer also has `Retry-After: 897` (seconds left). Only 4 answers were `401` because the injection test (section 4) had just used one of the 5 tries: the limiter counts **every** login request, right or wrong.

## 2. Headers

**Attack:** `curl -I http://localhost:3000/api/health`

**Before:**
```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
```
`X-Powered-By` tells attackers which framework to target, and nothing tells the browser to protect the user.

**Fix:** `server/app.js` line 30: `app.use(helmet())`, the first middleware, before the routes.

**After:**
```
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';base-uri 'self';...;frame-ancestors 'self';...
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: no-referrer
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
...
```
`X-Powered-By` is gone.

## 3. Big body

**Attack:** create a list with a huge name.
```
curl -X POST http://localhost:3000/api/lists -H 'Authorization: Bearer $ALICE' \
  -H 'Content-Type: application/json' --data-binary @body-1mb.json    # 1 MB
curl -X POST http://localhost:3000/api/lists -H 'Authorization: Bearer $ALICE' \
  -H 'Content-Type: application/json' --data-binary @body-50kb.json   # 50 KB
```
**Before:**
- 1 MB → `413 {"error":"request entity too large"}`: Express already refuses bodies over 100 KB by default.
- 50 KB → the server read and parsed the whole body, then sent it to Mongoose, which answered `400` with a long message that repeated the input: ``{"error":"List validation failed: name: Path `name` (`aaaa...`, length 51200) is longer than ..."}``.

**Fix:**
- `server/app.js` line 32: `express.json({ limit: '10kb' })`. None of our bodies needs more than a few hundred bytes.
- `server/middleware/validate.js`: a `.max()` on every text field, so each field also has its own size limit.

**After:** both bodies → `413 {"error":"request entity too large"}`, before any route runs.

## 4. Injection

**Attack:** log in with a MongoDB operator instead of an email. `{ "$ne": "" }` means "any email that isn't empty".
```
curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email": {"$ne": ""}, "password": "x"}'
```
**Before:** `400 {"error":"Email and password are required"}`.

**Already closed.** The old validation checked `typeof email === 'string'`, so an object never reached `User.findOne`.

**Fix (two layers now):**
- `server/middleware/validate.js` lines 40–47: `LoginInput`, where `email` must be `z.string()`. Every body goes through a zod schema.
- `server/server.js` line 12: `mongoose.set('sanitizeFilter', true)`. This is the backstop: even if an object slipped through, Mongoose would treat `$ne` as plain data, not as an operator.

**After:** `400 {"error":"Email and password are required"}`, same as before.

## 5. Mass assignment

**Attack:** Alice adds a title to her list, but the body also tries to give it to Bob and to mark it done with 5 stars.
```
curl -X POST http://localhost:3000/api/lists/<alice-list-id>/items -H 'Authorization: Bearer $ALICE' \
  -H 'Content-Type: application/json' \
  -d '{"externalId":"OL1W","title":"Test book","userId":"<bob-id>","status":"done","rating":5}'
```
**Before:** `201`, but the saved title has Alice's id as `userId` (not Bob's), `"status":"to do"` and `"rating":null`.

**Already closed.** The route picks the fields one by one and takes the owner from the token (`server/routes/lists.js` lines 98–107).

**Fix (second layer):**
- `server/middleware/validate.js` lines 66–92: `NewItemInput` only lists `externalId`, `title`, `author`, `year` and `imageUrl`.
- Line 22: `req.body = result.data`. zod drops every other key before the route even starts.

**After:** same `201`, with Alice's `userId`, `"status":"to do"` and `"rating":null`.

## 6. IDOR (someone else's id)

**Attack:** Bob deletes Alice's list by its id.
```
curl -X DELETE http://localhost:3000/api/lists/<alice-list-id> -H 'Authorization: Bearer $BOB'
```
**Before:** `404 {"error":"List not found"}`, and Alice still gets her list (`200`).

**Already closed, no change needed.** Every query filters on the id **and** the owner from the token, `{ _id: req.params.id, userId: req.userId }` (`server/routes/lists.js` lines 41, 53, 68, 80, 93 and `server/routes/items.js` lines 17, 31). Someone else's list looks like a list that doesn't exist.

**After:** `404 {"error":"List not found"}`, and Alice's list is still there (`200`).

## 7. Secrets

**Attack:** search the whole Git history for secrets.
```
git log -p | grep -i -E "JWT_SECRET=|MONGODB_URI=mongodb"
```
**Before:** a single line, `+JWT_SECRET=PASTE_A_LONG_RANDOM_SECRET_HERE`, which is the placeholder in `server/.env.example`. We also searched the history for the real values of `JWT_SECRET`, `MONGODB_URI` and `TMDB_API_KEY` (without printing them): found 0 times each.

**Already closed.** `.env` has been in `.gitignore` since the first commit, and the real values live only in `server/.env` and in Render's settings.

**Fix (fail fast):** `server/server.js` lines 6–9. If `MONGODB_URI`, `JWT_SECRET`, `TMDB_API_KEY` or `CLIENT_ORIGIN` is missing, the server stops at startup with a clear error, instead of breaking later in the middle of a request:
```
Error: Missing env var: TMDB_API_KEY
```
**After:** same search, same result: only the placeholder, and the real values 0 times.

---

## What changed in the code

| File | Change |
| --- | --- |
| `server/app.js` | `trust proxy`, `helmet()`, `express.json({ limit: '10kb' })`, `apiLimiter` (300 / 15 min), `loginLimiter` (5 / 15 min) |
| `server/server.js` | stops at startup if a secret is missing, `mongoose.set('sanitizeFilter', true)` |
| `server/middleware/validate.js` | rewritten with zod: one schema per body plus one `validate(schema)` middleware. Unknown keys are dropped, there's a `.max()` on every field, and the error messages are the same as before |
| `server/routes/*.js` | use `validate(SignupInput)`, `validate(NewListInput)`, and so on |
| `server/package.json` | new packages: `helmet`, `express-rate-limit`, `zod` |
