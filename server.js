
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

// Import passport configuration
require('./config/passport-setup');

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
    credentials: true,
}));

app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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