const router = require("express").Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const db = require("../db/db");
const serde = require("../utils/serde");

router.post("/login", async (req, res) => {
  const { name, email } = req.body;

  const { rows } = await db.query(
    "SELECT * FROM Users WHERE email = $1 LIMIT 1",
    [email]
  );

  const token = serde.serialize(email);

  if (rows.length == 0) {
    const { rows } = await db.query(
      "INSERT INTO Users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );

    res.status(201).json({ token: token });
  } else {
    res.status(200).json({ token: token });
  }
});

module.exports = router;
