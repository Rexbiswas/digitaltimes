const DESK_KEYWORDS = {
  ai: [
    "artificial intelligence",
    "ai",
    "machine learning",
    "deep learning",
    "llm",
    "generative ai",
    "ai agents",
    "agentic",
    "openai",
    "gemini",
    "claude",
    "anthropic",
    "neural networks",
    "transformer",
    "gpt",
    "reasoning model",
    "diffusion model",
  ],
  web: [
    "react",
    "next.js",
    "javascript",
    "typescript",
    "html",
    "css",
    "browser",
    "web development",
    "frontend",
    "webassembly",
    "wasm",
    "node.js",
    "chrome",
    "firefox",
    "safari",
    "webkit",
    "crdt",
    "api",
  ],
  startups: [
    "startup",
    "funding",
    "venture capital",
    "vc",
    "seed round",
    "series a",
    "series b",
    "series c",
    "founder",
    "co-founder",
    "acquisition",
    "incubator",
    "y combinator",
    "valuation",
    "angel investment",
  ],
  design: [
    "ui",
    "ux",
    "figma",
    "design",
    "product design",
    "graphic design",
    "typography",
    "interaction design",
    "aesthetic",
    "interface",
    "skeuomorphism",
    "swiss style",
    "fonts",
  ],
  security: [
    "cybersecurity",
    "security",
    "ransomware",
    "malware",
    "vulnerability",
    "cve",
    "data breach",
    "hacking",
    "phishing",
    "encryption",
    "zero-day",
    "cryptography",
    "infosec",
    "post-quantum",
  ],
  gaming: [
    "gaming",
    "playstation",
    "xbox",
    "nintendo",
    "steam",
    "video games",
    "game studio",
    "gameplay",
    "unreal engine",
    "unity",
    "esports",
    "gpu",
  ],
  culture: [
    "social media",
    "creator",
    "meme",
    "internet culture",
    "youtube",
    "tiktok",
    "instagram",
    "viral",
    "reddit",
    "influencer",
    "online community",
    "hyperlink",
    "digital art",
  ],
  business: [
    "business",
    "financial",
    "finance",
    "market",
    "markets",
    "futures",
    "exchange",
    "company",
    "companies",
    "revenue",
    "earnings",
    "stocks",
    "stock",
    "enterprise",
    "wall street",
    "nasdaq",
    "quarterly profit",
    "cfo",
    "ceo",
    "inflation",
    "economy",
    "economic",
    "commerce",
  ],
  future: [
    "robotics",
    "quantum computing",
    "space technology",
    "future technology",
    "ar",
    "vr",
    "spatial computing",
    "autonomous",
    "biotechnology",
    "dna storage",
    "fusion energy",
    "nanotechnology",
    "satellite",
  ],
};

/**
 * Classifies an article into one of the 10 editorial desks based on keywords
 */
const classifyArticle = (article) => {
  const textToScan = [
    article.title || "",
    article.headline || "",
    article.description || "",
    article.deck || "",
    article.content || "",
    (article.tags || []).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  let highestScore = 0;
  let bestDesk = "technology"; // Default desk for general tech stories

  for (const [desk, keywords] of Object.entries(DESK_KEYWORDS)) {
    let score = 0;

    for (const keyword of keywords) {
      // Use regex to match whole words or phrases
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      const matches = textToScan.match(regex);
      if (matches) {
        // Multi-word phrases give higher weight than single short words
        score += matches.length * (keyword.includes(" ") ? 3 : 1);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestDesk = desk;
    }
  }

  return bestDesk;
};

module.exports = {
  classifyArticle,
  DESK_KEYWORDS,
};
