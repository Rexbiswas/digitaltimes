const Edition = require("../../models/Edition");
const Article = require("../../models/Article");
const { seedFallbackArticles } = require("../seed/seedFallbackArticles");

const DESK_KEYS = [
  "frontpage",
  "ai",
  "web",
  "startups",
  "design",
  "security",
  "technology",
  "gaming",
  "culture",
  "business",
  "future",
];

/**
 * Format a Date object into human-readable broadsheet display date
 * e.g. "FRIDAY, OCTOBER 9, 2026"
 */
const formatDisplayDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return d
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
};

/**
 * Assembles and rolls out a daily broadsheet edition
 * @param {string} [targetDate] - Target date string in YYYY-MM-DD format
 * @param {Object} [options]
 * @param {boolean} [options.forceRebuild] - Whether to reassemble desk groupings from scratch
 */
const assembleDailyEdition = async (targetDate = null, { forceRebuild = false } = {}) => {
  const editionDate = targetDate || new Date().toISOString().split("T")[0];
  console.log(`[EditionAssembler] Assembling broadsheet edition for: ${editionDate}`);

  // 1. Check if edition already exists
  let edition = await Edition.findOne({ date: editionDate });

  if (edition && !forceRebuild && edition.articles && edition.articles.length >= 10 && edition.leadArticle) {
    console.log(`[EditionAssembler] Active edition already complete for ${editionDate} (${edition.articles.length} stories).`);
    return await Edition.findById(edition._id)
      .populate("leadArticle")
      .populate("desks.frontpage")
      .populate("desks.ai")
      .populate("desks.web")
      .populate("desks.startups")
      .populate("desks.design")
      .populate("desks.security")
      .populate("desks.technology")
      .populate("desks.gaming")
      .populate("desks.culture")
      .populate("desks.business")
      .populate("desks.future");
  }

  // 2. Fetch candidates for this edition date
  let articles = await Article.find({
    editionDate,
    status: "published",
  }).sort("-publishedAt");

  // 3. If too few articles exist for today, seed fallbacks or pull recent stories
  if (articles.length < 10) {
    console.log(
      `[EditionAssembler] Found only ${articles.length} articles for ${editionDate}. Augmenting with broadsheet archives & fallbacks...`
    );

    // Ensure fallback articles exist for this date
    await seedFallbackArticles({ targetDate: editionDate });

    // Re-query articles for this date
    articles = await Article.find({
      editionDate,
      status: "published",
    }).sort("-publishedAt");

    // If still insufficient, pull most recent published articles
    if (articles.length < 10) {
      const recentBackfill = await Article.find({
        status: "published",
        _id: { $nin: articles.map((a) => a._id) },
      })
        .sort("-publishedAt")
        .limit(20);

      articles = [...articles, ...recentBackfill];
    }
  }

  // 4. Select the highest-impact lead story
  // Priority: featured with image -> breaking with image -> first with image -> first article
  let leadArticle =
    articles.find((a) => a.featured && a.image) ||
    articles.find((a) => a.breaking && a.image) ||
    articles.find((a) => a.image) ||
    articles[0] ||
    null;

  // 5. Partition articles into desk buckets
  const deskBuckets = {};
  for (const desk of DESK_KEYS) {
    deskBuckets[desk] = [];
  }

  // Fill desks with today's articles
  articles.forEach((art) => {
    const d = (art.desk || "technology").toLowerCase();
    if (deskBuckets[d]) {
      if (!deskBuckets[d].some((id) => id.toString() === art._id.toString())) {
        deskBuckets[d].push(art._id);
      }
    }
    // Frontpage also collects featured, breaking, and lead articles
    if (art.featured || art.breaking || (leadArticle && art._id.equals(leadArticle._id))) {
      if (!deskBuckets.frontpage.some((id) => id.toString() === art._id.toString())) {
        deskBuckets.frontpage.push(art._id);
      }
    }
  });

  // Ensure every single desk has at least 1 story for authentic broadsheet completeness
  for (const desk of DESK_KEYS) {
    if (deskBuckets[desk].length === 0) {
      const archivalStory = await Article.findOne({
        desk,
        status: "published",
      }).sort("-publishedAt");

      if (archivalStory) {
        deskBuckets[desk].push(archivalStory._id);
        if (!articles.some((a) => a._id.equals(archivalStory._id))) {
          articles.push(archivalStory);
        }
      }
    }
  }

  // 6. Archive prior editions so only today's edition is "live"
  await Edition.updateMany(
    { date: { $ne: editionDate }, status: "live" },
    { $set: { status: "archived" } }
  );

  // 7. Calculate broadsheet volume and circulation telemetry
  const displayDate = formatDisplayDate(editionDate);
  const editionEpoch = Math.floor(new Date(editionDate).getTime() / (86400 * 1000));
  const volNumber = Math.max(1, (editionEpoch % 100) + 1);
  const issueNumber = String(volNumber).padStart(3, "0");

  const editionData = {
    date: editionDate,
    displayDate,
    status: "live",
    leadArticle: leadArticle ? leadArticle._id : null,
    articles: articles.map((a) => a._id),
    desks: deskBuckets,
    metadata: {
      vol: `VOL. ${String(Math.floor(volNumber / 30) + 1).padStart(2, "0")} • NO. ${issueNumber}`,
      circulation: `${(1800000 + (volNumber * 1234) % 150000).toLocaleString()} BROADSHEETS DISTRIBUTED`,
      weather: "GLOBAL NETWORK: 24°C / 75°F • BAROMETER 1014 hPa • VISIBILITY OPTIMAL",
    },
  };

  if (!edition) {
    edition = await Edition.create(editionData);
    console.log(`[EditionAssembler] Created new live broadsheet edition for ${editionDate}`);
  } else {
    Object.assign(edition, editionData);
    await edition.save();
    console.log(`[EditionAssembler] Updated existing broadsheet edition for ${editionDate}`);
  }

  // Return populated edition
  return await Edition.findById(edition._id)
    .populate("leadArticle")
    .populate("desks.frontpage")
    .populate("desks.ai")
    .populate("desks.web")
    .populate("desks.startups")
    .populate("desks.design")
    .populate("desks.security")
    .populate("desks.technology")
    .populate("desks.gaming")
    .populate("desks.culture")
    .populate("desks.business")
    .populate("desks.future");
};

module.exports = {
  assembleDailyEdition,
  formatDisplayDate,
  DESK_KEYS,
};
