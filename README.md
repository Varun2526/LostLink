# LostLink

**Secure Digital Lost & Found for Campuses**

Team 13 | Hackathon Project

Reconnecting people with their belongings, safely.

> Post it. Match it. Verify it. Reclaim it.

| | |
|---|---|
| **Live App** | https://lost-link-drab.vercel.app |
| **API** | https://lostlink-3mkr.onrender.com/api |
| **Repository** | https://github.com/Varun2526/LostLink |

---

## Table of Contents

1. [Project Objective / Problem Statement](#1-project-objective--problem-statement)
2. [Proposed Solution](#2-proposed-solution)
3. [Key Features](#3-key-features)
4. [Technologies Used](#4-technologies-used)
5. [Implementation Details](#5-implementation-details)
6. [Future Scope](#6-future-scope)
7. [References / Bibliography](#7-references--bibliography)

---

## 1. Project Objective / Problem Statement

College campuses lose track of items daily — bags, ID cards, electronics, water bottles, calculators. The systems students actually use to recover them are informal and broken in three specific ways:

**Discovery is scattered.** Lost-and-found activity lives across WhatsApp groups, Instagram stories, department notice boards, and a physical desk in the admin block. A student who loses a wallet has no single place to look, and a student who finds one has no single place to report it. Posts scroll out of view within hours.

**There is no ownership verification.** This is the critical failure. On a WhatsApp group, a post reading *"found a black wallet near the library"* can be claimed by anyone who replies "that's mine" first. The finder has no way to distinguish the real owner from an opportunist, and no mechanism exists to prove ownership short of demanding an ID card — which itself is often the lost item.

**There is no record or accountability.** Once a message scrolls away, nothing persists. There is no audit trail of who claimed what, no way to measure how many items are recovered, and no accountability for either party.

### Objective

Build a centralized, campus-scoped web platform where lost and found items are posted, searched, and automatically matched — and where **ownership must be proven before an item changes hands**, without requiring anyone to hand over personal identity documents.

---

## 2. Proposed Solution

LostLink is a MERN-stack web application built around a single core idea: **the person who found the item controls a secret that only the true owner can know.**

### The verification mechanism

When a user posts a found item, they set a **verification question** and a **private verification answer**:

> Question: *"What colour was the ID card inside?"*
> Answer: *"Blue"* — never shown to anyone

Anyone browsing the item sees the question but **never** the answer. The answer is excluded at the database layer, not merely hidden in the UI, so no API response, page source, or network inspection can reveal it.

A claimant submits their own answer. The backend normalizes both strings (trim + lowercase) and compares them, storing the boolean result as `answerMatched`. The finder then sees:

```
Claimed by Nihal — nihal@lostlink.com
✅ Answer matches your private answer
They answered: blue
[ Approve ]  [ Reject ]
```

The claimant is **never told whether their answer matched** — not on submission, not in their claims list. This is deliberate: revealing the match result would let an attacker brute-force the answer one guess at a time.

Approval is a **human decision informed by an automated check**. The backend verifies and surfaces the result; the finder makes the final call. This is intentional — a legitimate owner might answer "navy" when the finder wrote "blue", and a human can accept that where a strict string comparison would not.

### Supporting flow

Because a lost report and a found report are two descriptions of the same object, LostLink cross-references them with **rule-based similarity matching**, surfacing likely pairs so users do not have to scroll the entire board.

---

## 3. Key Features

### Implemented

| Feature | Description |
|---|---|
| **Authentication** | Email + password signup and login, bcrypt-hashed passwords, JWT sessions |
| **Refresh tokens** | 15-minute access tokens with rotating 7-day refresh tokens; sessions survive silently and logout genuinely revokes |
| **Post lost / found items** | Title, category, description, location, date, optional photo |
| **Verification-gated claiming** | Private answer never leaves the server; finder approves or rejects |
| **Search & filter** | Case-insensitive keyword search over title and description, plus category and Lost/Found/All type filters |
| **Rule-based matching** | Automatically suggests likely lost↔found pairs with a percentage score |
| **Claim lifecycle** | Submit, approve, reject; approving marks the item `claimed` and auto-rejects competing claims |
| **In-app notifications** | Bell with unread badge; alerts on claim received, approved, and rejected |
| **Dashboard** | Personal statistics, pending-action callout, recent posts |
| **My Posts / My Claims / Requests** | Full management views with edit, resolve, reopen, and delete |
| **Image upload** | Photo upload to Cloudinary, with a paste-a-link fallback |
| **Rate limiting** | Three tiers — global, authentication, and write operations |
| **Input validation** | Server-side validation and sanitization on every write, with field-level error messages |

### Security properties

- `verificationAnswer` is `select: false` in the Mongoose schema — excluded from **every** query result unless explicitly requested by the claim-verification code path. Verified by grepping all public endpoints.
- `answerMatched` and the submitted `answer` are visible **only** to the post owner.
- Ownership is enforced server-side on every mutation: `post.postedBy.toString() !== req.userId → 403`.
- `postedBy` cannot be reassigned through the update endpoint; the owner is always taken from the JWT, never the request body.
- Status `claimed` **cannot** be set manually — it is written only by the claim-approval flow, so the verification step cannot be bypassed.
- Passwords are never stored or returned; only `passwordHash` exists, and it is never serialized to a response.

---

## 4. Technologies Used

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI library |
| Vite | 8.2 | Build tool and dev server |
| React Router | 7.18 | Client-side routing |
| Tailwind CSS | 4.3 | Utility-first styling (via `@tailwindcss/vite`) |
| Axios | 1.20 | HTTP client with auth and refresh interceptors |
| oxlint | 1.79 | Linting |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime (ES Modules) |
| Express | 5.2 | HTTP server and routing |
| MongoDB Atlas | — | Cloud database |
| Mongoose | 9.9 | ODM, schema validation, field projection |
| jsonwebtoken | 9.0 | JWT signing and verification |
| bcryptjs | 3.0 | Password hashing |
| express-validator | 7.3 | Input validation and sanitization |
| express-rate-limit | 8.6 | Request throttling |
| string-similarity | 4.0 | Dice-coefficient text matching |
| multer | 2.2 | Multipart form parsing (memory storage) |
| cloudinary | 2.11 | Image hosting |
| cors, dotenv | — | Cross-origin support, environment config |

### Infrastructure

| Service | Role |
|---|---|
| Vercel | Frontend hosting, SPA rewrites, CI on push |
| Render | Backend hosting, CI on push |
| MongoDB Atlas | Managed database |
| Cloudinary | Image CDN |

---

## 5. Implementation Details

### 5.1 Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Client — React SPA (Vercel)                            │
│  Login · Signup · Browse/Search · Post Item             │
│  Item Detail (+ matches + claim form) · Dashboard       │
│  My Posts · My Claims · Requests · Notification Bell    │
└────────────────────────┬────────────────────────────────┘
                         │ REST / JSON over HTTPS
                         │ axios — access token + auto-refresh
┌────────────────────────▼────────────────────────────────┐
│  Express API (Render)                                   │
│                                                          │
│  Global:  cors → express.json → apiLimiter              │
│  Per-route: authLimiter | writeLimiter                  │
│             → validator rules → validate                │
│             → authMiddleware → controller               │
│                                                          │
│  Controllers: auth · post · claim · notification        │
│               dashboard · upload                        │
│  Utils:       matching · tokens · notify                │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
┌──────────▼──────────────┐  ┌──────────▼─────────────────┐
│  MongoDB Atlas          │  │  Cloudinary                │
│  users · itemposts      │  │  item photos               │
│  claims · notifications │  └────────────────────────────┘
│  refreshtokens (TTL)    │
└─────────────────────────┘
```

**Note on middleware:** authentication is applied **per route**, not globally. Browsing and search are deliberately public so a visitor can see what has been found before creating an account.

### 5.2 Repository structure

```
LostLink/
├── client/                     React frontend
│   ├── src/
│   │   ├── api/axios.js        HTTP client, auth + refresh interceptors
│   │   ├── context/            AuthContext (session state)
│   │   ├── components/         Navbar, PostCard, NotificationBell, ProtectedRoute
│   │   └── pages/              9 route components
│   └── vercel.json             SPA rewrite (deep links → index.html)
│
└── server/                     Express backend
    ├── server.js               Entry point, middleware, route mounting
    └── src/
        ├── config/             db.js, cloudinary.js
        ├── models/             User, ItemPost, Claim, Notification, RefreshToken
        ├── middleware/         authMiddleware, rateLimiter, validate, upload
        ├── validators/         auth, post, claim rule sets
        ├── controllers/        auth, post, claim, notification, dashboard, upload
        ├── routes/             one router per resource
        └── utils/              matching.js, tokens.js, notify.js
```

### 5.3 Data models

**User**
```js
{ name, email (unique, lowercase), passwordHash, campus, timestamps }
```

**ItemPost**
```js
{
  type: "lost" | "found",
  title, category, description, location, date, imageUrl,
  verificationQuestion,                    // public
  verificationAnswer,                      // select: false — never returned
  postedBy: ObjectId → User,
  status: "open" | "claimed" | "resolved", // default "open"
  timestamps
}
```

**Claim**
```js
{
  post: ObjectId → ItemPost,
  claimant: ObjectId → User,
  owner: ObjectId → User,        // denormalized so "received claims" is one query
  answer: String,                 // select: false — owner only
  answerMatched: Boolean,         // select: false — owner only
  message, status: "pending" | "approved" | "rejected",
  timestamps
}
// unique compound index on { post, claimant } — one claim per user per item
```

**Notification**
```js
{ user, type, title, body, link, read, timestamps }
```

**RefreshToken**
```js
{ user, token (unique), expiresAt, timestamps }
// TTL index on expiresAt — MongoDB deletes expired sessions automatically
```

### 5.4 API reference

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| GET | `/api/health` | — | Service health check |
| POST | `/api/auth/signup` | — | Create account, returns token pair |
| POST | `/api/auth/login` | — | Authenticate, returns token pair |
| POST | `/api/auth/refresh` | — | Exchange refresh token for a new pair |
| POST | `/api/auth/logout` | — | Revoke the refresh token |
| GET | `/api/posts` | — | All open posts, newest first |
| GET | `/api/posts/search` | — | `?q=` `?category=` `?type=lost\|found` |
| GET | `/api/posts/:id` | — | Single post |
| GET | `/api/posts/:id/matches` | — | Scored opposite-type suggestions |
| GET | `/api/posts/mine` | ✅ | All own posts, any status |
| POST | `/api/posts` | ✅ | Create post |
| PATCH | `/api/posts/:id` | ✅ | Update (owner only) |
| DELETE | `/api/posts/:id` | ✅ | Delete (owner only) |
| POST | `/api/claims` | ✅ | Submit a claim |
| GET | `/api/claims/my` | ✅ | Claims I submitted |
| GET | `/api/claims/received` | ✅ | Claims on my posts (+ answer, match result) |
| PATCH | `/api/claims/:id/approve` | ✅ | Approve (post owner only) |
| PATCH | `/api/claims/:id/reject` | ✅ | Reject (post owner only) |
| GET | `/api/notifications` | ✅ | List + unread count |
| PATCH | `/api/notifications/:id/read` | ✅ | Mark one read |
| PATCH | `/api/notifications/read-all` | ✅ | Mark all read |
| GET | `/api/dashboard/stats` | ✅ | Aggregated statistics |
| POST | `/api/upload` | ✅ | Upload an image, returns URL |

### 5.5 Matching algorithm

A lost post is compared only against **open found posts**, and vice versa. Scoring combines text similarity with two categorical signals:

```
score = diceCoefficient(titleA + descA, titleB + descB) × 0.80
      + 0.15  if categories match exactly
      + 0.05  if locations match exactly
```

Results below `0.20` are discarded; the top 10 are returned sorted descending.

`string-similarity` implements the **Sørensen–Dice coefficient** over character bigrams — it measures the proportion of shared adjacent character pairs, which tolerates word reordering and minor spelling differences better than exact substring matching.

Worked example, computed against the live scoring function:

```
Found: "Black leather wallet" / "found near the library reading hall"
Lost:  "Lost my black wallet" / "lost near the library yesterday"
        both category "documents", both location "Central Library"

  raw Dice similarity        0.5111
  × 0.80                     0.4089
  + 0.15  category matches   0.5589
  + 0.05  location matches   0.6089
  → displayed as "61% match"
```

> **Terminology:** this is **rule-based similarity matching**, not AI or machine learning. It uses no model, no training data, and no embeddings.

### 5.6 Authentication and session handling

1. Signup/login issue a **15-minute JWT access token** (payload: `userId`, `jti`, `iat`, `exp`) plus a **96-character random refresh token** persisted in MongoDB with a TTL index.
2. Axios attaches the access token to every request.
3. On a `401`, the response interceptor exchanges the refresh token for a new pair and **replays the original request** — the user never sees a logout.
4. Concurrent 401s share a single in-flight refresh promise, so five simultaneous failures trigger **one** refresh call, not five.
5. Refresh tokens **rotate** on every use: the old row is deleted as the new one is issued, so a stolen token stops working the moment the real user refreshes.
6. Logout deletes the row server-side — unlike a stateless JWT, the session is genuinely revoked.

A `jti` (unique token ID) is included because two JWTs signed for the same user within the same second are otherwise byte-identical, which makes a refresh appear to do nothing.

### 5.7 Rate limiting

| Scope | Window | Limit | Notes |
|---|---|---|---|
| All `/api` | 15 min | 300 | General protection |
| Login / signup | 15 min | 50 | Successful logins are not counted |
| Writes (posts, claims, uploads) | 60 min | 60 | Anti-spam |

`app.set("trust proxy", 1)` is required because Render terminates TLS at a proxy; without it every request appears to originate from the same internal IP.

The auth limit is deliberately set at 50 rather than a stricter 10–20: a campus shares one public IP through NAT, and once the limiter trips it blocks successful logins too. Fifty failed attempts per 15 minutes still makes brute force impractical while leaving room for a room full of people mistyping passwords.

### 5.8 Input validation

Every write endpoint runs `express-validator` rules, then a shared `validate` middleware that returns both a headline message and a field map:

```json
{
  "message": "Please enter a valid email",
  "fields": {
    "email": "Please enter a valid email",
    "password": "Password must be at least 6 characters"
  }
}
```

The frontend renders each message beneath its input. Text fields are trimmed and HTML-escaped; `verificationAnswer` is trimmed but **not** escaped, since escaping would corrupt answers containing characters like `&`.

### 5.9 Image upload

Files are held in memory by multer (never written to disk), capped at 5 MB, restricted to `image/*`, and streamed directly to Cloudinary. The returned secure URL is stored in `imageUrl`.

If the `CLOUDINARY_*` variables are absent, the endpoint returns a clear `503` and the UI falls back to a paste-a-link field, so the feature degrades gracefully rather than breaking the form.

### 5.10 Running locally

**Prerequisites:** Node.js 20+, MongoDB (local or Atlas)

```bash
git clone https://github.com/Varun2526/LostLink.git
cd LostLink

# Backend
cd server
npm install
cp .env.example .env      # then fill in the values below
npm run dev               # → http://localhost:5001

# Frontend (second terminal)
cd client
npm install
cp .env.example .env
npm run dev               # → http://localhost:5173
```

**`server/.env`**
```bash
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/lostlink
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_DAYS=7
CLIENT_URL=http://localhost:5173

# optional — uploads fall back to paste-a-link when blank
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Generate a secret with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**`client/.env`**
```bash
VITE_API_URL=http://localhost:5001/api
```

`server/test.http` contains 34 chained requests covering the full API. Open it in VS Code with the REST Client extension and run top to bottom — tokens and IDs flow automatically between requests.

### 5.11 Deployment

| Component | Platform | Configuration |
|---|---|---|
| Frontend | Vercel | Root directory `client`; `vercel.json` rewrites all paths to `index.html` for SPA routing |
| Backend | Render | Root directory `server`; start command `node server.js` |
| Database | MongoDB Atlas | Connection string in `MONGO_URI` |

Both platforms redeploy automatically on push to `main`. `VITE_API_URL` is inlined at **build** time, so changing it requires a redeploy, not just a restart.

---

## 6. Future Scope

**Email notifications.** In-app notifications exist; email delivery via Nodemailer/SMTP does not. Users currently learn of a claim by opening the app.

**AI-powered image matching.** Compare uploaded photos with a vision model or CLIP-style embeddings, so a photographed wallet matches a lost report even when the text descriptions differ.

**Semantic text matching.** Replace Dice-coefficient bigram overlap with sentence embeddings, so "phone" matches "mobile" and "specs" matches "spectacles" — cases the current character-level approach misses entirely.

**Push notifications.** Web Push or FCM so a match or claim reaches the user without opening the app.

**QR-code tagging.** Pre-registered stickers for high-value items, letting a finder scan and notify the owner directly.

**Multi-campus federation.** The `campus` field exists on every user but does not yet scope queries — all posts are currently visible to all users. Scoping the feed by campus, with an opt-in cross-campus view, is the natural next step.

**Real-time updates.** WebSockets in place of the current 20-second notification poll.

**Moderation and reporting.** Flagging inappropriate posts, plus an admin view for campus staff.

**Reputation system.** Track successful returns to build trust scores for frequent finders.

**Pagination.** All list endpoints currently return complete result sets — fine at campus scale, but pagination is needed before the dataset grows large.

**Automated test suite.** The API has been verified through scripted end-to-end runs and a 34-request `.http` suite; formal Jest/Supertest coverage in CI is not yet in place.

---

## 7. References / Bibliography

### Official documentation

1. **React** — Meta Open Source. https://react.dev/
2. **Vite** — Evan You & contributors. https://vite.dev/
3. **React Router** — Remix Software. https://reactrouter.com/
4. **Tailwind CSS** — Tailwind Labs. https://tailwindcss.com/docs
5. **Axios** — https://axios-http.com/docs/intro
6. **Node.js** — OpenJS Foundation. https://nodejs.org/docs/
7. **Express** — OpenJS Foundation. https://expressjs.com/
8. **MongoDB Manual** — MongoDB Inc. https://www.mongodb.com/docs/manual/
9. **Mongoose ODM** — https://mongoosejs.com/docs/
10. **MongoDB Atlas** — https://www.mongodb.com/docs/atlas/

### Libraries

11. **jsonwebtoken** — https://github.com/auth0/node-jsonwebtoken
12. **bcryptjs** — https://github.com/dcodeIO/bcrypt.js
13. **express-validator** — https://express-validator.github.io/docs/
14. **express-rate-limit** — https://express-rate-limit.mintlify.app/
15. **string-similarity** — https://github.com/aceakash/string-similarity
16. **multer** — https://github.com/expressjs/multer
17. **Cloudinary Node SDK** — https://cloudinary.com/documentation/node_integration

### Standards and specifications

18. **RFC 7519 — JSON Web Token (JWT).** Jones, M., Bradley, J., Sakimura, N. IETF, May 2015. https://datatracker.ietf.org/doc/html/rfc7519
19. **RFC 6749 — The OAuth 2.0 Authorization Framework** (refresh-token rotation model). Hardt, D. IETF, October 2012. https://datatracker.ietf.org/doc/html/rfc6749
20. **RFC 6585 — Additional HTTP Status Codes** (429 Too Many Requests). Nottingham, M., Fielding, R. IETF, April 2012. https://datatracker.ietf.org/doc/html/rfc6585

### Algorithms

21. **Sørensen, T. (1948).** "A method of establishing groups of equal amplitude in plant sociology based on similarity of species content." *Kongelige Danske Videnskabernes Selskab*, 5(4), 1–34.
22. **Dice, L. R. (1945).** "Measures of the Amount of Ecologic Association Between Species." *Ecology*, 26(3), 297–302. https://doi.org/10.2307/1932409
23. **Provos, N., & Mazières, D. (1999).** "A Future-Adaptable Password Scheme." *USENIX Annual Technical Conference.* — the bcrypt algorithm.

### Security guidance

24. **OWASP Top Ten.** https://owasp.org/www-project-top-ten/
25. **OWASP Authentication Cheat Sheet.** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
26. **OWASP Input Validation Cheat Sheet.** https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

### Deployment

27. **Vercel Documentation.** https://vercel.com/docs
28. **Render Documentation.** https://render.com/docs

---

## Team

**Team 13** — five members, five ownership areas.

| Member | Module | Responsibility |
|---|---|---|
| **Varun Koppula** | Authentication & Item Posts | User model, signup/login, JWT middleware, ItemPost model, post CRUD, search & filtering, frontend integration |
| **Nimishakavi Sri Nihal** | Claims & Matching | Claim model, claim lifecycle (submit/approve/reject), verification answer comparison, rule-based matching engine |
| **Hareesh** | Security & Sessions | Rate limiting (3 tiers), input validation & sanitization, refresh-token rotation, logout revocation |
| **Nigama** | Notifications & Dashboard | Notification model & triggers, notification bell UI, dashboard statistics endpoint and page |
| **Jayaram** | Media & Deployment | Cloudinary upload pipeline, multer handling, Vercel/Render/Atlas deployment, environment config, documentation & API testing |

### Work division in detail

**Varun Koppula — Authentication & Item Posts**
- `models/User.js`, `models/ItemPost.js`
- `controllers/authController.js` (signup, login), `middleware/authMiddleware.js`
- `controllers/postController.js` — create, read, update, delete, search, my-posts
- Enforced the rule that `verificationAnswer` is never returned by any public endpoint
- Frontend: `Login`, `Signup`, `Home` (browse + search), `CreatePost`, `MyPosts`, `AuthContext`, axios client

**Nimishakavi Sri Nihal — Claims & Matching**
- `models/Claim.js`, `controllers/claimController.js`
- Verification comparison logic and the `answerMatched` flag shown only to the post owner
- Auto-rejection of competing claims when one is approved
- `utils/matching.js` — Dice-coefficient scoring with category and location weighting
- Frontend: `PostDetail` claim form, `MyClaims`, `ReceivedClaims`

**Hareesh — Security & Sessions**
- `middleware/rateLimiter.js` — global, auth, and write limiters; `trust proxy` for Render
- `middleware/validate.js` and `validators/` — auth, post, and claim rule sets
- `models/RefreshToken.js`, `utils/tokens.js` — 15-minute access tokens, rotating 7-day refresh tokens with a TTL index
- `/auth/refresh` and `/auth/logout` endpoints
- Frontend: axios refresh interceptor with single-flight deduplication, field-level validation errors

**Nigama — Notifications & Dashboard**
- `models/Notification.js`, `utils/notify.js`, `controllers/notificationController.js`
- Notification triggers on claim received, approved, and rejected
- `controllers/dashboardController.js` — aggregated statistics in a single query batch
- Frontend: `NotificationBell` (polling, unread badge, dropdown, mark-read), `Dashboard` page

**Jayaram — Media & Deployment**
- `config/cloudinary.js`, `middleware/upload.js`, `controllers/uploadController.js`
- Graceful degradation to a paste-a-link field when Cloudinary is unconfigured
- Vercel and Render deployment, `vercel.json` SPA rewrites, MongoDB Atlas setup, environment variables
- `test.http` — 34 chained API requests; this documentation
