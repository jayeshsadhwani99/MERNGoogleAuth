const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
const User = require("./models/user.js");

dotenv.config();

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3001/google/callback",
    },
    async function (token, tokenSecret, profile, done) {
      const user = await User.findOne({ authId: profile.id });
      if (user == null) {
        const user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          authId: profile.id,
        });

        await user.save();
      }
      return done(null, profile);
    }
  )
);
