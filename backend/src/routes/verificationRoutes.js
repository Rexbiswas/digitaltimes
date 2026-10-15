const express = require("express");
const router = express.Router();
const {
  submitVerificationRequest,
  getVerificationStatus,
  listVerificationRequests,
  approveVerificationRequest,
  rejectVerificationRequest,
  revokeVerification,
} = require("../controllers/verificationController");
const { requireAuth, requireRole } = require("../middleware/auth");

// Reader endpoints
router.post("/request", requireAuth, submitVerificationRequest);
router.get("/status", requireAuth, getVerificationStatus);

// Editorial Admin / Reviewer endpoints
router.get("/requests", requireAuth, requireRole("admin", "editor"), listVerificationRequests);
router.patch("/requests/:id/approve", requireAuth, requireRole("admin", "editor"), approveVerificationRequest);
router.patch("/requests/:id/reject", requireAuth, requireRole("admin", "editor"), rejectVerificationRequest);
router.patch("/revoke/:userId", requireAuth, requireRole("admin"), revokeVerification);

module.exports = router;
