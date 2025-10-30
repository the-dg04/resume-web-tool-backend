const router = require("express").Router();
const db = require("../db/db");

router.get("/ping", async (req, res) => {
  const found = await db.query("SELECT * FROM Users LIMIT 1");

  res
    .status(found.rows[0] ? 200 : 201)
    .json({ status: found.rows ? "db is running" : "db is not running" });
});

module.exports = router;
