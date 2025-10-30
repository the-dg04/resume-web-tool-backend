const router = require("express").Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const { requireUser } = require("../middleware/requireRole");
const db = require("../db/db");
const serde = require("../utils/serde");

router.post("/login", async (req, res) => {
  const { name, email } = req.body;

  const found = await db.query(
    "SELECT * FROM Users WHERE email = $1 LIMIT 1",
    [email]
  );

  let user = found.rows[0];
  if (!user) {
    const inserted = await db.query(
      "INSERT INTO Users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    user = inserted.rows[0];
  }

  const token = serde.serialize({ email, role: "user", user_id: user.user_id });
  res.status(found.rows[0] ? 200 : 201).json({ token });
});

// Company login/registration via Google email
router.post("/login-company", async (req, res) => {
  const { name, email } = req.body;

  // Upsert company by email in Companies as an owner record
  let company = await db.query(
    "SELECT * FROM Companies WHERE email = $1 LIMIT 1",
    [email]
  );

  if (company.rows.length === 0) {
    const inserted = await db.query(
      "INSERT INTO Companies (name, location, linkedin_url, email) VALUES ($1, $2, $3, $4) RETURNING *",
      [name || "Company", null, null, email]
    );
    company = { rows: inserted.rows };
  }

  const token = serde.serialize({ email, role: "company", company_id: company.rows[0].company_id });
  res.status(200).json({ token });
});

// Get current user profile
router.get("/me", isLoggedIn, requireUser, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT user_id, name, email, type, created_at FROM Users WHERE user_id = $1",
      [req.user.user_id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// No user profile update per requirements

module.exports = router;
