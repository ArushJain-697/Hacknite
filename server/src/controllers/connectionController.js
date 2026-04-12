const { pool } = require("../db");

const parseMaybeJson = (value, fallback) => {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

// POST /api/connections/request/:userId
exports.sendRequest = async (req, res) => {
  try {
    const requesterId = req.user.sub;
    const receiverId = parseInt(req.params.userId);

    if (isNaN(receiverId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (requesterId === receiverId) {
      return res.status(400).json({ message: "You cannot connect with yourself." });
    }

    // Receiver exists?
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [receiverId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Already a connection or request exists?
    const [existing] = await pool.query(
      `SELECT id, status FROM connections 
       WHERE (requester_id = ? AND receiver_id = ?) 
          OR (requester_id = ? AND receiver_id = ?) 
       LIMIT 1`,
      [requesterId, receiverId, receiverId, requesterId]
    );

    if (existing.length > 0) {
      const status = existing[0].status;
      if (status === "accepted") return res.status(409).json({ message: "Already connected." });
      if (status === "pending") return res.status(409).json({ message: "Request already sent." });
      if (status === "declined") {
        // Allow re-request after decline
        await pool.query(
          "UPDATE connections SET status = 'pending', requester_id = ?, receiver_id = ? WHERE id = ?",
          [requesterId, receiverId, existing[0].id]
        );
        return res.status(201).json({ message: "Connection request sent." });
      }
    }

    await pool.query(
      "INSERT INTO connections (requester_id, receiver_id, status) VALUES (?, ?, 'pending')",
      [requesterId, receiverId]
    );

    return res.status(201).json({ message: "Connection request sent." });
  } catch (error) {
    console.error("Error sending request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/connections/:id/accept
exports.acceptRequest = async (req, res) => {
  try {
    const userId = req.user.sub;
    const connectionId = parseInt(req.params.id);

    if (isNaN(connectionId)) {
      return res.status(400).json({ message: "Invalid connection ID." });
    }

    const [rows] = await pool.query(
      "SELECT id, status FROM connections WHERE id = ? AND receiver_id = ? LIMIT 1",
      [connectionId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Request not found or not yours to accept." });
    }

    if (rows[0].status !== "pending") {
      return res.status(400).json({ message: "Request is not pending." });
    }

    await pool.query(
      "UPDATE connections SET status = 'accepted' WHERE id = ?",
      [connectionId]
    );

    return res.json({ message: "Connection accepted." });
  } catch (error) {
    console.error("Error accepting request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/connections/:id/decline
exports.declineRequest = async (req, res) => {
  try {
    const userId = req.user.sub;
    const connectionId = parseInt(req.params.id);

    if (isNaN(connectionId)) {
      return res.status(400).json({ message: "Invalid connection ID." });
    }

    const [rows] = await pool.query(
      "SELECT id, status FROM connections WHERE id = ? AND receiver_id = ? LIMIT 1",
      [connectionId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Request not found or not yours to decline." });
    }

    if (rows[0].status !== "pending") {
      return res.status(400).json({ message: "Request is not pending." });
    }

    await pool.query(
      "UPDATE connections SET status = 'declined' WHERE id = ?",
      [connectionId]
    );

    return res.json({ message: "Connection declined." });
  } catch (error) {
    console.error("Error declining request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/connections/:id
exports.removeConnection = async (req, res) => {
  try {
    const userId = req.user.sub;
    const connectionId = parseInt(req.params.id);

    if (isNaN(connectionId)) {
      return res.status(400).json({ message: "Invalid connection ID." });
    }

    // Sirf requester ya receiver hi remove kar sakta hai
    const [rows] = await pool.query(
      "SELECT id FROM connections WHERE id = ? AND (requester_id = ? OR receiver_id = ?) LIMIT 1",
      [connectionId, userId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Connection not found or not yours." });
    }

    await pool.query("DELETE FROM connections WHERE id = ?", [connectionId]);

    return res.json({ message: "Connection removed." });
  } catch (error) {
    console.error("Error removing connection:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/connections
exports.getConnections = async (req, res) => {
  try {
    const userId = req.user.sub;

    const [connections] = await pool.query(
      `SELECT 
        c.id AS connection_id,
        c.created_at AS connected_at,
        u.id AS user_id,
        u.username,
        u.role,
        sp.name,
        sp.title,
        sp.clearance_level,
        sp.skills,
        sp.photo_url
       FROM connections c
       JOIN users u ON (
         CASE WHEN c.requester_id = ? THEN c.receiver_id ELSE c.requester_id END = u.id
       )
       LEFT JOIN sicario_profiles sp ON sp.user_id = u.id
       WHERE (c.requester_id = ? OR c.receiver_id = ?)
         AND c.status = 'accepted'
       ORDER BY c.created_at DESC`,
      [userId, userId, userId]
    );

    const parsed = connections.map((c) => ({
      ...c,
      skills: parseMaybeJson(c.skills, []),
    }));

    return res.json({ connections: parsed });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/connections/pending
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.sub;

    const [requests] = await pool.query(
      `SELECT 
        c.id AS connection_id,
        c.created_at,
        u.id AS user_id,
        u.username,
        u.role,
        sp.name,
        sp.title,
        sp.clearance_level,
        sp.photo_url
       FROM connections c
       JOIN users u ON c.requester_id = u.id
       LEFT JOIN sicario_profiles sp ON sp.user_id = u.id
       WHERE c.receiver_id = ? AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return res.json({ requests });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/connections/sent
exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.user.sub;

    const [requests] = await pool.query(
      `SELECT 
        c.id AS connection_id,
        c.created_at,
        u.id AS user_id,
        u.username,
        u.role,
        sp.name,
        sp.title,
        sp.clearance_level,
        sp.photo_url
       FROM connections c
       JOIN users u ON c.receiver_id = u.id
       LEFT JOIN sicario_profiles sp ON sp.user_id = u.id
       WHERE c.requester_id = ? AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return res.json({ requests });
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};