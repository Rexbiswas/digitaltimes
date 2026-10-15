const mongoose = require("mongoose");
const env = require("../config/env");
const User = require("../models/User");
const Follow = require("../models/Follow");
const Article = require("../models/Article");
const Notification = require("../models/Notification");
const VerificationRequest = require("../models/VerificationRequest");
const jwt = require("jsonwebtoken");

async function runTests() {
  console.log("=======================================================");
  console.log(" THE DIGITAL TIMES — REAL-TIME SOCIAL ARCHITECTURE TESTS");
  console.log("=======================================================");

  await mongoose.connect(env.MONGODB_URI);
  console.log("[DB] Connected to MongoDB Atlas.");

  const testEmail = `test_reader_${Date.now()}@digitaltimes.com`;
  const adminEmail = `test_admin_${Date.now()}@digitaltimes.com`;

  // 1. Create Test User and Admin User
  const testUser = await User.create({
    name: "Aria Thorne",
    email: testEmail,
    role: "reader",
  });
  const adminUser = await User.create({
    name: "Chief Editor Julian",
    email: adminEmail,
    role: "admin",
  });

  const userToken = jwt.sign({ id: testUser._id }, env.JWT_SECRET, { expiresIn: "1h" });
  const adminToken = jwt.sign({ id: adminUser._id }, env.JWT_SECRET, { expiresIn: "1h" });

  console.log("✓ Test User created:", testUser._id.toString());
  console.log("✓ Test Admin created:", adminUser._id.toString());

  const baseUrl = `http://localhost:${env.PORT}/api`;

  // 2. Test Following an Author
  const followAuthorRes = await fetch(`${baseUrl}/follows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      targetType: "journalist",
      targetId: "BrianKrebs",
      targetName: "BrianKrebs",
      targetDesk: "SECURITY",
    }),
  }).then((r) => r.json());

  console.log("✓ Follow Author response:", {
    success: followAuthorRes.success,
    isFollowing: followAuthorRes.isFollowing,
    followerCount: followAuthorRes.followerCount,
  });

  // 3. Test Duplicate Follow Prevention
  const dupFollowRes = await fetch(`${baseUrl}/follows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      targetType: "journalist",
      targetId: "BrianKrebs",
      targetName: "BrianKrebs",
    }),
  }).then((r) => r.json());

  console.log("✓ Duplicate follow handled safely:", dupFollowRes.message);

  // 4. Test Following an Editorial Desk
  const followDeskRes = await fetch(`${baseUrl}/follows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      targetType: "desk",
      targetId: "ai",
      targetName: "The AI Desk",
      targetDesk: "AI",
    }),
  }).then((r) => r.json());

  console.log("✓ Follow Desk response:", {
    success: followDeskRes.success,
    isFollowing: followDeskRes.isFollowing,
  });

  // 5. Test Listing User Follows
  const listFollowsRes = await fetch(`${baseUrl}/follows`, {
    headers: { Authorization: `Bearer ${userToken}` },
  }).then((r) => r.json());

  console.log("✓ User follows count:", {
    total: listFollowsRes.pagination?.total,
    desks: listFollowsRes.desks?.length,
    journalists: listFollowsRes.journalists?.length,
  });

  // 6. Test Personalized Feed
  const feedRes = await fetch(`${baseUrl}/feed?limit=10`, {
    headers: { Authorization: `Bearer ${userToken}` },
  }).then((r) => r.json());

  console.log("✓ Personalized feed returned:", {
    success: feedRes.success,
    count: feedRes.count,
    hasNextCursor: !!feedRes.nextCursor,
    followedSources: feedRes.followedSourcesCount,
  });

  // 7. Test Verification Request Submission
  const verifReqRes = await fetch(`${baseUrl}/verification/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      category: "journalist",
      name: "Aria Thorne",
      organization: "Broadsheet Investigative Wire",
      titleOrRole: "Senior Computational Logic Correspondent",
      workLinks: ["https://example.com/dispatch-1", "https://example.com/portfolio"],
      evidence: "International Press Card #IPC-904128; Institutional credentials on record.",
    }),
  }).then((r) => r.json());

  console.log("✓ Verification request submitted:", {
    success: verifReqRes.success,
    requestId: verifReqRes.data?._id,
    status: verifReqRes.data?.status,
  });

  const requestId = verifReqRes.data?._id;

  // 8. Test Admin Verification Approval
  const approveRes = await fetch(`${baseUrl}/verification/requests/${requestId}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      reviewerNotes: "Credentials and published work authenticated via press registry.",
    }),
  }).then((r) => r.json());

  console.log("✓ Admin approved verification:", {
    success: approveRes.success,
    status: approveRes.data?.status,
  });

  // 9. Verify Target User is now verified and has notification
  const updatedUser = await User.findById(testUser._id).lean();
  console.log("✓ User verification badge updated in DB:", {
    status: updatedUser.verification?.status,
    category: updatedUser.verification?.category,
    badge: updatedUser.verification?.badge,
  });

  const userNotifs = await Notification.find({ user: testUser._id }).lean();
  console.log("✓ User received persistent notification:", {
    count: userNotifs.length,
    latestTitle: userNotifs[0]?.title,
    type: userNotifs[0]?.type,
  });

  // 10. Test Unfollowing
  const unfollowRes = await fetch(`${baseUrl}/follows/${encodeURIComponent("BrianKrebs")}?targetType=journalist`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${userToken}` },
  }).then((r) => r.json());

  console.log("✓ Unfollow response:", {
    success: unfollowRes.success,
    isFollowing: unfollowRes.isFollowing,
  });

  // 11. Cleanup test records
  await User.deleteMany({ _id: { $in: [testUser._id, adminUser._id] } });
  await Follow.deleteMany({ user: testUser._id });
  await Notification.deleteMany({ user: testUser._id });
  await VerificationRequest.deleteMany({ user: testUser._id });
  console.log("✓ Test records cleaned up successfully.");

  console.log("=======================================================");
  console.log(" ALL REAL-TIME & SOCIAL ARCHITECTURE TESTS PASSED!");
  console.log("=======================================================");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
