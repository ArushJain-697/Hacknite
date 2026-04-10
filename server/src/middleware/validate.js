const { z } = require("zod");

const registerCredentialsSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(6).max(128),
  role: z.enum(["sicario", "fixer"]).default("sicario"),
});

const loginCredentialsSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(6).max(128),
  role: z.enum(["sicario", "fixer"]).optional(),
});

function validateRegisterCredentials(req, res, next) {
  const parsed = registerCredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  req.body = parsed.data;
  return next();
}

function validateLoginCredentials(req, res, next) {
  const parsed = loginCredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  req.body = parsed.data;
  return next();
}

const heistSchema = z.object({
  heading: z.string().trim().min(3).max(200),
  subheading: z.string().trim().min(3).max(200),
  quote: z.string().trim().max(500).optional().or(z.literal("")),
  timeline: z.string().trim().min(3).max(500),
  crew_threat_level: z.string().trim().min(1).max(100),
  short_description: z.string().trim().min(10).max(2000),
  payout: z.coerce.number().int().nonnegative().default(0),
  required_skills: z.array(
    z.object({
      role: z.string().trim().min(1).max(100),
      moneyshare: z.string().trim().min(1).max(50),
    })
  ).min(1),
});

function validateHeist(req, res, next) {
  if (typeof req.body.required_skills === "string") {
    try {
      req.body.required_skills = JSON.parse(req.body.required_skills);
    } catch {
      return res.status(400).json({ message: "required_skills must be a valid JSON array" });
    }
  }
  if (typeof req.body.payout === "string") {
    req.body.payout = Number(req.body.payout);
  }

  const parsed = heistSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid heist data",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  req.body = parsed.data;
  return next();
}

const profileSchema = z.object({
  name: z.string().trim().max(200).optional(),
  title: z.string().trim().max(200).optional(),
  height: z.string().trim().max(50).optional(),
  weight: z.string().trim().max(50).optional(),
  languages: z.array(z.string().trim().min(1)).optional(),
  blood_group: z.string().trim().max(10).optional(),
  clearance_level: z.string().trim().max(100).optional(),
  about: z.string().trim().max(5000).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
});

function validateProfile(req, res, next) {
  ["skills", "languages"].forEach((key) => {
    if (typeof req.body[key] === "string") {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch {
        // ignore
      }
    }
  });

  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid profile data",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  req.body = parsed.data;
  return next();
}

module.exports = {
  validateRegisterCredentials,
  validateLoginCredentials,
  validateHeist,
  validateProfile,
};