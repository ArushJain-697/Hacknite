// routes/heistRoutes.js
const express = require("express");
const router = express.Router();

const { requireAuth, restrictTo } = require("../middleware/auth");
const heistController = require("../controllers/heistController");

// Sicarios aur Fixers dono heists dekh sakte hain
router.get("/", requireAuth, heistController.getAvailableHeists);

// 🛡️ VIP BOUNCER: Sirf FIXERS naye Heists (Jobs) plan kar sakte hain!
router.post("/add", requireAuth, restrictTo("fixer"), heistController.createHeist);

module.exports = router;