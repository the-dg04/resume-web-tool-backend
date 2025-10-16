const router = require('express').Router();
const db = require('../db/db');
const isLoggedIn = require('../middleware/isLoggedIn');
const { requireUser, requireCompany } = require('../middleware/requireRole');

// GET all applications for the logged-in user
router.get('/', isLoggedIn, requireUser, async (req, res) => {
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
router.post('/', isLoggedIn, requireUser, async (req, res) => {
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

// GET applications for a specific company (by company_id)
router.get('/company/:company_id', isLoggedIn, requireCompany, async (req, res) => {
    const companyId = req.params.company_id;
    if (String(req.company.company_id) !== String(companyId)) {
        return res.status(403).json({ message: 'forbidden' });
    }
    try {
        const query = `
            SELECT 
                a.application_id,
                a.status,
                a.created_at,
                a.role_id,
                a.resume_id,
                u.user_id,
                u.name as user_name,
                u.email as user_email,
                res.resume_name,
                res.resume_url,
                r.job_description,
                c.name as company_name
            FROM Applications a
            JOIN Roles r ON a.role_id = r.role_id
            JOIN Companies c ON r.company_id = c.company_id
            JOIN Users u ON a.user_id = u.user_id
            JOIN Resumes res ON res.resume_id = a.resume_id
            WHERE c.company_id = $1
            ORDER BY a.created_at DESC
        `;
        const { rows } = await db.query(query, [companyId]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PATCH update application status
router.patch('/:application_id/status', isLoggedIn, requireCompany, async (req, res) => {
    const applicationId = req.params.application_id;
    const { status } = req.body;
    const allowed = ['applied', 'reviewing', 'interviewing', 'rejected', 'hired'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'invalid status' });
    }
    try {
        // Ensure the application belongs to the company making the request
        const ownerCheck = await db.query(
            `SELECT a.application_id
             FROM Applications a
             JOIN Roles r ON a.role_id = r.role_id
             WHERE a.application_id = $1 AND r.company_id = $2`,
            [applicationId, req.company.company_id]
        );
        if (ownerCheck.rows.length === 0) return res.status(403).json({ message: 'forbidden' });

        const { rows } = await db.query(
            'UPDATE Applications SET status = $1 WHERE application_id = $2 RETURNING *',
            [status, applicationId]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;