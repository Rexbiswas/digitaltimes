/**
 * Digital Times — Real-Time Follow Notifications Integration Test Suite
 * 
 * Verifies all 10 follow & real-time notification behaviors across two authenticated users:
 * 1. User A follows User B -> Follow relationship persisted in MongoDB
 * 2. Exactly one persistent notification created for User B with NEW_FOLLOWER type
 * 3. Real-time Socket.IO emission to User B's private room with event 'notification:new'
 * 4. User B unread notification count incremented immediately
 * 5. User B unread badge reflects new count
 * 6. User B notifications page shows User A's follow event with actor details
 * 7. User B marks notification as read -> count updates and persists
 * 8. Duplicate follow request is idempotent and does not create duplicate notification
 * 9. User A unfollows and follows again -> new notification emitted and saved
 * 10. User cannot follow themselves
 */

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { io: ClientIO } = require(require.resolve("socket.io-client", {
  paths: [__dirname + "/..", __dirname + "/../.."],
}));

// Backend models & config
const User = require("../src/models/User");
const Follow = require("../src/models/Follow");
const Notification = require("../src/models/Notification");
const { initSocket } = require("../src/config/socket");
const env = require("../src/config/env");

// Routes
const followRoutes = require("../src/routes/followRoutes");
const notificationRoutes = require("../src/routes/notificationRoutes");

