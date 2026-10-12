import {
  leadStory as fallbackLeadStory,
  aiDeskArticles as fallbackAi,
  webDeskData as fallbackWeb,
  startupDeskData as fallbackStartup,
  designDeskData as fallbackDesign,
  securityDeskData as fallbackSecurity,
  gamingDeskData as fallbackGaming,
  cultureDeskData as fallbackCulture,
  businessDeskData as fallbackBusiness,
  futureDeskData as fallbackFuture,
  frontPageSecondaryStories as fallbackFrontPage,
  allArticles as fallbackAllArticles,
} from "@/data/newspaperData";

/**
 * Presenter that converts any backend MongoDB article document into
 * the exact object structure expected by the existing broadsheet scene components.
 */
export function mapArticleToBroadsheetFormat(art) {
  if (!art) return null;

  const pubDate = art.publishedAt ? new Date(art.publishedAt) : new Date();
  const formattedDate = pubDate
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return {
    id: art.slug || (art._id ? art._id.toString() : art.id),
    _id: art._id,
    slug: art.slug,
    headline: art.headline || art.title || "UNTITLED DISPATCH",
    title: art.title || art.headline || "UNTITLED DISPATCH",
    deck: art.deck || art.description || "",
    description: art.description || art.deck || "",
    leadParagraph: art.leadParagraph || art.content || art.description || "",
    bodyParagraphs:
      Array.isArray(art.bodyParagraphs) && art.bodyParagraphs.length > 0
        ? art.bodyParagraphs
        : [art.content || art.description || ""],
    pullQuote: art.pullQuote || null,
    author: art.author || "By TIMES EDITORIAL BOARD",
    location: art.location || "CENTRAL BUREAU",
    desk: (art.desk || "TECHNOLOGY").toUpperCase(),
    category: art.category || "technology",
    page: art.page || "PAGE 01",
    readTime: art.readTime || "4 MIN READ",
    editionBadge: art.breaking
      ? "BREAKING NEWS"
      : art.featured
      ? "SPECIAL DISPATCH"
      : "INVESTIGATIVE DISPATCH",
    date: formattedDate,
    editionDate: art.editionDate || "2026-10-07",
    image: art.image || null,
    imageCaption: art.imageCaption || null,
    imageCredit: art.imageCredit || null,
    sourceName: art.sourceName || "The Digital Times",
    sourceUrl: art.sourceUrl || null,
    tags: art.tags || [],
    views: art.views || 0,
    breaking: Boolean(art.breaking),
    featured: Boolean(art.featured),
    trending: Boolean(art.trending),
  };
}

/**
 * Maps a full backend Edition document into the complete set of desk models
 * required by HeroScene, FrontPageScene, AiScene, etc. with automatic fallback.
 */
export function mapEditionToBroadsheet(edition) {
  if (!edition || !edition.desks) {
    return {
      leadStory: fallbackLeadStory,
      frontpage: fallbackFrontPage,
      ai: fallbackAi,
      web: fallbackWeb,
      startups: fallbackStartup,
      design: fallbackDesign,
      security: fallbackSecurity,
      gaming: fallbackGaming,
      culture: fallbackCulture,
      business: fallbackBusiness,
      future: fallbackFuture,
      allArticles: fallbackAllArticles,
      isLiveBackendData: false,
    };
  }

  const mapList = (arr) => (Array.isArray(arr) ? arr.map(mapArticleToBroadsheetFormat).filter(Boolean) : []);

  // 1. Lead Story
  const leadStory = edition.leadArticle
    ? mapArticleToBroadsheetFormat(edition.leadArticle)
    : fallbackLeadStory;

  // 2. Frontpage stories
  const fpList = mapList(edition.desks.frontpage);
  const frontpage = fpList.length >= 3 ? fpList : fallbackFrontPage;

  // 3. AI Desk
  const aiList = mapList(edition.desks.ai);
  const ai =
    aiList.length > 0
      ? {
          lead: aiList[0],
          secondaries: aiList.slice(1, 3).map((a) => ({
            id: a.id,
            headline: a.headline,
            deck: a.deck,
            time: "JUST IN",
            readTime: a.readTime,
          })),
          benchmarks: fallbackAi.lead.benchmarks,
        }
      : fallbackAi;

  // 4. Web Desk
  const webList = mapList(edition.desks.web);
  const web =
    webList.length > 0
      ? {
          lead: {
            ...webList[0],
            codeSnippet: fallbackWeb.lead.codeSnippet,
          },
          frameworkMetrics: fallbackWeb.frameworkMetrics,
        }
      : fallbackWeb;

  // 5. Startups Desk
  const startupList = mapList(edition.desks.startups);
  const startups =
    startupList.length > 0
      ? {
          lead: {
            ...startupList[0],
            highlightStat: fallbackStartup.lead.highlightStat,
            highlightLabel: fallbackStartup.lead.highlightLabel,
          },
          dealFlow: fallbackStartup.dealFlow,
          chartData: fallbackStartup.chartData,
        }
      : fallbackStartup;

  // 6. Design Desk
  const designList = mapList(edition.desks.design);
  const design =
    designList.length > 0
      ? {
          lead: {
            ...designList[0],
            collageImages: fallbackDesign.lead.collageImages,
            designPrinciples: fallbackDesign.lead.designPrinciples,
          },
        }
      : fallbackDesign;

  // 7. Security Desk
  const secList = mapList(edition.desks.security);
  const security =
    secList.length > 0
      ? {
          lead: {
            ...secList[0],
            threatLevel: fallbackSecurity.lead.threatLevel,
            classification: fallbackSecurity.lead.classification,
          },
          bulletins: fallbackSecurity.bulletins,
        }
      : fallbackSecurity;

  // 8. Gaming Desk
  const gamingList = mapList(edition.desks.gaming);
  const gaming =
    gamingList.length > 0
      ? {
          lead: {
            ...gamingList[0],
            reviewScore: fallbackGaming.lead.reviewScore,
            reviewTitle: fallbackGaming.lead.reviewTitle,
            stats: fallbackGaming.lead.stats,
          },
        }
      : fallbackGaming;

  // 9. Culture Desk
  const cultureList = mapList(edition.desks.culture);
  const culture =
    cultureList.length > 0
      ? {
          lead: cultureList[0],
          classifieds: fallbackCulture.classifieds,
          miniCrossword: fallbackCulture.miniCrossword,
        }
      : fallbackCulture;

  // 10. Business Desk
  const bizList = mapList(edition.desks.business);
  const business =
    bizList.length > 0
      ? {
          lead: {
            ...bizList[0],
            marketIndicators: fallbackBusiness.lead.marketIndicators,
          },
        }
      : fallbackBusiness;

  // 11. Future Desk
  const futureList = mapList(edition.desks.future);
  const future =
    futureList.length > 0
      ? {
          lead: {
            ...futureList[0],
            milestones: fallbackFuture.lead.milestones,
          },
        }
      : fallbackFuture;

  // Aggregate all articles from the edition
  const allArticles = [
    leadStory,
    ...frontpage,
    ...aiList,
    ...webList,
    ...startupList,
    ...designList,
    ...secList,
    ...gamingList,
    ...cultureList,
    ...bizList,
    ...futureList,
  ].filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
  );

  return {
    date: edition.date,
    displayDate: edition.displayDate,
    leadStory,
    frontpage,
    ai,
    web,
    startups,
    design,
    security,
    gaming,
    culture,
    business,
    future,
    allArticles: allArticles.length > 0 ? allArticles : fallbackAllArticles,
    isLiveBackendData: true,
  };
}
