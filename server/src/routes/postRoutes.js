const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");
const { createPost, getFeed, castVote } = require("../controllers/postController");

router.get("/", requireAuth, getFeed);
router.post("/add", requireAuth, uploadSingle, createPost);
router.post("/:id/vote", requireAuth, castVote);

module.exports = router;