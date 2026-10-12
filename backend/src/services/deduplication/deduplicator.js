const crypto = require("crypto");
const Article = require("../../models/Article");

/**
 * Clean and simplify a title string for semantic comparison
 */
const simplifyTitle = (title) => {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Generate a SHA256 hash identifying the article
 */
const generateContentHash = (article) => {
  const simplified = simplifyTitle(article.title || article.headline);
  const url = (article.sourceUrl || "").trim().toLowerCase();

  // Combine title tokens and url to form a deterministic fingerprint
  const rawFingerprint = `${simplified}::${url}`;
  return crypto.createHash("sha256").update(rawFingerprint).digest("hex");
};

/**
 * Check if the article already exists in the database
 */
const isDuplicate = async (article) => {
  const hash = generateContentHash(article);

  // 1. Direct content hash match
  const matchByHash = await Article.findOne({ contentHash: hash });
  if (matchByHash) return true;

  // 2. Exact source URL match
  if (article.sourceUrl) {
    const matchByUrl = await Article.findOne({ sourceUrl: article.sourceUrl });
    if (matchByUrl) return true;
  }

  // 3. Exact title match published within the same 48 hours
  if (article.title) {
    const simplified = simplifyTitle(article.title);
    const recentArticles = await Article.find({
      publishedAt: {
        $gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    }).select("title contentHash");

    for (const recent of recentArticles) {
      if (simplifyTitle(recent.title) === simplified) {
        return true;
      }
    }
  }

  return false;
};

module.exports = {
  simplifyTitle,
  generateContentHash,
  isDuplicate,
};
