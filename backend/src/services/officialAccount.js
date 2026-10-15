const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * Service to manage the Official Brand Account and username normalization.
 * Idempotent, safe, and production-ready.
 */

const OFFICIAL_USERNAME = "thedigitaltimes";
const OFFICIAL_NAME = "The Digital Times";

const ensureOfficialAccount = async () => {
  try {
    let official = await User.findOne({ username: OFFICIAL_USERNAME });

    if (!official) {
      // Check if user exists by official email
      const officialEmail = "broadsheet@digitaltimes.com";
      official = await User.findOne({ email: officialEmail });

      if (official) {
        official.username = OFFICIAL_USERNAME;
        official.name = OFFICIAL_NAME;
        official.accountType = "official_brand";
        official.isVerified = true;
        official.role = "admin";
        official.verification = {
          status: "verified",
          category: "publication",
          badge: "official_brand",
          verifiedAt: official.verification?.verifiedAt || new Date(),
        };
        official.bio =
          "The official broadsheet voice of The Digital Times. Delivering premium vintage journalism, real-time dispatches, and curated daily editions since 1892.";
        official.organization = "The Digital Times Publishing Co.";
        official.desk = "BROADSHEET EDITORIAL";
        official.avatar = "/icon.svg";
        await official.save();
        console.log(`[OfficialAccount] Updated existing user to Official Brand Account (@${OFFICIAL_USERNAME})`);
      } else {
        // Create new official brand account with random high-entropy salt
        const salt = await bcrypt.genSalt(12);
        const autoPass = await bcrypt.hash(`DT_Official_${Date.now()}_Key`, salt);

        official = await User.create({
          name: OFFICIAL_NAME,
          username: OFFICIAL_USERNAME,
          email: officialEmail,
          password: autoPass,
          accountType: "official_brand",
          isVerified: true,
          role: "admin",
          verification: {
            status: "verified",
            category: "publication",
            badge: "official_brand",
            verifiedAt: new Date(),
          },
          bio: "The official broadsheet voice of The Digital Times. Delivering premium vintage journalism, real-time dispatches, and curated daily editions since 1892.",
          organization: "The Digital Times Publishing Co.",
          desk: "BROADSHEET EDITORIAL",
          avatar: "/icon.svg",
          preferences: {
            theme: "morning",
            favoriteDesks: ["ai", "web", "startups", "security", "science"],
            notifications: true,
          },
        });
        console.log(`[OfficialAccount] Provisioned Official Brand Account (@${OFFICIAL_USERNAME})`);
      }
    } else {
      // Ensure official brand fields remain authoritative without overwriting custom password
      let dirty = false;
      if (official.accountType !== "official_brand") {
        official.accountType = "official_brand";
        dirty = true;
      }
      if (!official.isVerified) {
        official.isVerified = true;
        dirty = true;
      }
      if (official.verification?.status !== "verified") {
        official.verification = {
          status: "verified",
          category: "publication",
          badge: "official_brand",
          verifiedAt: official.verification?.verifiedAt || new Date(),
        };
        dirty = true;
      }
      if (dirty) {
        await official.save();
        console.log(`[OfficialAccount] Synchronized official brand verification attributes.`);
      }
    }

    return official;
  } catch (err) {
    console.error("[OfficialAccount] Error ensuring official account:", err.message);
    return null;
  }
};

/**
 * Migrate legacy users without a username
 */
const normalizeExistingUsers = async () => {
  try {
    const legacyUsers = await User.find({
      $or: [{ username: { $exists: false } }, { username: null }, { username: "" }],
    });

    if (legacyUsers.length === 0) return 0;

    console.log(`[Migration] Found ${legacyUsers.length} users requiring username assignment.`);

    for (const u of legacyUsers) {
      const candidateBase = u.email ? u.email.split("@")[0] : u.name || "reader";
      const uniqueUsername = await User.generateUniqueUsername(candidateBase);
      u.username = uniqueUsername;
      if (!u.accountType) u.accountType = "reader";
      if (typeof u.isVerified !== "boolean") u.isVerified = false;
      await u.save();
      console.log(`[Migration] Assigned username @${uniqueUsername} to user ${u._id} (${u.email})`);
    }

    return legacyUsers.length;
  } catch (err) {
    console.error("[Migration] Error normalizing user usernames:", err.message);
    return 0;
  }
};

module.exports = {
  OFFICIAL_USERNAME,
  OFFICIAL_NAME,
  ensureOfficialAccount,
  normalizeExistingUsers,
};