async function runTestSuite() {
  console.log("================================================================================");
  console.log("   DIGITAL TIMES — REAL-TIME FOLLOW NOTIFICATIONS VERIFICATION TEST SUITE");
  console.log("================================================================================\n");

  let server = null;
  let socketB = null;
  let socketA = null;
  let port = null;
  let baseUrl = null;
  let userA = null;
  let userB = null;

  const testResults = [];
  function recordTest(title, passed, detail = "") {
    testResults.push({ title, passed, detail });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] ${title}${detail ? " -> " + detail : ""}`);
  }

  const testUserAUsername = `test_arthur_${Date.now()}`;
  const testUserBUsername = `test_beatrice_${Date.now()}`;

  try {
    // 1. Connect to MongoDB
    console.log("[Setup] Connecting to MongoDB database...");
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("[Setup] Connected to MongoDB database.");

    // 2. Set up Express application with WebSocket support
    const app = express();
    app.use(express.json());
    app.use("/api/follows", followRoutes);
    app.use("/api/notifications", notificationRoutes);

    server = http.createServer(app);
    initSocket(server);

    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`[Setup] Broadsheet backend running on port ${port}.`);
        resolve();
      });
    });

    // 3. Create Two Test Users: User A (Follower) and User B (Recipient)
    console.log("[Setup] Registering authenticated subscriber accounts...");
    userA = await User.create({
      name: "Arthur Pendelton",
      username: testUserAUsername,
      email: `${testUserAUsername}@digitaltimes.com`,
      password: "hashedPassword123!",
      accountType: "reader",
      role: "reader",
      avatar: "https://digitaltimes.com/avatars/arthur.jpg",
    });

    userB = await User.create({
      name: "Beatrice Webb",
      username: testUserBUsername,
      email: `${testUserBUsername}@digitaltimes.com`,
      password: "hashedPassword123!",
      accountType: "journalist",
      role: "editor",
      isVerified: true,
      verification: { status: "verified", category: "journalist" },
      avatar: "https://digitaltimes.com/avatars/beatrice.jpg",
    });

    const tokenA = jwt.sign(
      { id: userA._id.toString(), email: userA.email, role: userA.role },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const tokenB = jwt.sign(
      { id: userB._id.toString(), email: userB.email, role: userB.role },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const authHeaderA = { Authorization: `Bearer ${tokenA}` };
    const authHeaderB = { Authorization: `Bearer ${tokenB}` };

    // 4. Connect User B Socket.IO client with authenticated handshake
    console.log("[Setup] Connecting User B client socket to private room...");
    const socketBReceivedEvents = [];
    socketB = ClientIO(baseUrl, {
      auth: { token: tokenB },
      transports: ["websocket"],
      forceNew: true,
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Socket B connection timed out")), 4000);
      socketB.on("connect", () => {
        clearTimeout(timer);
        resolve();
      });
      socketB.on("connect_error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    socketB.on("notification:new", (data) => {
      socketBReceivedEvents.push({ event: "notification:new", data });
    });

    console.log("[Setup] User B socket connected and listening for dispatches.\n");

    // Helper fetch wrapper
    async function apiRequest(path, { method = "GET", headers = {}, body = null } = {}) {
      const fetchOpts = { method, headers: { "Content-Type": "application/json", ...headers } };
      if (body) fetchOpts.body = JSON.stringify(body);
      const res = await fetch(`${baseUrl}${path}`, fetchOpts);
      const data = await res.json().catch(() => ({}));
      return { status: res.status, ok: res.ok, data };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1: User A follows User B -> Follow persisted in DB
    // ─────────────────────────────────────────────────────────────────────────
    const followRes = await apiRequest("/api/follows", {
      method: "POST",
      headers: authHeaderA,
      body: {
        targetType: "user",
        targetId: userB._id.toString(),
      },
    });

    const followInDb = await Follow.findOne({
      user: userA._id,
      targetType: "user",
      targetId: userB._id.toString(),
    });

    recordTest(
      "Test 1: User A follows User B -> Follow persisted in MongoDB",
      followRes.status === 201 && followInDb !== null,
      `Follow ID: ${followInDb?._id}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 2: One notification created for User B with NEW_FOLLOWER type
    // ─────────────────────────────────────────────────────────────────────────
    const notifsForB = await Notification.find({
      $or: [{ recipient: userB._id }, { user: userB._id }],
      type: "NEW_FOLLOWER",
    });

    const notif = notifsForB[0];
    const test2Passed =
      notifsForB.length === 1 &&
      notif.type === "NEW_FOLLOWER" &&
      notif.actor.toString() === userA._id.toString() &&
      notif.entityId.toString() === followInDb._id.toString();

    recordTest(
      "Test 2: Exactly one notification created for User B with NEW_FOLLOWER type",
      test2Passed,
      `Message: "${notif?.message}", Recipient: User B`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3: Socket.IO event received by User B's client in their private room
    // ─────────────────────────────────────────────────────────────────────────
    // Allow brief event loop cycle for websocket message delivery
    await new Promise((r) => setTimeout(r, 200));

    const receivedNotifEvent = socketBReceivedEvents.find(
      (e) => e.event === "notification:new"
    );

    const test3Passed =
      Boolean(receivedNotifEvent) &&
      (receivedNotifEvent.data.type === "NEW_FOLLOWER" || receivedNotifEvent.data.type === "follow") &&
      (receivedNotifEvent.data.actor?.username === userA.username ||
        receivedNotifEvent.data.metadata?.followerUsername === userA.username);

    recordTest(
      "Test 3: Socket.IO event 'notification:new' received by User B in private room",
      test3Passed,
      `Event received with actor @${userA.username}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 4 & 5: User B unread count incremented immediately & badge reflects it
    // ─────────────────────────────────────────────────────────────────────────
    const unreadCountRes = await apiRequest("/api/notifications/unread-count", {
      headers: authHeaderB,
    });

    const unreadCountFromSocket = receivedNotifEvent?.data?.unreadCount;
    const test4Passed = unreadCountRes.data.unreadCount === 1;
    const test5Passed = unreadCountFromSocket === 1;

    recordTest(
      "Test 4: User B unread count incremented to 1 immediately in API ledger",
      test4Passed,
      `Authoritative count: ${unreadCountRes.data.unreadCount}`
    );

    recordTest(
      "Test 5: Real-time socket payload contains authoritative unreadCount: 1 for badge",
      test5Passed,
      `Socket payload unreadCount: ${unreadCountFromSocket}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 6: User B notifications page shows User A's follow event
    // ─────────────────────────────────────────────────────────────────────────
    const notifsListRes = await apiRequest("/api/notifications?limit=10", {
      headers: authHeaderB,
    });

    const retrievedNotif = notifsListRes.data.data?.[0];
    const test6Passed =
      notifsListRes.ok &&
      retrievedNotif &&
      retrievedNotif.type === "NEW_FOLLOWER" &&
      retrievedNotif.actor?.username === userA.username &&
      retrievedNotif.isRead === false;

    recordTest(
      "Test 6: User B notifications page lists User A follow event with actor details",
      test6Passed,
      `Actor: ${retrievedNotif?.actor?.name} (@${retrievedNotif?.actor?.username})`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 7: User B marks notification as read -> count updates and persists
    // ─────────────────────────────────────────────────────────────────────────
    const markReadRes = await apiRequest(`/api/notifications/${retrievedNotif._id}/read`, {
      method: "PATCH",
      headers: authHeaderB,
    });

    const unreadCountAfterRead = await apiRequest("/api/notifications/unread-count", {
      headers: authHeaderB,
    });

    const test7Passed =
      markReadRes.ok &&
      markReadRes.data.unreadCount === 0 &&
      unreadCountAfterRead.data.unreadCount === 0;

    recordTest(
      "Test 7: User B marks notification as read -> count persists as 0",
      test7Passed,
      `Unread count after read: ${unreadCountAfterRead.data.unreadCount}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 8: Duplicate follow request is idempotent and does not create duplicate
    // ─────────────────────────────────────────────────────────────────────────
    const notifsBeforeDup = await Notification.countDocuments({
      recipient: userB._id,
      type: "NEW_FOLLOWER",
    });
    const socketEventsBeforeDup = socketBReceivedEvents.length;

    const dupFollowRes = await apiRequest("/api/follows", {
      method: "POST",
      headers: authHeaderA,
      body: {
        targetType: "user",
        targetId: userB._id.toString(),
      },
    });

    await new Promise((r) => setTimeout(r, 200));

    const notifsAfterDup = await Notification.countDocuments({
      recipient: userB._id,
      type: "NEW_FOLLOWER",
    });
    const socketEventsAfterDup = socketBReceivedEvents.length;

    const test8Passed =
      dupFollowRes.ok &&
      dupFollowRes.data.isFollowing === true &&
      notifsAfterDup === notifsBeforeDup &&
      socketEventsAfterDup === socketEventsBeforeDup;

    recordTest(
      "Test 8: Duplicate follow request is idempotent with no extra notification",
      test8Passed,
      `Existing count: ${notifsAfterDup}, Socket events delta: ${socketEventsAfterDup - socketEventsBeforeDup}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 9: User A unfollows and follows again -> new notification emitted & saved
    // ─────────────────────────────────────────────────────────────────────────
    const unfollowRes = await apiRequest(`/api/follows/${userB._id.toString()}`, {
      method: "DELETE",
      headers: authHeaderA,
    });

    const followAfterDelete = await Follow.findOne({
      user: userA._id,
      targetType: "user",
      targetId: userB._id.toString(),
    });

    // Clear event counter
    const socketEventsBeforeReFollow = socketBReceivedEvents.length;

    // Follow again
    const reFollowRes = await apiRequest("/api/follows", {
      method: "POST",
      headers: authHeaderA,
      body: {
        targetType: "user",
        targetId: userB._id.toString(),
      },
    });

    await new Promise((r) => setTimeout(r, 200));

    const notifsAfterReFollow = await Notification.countDocuments({
      recipient: userB._id,
      type: "NEW_FOLLOWER",
    });
    const socketEventsAfterReFollow = socketBReceivedEvents.length;

    const test9Passed =
      unfollowRes.ok &&
      followAfterDelete === null &&
      reFollowRes.status === 201 &&
      notifsAfterReFollow > notifsAfterDup &&
      socketEventsAfterReFollow > socketEventsBeforeReFollow;

    recordTest(
      "Test 9: User A unfollows and follows again -> new notification emitted and saved",
      test9Passed,
      `New total notifications: ${notifsAfterReFollow}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 10: User cannot follow themselves
    // ─────────────────────────────────────────────────────────────────────────
    const selfFollowRes = await apiRequest("/api/follows", {
      method: "POST",
      headers: authHeaderA,
      body: {
        targetType: "user",
        targetId: userA._id.toString(),
      },
    });

    const test10Passed =
      selfFollowRes.status === 400 &&
      selfFollowRes.data.success === false;

    recordTest(
      "Test 10: Self-follow rejected with 400 Bad Request",
      test10Passed,
      `Response: "${selfFollowRes.data?.message}"`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n================================================================================");
    const passedCount = testResults.filter((t) => t.passed).length;
    const allPassed = passedCount === testResults.length;
    console.log(`   INTEGRATION TEST SUMMARY: ${passedCount}/${testResults.length} PASSED`);
    console.log("================================================================================\n");

    if (!allPassed) {
      console.error("Some integration tests failed.");
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("[FATAL ERROR] Test suite encountered unexpected failure:", err);
    process.exitCode = 1;
  } finally {
    try {
      if (userA?._id) {
        await Follow.deleteMany({ user: userA._id });
        await Notification.deleteMany({ $or: [{ recipient: userA._id }, { actor: userA._id }] });
        await User.findByIdAndDelete(userA._id);
      }
      if (userB?._id) {
        await Follow.deleteMany({ user: userB._id });
        await Notification.deleteMany({ $or: [{ recipient: userB._id }, { actor: userB._id }] });
        await User.findByIdAndDelete(userB._id);
      }
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr.message);
    }
    if (socketB) socketB.disconnect();
    if (socketA) socketA.disconnect();
    if (server) await new Promise((r) => server.close(r));
    if (mongoose.connection.readyState) await mongoose.disconnect();
  }
}

runTestSuite();
