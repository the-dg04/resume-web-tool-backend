const router = require('express').Router();
const db = require('../db/db');
const isLoggedIn = require('../middleware/isLoggedIn');

// GET all roles
router.get('/', async (req, res) => {
    try {
        // Join with companies to get company name
        const query = `
            SELECT r.*, c.name as company_name 
            FROM Roles r
            JOIN Companies c ON r.company_id = c.company_id
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET all roles for a company
router.get('/:company_id', async (req, res) => {
    const company_id = req.params.company_id
    try {
        // Join with companies to get company name
        const query = `
            SELECT r.*, c.name as company_name 
            FROM Roles r
            JOIN Companies c ON r.company_id = c.company_id
            WHERE r.company_id = ${company_id}
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST a new role (protected)
router.post('/', isLoggedIn, async (req, res) => {
    const { company_id, job_description, pay, location, start_date, application_end_date, hours_per_week } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO Roles (company_id, job_description, pay, location, start_date, application_end_date, hours_per_week) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [company_id, job_description, pay, location, start_date, application_end_date, hours_per_week]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;