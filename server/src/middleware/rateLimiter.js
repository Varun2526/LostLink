import rateLimit from "express-rate-limit";

// Render sits behind a proxy, so the limiter must read the real client IP
// from X-Forwarded-For. That is enabled with app.set("trust proxy", 1).

// general protection for the whole API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please slow down and try again later.",
  },
});

// Login and signup are the endpoints worth brute forcing. 50 failed
// attempts in 15 minutes still stops a real attack, but leaves room for a
// whole room of people on one campus IP mistyping passwords during a demo.
// Successful logins are not counted at all.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

// creating posts and claims is cheap to spam
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "You are creating things too quickly. Please wait a bit.",
  },
});

export { apiLimiter, authLimiter, writeLimiter };
