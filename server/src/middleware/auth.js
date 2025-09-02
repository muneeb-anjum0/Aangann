// Auth middleware

import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  console.log("[requireAuth] cookies:", req.cookies);
  const token = req.cookies?.token;
  if (!token) {
    console.log("[requireAuth] No token cookie found");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    console.log("[requireAuth] Token verification failed:", e?.message || e);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
