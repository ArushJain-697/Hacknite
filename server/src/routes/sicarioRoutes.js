const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { checkRole } = require("../middleware/checkRole");
const { validateProfile } = require("../middleware/validate");
const { uploadSingle } = require("../middleware/upload");
const { getProfile, updateProfile, getHeists, applyToHeist, getMyApplications } = require("../controllers/sicarioController");

router.get("/profile", requireAuth, checkRole("sicario"), getProfile);
router.put("/profile", requireAuth, checkRole("sicario"), uploadSingle, validateProfile, updateProfile);
router.get("/heists", requireAuth, checkRole("sicario"), getHeists);
router.post("/apply/:heistId", requireAuth, checkRole("sicario"), applyToHeist);
router.get("/applications", requireAuth, checkRole("sicario"), getMyApplications);

module.exports = router;