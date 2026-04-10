// controllers/heistController.js
const { pool } = require("../db");

exports.createHeist = async (req, res) => {
  try {
    // Ye line tabhi hit hogi jab user 'fixer' hoga (bouncer check kar chuka hoga)
    const { title, description, payout } = req.body;
    const fixerId = req.user.sub;

    // TODO: Yahan MySQL mein heists table ke andar entry jayegi
    // Abhi ke liye fake response bhej rahe hain testing ke liye
    
    return res.status(201).json({ 
      message: "Heist blueprint added to the underworld board!",
      fixer_id: fixerId
    });

  } catch (error) {
    console.error("Error creating heist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAvailableHeists = async (req, res) => {
  try {
    // TODO: Fetch heists from DB
    return res.json({ message: "Feed of available heists", heists: [] });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};