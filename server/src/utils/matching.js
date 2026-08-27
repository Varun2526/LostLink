import stringSimilarity from "string-similarity";

// Turns a post into one lowercase string we can compare.
const buildText = (post) => {
  const title = post.title || "";
  const description = post.description || "";

  return `${title} ${description}`.toLowerCase().trim();
};

// Score is mostly text similarity, with small bonuses for the
// obvious signals: same category and same location.
const scorePosts = (postA, postB) => {
  const textScore = stringSimilarity.compareTwoStrings(
    buildText(postA),
    buildText(postB)
  );

  let score = textScore * 0.8;

  const categoryA = (postA.category || "").toLowerCase().trim();
  const categoryB = (postB.category || "").toLowerCase().trim();

  if (categoryA && categoryA === categoryB) {
    score = score + 0.15;
  }

  const locationA = (postA.location || "").toLowerCase().trim();
  const locationB = (postB.location || "").toLowerCase().trim();

  if (locationA && locationA === locationB) {
    score = score + 0.05;
  }

  if (score > 1) {
    score = 1;
  }

  return score;
};

// Compares one post against a list of candidate posts and returns
// the best ones, sorted from most similar to least similar.
const findMatches = (post, candidates, minScore = 0.2, limit = 10) => {
  const matches = [];

  candidates.forEach((candidate) => {
    const score = scorePosts(post, candidate);

    if (score >= minScore) {
      matches.push({
        score: Math.round(score * 100) / 100,
        post: candidate,
      });
    }
  });

  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, limit);
};

export { findMatches, scorePosts };
