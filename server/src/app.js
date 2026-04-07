const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "https://sicari.works",
  "https://sicari.works",
  "https://www.sicari.works",
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const isDev = process.env.NODE_ENV !== "production";
      const isLocalDevOrigin =
        isDev &&
        (/^http:\/\/localhost:\d+$/.test(origin || "") ||
          /^http:\/\/127\.0\.0\.1:\d+$/.test(origin || ""));

      if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ==========================================
// 🛡️ THE SYNDICATE EDGE GUARD
// ==========================================
app.use((req, res, next) => {
  // Ignore during local development so you can test easily
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  // Verify the Secret Handshake from Cloudflare
  const incomingToken = req.headers['x-edge'];
  const expectedToken = process.env.EDGE_SECRET;

  if (!incomingToken || incomingToken !== expectedToken) {
    console.warn(`DIRECT IP ATTACK BLOCKED from IP: ${req.ip}`);
    return res.status(403).json({ 
      error: "Access Denied. Invalid Edge Signature." 
    });
  }

  next(); // Handshake accepted, proceed to the routes
});
// ==========================================

app.get("/api", (_req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.use("/api", authRouter);

app.use((err, _req, res, _next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS blocked this origin" });
  }
  console.error("Unhandled error:", err);
  const response = { message: "Internal server error" };
  if (process.env.NODE_ENV !== "production") {
    response.error = err?.message || "Unknown error";
  }
  return res.status(500).json(response);
});

module.exports = app;