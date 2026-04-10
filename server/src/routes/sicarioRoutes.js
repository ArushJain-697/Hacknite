const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { checkRole } = require("../middleware/checkRole");
const { validateProfile } = require("../middleware/validate");
const upload = require("../middleware/upload");
const { getProfile, updateProfile } = require("../controllers/sicarioController");

router.get("/profile", requireAuth, checkRole("sicario"), getProfile);
router.put("/profile", requireAuth, checkRole("sicario"), upload.single("photo"), validateProfile, updateProfile);

module.exports = router;