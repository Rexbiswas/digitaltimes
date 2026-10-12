const Edition = require("../models/Edition");
const Article = require("../models/Article");
const { assembleDailyEdition } = require("../services/edition/editionAssembler");

// Helper to format date string as YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

// GET /api/editions/today
const getTodayEdition = async (req, res, next) => {
  try {
    const todayStr = getTodayDateString();

    let edition = await Edition.findOne({ date: todayStr })
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
      .populate("desks.future")
      .lean();

    // If no edition for today yet, assemble it automatically!
    if (!edition) {
      try {
        console.log(`[EditionController] No edition found for ${todayStr}. Assembling on demand...`);
        const created = await assembleDailyEdition(todayStr);
        if (created) {
          edition = created.toObject ? created.toObject() : created;
        }
      } catch (assembleErr) {
        console.warn(`[EditionController] Auto-assembly error: ${assembleErr.message}`);
      }
    }

    // If still no edition, find most recent published edition
    if (!edition) {
      edition = await Edition.findOne({ status: "live" })
        .sort("-date")
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
        .populate("desks.future")
        .lean();
    }

    if (!edition) {
      return res.status(404).json({
        success: false,
        message: "No published edition found in the archives.",
      });
    }

    res.json({
      success: true,
      data: edition,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/editions/archive (and /api/editions/calendar)
const getEditionArchive = async (req, res, next) => {
  try {
    const editions = await Edition.find({})
      .sort("-date")
      .select("date displayDate status metadata leadArticle articles")
      .populate("leadArticle", "title headline deck image readTime author desk")
      .lean();

    const formatted = editions.map((e) => ({
      date: e.date,
      displayDate: e.displayDate,
      status: e.status,
      vol: e.metadata?.vol || "VOL. 01 • NO. 001",
      circulation: e.metadata?.circulation || "BROADSHEET",
      weather: e.metadata?.weather || "",
      totalArticles: e.articles?.length || 0,
      leadStory: e.leadArticle || null,
    }));

    res.json({
      success: true,
      total: formatted.length,
      data: formatted,
      dates: editions.map((e) => e.date),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/editions/:date or /api/editions/date/:date
const getEditionByDate = async (req, res, next) => {
  try {
    const date = req.params.date;

    let edition = await Edition.findOne({ date })
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
      .populate("desks.future")
      .lean();

    // If not found, try assembling it if valid date pattern
    if (!edition && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      try {
        console.log(`[EditionController] Assembling requested date ${date} on demand...`);
        const created = await assembleDailyEdition(date);
        if (created) {
          edition = created.toObject ? created.toObject() : created;
        }
      } catch (err) {
        console.warn(`[EditionController] Could not assemble ${date}: ${err.message}`);
      }
    }

    if (!edition) {
      return res.status(404).json({
        success: false,
        message: `Historical broadsheet edition for ${date} not found.`,
      });
    }

    res.json({
      success: true,
      data: edition,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/editions/:date/articles
const getEditionArticles = async (req, res, next) => {
  try {
    const { date } = req.params;

    const articles = await Article.find({ editionDate: date, status: "published" })
      .sort("-publishedAt")
      .lean();

    res.json({
      success: true,
      date,
      total: articles.length,
      data: articles,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/editions/:date/:desk
const getEditionDeskArticles = async (req, res, next) => {
  try {
    const { date, desk } = req.params;

    const articles = await Article.find({
      editionDate: date,
      desk: desk.toLowerCase(),
      status: "published",
    })
      .sort("-publishedAt")
      .lean();

    res.json({
      success: true,
      date,
      desk,
      total: articles.length,
      data: articles,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTodayEdition,
  getEditionArchive,
  getEditionCalendar: getEditionArchive, // Alias for backwards compatibility
  getEditionByDate,
  getEditionArticles,
  getEditionDeskArticles,
};
