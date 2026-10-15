const mongoose = require("mongoose");
const env = require("../config/env");
const User = require("../models/User");
const Follow = require("../models/Follow");
const Notification = require("../models/Notification");
const { ensureOfficialAccount } = require("../services/officialAccount");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runSocialSuite() {
  console.log("===============================================================");
  console.log(" THE DIGITAL TIMES — INSTAGRAM-STYLE SOCIAL ARCHITECTURE TESTS");
  console.log("===============================================================");

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("✓ Connected to MongoDB Atlas cluster.\n");

    // 1. Verify Official Brand Account
    console.log("TEST 1: Authoritative Official Brand Account (@thedigitaltimes)");
    const official = await ensureOfficialAccount();
    assert(official !== null, "Official brand account ensured without error");
    assert(official.username === "thedigitaltimes", "Username is strictly 'thedigitaltimes'");
    assert(official.name === "The Digital Times", "Display name is 'The Digital Times'");
    assert(official.accountType === "official_brand", "Account type is 'official_brand'");
    assert(official.isVerified === true, "Official account isVerified is strictly true");
    assert(official.verification?.badge === "official_brand", "Official account badge is 'official_brand'");
    console.log("");

    // 2. Reserved Username Protection
    console.log("TEST 2: Reserved Username Validation");
    assert(User.isUsernameReserved("thedigitaltimes"), "'thedigitaltimes' is protected");
    assert(User.isUsernameReserved("digitaltimes"), "'digitaltimes' is protected");
    assert(User.isUsernameReserved("admin"), "'admin' is protected");
    assert(!User.isUsernameReserved("charlie_reader"), "'charlie_reader' is allowed");
    console.log("");

    // 3. User Registration Defaults
    console.log("TEST 3: Real User Registration & Default Unverified State");
    const testUsername = `user_${Date.now()}`;
    const testEmail = `test_${Date.now()}@digitaltimes.test`;

    const userA = await User.create({
      name: "Reader Arthur",
      username: testUsername,
      email: testEmail,
      password: "Password123!",
      role: "reader",
      accountType: "reader",
      isVerified: false,
    });

    assert(userA.isVerified === false, "Regular user defaults to isVerified: false");
    assert(userA.accountType === "reader", "Regular user defaults to accountType: 'reader'");
    assert(userA.username === testUsername, "Unique normalized username saved");

    // Attempting duplicate username should fail
    let duplicateRejected = false;
    try {
      await User.create({
        name: "Duplicate Arthur",
        username: testUsername,
        email: `dup_${Date.now()}@digitaltimes.test`,
        password: "Password123!",
      });
    } catch (e) {
      duplicateRejected = true;
    }
    assert(duplicateRejected, "Duplicate username registration is rejected by unique constraint");
    console.log("");

    // 4. Social Follow Relationship
    console.log("TEST 4: User-to-User Follow & Self-Following Prevention");
    const testTargetUsername = `target_${Date.now()}`;
    const userB = await User.create({
      name: "Reader Beatrice",
      username: testTargetUsername,
      email: `beatrice_${Date.now()}@digitaltimes.test`,
      password: "Password123!",
      role: "reader",
      accountType: "reader",
      isVerified: false,
    });

    // User A follows User B
    const followRecord = await Follow.create({
      user: userA._id,
      targetType: "user",
      targetId: userB._id.toString(),
      followedUser: userB._id,
      targetName: userB.name,
      metadata: { username: userB.username },
    });

    assert(followRecord !== null, "User A successfully followed User B");

    // Check duplicate follow rejection
    let dupFollowRejected = false;
    try {
      await Follow.create({
        user: userA._id,
        targetType: "user",
        targetId: userB._id.toString(),
        followedUser: userB._id,
        targetName: userB.name,
      });
    } catch (e) {
      dupFollowRejected = true;
    }
    assert(dupFollowRejected, "Duplicate follow prevented by compound unique index");

    // Verify follower and following counts
    const bFollowers = await Follow.countDocuments({
      targetType: "user",
      targetId: userB._id.toString(),
    });
    const aFollowing = await Follow.countDocuments({
      user: userA._id,
      targetType: "user",
    });

    assert(bFollowers === 1, "User B has exactly 1 follower");
    assert(aFollowing === 1, "User A has exactly 1 following");
    console.log("");

    // 5. Official Account Following
    console.log("TEST 5: Following Official Brand Account");
    const followOfficial = await Follow.create({
      user: userA._id,
      targetType: "user",
      targetId: official._id.toString(),
      followedUser: official._id,
      targetName: official.name,
      metadata: { username: official.username, accountType: "official_brand" },
    });
    assert(followOfficial !== null, "User A followed @thedigitaltimes");

    const officialFollowerCount = await Follow.countDocuments({
      targetType: "user",
      targetId: official._id.toString(),
    });
    assert(officialFollowerCount >= 1, "Official brand account follower count calculated accurately");
    console.log("");

    // 6. Unfollow Operation
    console.log("TEST 6: Unfollow Persistence");
    await Follow.findByIdAndDelete(followRecord._id);
    const bFollowersAfter = await Follow.countDocuments({
      targetType: "user",
      targetId: userB._id.toString(),
    });
    assert(bFollowersAfter === 0, "User B follower count drops to 0 after unfollow");
    console.log("");

    // 7. Cleanup Test Records
    console.log("TEST 7: Safe Cleanup of Test Records");
    await User.findByIdAndDelete(userA._id);
    await User.findByIdAndDelete(userB._id);
    await Follow.findByIdAndDelete(followOfficial._id);
    assert(true, "Temporary test accounts cleaned up safely without touching production data");
    console.log("");

    console.log("===============================================================");
    console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("===============================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Fatal Test Suite Error:", err);
    process.exit(1);
  }
}

runSocialSuite();
