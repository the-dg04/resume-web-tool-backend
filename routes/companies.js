const router = require('express').Router();
const db = require('../db/db');
const isLoggedIn = require('../middleware/isLoggedIn');

// GET all companies
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM Companies');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST a new company (protected)
router.post('/', isLoggedIn, async (req, res) => {
    const { name, location, linkedin_url } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO Companies (name, location, linkedin_url) VALUES ($1, $2, $3) RETURNING *',
            [name, location, linkedin_url]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;