const cron = require("node-cron");
const { runIngestionPipeline } = require("../ingestion/ingestionPipeline");
const { assembleDailyEdition } = require("../edition/editionAssembler");
const Article = require("../../models/Article");

let ingestionTask = null;
let editionRollupTask = null;
let trendingRecalcTask = null;
let lastIngestionStats = null;

/**
 * Recalculate trending flag on articles based on view counts
 */
const recalculateTrendingArticles = async () => {
  try {
    // Reset trending flag
    await Article.updateMany({ trending: true }, { $set: { trending: false } });

    // Mark top 10 viewed articles as trending
    const topArticles = await Article.find({ status: "published" })
      .sort("-views")
      .limit(10);

    const ids = topArticles.map((a) => a._id);
    await Article.updateMany({ _id: { $in: ids } }, { $set: { trending: true } });
    console.log(`[Scheduler] Updated trending status for ${ids.length} articles.`);
  } catch (err) {
    console.warn(`[Scheduler] Error updating trending articles: ${err.message}`);
  }
};

/**
 * Initialize all scheduled broadsheet cron jobs
 */
const startCronScheduler = () => {
  console.log("[Scheduler] Initializing Digital Times Broadsheet Cron Scheduler...");

  // 1. News Ingestion Job: runs every 30 minutes
  ingestionTask = cron.schedule("*/30 * * * *", async () => {
    console.log("[Scheduler] Cron triggered: Broadsheet News Ingestion (30m interval)");
    try {
      lastIngestionStats = await runIngestionPipeline();
    } catch (err) {
      console.error(`[Scheduler] Ingestion cron failed: ${err.message}`);
    }
  });

  // 2. Daily Broadsheet Rollover: runs at midnight every day
  editionRollupTask = cron.schedule("0 0 * * *", async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    console.log(`[Scheduler] Cron triggered: Midnight Broadsheet Edition Rollover for ${todayStr}`);
    try {
      await assembleDailyEdition(todayStr, { forceRebuild: true });
    } catch (err) {
      console.error(`[Scheduler] Midnight edition rollover failed: ${err.message}`);
    }
  });

  // 3. Trending Articles Refresh: runs at the top of every hour
  trendingRecalcTask = cron.schedule("0 * * * *", async () => {
    await recalculateTrendingArticles();
  });

  // 4. Initial startup trigger (delayed slightly to ensure DB connection is ready)
  setTimeout(async () => {
    console.log("[Scheduler] Running initial boot ingestion cycle...");
    try {
      lastIngestionStats = await runIngestionPipeline();
      const todayStr = new Date().toISOString().split("T")[0];
      await assembleDailyEdition(todayStr);
    } catch (err) {
      console.error(`[Scheduler] Initial boot run error: ${err.message}`);
    }
  }, 5000);

  console.log("[Scheduler] All broadsheet jobs scheduled (Ingestion: 30m, Edition: Midnight, Trending: 1h).");
};

/**
 * Stop all running cron jobs
 */
const stopCronScheduler = () => {
  if (ingestionTask) ingestionTask.stop();
  if (editionRollupTask) editionRollupTask.stop();
  if (trendingRecalcTask) trendingRecalcTask.stop();
  console.log("[Scheduler] All scheduled cron tasks stopped.");
};

/**
 * Manually trigger ingestion on demand
 */
const triggerIngestionNow = async () => {
  console.log("[Scheduler] Manual ingestion requested.");
  lastIngestionStats = await runIngestionPipeline();
  return lastIngestionStats;
};

/**
 * Manually trigger edition rollup on demand
 */
const triggerEditionRollupNow = async (targetDate = null) => {
  const date = targetDate || new Date().toISOString().split("T")[0];
  console.log(`[Scheduler] Manual edition rollup requested for ${date}.`);
  return await assembleDailyEdition(date, { forceRebuild: true });
};

/**
 * Get current scheduler status and last run stats
 */
const getSchedulerStatus = () => {
  return {
    schedulerRunning: Boolean(ingestionTask),
    lastIngestionStats,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  startCronScheduler,
  stopCronScheduler,
  triggerIngestionNow,
  triggerEditionRollupNow,
  getSchedulerStatus,
  recalculateTrendingArticles,
};
