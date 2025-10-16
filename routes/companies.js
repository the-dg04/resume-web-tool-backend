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
    const { name, location, linkedin_url, email } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO Companies (name, location, linkedin_url, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, location, linkedin_url, email]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
 
// Get signed-in company profile
router.get('/me', isLoggedIn, requireCompany, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT company_id, name, location, linkedin_url FROM Companies WHERE company_id = $1', [req.company.company_id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Company self-update details (location, linkedin_url) for the signed-in company
router.patch('/me', isLoggedIn, requireCompany, async (req, res) => {
    const { location, linkedin_url } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE Companies SET location = COALESCE($1, location), linkedin_url = COALESCE($2, linkedin_url) WHERE company_id = $3 RETURNING company_id, name, location, linkedin_url',
            [location || null, linkedin_url || null, req.company.company_id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});