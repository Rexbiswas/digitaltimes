const Article = require("../models/Article");
const Follow = require("../models/Follow");

// GET /api/feed
// Returns personalized feed based on user's followed journalists and editorial desks
const getPersonalizedFeed = async (req, res, next) => {
  try {
    const { desk, cursor, limit = 20 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const userId = req.user ? req.user._id : null;

    // 1. Fetch user's followed journalists and desks
    let followedJournalists = [];
    let followedDesks = [];

    if (userId) {
      const userFollows = await Follow.find({ user: userId }).lean();
      followedJournalists = userFollows
        .filter((f) => f.targetType === "journalist")
        .map((f) => f.targetId);
      followedDesks = userFollows
        .filter((f) => f.targetType === "desk")
        .map((f) => f.targetId.toLowerCase());
    }

    // 2. Build MongoDB query
    const baseQuery = { status: "published" };

    // Desk filter if explicitly requested by reader
    if (desk && desk.toUpperCase() !== "ALL") {
      baseQuery.desk = desk.toLowerCase();
    }

    // If cursor provided, fetch older articles for stable pagination
    if (cursor) {
      const cursorDate = new Date(cursor);
      if (!isNaN(cursorDate.getTime())) {
        baseQuery.publishedAt = { $lt: cursorDate };
      }
    }

    let articles = [];
    let isCuratedFallback = false;

    // 3. If user follows sources, build targeted $or query
    const hasFollows = followedJournalists.length > 0 || followedDesks.length > 0;

    if (hasFollows && (!desk || desk.toUpperCase() === "ALL")) {
      const orClauses = [];

      if (followedDesks.length > 0) {
        orClauses.push({ desk: { $in: followedDesks } });
      }

      if (followedJournalists.length > 0) {
        // Author matching: regex or exact
        const authorRegexes = followedJournalists.map(
          (name) => new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        );
        orClauses.push({ author: { $in: authorRegexes } });
      }

      const targetedQuery = {
        ...baseQuery,
        $or: orClauses,
      };

      articles = await Article.find(targetedQuery)
        .sort({ publishedAt: -1, _id: -1 })
        .limit(limitNum + 1)
        .lean();
    }

    // 4. Fallback / Cold-Start: If reader has no follows yet, or followed feed is thin (< 5 articles)
    // provide high-quality broadsheet dispatches + trending articles
    if (articles.length === 0) {
      isCuratedFallback = true;
      articles = await Article.find(baseQuery)
        .sort({ publishedAt: -1, _id: -1 })
        .limit(limitNum + 1)
        .lean();
    }

    // 5. Cursor Pagination handling
    const hasMore = articles.length > limitNum;
    if (hasMore) {
      articles.pop(); // Remove the extra probe item
    }

    const nextCursor =
      articles.length > 0
        ? articles[articles.length - 1].publishedAt.toISOString()
        : null;

    // 6. Deduplication safeguard (by canonical sourceUrl and _id)
    const seenIds = new Set();
    const seenUrls = new Set();
    const deduplicatedArticles = [];

    for (const item of articles) {
      const idStr = item._id.toString();
      const url = item.sourceUrl || item.slug;

      if (!seenIds.has(idStr) && (!url || !seenUrls.has(url))) {
        seenIds.add(idStr);
        if (url) seenUrls.add(url);
        deduplicatedArticles.push(item);
      }
    }

    res.json({
      success: true,
      count: deduplicatedArticles.length,
      data: deduplicatedArticles,
      hasMore,
      nextCursor,
      isCuratedFallback,
      followedSourcesCount: {
        journalists: followedJournalists.length,
        desks: followedDesks.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPersonalizedFeed,
};
