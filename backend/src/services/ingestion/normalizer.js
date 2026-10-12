/**
 * Generate a URL-friendly slug from title and timestamp
 */
const generateSlug = (title) => {
  if (!title) return `dispatch-${Date.now()}`;
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${suffix}`;
};

/**
 * Estimate read time from text content
 */
const calculateReadTime = (text) => {
  if (!text) return "3 MIN READ";
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 180));
  return `${minutes} MIN READ`;
};

const DESK_MEDIA_MAP = {
  ai: {
    fallbackImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/aircAruvnKk",
    videoCaption: "TELEGRAPHIC VIDEO: Frontier Neural Architectures & Machine Reasoning Analysis",
  },
  web: {
    fallbackImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/fBNz5xF-Kx4",
    videoCaption: "TELEGRAPHIC VIDEO: Local-First Web Runtimes & High-Throughput Wasm Architecture",
  },
  startups: {
    fallbackImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/5qap5aO4i9A",
    videoCaption: "TELEGRAPHIC VIDEO: Venture Capital Dynamics & Next-Gen Hardware Fabrication",
  },
  security: {
    fallbackImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/2_lswM1S264",
    videoCaption: "TELEGRAPHIC VIDEO: Investigative Briefing on Post-Quantum Cryptographic Protocols",
  },
  design: {
    fallbackImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/sByzHoiYFX0",
    videoCaption: "TELEGRAPHIC VIDEO: Tactile Broadsheet Typography & Grid Systems in Modern Media",
  },
  gaming: {
    fallbackImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/qC5KtatMcUw",
    videoCaption: "TELEGRAPHIC VIDEO: Real-Time Photoreal Simulation & Neural Rendering Showcase",
  },
  business: {
    fallbackImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/PHe0bXAIuk8",
    videoCaption: "TELEGRAPHIC VIDEO: Financial Compute Infrastructure & Algorithmic Market Networks",
  },
  culture: {
    fallbackImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/aircAruvnKk",
    videoCaption: "TELEGRAPHIC VIDEO: Internet Archaeology & The Evolution of Hyperlinked Culture",
  },
  future: {
    fallbackImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/QuR969uMICM",
    videoCaption: "TELEGRAPHIC VIDEO: Quantum Entanglement & Room-Temperature Photonic Chips",
  },
  technology: {
    fallbackImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/aircAruvnKk",
    videoCaption: "TELEGRAPHIC VIDEO: Special Technology Dispatch & Silicon Architecture Analysis",
  },
};

const { getTopicAppropriateImage } = require("../../utils/imageCurator");

const getMediaForArticle = (title = "", desk = "technology", givenImage = null) => {
  const deskKey = (desk || "technology").toLowerCase();
  const config = DESK_MEDIA_MAP[deskKey] || DESK_MEDIA_MAP.technology;
  const image = getTopicAppropriateImage({
    title,
    headline: title,
    desk: deskKey,
    urlToImage: givenImage,
    image: givenImage,
  });
  const video = config.video;
  const videoCaption = `${config.videoCaption} — ${title.slice(0, 80)}`;

  return { image, video, videoCaption };
};

/* Normalizes an article from NewsAPI format*/
const normalizeNewsApiArticle = (article) => {
  const title = (article.title || "").replace(/ - [^-]+$/, "").trim(); // Remove publisher suffix
  const description = article.description || article.content || "";
  const pubDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
  const editionDate = pubDate.toISOString().split("T")[0];
  const media = getMediaForArticle(title, "technology", article.urlToImage);

  return {
    title,
    headline: title,
    slug: generateSlug(title),
    description,
    deck: description,
    content: article.content || description,
    leadParagraph: description,
    bodyParagraphs: article.content
      ? [article.content.replace(/\[\+\d+ chars\]$/, "")]
      : [description],
    image: media.image,
    urlToImage: article.urlToImage || media.image,
    imageCaption: title ? `WIRE PHOTO: ${title}` : null,
    imageCredit: article.source?.name ? `Archive / ${article.source.name}` : "Times Dispatch Wire",
    video: media.video,
    videoCaption: media.videoCaption,
    videoType: "embed",
    sourceName: article.source?.name || "Global Wire Service",
    sourceUrl: article.url,
    author: article.author ? `By ${article.author.toUpperCase()}` : "By TIMES WIRE DESK",
    publishedAt: pubDate,
    discoveredAt: new Date(),
    editionDate,
    readTime: calculateReadTime(article.content || description),
    category: "technology",
    status: "published",
    featured: false,
    breaking: false,
    trending: false,
  };
};

/**
 * Normalizes an article from RSS item format
 */
const normalizeRssArticle = (item) => {
  const title = (item.rawTitle || "").trim();
  const description = (item.rawDescription || "").replace(/<[^>]*>?/gm, "").trim();
  const pubDate = item.rawDate ? new Date(item.rawDate) : new Date();
  const editionDate = pubDate.toISOString().split("T")[0];
  const media = getMediaForArticle(title, "technology", item.rawEnclosure);

  return {
    title,
    headline: title,
    slug: generateSlug(title),
    description,
    deck: description,
    content: item.rawContent || description,
    leadParagraph: description,
    bodyParagraphs: [description],
    image: media.image,
    urlToImage: item.rawEnclosure || media.image,
    imageCaption: `BROADSHEET ILLUSTRATION: ${title}`,
    imageCredit: `Dispatch Wire / ${item.sourceName || "Syndicate"}`,
    video: media.video,
    videoCaption: media.videoCaption,
    videoType: "embed",
    sourceName: item.sourceName || "Independent Syndicate",
    sourceUrl: item.rawUrl,
    author: item.rawAuthor ? (item.rawAuthor.startsWith("By ") ? item.rawAuthor : `By ${item.rawAuthor}`) : "By SPECIAL CORRESPONDENT",
    publishedAt: pubDate,
    discoveredAt: new Date(),
    editionDate,
    readTime: calculateReadTime(description),
    category: "technology",
    status: "published",
    featured: false,
    breaking: false,
    trending: false,
  };
};

module.exports = {
  generateSlug,
  calculateReadTime,
  normalizeNewsApiArticle,
  normalizeRssArticle,
  getMediaForArticle,
  DESK_MEDIA_MAP,
};
