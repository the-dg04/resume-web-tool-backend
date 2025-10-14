const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../db/db');
require('dotenv').config();

passport.serializeUser((user, done) => {
  // Store only the user_id in the session
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await db.query('SELECT * FROM Users WHERE user_id = $1', [id]);
    const user = rows[0];
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback', // Must match Google Console URI
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our DB
        const { rows: existingUsers } = await db.query(
          'SELECT * FROM Users WHERE google_id = $1',
          [profile.id]
        );

        if (existingUsers.length > 0) {
          // User exists, return them
          return done(null, existingUsers[0]);
        }

        // If not, create a new user in our DB
        const { rows: newUsers } = await db.query(
          'INSERT INTO Users (google_id, name, email) VALUES ($1, $2, $3) RETURNING *',
          [profile.id, profile.displayName, profile.emails[0].value]
        );
        
        return done(null, newUsers[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);