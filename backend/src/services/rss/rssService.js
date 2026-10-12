const Parser = require("rss-parser");

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "DigitalTimes-EditorialBot/1.0 (+https://digitaltimes.press)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

// Curated authentic technology and science RSS feeds
const DEFAULT_TECH_FEEDS = [
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
    defaultDesk: "technology",
  },
  {
    name: "Hacker News Frontpage",
    url: "https://news.ycombinator.com/rss",
    defaultDesk: "startups",
  },
  {
    name: "The Verge Tech",
    url: "https://www.theverge.com/rss/technology/index.xml",
    defaultDesk: "web",
  },
  {
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    defaultDesk: "future",
  },
  {
    name: "Krebs on Security",
    url: "https://krebsonsecurity.com/feed/",
    defaultDesk: "security",
  },
];

/**
 * Fetch and parse a single RSS feed url
 */
const fetchFeed = async (feedUrl, defaultSourceName = "RSS Wire") => {
  try {
    const feed = await parser.parseURL(feedUrl);
    const sourceTitle = feed.title || defaultSourceName;

    return (feed.items || []).map((item) => ({
      rawTitle: item.title,
      rawDescription: item.contentSnippet || item.summary || item.content || "",
      rawContent: item["content:encoded"] || item.content || item.summary || "",
      rawUrl: item.link || item.guid,
      rawDate: item.pubDate || item.isoDate || new Date().toISOString(),
      rawAuthor: item.creator || item.author || "By TIMES WIRE SERVICE",
      rawSource: sourceTitle,
      rawCategories: item.categories || [],
      rawEnclosure: item.enclosure?.url || null,
    }));
  } catch (err) {
    console.warn(`[RSS] Failed to fetch feed (${feedUrl}): ${err.message}`);
    return [];
  }
};

/**
 * Fetch all registered default feeds in parallel
 */
const fetchAllFeeds = async (feedList = DEFAULT_TECH_FEEDS) => {
  const allResults = [];

  for (const feedConfig of feedList) {
    try {
      const items = await fetchFeed(feedConfig.url, feedConfig.name);
      const itemsWithConfig = items.map((item) => ({
        ...item,
        defaultDesk: feedConfig.defaultDesk,
        sourceName: feedConfig.name,
      }));
      allResults.push(...itemsWithConfig);
    } catch (e) {
      console.warn(`[RSS] Error reading ${feedConfig.name}: ${e.message}`);
    }
  }

  return allResults;
};

module.exports = {
  fetchFeed,
  fetchAllFeeds,
  DEFAULT_TECH_FEEDS,
};
