const jwt = require("jsonwebtoken");
const db = require("../db/db");

module.exports = async (req, res, next) => {
  try {
    const header = req.get("Authorization") || "";
    if (!header.startsWith("Bearer ")) throw new Error("missing bearer");
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'company') {
      req.company = { company_id: decoded.company_id, email: decoded.email };
    } else {
      const { rows } = await db.query(
        "SELECT * FROM Users WHERE email = $1 LIMIT 1",
        [decoded.email]
      );
      if (rows.length === 0) {
        return res.status(401).json({ message: "user not found" });
      }
      req.user = rows[0];
    }
    next();
  } catch (err) {
    res.status(400).json({ message: "invalid token" });
  }
};