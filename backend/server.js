
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
app.set('strict routing', false);

const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    origin: process.env.CLIENT_HOME_PAGE_URL, // Allow client to make requests
}));

app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// // Middleware to enforce trailing slash
// app.use((req, res, next) => {
//   // Check if the request path does not end with a slash
//   // and is not the root path itself (to avoid an infinite redirect loop on root)
//   // We also check req.url to ensure it's not just a request for '/' already
//   if (req.path.substr(-1) !== '/' && req.url.length > 1) {
//     const query = req.url.slice(req.path.length); // Keep any query parameters
//     res.redirect(301, req.path + '/' + query);
//   } else {
//     next();
//   }
// });

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