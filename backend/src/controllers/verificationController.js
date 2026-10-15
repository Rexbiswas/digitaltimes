const VerificationRequest = require("../models/VerificationRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");

// POST /api/verification/request
// Submit a verification application
const submitVerificationRequest = async (req, res, next) => {
  try {
    const { category, name, organization, titleOrRole, workLinks, evidence } = req.body;

    if (!category || !["journalist", "editor", "publication"].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Must be 'journalist', 'editor', or 'publication'.",
      });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full editorial name is required.",
      });
    }

    if (!organization || typeof organization !== "string" || !organization.trim()) {
      return res.status(400).json({
        success: false,
        message: "Media organization or publisher affiliation is required.",
      });
    }

    if (!evidence || typeof evidence !== "string" || !evidence.trim()) {
      return res.status(400).json({
        success: false,
        message: "Supporting professional credentials or accreditation evidence is required.",
      });
    }

    // Check for existing pending request
    const existingPending = await VerificationRequest.findOne({
      user: req.user._id,
      status: "pending",
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: "You already have a verification request under editorial review.",
        data: existingPending,
      });
    }

    const cleanWorkLinks = Array.isArray(workLinks)
      ? workLinks.filter((l) => typeof l === "string" && l.trim().length > 0)
      : [];

    const request = await VerificationRequest.create({
      user: req.user._id,
      category,
      name: name.trim(),
      email: req.user.email,
      organization: organization.trim(),
      titleOrRole: (titleOrRole && titleOrRole.trim()) || "",
      workLinks: cleanWorkLinks,
      evidence: evidence.trim(),
      status: "pending",
    });

    // Update user verification status to pending
    await User.findByIdAndUpdate(req.user._id, {
      "verification.status": "pending",
      "verification.category": category,
    });

    res.status(201).json({
      success: true,
      message: "Verification application submitted for editorial board review.",
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/verification/status
// Check current user's verification status
const getVerificationStatus = async (req, res, next) => {
  try {
    const latestRequest = await VerificationRequest.findOne({ user: req.user._id })
      .sort("-createdAt")
      .lean();

    const user = await User.findById(req.user._id)
      .select("verification role name email")
      .lean();

    res.json({
      success: true,
      status: user?.verification?.status || "unverified",
      category: user?.verification?.category || "none",
      verifiedAt: user?.verification?.verifiedAt || null,
      request: latestRequest,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/verification/requests
// Admin / Editor: List all verification requests
const listVerificationRequests = async (req, res, next) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      VerificationRequest.find(query)
        .populate("user", "name email role")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum)
        .lean(),
      VerificationRequest.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/verification/requests/:id/approve
// Admin / Editor: Approve application
const approveVerificationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewerNotes } = req.body;

    const request = await VerificationRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found.",
      });
    }

    request.status = "verified";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (reviewerNotes) request.reviewerNotes = reviewerNotes;
    await request.save();

    // Update target user
    const targetUser = await User.findById(request.user);
    if (targetUser) {
      targetUser.verification = {
        status: "verified",
        category: request.category,
        verifiedAt: new Date(),
        badge: `Verified ${request.category.charAt(0).toUpperCase() + request.category.slice(1)}`,
      };
      if (request.organization) targetUser.organization = request.organization;
      await targetUser.save();

      // Create persistent notification
      const notification = await Notification.create({
        user: targetUser._id,
        title: "Editorial Broadcaster Verification Approved",
        message: `Your application has been verified. You now carry official ${request.category} credentials across The Digital Times.`,
        type: "verification",
        desk: "EDITORIAL BOARD",
        time: "JUST NOW",
      });

      // Emit real-time notification
      try {
        const io = getIO();
        if (io) {
          io.to(`user:${targetUser._id.toString()}`).emit("NEW_NOTIFICATION", notification);
          io.to(`user:${targetUser._id.toString()}`).emit("notification:new", notification);
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      message: "Application approved. Official broadsheet verification badge awarded.",
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/verification/requests/:id/reject
// Admin / Editor: Reject application
const rejectVerificationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason, reviewerNotes } = req.body;

    const request = await VerificationRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found.",
      });
    }

    request.status = "rejected";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason || "Credentials could not be independently authenticated.";
    if (reviewerNotes) request.reviewerNotes = reviewerNotes;
    await request.save();

    // Update target user
    const targetUser = await User.findById(request.user);
    if (targetUser) {
      targetUser.verification.status = "rejected";
      await targetUser.save();

      // Create persistent notification
      const notification = await Notification.create({
        user: targetUser._id,
        title: "Verification Request Decision",
        message: `Your verification request was not approved: ${request.rejectionReason}. You may re-apply after 30 days with updated documentation.`,
        type: "verification",
        desk: "EDITORIAL BOARD",
        time: "JUST NOW",
      });

      try {
        const io = getIO();
        if (io) {
          io.to(`user:${targetUser._id.toString()}`).emit("NEW_NOTIFICATION", notification);
          io.to(`user:${targetUser._id.toString()}`).emit("notification:new", notification);
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      message: "Verification request rejected.",
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/verification/revoke/:userId
// Admin: Revoke verification status
const revokeVerification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    targetUser.verification = {
      status: "unverified",
      category: "none",
      verifiedAt: null,
      badge: null,
    };
    await targetUser.save();

    // Mark previous requests as rejected/revoked
    await VerificationRequest.updateMany(
      { user: targetUser._id, status: "verified" },
      {
        status: "rejected",
        rejectionReason: reason || "Credentials revoked by editorial administration.",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      }
    );

    // Create persistent notification
    const notification = await Notification.create({
      user: targetUser._id,
      title: "Broadsheet Verification Revoked",
      message: `Your verified profile status was revoked by editorial administration: ${reason || "Policy compliance check"}.`,
      type: "verification",
      desk: "EDITORIAL BOARD",
      time: "JUST NOW",
    });

    try {
      const io = getIO();
      if (io) {
        io.to(`user:${targetUser._id.toString()}`).emit("NEW_NOTIFICATION", notification);
      }
    } catch (e) {}

    res.json({
      success: true,
      message: "Verification revoked successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitVerificationRequest,
  getVerificationStatus,
  listVerificationRequests,
  approveVerificationRequest,
  rejectVerificationRequest,
  revokeVerification,
};
