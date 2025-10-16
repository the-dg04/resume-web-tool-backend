const router = require("express").Router();
const isLoggedIn = require("../middleware/isLoggedIn");
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

  // Upsert company by email in Companies as an owner record. If you prefer separate table, adapt accordingly
  // We will store company name in Companies.name and use email to identify admin (optional if schema expands later)
  let company = await db.query(
    "SELECT * FROM Companies WHERE linkedin_url = $1 LIMIT 1",
    [email]
  );

  if (company.rows.length === 0) {
    const inserted = await db.query(
      "INSERT INTO Companies (name, location, linkedin_url) VALUES ($1, $2, $3) RETURNING *",
      [name || "Company", null, email]
    );
    company = { rows: inserted.rows };
  }

  const token = serde.serialize({ email, role: "company", company_id: company.rows[0].company_id });
  res.status(200).json({ token });
});

module.exports = router;
