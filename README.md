# LostLink
 
**Secure Digital Lost & Found for Campuses**
 
Team 13 | Hackathon Project
 
Reconnecting people with their belongings, safely.
 
---
 
## Problem Statement
 
College campuses lose track of items daily — bags, ID cards, electronics, water bottles. Current systems rely on scattered WhatsApp groups and physical notice boards, with no identity verification, meaning anyone can falsely claim an item. There's no centralized record or accountability, resulting in unclaimed items and wrongful claims.
 
## Solution
 
LostLink is a centralized MERN-stack platform to **post, search, match, and verify** lost and found items on campus — with a built-in verification step before any claim is approved.
 
> Post it. Match it. Verify it. Reclaim it.
 
## Key Features
 
- **Post Items** — Report a lost or found item in seconds, with category, description, and location
- **Search & Filter** — Find items by category or keyword
- **Smart Matching** — Auto-suggests likely lost↔found matches using category + description similarity
- **Verification-Gated Claiming** — No ID required. The finder sets a private verification question only the true owner can answer, eliminating fraudulent claims
- **Dashboard** — Track your own posts and claim status
- **Image Upload** *(stretch)* — Attach photos to posts via Cloudinary/S3
- **Email Notifications** *(stretch)* — Alerts the finder when someone submits a claim
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT, bcrypt |
| Matching | string-similarity (category + description overlap) |
| Storage *(stretch)* | Cloudinary / AWS S3 |
| Notifications *(stretch)* | Nodemailer (SMTP) |
 
## System Architecture
 
```
React Client (SPA)
      ↓ REST API (Axios/JSON)
Express Server
      ↓
JWT Auth Middleware → Rate Limiter → Input Validator
      ↓
Core Backend Services
  ├─ Auth Service
  ├─ Post Service        → Image Upload Service
  ├─ Search Service
  ├─ Matching Engine
  └─ Claim & Verification Service → Notification Service
      ↓
MongoDB Atlas (Users · ItemPosts · Claims)
      ↓
Cloudinary/S3          Email Service (SMTP)
```
 
## Database Schema
 
**User**
```
{ name, email, passwordHash, campus, createdAt }
```
 
**ItemPost**
```
{
  type: "lost" | "found",
  title,
  category,
  description,
  location,
  date,
  imageUrl,
  verificationQuestion,
  postedBy: userId,
  status: "open" | "claimed" | "resolved",
  createdAt
}
```
 
**Claim**
```
{
  itemId,
  claimedBy: userId,
  answer,
  status: "pending" | "approved" | "rejected",
  createdAt
}
```
 
## Verification Flow
 
1. Finder posts a found item and sets a private verification question (e.g. "What's inside the bag?")
2. Claimant views the question (not the answer) and submits their response
3. Finder reviews the answer and approves or rejects the claim — item is marked `claimed` on approval
 
## User Flow / Pages
 
`Home & Search` → `Post Item` → `Item Detail` → `Claim Form` → `Dashboard`
 
| Page | Purpose |
|---|---|
| Home / Search | Browse or filter all active posts |
| Post Item | Report a lost or found item with a verification question |
| Item Detail | Full listing view + match suggestions |
| Claim Form | Answer the verification question to submit a claim |
| Dashboard | Track your posts and incoming/outgoing claims |
 
## Core Modules
 
1. **Auth Module** — signup, login, JWT session management
2. **Post Module** — create/edit/delete item listings
3. **Search Module** — filter by category, keyword, location
4. **Matching Module** — auto-suggests lost↔found matches by description similarity
5. **Claim Module** — submit a claim with a private verification answer
6. **Verification Module** — finder reviews and approves/rejects claims
7. **Image Upload Service** *(stretch)* — Cloudinary/S3 attachment for post photos
8. **Notification Service** *(stretch)* — email alerts on new claims
9. **Rate Limiter & Input Validator** *(stretch)* — basic request hardening
 
## Impact
 
- Reduces unclaimed items on campus
- Prevents fraudulent claims through verification
- Centralizes all lost-and-found activity in one place
- Creates accountability for both finders and claimants
 
## Future Scope
 
- AI-powered image matching via computer vision
- Push notifications for new matches
- QR-code tagging for high-value items
- Multi-campus network expansion
 
## Getting Started
 
```bash
# Clone the repo
git clone <repo-url>
cd lostlink
 
# Install backend dependencies
cd server
npm install
 
# Install frontend dependencies
cd ../client
npm install
 
# Set up environment variables (server/.env)
# MONGODB_URI=
# JWT_SECRET=
# CLOUDINARY_URL=        (optional)
# EMAIL_USER / EMAIL_PASS (optional)
 
# Run backend
cd server
npm run dev
 
# Run frontend
cd ../client
npm start
```
 
## Team
 
**Team 13**
 