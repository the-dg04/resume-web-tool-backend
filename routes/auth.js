const router = require('express').Router();
const passport = require('passport');
const isLoggedIn = require('../middleware/isLoggedIn');

// Route to start the Google authentication process
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'] // What we want to get from Google
}));

// Google's callback URL
router.get('/google/callback', passport.authenticate('google', {
    successRedirect: process.env.CLIENT_HOME_PAGE_URL,
    failureRedirect: '/auth/login/failed'
}));

router.get('/login/failed', (req, res) => {
    res.status(401).json({ message: 'Login failed.' });
});

router.get('/logout', (req, res) => {
    req.logout(); // Removes req.user and clears the session
    res.redirect(process.env.CLIENT_HOME_PAGE_URL);
});

// Route to get current user data
router.get('/current-user', isLoggedIn, (req, res) => {
    res.json(req.user);
});

module.exports = router;