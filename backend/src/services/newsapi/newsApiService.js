const axios = require("axios");
const env = require("../../config/env");

const NEWS_API_BASE_URL = "https://newsapi.org/v2";

/**
 * Fetch top technology headlines from NewsAPI
 */
const fetchTopHeadlines = async ({ category = "technology", pageSize = 20, page = 1 } = {}) => {
  if (!env.NEWS_API_KEY) {
    console.warn("[NewsAPI] NEWS_API_KEY not configured. Skipping NewsAPI fetch.");
    return [];
  }

  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
      params: {
        category,
        language: "en",
        pageSize,
        page,
        apiKey: env.NEWS_API_KEY,
      },
      timeout: 10000,
    });

    if (response.data && response.data.articles) {
      return response.data.articles;
    }
    return [];
  } catch (err) {
    console.error(`[NewsAPI] Error fetching top headlines: ${err.response?.data?.message || err.message}`);
    return [];
  }
};

/**
 * Search articles by query keyword
 */
const searchNews = async ({ query, pageSize = 20, page = 1, sortBy = "publishedAt" } = {}) => {
  if (!env.NEWS_API_KEY) {
    console.warn("[NewsAPI] NEWS_API_KEY not configured. Skipping NewsAPI search.");
    return [];
  }

  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: query,
        language: "en",
        sortBy,
        pageSize,
        page,
        apiKey: env.NEWS_API_KEY,
      },
      timeout: 10000,
    });

    if (response.data && response.data.articles) {
      return response.data.articles;
    }
    return [];
  } catch (err) {
    console.error(`[NewsAPI] Error searching news: ${err.response?.data?.message || err.message}`);
    return [];
  }
};

module.exports = {
  fetchTopHeadlines,
  searchNews,
};
