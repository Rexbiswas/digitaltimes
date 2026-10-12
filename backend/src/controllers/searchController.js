const Article = require("../models/Article");

// GET /api/articles/search?q=
const searchArticles = async (req, res, next) => {
  try {
    const { q = "", desk, tab = "ALL", page = 1, limit = 20 } = req.query;
    const queryStr = q.trim();

    if (!queryStr && !desk) {
      const recent = await Article.find({ status: "published" })
        .sort("-publishedAt")
        .limit(20)
        .lean();

      return res.json({
        success: true,
        data: recent,
        total: recent.length,
      });
    }

    const filter = { status: "published" };

    if (desk) {
      filter.desk = desk.toLowerCase();
    }

    // Tab filters matching frontend tabs (ALL, ARTICLES, SOURCES, TOPICS)
    if (tab === "ARTICLES") {
      filter.category = { $ne: "SOURCES" };
    } else if (tab === "SOURCES") {
      filter.sourceName = { $exists: true, $ne: "" };
    }

    if (queryStr) {
      // Use case-insensitive regex for broad broadsheet search across multiple editorial fields
      const regex = new RegExp(queryStr, "i");
      filter.$or = [
        { title: regex },
        { headline: regex },
        { description: regex },
        { deck: regex },
        { content: regex },
        { leadParagraph: regex },
        { author: regex },
        { sourceName: regex },
        { tags: regex },
        { desk: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [results, total] = await Promise.all([
      Article.find(filter)
        .sort("-publishedAt")
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      query: queryStr,
      total,
      data: results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchArticles,
};
