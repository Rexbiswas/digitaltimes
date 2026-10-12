const Article = require("../models/Article");

/**
 * Recalculate trending flag based on views and recency
 */
const recalculateTrendingArticles = async () => {
  try {
    // Reset old trending flags
    await Article.updateMany({ trending: true }, { $set: { trending: false } });

    // Mark top 10 articles by views in the past 7 days as trending
    const topArticles = await Article.find({
      status: "published",
      publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .sort({ views: -1, publishedAt: -1 })
      .limit(10);

    const ids = topArticles.map((a) => a._id);
    await Article.updateMany({ _id: { $in: ids } }, { $set: { trending: true } });

    console.log(`[TrendingJob] Recalculated ${ids.length} trending articles.`);
  } catch (err) {
    console.error(`[TrendingJob] Error recalculating trending: ${err.message}`);
  }
};

const startTrendingJob = (intervalHours = 1) => {
  setInterval(recalculateTrendingArticles, intervalHours * 60 * 60 * 1000);
};

module.exports = {
  recalculateTrendingArticles,
  startTrendingJob,
};
