const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const {
  sendRequest, acceptRequest, declineRequest,
  removeConnection, getConnections, getPendingRequests, getSentRequests,
} = require("../controllers/connectionController");

router.post("/request/:userId", requireAuth, sendRequest);
router.patch("/:id/accept", requireAuth, acceptRequest);
router.patch("/:id/decline", requireAuth, declineRequest);
router.delete("/:id", requireAuth, removeConnection);
router.get("/", requireAuth, getConnections);
router.get("/pending", requireAuth, getPendingRequests);
router.get("/sent", requireAuth, getSentRequests);

module.exports = router;