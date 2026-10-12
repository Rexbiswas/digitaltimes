const { fetchTopHeadlines } = require("../newsapi/newsApiService");
const { fetchAllFeeds } = require("../rss/rssService");
const {
  normalizeNewsApiArticle,
  normalizeRssArticle,
  getMediaForArticle,
} = require("./normalizer");
const {
  isDuplicate,
  generateContentHash,
} = require("../deduplication/deduplicator");
const { classifyArticle } = require("../classification/categoryClassifier");
const { assembleDailyEdition } = require("../edition/editionAssembler");
const { seedFallbackArticles } = require("../seed/seedFallbackArticles");
const Article = require("../../models/Article");
const Edition = require("../../models/Edition");
const { emitNewArticle } = require("../../config/socket");

/**
 * Attaches a newly saved article to the active edition for its date
 */
const attachArticleToEdition = async (article) => {
  try {
    const editionDate = article.editionDate || new Date().toISOString().split("T")[0];
    const desk = (article.desk || "technology").toLowerCase();

    let edition = await Edition.findOne({ date: editionDate });

    if (!edition) {
      const d = new Date(article.publishedAt || Date.now());
      const displayDate = d
        .toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase();

      edition = await Edition.create({
        date: editionDate,
        displayDate,
        status: "live",
        leadArticle: article._id,
        articles: [article._id],
        desks: {
          frontpage: [article._id],
          ai: [],
          web: [],
          startups: [],
          design: [],
          security: [],
          technology: [],
          gaming: [],
          culture: [],
          business: [],
          future: [],
          [desk]: [article._id],
        },
      });
    } else {
      // Add article to edition articles list if not present
      if (!edition.articles.some((id) => id.toString() === article._id.toString())) {
        edition.articles.push(article._id);
      }

      // Ensure desks object is initialized
      if (!edition.desks) {
        edition.desks = {};
      }
      if (!edition.desks[desk]) {
        edition.desks[desk] = [];
      }

      // Add to desk bucket
      if (!edition.desks[desk].some((id) => id.toString() === article._id.toString())) {
        edition.desks[desk].push(article._id);
      }

      // If edition has no lead article, assign this one
      if (!edition.leadArticle) {
        edition.leadArticle = article._id;
      }

      await edition.save();
    }
  } catch (err) {
    console.error(`[IngestionPipeline] Error attaching article to edition: ${err.message}`);
  }
};

/**
 * Executes a full news ingestion cycle across NewsAPI and RSS sources
 * @param {Object} [options]
 * @param {boolean} [options.rebuildEdition] - Whether to reassemble today's edition after ingestion
 */
const runIngestionPipeline = async ({ rebuildEdition = true } = {}) => {
  const startTime = Date.now();
  console.log("[IngestionPipeline] Starting autonomous broadsheet news ingestion...");

  let rawNewsApiArticles = [];
  let rawRssArticles = [];

  // 1. Fetch from NewsAPI (handles missing key gracefully)
  try {
    rawNewsApiArticles = await fetchTopHeadlines({ pageSize: 25 });
    console.log(`[IngestionPipeline] NewsAPI returned ${rawNewsApiArticles.length} candidates.`);
  } catch (err) {
    console.warn(`[IngestionPipeline] NewsAPI fetch skipped or failed: ${err.message}`);
  }

  // 2. Fetch from RSS Feeds
  try {
    rawRssArticles = await fetchAllFeeds();
    console.log(`[IngestionPipeline] RSS Feeds returned ${rawRssArticles.length} candidates.`);
  } catch (err) {
    console.warn(`[IngestionPipeline] RSS fetch skipped or failed: ${err.message}`);
  }

  // 3. Normalize into common schema format
  const normalizedCandidates = [
    ...rawNewsApiArticles.map(normalizeNewsApiArticle),
    ...rawRssArticles.map(normalizeRssArticle),
  ];

  console.log(
    `[IngestionPipeline] Total raw candidates received: ${normalizedCandidates.length}. Processing & deduplicating...`
  );

  let savedCount = 0;
  let duplicatesSkipped = 0;
  let validationErrors = 0;

  for (const candidate of normalizedCandidates) {
    try {
      // Basic validation
      if (!candidate.title || candidate.title.length < 5) {
        validationErrors++;
        continue;
      }

      // Check deduplication (SHA256 hash, URL match, 48hr fuzzy title)
      const duplicate = await isDuplicate(candidate);
      if (duplicate) {
        duplicatesSkipped++;
        continue;
      }

      // Classify into 1 of the 10 broadsheet desks
      const desk = classifyArticle(candidate);
      candidate.desk = desk;
      candidate.category = desk;
      candidate.contentHash = generateContentHash(candidate);

      // Assign desk media assets (photo, telegraphic video dispatch, caption)
      const media = getMediaForArticle(candidate.headline, desk, candidate.urlToImage || candidate.image);
      candidate.image = media.image;
      candidate.urlToImage = candidate.urlToImage || media.image;
      candidate.video = media.video;
      candidate.videoCaption = media.videoCaption;
      candidate.videoType = "embed";

      // Persist to MongoDB
      const savedArticle = await Article.create(candidate);
      savedCount++;

      // Attach to active Edition
      await attachArticleToEdition(savedArticle);

      // Emit real-time Socket.IO dispatch to connected subscribers
      try {
        emitNewArticle(savedArticle);
      } catch (socketErr) {
        // Socket emission failure is non-fatal
      }
    } catch (saveErr) {
      if (saveErr.code === 11000) {
        duplicatesSkipped++;
      } else {
        console.warn(`[IngestionPipeline] Failed saving candidate "${candidate.title?.slice(0, 30)}": ${saveErr.message}`);
      }
    }
  }

  // 4. Ensure broadsheet is never empty: if 0 articles saved and DB is barren, seed fallbacks
  const todayStr = new Date().toISOString().split("T")[0];
  const todayArticlesCount = await Article.countDocuments({ editionDate: todayStr });

  if (todayArticlesCount < 5) {
    console.log(
      `[IngestionPipeline] Active edition has only ${todayArticlesCount} articles. Triggering broadsheet fallback seeds...`
    );
    await seedFallbackArticles({ targetDate: todayStr });
  }

  // 5. Reassemble / refresh today's broadsheet Edition
  let assembledEdition = null;
  if (rebuildEdition) {
    try {
      assembledEdition = await assembleDailyEdition(todayStr, { forceRebuild: true });
    } catch (assemErr) {
      console.error(`[IngestionPipeline] Error assembling edition: ${assemErr.message}`);
    }
  }

  const durationMs = Date.now() - startTime;
  console.log(
    `[IngestionPipeline] Completed in ${durationMs}ms. Saved: ${savedCount}, Duplicates: ${duplicatesSkipped}, Raw Total: ${normalizedCandidates.length}.`
  );

  return {
    success: true,
    timestamp: new Date().toISOString(),
    durationMs,
    candidates: {
      newsApi: rawNewsApiArticles.length,
      rss: rawRssArticles.length,
      total: normalizedCandidates.length,
    },
    savedCount,
    duplicatesSkipped,
    validationErrors,
    editionDate: todayStr,
    editionArticleCount: assembledEdition ? assembledEdition.articles?.length : todayArticlesCount + savedCount,
  };
};

module.exports = {
  runIngestionPipeline,
  attachArticleToEdition,
};
