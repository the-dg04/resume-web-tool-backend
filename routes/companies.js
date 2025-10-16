const router = require('express').Router();
const db = require('../db/db');
const isLoggedIn = require('../middleware/isLoggedIn');
const { requireCompany } = require('../middleware/requireRole');

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
 
// Company self-update details (name, location, linkedin_url) for the signed-in company
router.patch('/me', isLoggedIn, requireCompany, async (req, res) => {
    const { name, location, linkedin_url } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE Companies SET name = COALESCE($1, name), location = COALESCE($2, location), linkedin_url = COALESCE($3, linkedin_url) WHERE company_id = $4 RETURNING *',
            [name || null, location || null, linkedin_url || null, req.company.company_id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});