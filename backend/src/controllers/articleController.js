const Article = require("../models/Article");

// GET /api/articles
const getArticles = async (req, res, next) => {
  try {
    const {
      desk,
      category,
      editionDate,
      featured,
      breaking,
      trending,
      status = "published",
      page = 1,
      limit = 20,
      sort = "-publishedAt",
    } = req.query;

    const query = { status };

    if (desk) query.desk = desk.toLowerCase();
    if (category) query.category = category.toLowerCase();
    if (editionDate) query.editionDate = editionDate;
    if (featured !== undefined) query.featured = featured === "true";
    if (breaking !== undefined) query.breaking = breaking === "true";
    if (trending !== undefined) query.trending = trending === "true";

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      Article.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Article.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/articles/:id (by ID or Slug)
const getArticleByIdOrSlug = async (req, res, next) => {
  try {
    const { id } = req.params;

    let article = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(id).lean();
    }

    if (!article) {
      article = await Article.findOne({ slug: id }).lean();
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found in the Digital Times archives.",
      });
    }

    // Increment view count asynchronously
    Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

    res.json({
      success: true,
      data: article,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/trending
const getTrendingArticles = async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 6);

    const articles = await Article.find({ status: "published" })
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: articles,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/newsroom/live
const getLiveDispatches = async (req, res, next) => {
  try {
    const limit = Math.min(10, parseInt(req.query.limit, 10) || 5);

    const dispatches = await Article.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      hasNewDispatches: dispatches.length > 0,
      newCount: dispatches.length,
      dispatches: dispatches.map((a) => ({
        id: a.slug || a._id.toString(),
        headline: a.headline || a.title,
        desk: (a.desk || "TECHNOLOGY").toUpperCase(),
        time: "JUST NOW",
        bureau: a.location || "CENTRAL BUREAU",
        author: a.author || "By TIMES DESK",
        readTime: a.readTime || "4 MIN READ",
        date: a.editionDate || "OCTOBER 7, 2026",
        deck: a.deck || a.description || "",
        leadParagraph: a.leadParagraph || a.content || "",
        bodyParagraphs: a.bodyParagraphs || [],
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getArticles,
  getArticleByIdOrSlug,
  getTrendingArticles,
  getLiveDispatches,
};
