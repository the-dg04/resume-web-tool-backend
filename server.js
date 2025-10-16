
const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const rolesRoutes = require('./routes/roles');
const applicationsRoutes = require('./routes/applications');
const resumesRoutes = require('./routes/resumes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    origin: process.env.CLIENT_HOME_PAGE_URL, // Allow client to make requests
}));

app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/resumes', resumesRoutes);

app.get('/', (req, res) => {
    res.send('Interview Prep Portal API is running!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});