const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: "Missing token. Please log in." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Payload mein ab role bhi shamil hai!
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// 🛡️ NAYA VIP BOUNCER 
function restrictTo(...allowedRoles) {
  return (req, res, next) => {
    // Agar user logged in nahi hai, ya uska role allowed list mein nahi hai
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access Denied: Sicarios execute, Fixers plan. You don't have clearance for this." 
      });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  restrictTo // Isey export karna mat bhulna
};