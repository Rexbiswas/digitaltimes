const { assembleDailyEdition } = require("../services/edition/editionAssembler");
const Edition = require("../models/Edition");

/**
 * Generate or ensure a structured daily edition for a given date
 */
const generateDailyEdition = async (dateStr) => {
  return await assembleDailyEdition(dateStr, { forceRebuild: true });
};

/**
 * Daily check for rollover to create new edition
 */
const startEditionJob = () => {
  // Check every hour for rollover
  setInterval(async () => {
    const today = new Date().toISOString().split("T")[0];
    const edition = await Edition.findOne({ date: today });
    if (!edition) {
      await assembleDailyEdition(today);
    }
  }, 60 * 60 * 1000);
};

module.exports = {
  generateDailyEdition,
  startEditionJob,
};
