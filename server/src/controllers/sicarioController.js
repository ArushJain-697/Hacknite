const { pool } = require("../db");
const { uploadToCloudinary } = require("../utils/cloudinary");

// GET /api/sicario/profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.sub;

    const [rows] = await pool.query(
      `SELECT 
        sp.name, sp.title, sp.height, sp.weight, sp.languages,
        sp.blood_group, sp.clearance_level, sp.about, sp.skills,
        sp.photo_url, u.username, u.created_at
       FROM users u
       LEFT JOIN sicario_profiles sp ON sp.user_id = u.id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const profile = rows[0];
    const parseMaybeJson = (val, fallback) => {
      if (val == null) return fallback;
      if (typeof val === "object") return val;
      try { return JSON.parse(val); } catch { return fallback; }
    };

    return res.json({
      profile: {
        ...profile,
        skills: parseMaybeJson(profile.skills, []),
        languages: parseMaybeJson(profile.languages, []),
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/sicario/profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.sub;
    const {
      name,
      title,
      height,
      weight,
      languages,
      blood_group,
      clearance_level,
      about,
      skills,
    } = req.body;

    let photo_url = null;
    let photo_public_id = null;

    if (req.file) {
      try {
        const cloudRes = await uploadToCloudinary(req.file.buffer);
        photo_url = cloudRes.secure_url;
        photo_public_id = cloudRes.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(502).json({ message: "Photo upload failed. Try again." });
      }
    }

    // Check if profile already exists
    const [existing] = await pool.query(
      "SELECT id, photo_url, photo_public_id FROM sicario_profiles WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (existing.length > 0) {
      // UPDATE — only update photo if new one uploaded
      const updatePhoto = photo_url
        ? ", photo_url = ?, photo_public_id = ?"
        : "";
      const params = [
        name ?? null,
        title ?? null,
        height ?? null,
        weight ?? null,
        JSON.stringify(languages ?? []),
        blood_group ?? null,
        clearance_level ?? null,
        about ?? null,
        JSON.stringify(skills ?? []),
        ...(photo_url ? [photo_url, photo_public_id] : []),
        userId,
      ];

      await pool.query(
        `UPDATE sicario_profiles SET
          name = ?, title = ?, height = ?, weight = ?,
          languages = ?, blood_group = ?, clearance_level = ?,
          about = ?, skills = ?
          ${updatePhoto}
         WHERE user_id = ?`,
        params
      );
    } else {
      // INSERT fresh profile
      await pool.query(
        `INSERT INTO sicario_profiles 
          (user_id, name, title, height, weight, languages, blood_group, clearance_level, about, skills, photo_url, photo_public_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          name ?? null,
          title ?? null,
          height ?? null,
          weight ?? null,
          JSON.stringify(languages ?? []),
          blood_group ?? null,
          clearance_level ?? null,
          about ?? null,
          JSON.stringify(skills ?? []),
          photo_url,
          photo_public_id,
        ]
      );
    }

    return res.json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};