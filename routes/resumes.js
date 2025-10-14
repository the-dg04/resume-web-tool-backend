const router = require('express').Router();
const db = require('../db/db');
const isLoggedIn = require('../middleware/isLoggedIn');

// GET current user's resumes
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM Resumes WHERE user_id = $1', [req.user.user_id]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST a new resume URL for the current user
router.post('/', isLoggedIn, async (req, res) => {
    const { resume_url } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO Resumes (user_id, resume_url) VALUES ($1, $2) RETURNING *',
            [req.user.user_id, resume_url]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;