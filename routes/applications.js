const router = require('express').Router();
const db = require('../db/db');
const isLoggedIn = require('../middleware/isLoggedIn');

// GET all applications for the logged-in user
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const query = `
            SELECT a.application_id, a.status, a.created_at, r.job_description, c.name as company_name
            FROM Applications a
            JOIN Roles r ON a.role_id = r.role_id
            JOIN Companies c ON r.company_id = c.company_id
            WHERE a.user_id = $1
        `;
        const { rows } = await db.query(query, [req.user.user_id]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST a new application (apply for a job)
router.post('/', isLoggedIn, async (req, res) => {
    const { role_id, resume_id } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO Applications (role_id, user_id, resume_id) VALUES ($1, $2, $3) RETURNING *',
            [role_id, req.user.user_id, resume_id]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;