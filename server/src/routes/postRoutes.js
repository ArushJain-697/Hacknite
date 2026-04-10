const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload"); // Apna naya bouncer
const postController = require("../controllers/postController");

// DHYAN DE: upload.single("image") likha hai. 
// Frontend/Postman me photo bhejte time key ka naam "image" hona chahiye!
router.post("/add", requireAuth, upload.single("image"), postController.createPost);

module.exports = router;