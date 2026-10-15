const mongoose = require("mongoose");
const env = require("../config/env");
const User = require("../models/User");
const Follow = require("../models/Follow");
const Bookmark = require("../models/Bookmark");
const ReadingHistory = require("../models/ReadingHistory");
const Notification = require("../models/Notification");
const VerificationRequest = require("../models/VerificationRequest");

async function cleanup() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas.");

    // Keep the official brand account and the user's primary account
    const preservedUsernames = ["thedigitaltimes", "rexbiswas1"];

    // Find accounts to be removed
    const accountsToDelete = await User.find({
      username: { $nin: preservedUsernames },
    });

    const idsToDelete = accountsToDelete.map((u) => u._id);
    const idsToDeleteStrings = idsToDelete.map((id) => id.toString());

    console.log(
      "Accounts to delete:",
      accountsToDelete.map((u) => `@${u.username} (${u.name})`)
    );

    // 1. Delete the users
    const userResult = await User.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`✓ Deleted ${userResult.deletedCount} user accounts.`);

    // 2. Cascade delete follows
    const followResult = await Follow.deleteMany({
      $or: [
        { user: { $in: idsToDelete } },
        { targetId: { $in: idsToDeleteStrings } },
        { followedUser: { $in: idsToDelete } },
      ],
    });
    console.log(`✓ Removed ${followResult.deletedCount} related follow records.`);

    // 3. Cascade delete bookmarks, reading history, notifications, verifications
    const bmResult = await Bookmark.deleteMany({ user: { $in: idsToDelete } });
    const rhResult = await ReadingHistory.deleteMany({ user: { $in: idsToDelete } });
    const notifResult = await Notification.deleteMany({
      $or: [
        { recipient: { $in: idsToDelete } },
        { "metadata.followerId": { $in: idsToDelete } },
      ],
    });
    const vrResult = await VerificationRequest.deleteMany({ applicant: { $in: idsToDelete } });

    console.log(`✓ Cleaned ${bmResult.deletedCount} bookmarks.`);
    console.log(`✓ Cleaned ${rhResult.deletedCount} reading history logs.`);
    console.log(`✓ Cleaned ${notifResult.deletedCount} notifications.`);
    console.log(`✓ Cleaned ${vrResult.deletedCount} verification requests.`);

    // Verify remaining users
    const remaining = await User.find({}).select("name username email accountType isVerified").lean();
    console.log("\n=======================================================");
    console.log("REMAINING AUTHORITATIVE USERS IN MONGODB:");
    console.log(JSON.stringify(remaining, null, 2));
    console.log("=======================================================");

    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
}

cleanup();
