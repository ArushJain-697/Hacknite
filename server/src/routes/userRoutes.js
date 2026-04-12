const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { getPublicProfile } = require("../controllers/userController");

router.get("/:username", requireAuth, getPublicProfile);

module.exports = router;